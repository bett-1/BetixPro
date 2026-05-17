import axios from "axios";

type RefreshHandler = () => Promise<string | null>;
type UnauthorizedHandler = () => void;
type RetryableRequestConfig = {
  headers?: Record<string, string>;
  _retry?: boolean;
  url?: string;
};

const DEFAULT_API_URL = "https://api.betixpro.com";
const DEFAULT_API_BASE_URL = "https://api.betixpro.com/api";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function resolveApiBaseUrl() {
  return trimTrailingSlash(
    import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
  );
}

export function resolveSocketBaseUrl() {
  return trimTrailingSlash(
    import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL,
  );
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
});

let accessToken: string | null = null;
let refreshHandler: RefreshHandler | null = null;
let unauthorizedHandler: UnauthorizedHandler | null = null;

const AUTH_TOKEN_KEY = "betwise-auth-token";

function shouldSkipRefresh(url: string | undefined) {
  if (!url) return false;

  return (
    url.includes("/auth/refresh") ||
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/me")
  );
}

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
    config.headers = config.headers ?? {};

    // Priority: memory variable > localStorage
    const token = accessToken || getStoredAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status as number | undefined;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {
      console.log("[Axios] 401 detected, attempting refresh...");
      originalRequest._retry = true;

      if (refreshHandler) {
        try {
          const newToken = await refreshHandler();
          if (newToken) {
            originalRequest.headers = originalRequest.headers ?? {};
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
