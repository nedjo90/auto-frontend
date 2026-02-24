import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBreakpoint } from "@/hooks/use-breakpoint";

function setWindowWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { value: width, writable: true });
  window.dispatchEvent(new Event("resize"));
}

describe("useBreakpoint", () => {
  beforeEach(() => {
    setWindowWidth(1024);
  });

  it("should detect mobile viewport (< 768px)", () => {
    setWindowWidth(375);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it("should detect tablet viewport (768–1023px)", () => {
    setWindowWidth(768);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it("should detect desktop viewport (>= 1024px)", () => {
    setWindowWidth(1280);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it("should respond to resize events", () => {
    setWindowWidth(1280);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isDesktop).toBe(true);

    act(() => setWindowWidth(375));
    expect(result.current.isMobile).toBe(true);
  });

  it("isAbove returns true when width >= breakpoint", () => {
    setWindowWidth(800);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isAbove("sm")).toBe(true); // 800 >= 640
    expect(result.current.isAbove("md")).toBe(true); // 800 >= 768
    expect(result.current.isAbove("lg")).toBe(false); // 800 < 1024
  });

  it("isBelow returns true when width < breakpoint", () => {
    setWindowWidth(600);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isBelow("sm")).toBe(true); // 600 < 640
    expect(result.current.isBelow("md")).toBe(true); // 600 < 768
    expect(result.current.isBelow("lg")).toBe(true); // 600 < 1024
  });

  it("reports exact width", () => {
    setWindowWidth(999);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.width).toBe(999);
  });
});
