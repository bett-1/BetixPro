import axios from "axios";

type RefreshHandler = () => Promise<string | null>;
type UnauthorizedHandler = () => void;

function resolveApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL?.trim() || "/api";
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
