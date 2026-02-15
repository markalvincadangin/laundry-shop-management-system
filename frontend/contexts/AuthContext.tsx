"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ApiError } from "@/lib/api/client";
import { authApi, type CurrentUserResponse } from "@/lib/api/auth";

type AuthState = {
  user: CurrentUserResponse | null;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<{
  user: CurrentUserResponse | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
} | null>(null);

const PUBLIC_PATHS = ["/login", "/track"];
const OWNER_ONLY_PATHS = ["/reports"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isOwnerOnlyPath(pathname: string) {
  return OWNER_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const user = await authApi.me();
      setState({ user, loading: false, error: null });
    } catch {
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (username: string, password: string) => {
      setState((s) => ({ ...s, error: null }));
      try {
        await authApi.login({ username, password });
        await refresh();
        router.push("/");
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Login failed";
        setState((s) => ({ ...s, error: message }));
        throw err;
      }
    },
    [refresh, router]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setState({ user: null, loading: false, error: null });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
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

    if (isOwnerOnlyPath(pathname) && user.role !== "OWNER") {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);
}
