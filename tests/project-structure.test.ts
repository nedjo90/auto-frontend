import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Frontend project structure", () => {
  const root = path.resolve(__dirname, "..");

  it("should have (public) route group with layout", () => {
    expect(fs.existsSync(path.join(root, "src/app/(public)/layout.tsx"))).toBe(true);
  });

  it("should have (dashboard) route group with layout", () => {
    expect(fs.existsSync(path.join(root, "src/app/(dashboard)/layout.tsx"))).toBe(true);
  });

  it("should have (auth) route group with layout", () => {
    expect(fs.existsSync(path.join(root, "src/app/(auth)/layout.tsx"))).toBe(true);
  });

  it("should have components/ui directory (shadcn)", () => {
    expect(fs.existsSync(path.join(root, "src/components/ui"))).toBe(true);
  });

  it("should have components/layout directory", () => {
    expect(fs.existsSync(path.join(root, "src/components/layout"))).toBe(true);
  });

  it("should have hooks directory", () => {
    expect(fs.existsSync(path.join(root, "src/hooks"))).toBe(true);
  });

  it("should have stores directory", () => {
    expect(fs.existsSync(path.join(root, "src/stores"))).toBe(true);
  });

  it("should have lib directory", () => {
    expect(fs.existsSync(path.join(root, "src/lib"))).toBe(true);
  });

  it("should have i18n directory", () => {
    expect(fs.existsSync(path.join(root, "src/i18n"))).toBe(true);
  });

  it("should have zustand as a dependency", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf-8"));
    expect(pkg.dependencies.zustand).toBeDefined();
  });

  it("should have @auto/shared as a dependency", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf-8"));
    expect(pkg.dependencies["@auto/shared"]).toBeDefined();
  });
});
