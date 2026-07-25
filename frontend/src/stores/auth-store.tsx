"use client";

/**
 * NOTE: Despite the `-store.tsx` naming convention (which is often used for Zustand/Redux), 
 * this module intentionally uses the React Context API. The renaming was purely cosmetic 
 * to align with Next.js App Router layer conventions (stores/ vs contexts/).
 */

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { ApiError, setAccessToken } from "@/lib/api-client";
import { authService, type CurrentUserResponse } from "@/lib/api/auth";
import { UI_LABELS } from "@/constants/ui";

type AuthState = {
  user: CurrentUserResponse | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<{
  user: CurrentUserResponse | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
} | null>(null);

const PUBLIC_PATHS = ["/", "/login", "/track"];
const ADMIN_ONLY_PATHS = ["/reports", "/rates", "/users", "/activity"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isAdminOnlyPath(pathname: string) {
  return ADMIN_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // The apiClient will automatically intercept a 401 response and attempt a 
      // silent refresh via POST /api/v1/auth/refresh.
      // If successful, it retries the me() request with the new access token.
      const user = await authService.me();
      setState((s) => ({ ...s, user, loading: false, error: null }));
    } catch {
      setState((s) => ({ ...s, user: null, loading: false, error: null }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (username: string, password: string) => {
      setState((s) => ({ ...s, error: null }));
      try {
        const response = await authService.login({ username, password });
        setAccessToken(response.token); // set token in api client
        setState((s) => ({ ...s, accessToken: response.token }));
        await refresh();
        toast.success(UI_LABELS.feedback.success.AUTH_SUCCESS);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.status >= 500
              ? "Login is temporarily unavailable. Please try again in a few minutes."
              : err.message
            : "Login failed";
        setState((s) => ({ ...s, error: message }));
        toast.error(message);
        throw err;
      }
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      toast.success(UI_LABELS.feedback.success.LOGOUT_SUCCESS);
    } catch {
      // ignore
    }
    setAccessToken(null);
    setState({ user: null, accessToken: null, loading: false, error: null });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        accessToken: state.accessToken,
        loading: state.loading,
        error: state.error,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useRequireAuth(pathname: string) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (isPublicPath(pathname)) return;

    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAdminOnlyPath(pathname) && user.role !== "ADMIN") {
      router.replace("/overview");
    }
  }, [user, loading, pathname, router]);
}
