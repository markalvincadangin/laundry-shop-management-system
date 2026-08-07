"use client";

import { UI_LABELS } from "@/constants/ui";

type OfflineScreenProps = {
  onRetry: () => void;
  isRetrying: boolean;
};

export function OfflineScreen({ onRetry, isRetrying }: OfflineScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
      <section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900">{UI_LABELS.remoteAccess.OFFLINE_TITLE}</h1>
        <p className="mt-3 text-slate-600">{UI_LABELS.remoteAccess.OFFLINE_DESCRIPTION}</p>
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-6 rounded-xl bg-brand-blue px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRetrying ? UI_LABELS.remoteAccess.RECONNECTING : UI_LABELS.remoteAccess.RETRY}
        </button>
      </section>
    </main>
  );
}
