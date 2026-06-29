import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import api from "@/lib/axios";
import { AxiosError } from "axios";
import {
  User,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
  LoginPayload,
  Store,
} from "@/types";
import Cookies from "js-cookie";

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  expires: 1 / 24, // 1 hour
  secure: isProduction,
  sameSite: isProduction ? ("None" as const) : ("Lax" as const),
};

const refreshCookieOptions = {
  expires: 7, // 7 days
  secure: isProduction,
  sameSite: isProduction ? ("None" as const) : ("Lax" as const),
};

interface AuthState {
  user: User | null;
  loading: boolean;
  _hasHydrated: boolean;
  stores: Store[];
  activeStore: Store | null;
  lastActiveStoreId: number | null;

  switchStore: (storeId: number) => void;
  setHasHydrated: (state: boolean) => void;
  isLoggedIn: () => boolean;
  isBusinessRegistered: () => boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<string>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  refreshStores: () => Promise<void>;
  completedOnboardingUsers: Record<number, boolean>;
  setCompletedOnboarding: (userId: number, state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      _hasHydrated: false,
      lastActiveStoreId: null,
      stores: [],
      activeStore: null,
      completedOnboardingUsers: {},

      setCompletedOnboarding: (userId, state) => {
        set((prev) => ({
          completedOnboardingUsers: {
            ...prev.completedOnboardingUsers,
            [userId]: state,
          },
        }));
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      isLoggedIn: () => {
        return !!Cookies.get("accessToken") || !!Cookies.get("refreshToken");
      },

      isBusinessRegistered: () => {
        const state = get();
        return state.user?.business != null;
      },

      register: async (payload) => {
        try {
          const response = await api.post("/auth/register", payload);
          const { responseSuccessful, responseMessage } = response.data;

          if (!responseSuccessful) {
            throw new Error(responseMessage || "Registration failed");
          }

          return payload.email;
        } catch (err) {
          const error = err as AxiosError<{ responseMessage: string }>;
          const customMessage =
            error.response?.data?.responseMessage || "Registration failed";
          throw new Error(customMessage);
        }
      },

      verifyOtp: async (payload) => {
        try {
          const response = await api.post("/auth/verify", payload);
          const { responseSuccessful, responseBody, responseMessage } =
            response.data;

          if (!responseSuccessful) {
            throw new Error(responseMessage || "OTP verification failed");
          }

          const { user, accessToken, refreshToken } = responseBody;

          Cookies.set("accessToken", accessToken, cookieOptions);
          Cookies.set("refreshToken", refreshToken, refreshCookieOptions);

          set({ user });
        } catch (err) {
          const error = err as AxiosError<{ responseMessage: string }>;
          const customMessage =
            error.response?.data?.responseMessage || "OTP verification failed";
          throw new Error(customMessage);
        }
      },

      resendOtp: async (email) => {
        set({ loading: true });
        try {
          const response = await api.post("/auth/resend", { email });
          const { responseSuccessful, responseMessage } = response.data;

          if (!responseSuccessful) {
            throw new Error(responseMessage || "OTP resend failed");
          }
        } catch (error) {
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      login: async (payload) => {
        set({ loading: true });
        try {
          const response = await api.post("/auth/login", payload);
          const { responseBody } = response.data;

          const { user, business, accessToken, refreshToken } = responseBody;
          const fetchedStores = business?.store ?? [];


          Cookies.set("accessToken", accessToken, cookieOptions);
          Cookies.set("refreshToken", refreshToken, refreshCookieOptions);

          // FIXED: Use persisted lastActiveStoreId to find active store
          const lastStoreId = get().lastActiveStoreId;
          const activeStore =
            (lastStoreId && fetchedStores.find((s: Store) => s.id === lastStoreId)) ||
            fetchedStores[0] ||
            null;


          set({
            user: {
              ...user,
              business: business || null,
            },
            stores: fetchedStores, // IMPORTANT: Make sure this is set!
            activeStore,
            lastActiveStoreId: activeStore?.id || null,
          });

          // Set business_status cookie for middleware
          if (business) {
            Cookies.set("businessRegistered", "true", { expires: 365, secure: isProduction, sameSite: isProduction ? "None" : "Lax" });
          } else {
            Cookies.remove("businessRegistered");
          }

          return responseBody.user;
        } catch (err) {
          const error = err as AxiosError<{ responseMessage: string }>;
          const customMessage =
            error.response?.data?.responseMessage || "Login failed";
          throw new Error(customMessage);
        } finally {
          set({ loading: false });
        }
      },

      // FIXED: Update both activeStore and lastActiveStoreId
      switchStore: (storeId) => {
        const state = get();
        const newStore = state.stores.find((store) => store.id === storeId);

        if (!newStore) {
          throw new Error("Store not found");
        }

        // Update both activeStore and lastActiveStoreId atomically
        set({ 
          activeStore: newStore, 
          lastActiveStoreId: storeId 
        });
        
        // No need for localStorage.setItem - Zustand persistence handles this
      },

      forgotPassword: async (email) => {
        set({ loading: true });
        try {
          const response = await api.post("/auth/forgot", { email });
          const { responseSuccessful, responseMessage } = response.data;

          if (!responseSuccessful) {
            throw new Error(responseMessage || "Failed to send reset email");
          }

          return responseMessage;
        } catch (err) {
          const error = err as AxiosError<{ responseMessage: string }>;
          const customMessage = error?.response?.data?.responseMessage;
          throw new Error(customMessage);
        } finally {
          set({ loading: false });
        }
      },

      resetPassword: async (payload) => {
        set({ loading: true });
        try {
          const response = await api.post("/auth/reset", payload);
          const { responseSuccessful, responseMessage } = response.data;

          if (!responseSuccessful) {
            throw new Error(responseMessage || "Failed to reset password");
          }

          return responseMessage || "Password reset successfully";
        } catch (err) {
          const error = err as AxiosError<{ responseMessage: string }>;
          const customMessage =
            error.response?.data?.responseMessage || "Failed to reset password";
          throw new Error(customMessage);
        } finally {
          set({ loading: false });
        }
      },

      checkAuth: async () => {
        const hasSession =
          !!Cookies.get("accessToken") || !!Cookies.get("refreshToken");

        if (!hasSession) {
          set({ user: null, stores: [], activeStore: null, loading: false });
          return false;
        }

        try {
          const response = await api.get("/user/profile");
          const { user, business } = response.data.responseBody;

          if (business) {
            // Fetch stores from API
            const storesResp = await api.get("/user/stores");
            const fetchedStores = storesResp.data.responseBody ?? [];
            

            // FIXED: Use persisted lastActiveStoreId to restore active store
            const lastStoreId = get().lastActiveStoreId;
            const activeStore =
              (lastStoreId &&
                fetchedStores.find((s: Store) => s.id === lastStoreId)) ||
              fetchedStores[0] ||
              null;

            set({
              user: { ...user, business },
              stores: fetchedStores, // IMPORTANT: Make sure this is set!
              activeStore,
              lastActiveStoreId: activeStore?.id || null,
            });

            // Set business_status cookie for middleware
            Cookies.set("businessRegistered", "true", { expires: 365, secure: isProduction, sameSite: isProduction ? "None" : "Lax" });
          } else {
            set({
              user: { ...user, business: null },
              stores: [],
              activeStore: null,
              lastActiveStoreId: null,
            });
            Cookies.remove("businessRegistered");
          }

          return true;
        } catch (error) {
          console.error("Error fetching user data:", error);
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          set({ 
            user: null, 
            stores: [], 
            activeStore: null, 
            loading: false 
          });
          return false;
        }
      },

      refreshStores: async () => {
        try {
          const profileResp = await api.get("/user/profile");
          const { user, business } = profileResp.data.responseBody;

          if (business) {
            const storesResp = await api.get("/user/stores");
            const stores = storesResp.data.responseBody ?? [];

            // FIXED: Use persisted lastActiveStoreId
            const lastStoreId = get().lastActiveStoreId;
            const activeStore =
              (lastStoreId &&
                stores.find((s: Store) => s.id === lastStoreId)) ||
              stores[0] ||
              null;

            set({
              user: { ...user, business },
              stores,
              activeStore, // FIXED: Set activeStore
              lastActiveStoreId: activeStore?.id || null,
            });

            Cookies.set("businessRegistered", "true", { expires: 365, secure: isProduction, sameSite: isProduction ? "None" : "Lax" });
          } else {
            set({
              user: { ...user, business: null },
              stores: [],
              activeStore: null,
              lastActiveStoreId: null,
            });
            Cookies.remove("businessRegistered");
          }
        } catch (err) {
          console.error("Failed to refresh stores", err);
          throw err;
        }
      },
       // still thinking of a better way
      logout: async () => {
        set({ loading: true });
        try {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");

          set({
            user: null,
            stores: [],
            activeStore: null,
          });

          Cookies.remove("businessRegistered");

          await new Promise((resolve) => setTimeout(resolve, 50));
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastActiveStoreId: state.lastActiveStoreId,
        completedOnboardingUsers: state.completedOnboardingUsers,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);