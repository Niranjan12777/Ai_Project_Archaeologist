import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 20000
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (typeof window === "undefined") {
    throw new Error("Token refresh is only available in the browser");
  }

  const refreshToken = window.localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(
    `${API_URL}/auth/refresh`,
    {
      refreshToken
    }
  );

  const newAccessToken = response.data.data.accessToken;

  if (!newAccessToken) {
    throw new Error("Refresh response did not contain an access token");
  }

  window.localStorage.setItem("accessToken", newAccessToken);

  return newAccessToken;
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = window.localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const originalRequest =
      error.config as
      | (InternalAxiosRequestConfig & {
        _retry?: boolean;
      })
      | undefined;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken()
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);

    } catch (refreshError) {
      window.localStorage.removeItem("accessToken");

      window.localStorage.removeItem("refreshToken");

      window.localStorage.removeItem("user");

      return Promise.reject(refreshError);
    }
  }
);