import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

describe("useIsMobile", () => {
  let listeners: Array<() => void>;
  let currentMatches: boolean;

  beforeEach(() => {
    listeners = [];
    currentMatches = false;

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        get matches() {
          return currentMatches;
        },
        media: query,
        addEventListener: (_: string, fn: () => void) => {
          listeners.push(fn);
        },
        removeEventListener: (_: string, fn: () => void) => {
          listeners = listeners.filter((l) => l !== fn);
        },
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => true,
      }),
    });
  });

  it("should return true when viewport is mobile", () => {
    currentMatches = true;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("should return false when viewport is desktop", () => {
    currentMatches = false;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("should react to media query changes", () => {
    currentMatches = false;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      currentMatches = true;
      listeners.forEach((fn) => fn());
    });
    expect(result.current).toBe(true);
  });

  it("should clean up listener on unmount", () => {
    currentMatches = false;
    const { unmount } = renderHook(() => useIsMobile());
    expect(listeners.length).toBe(1);
    unmount();
    expect(listeners.length).toBe(0);
  });
});
