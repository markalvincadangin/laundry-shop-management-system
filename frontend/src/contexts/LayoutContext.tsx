"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

/**
 * LayoutProvider: Manages global UI layout states like sidebar collapse.
 * FRONT-002 §4.
 */
export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") {
      setIsSidebarCollapsed(true);
    }
    setMounted(true);
  }, []);

  // Save preference to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sidebar-collapsed", String(isSidebarCollapsed));
    }
  }, [isSidebarCollapsed, mounted]);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const setSidebarCollapsed = (collapsed: boolean) => setIsSidebarCollapsed(collapsed);

  return (
    <LayoutContext.Provider value={{ isSidebarCollapsed, toggleSidebar, setSidebarCollapsed }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
