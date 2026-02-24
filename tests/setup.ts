import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// Polyfill ResizeObserver for Radix UI components in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill pointer capture for Radix UI Select in jsdom
HTMLElement.prototype.hasPointerCapture = (() => false) as never;
HTMLElement.prototype.setPointerCapture = (() => {}) as never;
HTMLElement.prototype.releasePointerCapture = (() => {}) as never;

// Polyfill scrollIntoView for Radix UI in jsdom
HTMLElement.prototype.scrollIntoView = (() => {}) as never;

// Polyfill matchMedia for useIsMobile / useBreakpoint hooks in jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});
