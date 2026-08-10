import { useState, useEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

export interface ViewportState {
  isMobile: boolean; // < 768px
  isTablet: boolean; // >= 768px && < 1024px
  isDesktop: boolean; // >= 1024px
  breakpoint: Breakpoint;
}

export function useBreakpoint(): ViewportState {
  const [state, setState] = useState<ViewportState>(() => {
    if (typeof window === "undefined") {
      return { isMobile: false, isTablet: false, isDesktop: true, breakpoint: "desktop" };
    }
    const width = window.innerWidth;
    return getViewportState(width);
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleResize() {
      const newState = getViewportState(window.innerWidth);
      setState((prev) => {
        if (prev.breakpoint !== newState.breakpoint) {
          return newState;
        }
        return prev;
      });
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return state;
}

function getViewportState(width: number): ViewportState {
  if (width < 768) {
    return { isMobile: true, isTablet: false, isDesktop: false, breakpoint: "mobile" };
  }
  if (width < 1024) {
    return { isMobile: false, isTablet: true, isDesktop: false, breakpoint: "tablet" };
  }
  return { isMobile: false, isTablet: false, isDesktop: true, breakpoint: "desktop" };
}
