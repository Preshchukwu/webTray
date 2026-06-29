import axios from "axios";
import { BASE_URL } from "@/constants/api";
import Cookies from "js-cookie";

const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify",
  "/auth/forgot",
  "/auth/reset",
  "/auth/refresh",
];

const isAuthRequest = (url?: string) => {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const shouldRedirectToSignin = () => {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  // Don't redirect if we are already on auth pages or a storefront
    const isAuthPage =
      path === "/signin" ||
      path === "/signup" ||
      path.startsWith("/forgot-password") ||
      path.startsWith("/reset-password") ||
      path.startsWith("/otp-verification");
    const isStorePage = path !== "/" && !isAuthPage && ![
      "/dashboard", "/profile", "/register-business", "/welcome",
      "/contact-us", "/feature-page", "/pricing-page", "/wait-list"
    ].some(p => path.startsWith(p));
    return !isAuthPage && !isStorePage;
};

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// A separate instance for public storefront requests
export const publicApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract backend error message
    if (error.response?.data) {
      const backendMessage = error.response.data.responseMessage || error.response.data.message;
      if (backendMessage) {
        error.message = backendMessage;
      }
    }
    return Promise.reject(error);
  }
);

// For handling multiple concurrent 401s
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  // console.log(`[Auth] Processing queue with ${failedQueue.length} pending requests.`);
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Extracted refresh logic to be used by both interceptors
const handleRefresh = async (refreshToken: string): Promise<string> => {
  if (isRefreshing) {
    // console.log("[Auth] Refresh already in progress, adding request to queue.");
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  // console.log("[Auth] Starting token refresh process...");
  isRefreshing = true;

  try {
    const response = await axios.post(
      `${BASE_URL}/auth/refresh`,
      { refreshToken },
      { withCredentials: true }
    );

    const { accessToken } = response.data.responseBody;
    // console.log("[Auth] Token refresh successful. Updating cookies.");

    const isProduction = process.env.NODE_ENV === "production";
    Cookies.set("accessToken", accessToken, {
      expires: 1 / 24,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    });

    processQueue(null, accessToken);
    isRefreshing = false;
    return accessToken;
  } catch (refreshError) {
    // console.error("[Auth] Token refresh failed:", refreshError);
    processQueue(refreshError, null);
    isRefreshing = false;
    
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");

    if (shouldRedirectToSignin()) {
      // console.log("[Auth] Redirecting to signin due to refresh failure.");
      window.location.href = "/signin";
    }
    throw refreshError;
  }
};

// Request interceptor - PROACTIVE REFRESH
api.interceptors.request.use(
  async (config) => {
    let accessToken = Cookies.get("accessToken");
    const refreshToken = Cookies.get("refreshToken");

    // If token is missing but we have a refresh token, try to get a new one immediately
    if (!accessToken && refreshToken && !config.url?.includes("/auth/refresh")) {
      // console.log(`[Auth] Proactive refresh triggered for: ${config.url}`);
      try {
        accessToken = await handleRefresh(refreshToken);
      } catch (err) {
        // console.warn("[Auth] Proactive refresh failed, proceeding to see if request works anyway.");
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - REACTIVE REFRESH (Handles expired tokens)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (Expired) or your backend's 500 (Missing)
    const isUnauthorized = error.response?.status === 401;
    const isMissingTokenError =
      error.response?.status === 500 &&
      (error.response?.data?.responseMessage?.toLowerCase().includes("no token") ||
        error.response?.data?.message?.toLowerCase().includes("no token"));

    // Robust check: Only attempt refresh/redirect if it's NOT an auth request
    if (
      (isUnauthorized || isMissingTokenError) &&
      !originalRequest._retry &&
      !isAuthRequest(originalRequest.url)
    ) {
      // console.log(`[Auth] Reactive refresh triggered by ${error.response?.status} error at: ${originalRequest.url}`);
      originalRequest._retry = true;
      const refreshToken = Cookies.get("refreshToken");

      if (!refreshToken) {
        // console.warn("[Auth] No refresh token available. Cannot refresh.");
        if (shouldRedirectToSignin()) {
          window.location.href = "/signin";
        }
        return Promise.reject(error);
      }

      try {
        const newToken = await handleRefresh(refreshToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // console.log("[Auth] Retrying original request with new token.");
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // Extract backend error message
    if (error.response?.data) {
      const backendMessage = error.response.data.responseMessage || error.response.data.message;
      if (backendMessage) {
        error.message = backendMessage;
      }
    }

    return Promise.reject(error);
  }
);

export default api;