"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AvailabilityBanner } from "@/components/system/AvailabilityBanner";
import { OfflineScreen } from "@/components/system/OfflineScreen";
import {
  probeRemoteAvailability,
  setRemoteWritesEnabled,
  type AvailabilityProbe as ProbeFunction,
  type AvailabilityState,
} from "@/lib/availability";

export type AvailabilityProbe = ProbeFunction;

type AvailabilityContextValue = {
  state: AvailabilityState;
  isWriteEnabled: boolean;
  retry: () => Promise<void>;
};

const AvailabilityContext = createContext<AvailabilityContextValue>({
  state: "online",
  isWriteEnabled: true,
  retry: async () => undefined,
});

type AvailabilityProviderProps = {
  children: ReactNode;
  probe?: AvailabilityProbe;
};

export function AvailabilityProvider({ children, probe = probeRemoteAvailability }: AvailabilityProviderProps) {
  const [state, setState] = useState<AvailabilityState>("checking");
  const hasConnected = useRef(false);
  const requestId = useRef(0);

  const retry = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setState("checking");
    setRemoteWritesEnabled(false);
    const nextState = await probe();
    if (currentRequest !== requestId.current) {
      return;
    }
    if (nextState === "online") {
      hasConnected.current = true;
    }
    setRemoteWritesEnabled(nextState === "online");
    setState(nextState);
  }, [probe]);

  useEffect(() => {
    void retry();
    const handleOnline = () => void retry();
    const handleOffline = () => {
      requestId.current += 1;
      setRemoteWritesEnabled(false);
      setState("offline");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [retry]);

  const isInitialOffline = state === "offline" && !hasConnected.current;
  const isCheckingInitially = state === "checking" && !hasConnected.current;
  if (isInitialOffline || isCheckingInitially) {
    return <OfflineScreen onRetry={() => void retry()} isRetrying={state === "checking"} />;
  }

  return (
    <AvailabilityContext.Provider value={{ state, isWriteEnabled: state === "online", retry }}>
      {state !== "online" && <AvailabilityBanner />}
      {children}
    </AvailabilityContext.Provider>
  );
}

export function useAvailability(): AvailabilityContextValue {
  return useContext(AvailabilityContext);
}
