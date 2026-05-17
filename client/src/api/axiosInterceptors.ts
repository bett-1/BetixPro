import { api, getAccessToken, getRefreshHandler, getStoredAccessToken, getUnauthorizedHandler } from "@/api/axiosConfig";

type RetryableRequestConfig = {
  headers?: Record<string, string>;
  _retry?: boolean;
  url?: string;
};

let installed = false;

function shouldSkipRefresh(url: string | undefined) {
  if (!url) return false;
  return (
    url.includes("/auth/refresh") ||
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/me")
  );
}

export function installApiInterceptors() {
  if (installed) return;
  installed = true;

  api.interceptors.request.use((config) => {
    const mutableConfig = config as RetryableRequestConfig;
    mutableConfig.headers = mutableConfig.headers ?? {};

    let tokenToUse = getAccessToken();
    if (!tokenToUse) {
      tokenToUse = getStoredAccessToken();
    }

    if (tokenToUse) {
      mutableConfig.headers.Authorization = `Bearer ${tokenToUse}`;
    }

    return config;
  });

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
        originalRequest._retry = true;

        if (getRefreshHandler()) {
          try {
            const newToken = await getRefreshHandler()?.();
            if (newToken) {
              originalRequest.headers = originalRequest.headers ?? {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, fall through to unauthorized handler
          }
        }

        // If no refresh handler or refresh fails, call unauthorized handler
        if (getUnauthorizedHandler()) {
          getUnauthorizedHandler()?.();
        }
      }

      return Promise.reject(error);
    },
  );
}
