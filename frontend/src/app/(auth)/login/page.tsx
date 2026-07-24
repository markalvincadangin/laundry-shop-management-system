"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui";
import { Input, Button } from "@/components/ui";
import { LoadingState } from "@/features/shared";
import { UI_LABELS } from "@/constants/ui";

/**
 * Faith Laundry Shop — Staff Authentication Portal
 * 
 * HCI PRINCIPLES APPLIED:
 * 1. Aesthetic-Minimalist (Nielsen H8): Removed visual noise to focus purely on credentials.
 * 2. Visibility of System Status (Nielsen H1): Clean, high-contrast error states for feedback.
 * 3. Match Between System & Real World: Human-centric labels and localized prompt for customers.
 * 4. Error Prevention: Consistent focus rings and high-affordance interaction states.
 * 5. F-Pattern Hierarchy: Top-to-bottom vertical flow optimized for rapid credential entry.
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/overview";
  const { user, login, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirect);
    }
  }, [user, loading, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace(redirect);
    } catch {
      // error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-grid-10">
      <div className="space-y-grid-2 mb-grid-10">
        <h2 className="text-4xl font-display font-black text-slate-900 tracking-tighter leading-none">
          {UI_LABELS.auth.LOGIN_TITLE}
        </h2>
        <p className="text-sm font-medium text-slate-500 leading-relaxed opacity-80">
          {UI_LABELS.auth.LOGIN_SUBTITLE}
        </p>
      </div>

      <Card className="border-slate-200/60 shadow-2xl shadow-slate-200/60 bg-white rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-grid-10 sm:p-grid-12">
          <form onSubmit={handleSubmit} className="space-y-grid-8">
            
            {error && (
              <div
                className="flex items-center gap-grid-3 rounded-2xl border border-rose-100 bg-rose-50 px-grid-5 py-grid-4 text-[10px] font-black uppercase tracking-widest text-rose-600 animate-in fade-in slide-in-from-top-1 shadow-sm"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-grid-5">
              <Input
                label={UI_LABELS.modules.users.USERNAME}
                id="login-username"
                type="text"
                autoComplete="username"
                placeholder={UI_LABELS.auth.USERNAME_PLACEHOLDER}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                icon={<User className="h-4 w-4 text-brand-blue" />}
                className="bg-slate-50/50 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:ring-brand-blue/10 transition-all h-14 rounded-2xl"
              />

              <Input
                label={UI_LABELS.modules.users.PASSWORD}
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={UI_LABELS.auth.PASSWORD_PLACEHOLDER}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock className="h-4 w-4 text-brand-blue" />}
                className="bg-slate-50/50 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:ring-brand-blue/10 transition-all h-14 rounded-2xl"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex items-center justify-center text-slate-300 hover:text-brand-blue focus:outline-none transition-colors h-14 w-12"
                    aria-label={showPassword ? UI_LABELS.auth.HIDE_PASSWORD : UI_LABELS.auth.SHOW_PASSWORD}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-[10px] font-black uppercase tracking-[0.25em] shadow-xl shadow-brand-blue/20 bg-brand-blue hover:bg-brand-blue/90 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
              isLoading={loading || submitting}
            >
              {UI_LABELS.auth.LOGIN_BUTTON}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="pt-grid-4 text-center">
        <div className="inline-flex flex-col sm:flex-row items-center gap-grid-4 p-grid-3 px-grid-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            {UI_LABELS.auth.TRACK_PROMPT}
          </span>
          <Link 
            href="/track" 
            className="text-brand-blue hover:text-brand-blue/80 transition-all text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-grid-2 group"
          >
            {UI_LABELS.auth.TRACK_LINK}
            <div className="h-6 w-6 rounded-full bg-brand-blue/5 flex items-center justify-center group-hover:bg-brand-blue/10 transition-all group-hover:translate-x-0.5">
              <span className="text-brand-blue">{UI_LABELS.dynamic.STR_0616fb}</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginForm />
    </Suspense>
  );
}
