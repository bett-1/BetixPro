import axios from "axios";

type RefreshHandler = () => Promise<string | null>;
type UnauthorizedHandler = () => void;

const DEFAULT_API_URL = "https://server.betixpro.com";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function appendApiPath(baseUrl: string) {
  const trimmed = trimTrailingSlash(baseUrl);
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function resolveConfiguredApiUrl() {
  return import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL;
}

export function resolveApiBaseUrl() {
  const configuredApiUrl = resolveConfiguredApiUrl();

  if (!configuredApiUrl.startsWith("http")) {
    return appendApiPath(configuredApiUrl);
  }

  return appendApiPath(configuredApiUrl);
}

export function resolveSocketBaseUrl() {
  const configuredSocketUrl = import.meta.env.VITE_SOCKET_BASE_URL?.trim();
  const configuredApiUrl = configuredSocketUrl || resolveConfiguredApiUrl();

  if (!configuredApiUrl.startsWith("http")) {
    return trimTrailingSlash(configuredApiUrl.replace(/\/api\/?$/, ""));
  }

  const url = new URL(configuredApiUrl);
  return url.origin;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
});

let accessToken: string | null = null;
let refreshHandler: RefreshHandler | null = null;
let unauthorizedHandler: UnauthorizedHandler | null = null;

const AUTH_TOKEN_KEY = "betwise-auth-token";

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function configureAuthHandlers(handlers: {
  onRefresh: RefreshHandler;
  onUnauthorized: UnauthorizedHandler;
}) {
  refreshHandler = handlers.onRefresh;
  unauthorizedHandler = handlers.onUnauthorized;
}

export function getAccessToken() {
  return accessToken;
}

export function getStoredAccessToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshHandler() {
  return refreshHandler;
}

export function getUnauthorizedHandler() {
  return unauthorizedHandler;
}

api.interceptors.request.use(
  (config) => {
    // Priority: memory variable > localStorage
    const token = accessToken || getStoredAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("[Axios] 401 detected, attempting refresh...");
      originalRequest._retry = true;

      if (refreshHandler) {
        try {
          const newToken = await refreshHandler();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("[Axios] Refresh failed:", refreshError);
        }
      }

      // If no refresh handler or refresh fails, call unauthorized handler
      if (unauthorizedHandler) {
        unauthorizedHandler();
      }
    }

    return Promise.reject(error);
  },
);

export { api };
