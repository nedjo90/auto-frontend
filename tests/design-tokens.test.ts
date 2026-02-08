import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Design tokens", () => {
  const globalsPath = path.resolve(__dirname, "../src/app/globals.css");
  const css = fs.readFileSync(globalsPath, "utf-8");

  it("should define --certified token", () => {
    expect(css).toContain("--certified:");
  });

  it("should define --declared token", () => {
    expect(css).toContain("--declared:");
  });

  it("should define --success token", () => {
    expect(css).toContain("--success:");
  });

  it("should define --market-below token", () => {
    expect(css).toContain("--market-below:");
  });

  it("should define --market-aligned token", () => {
    expect(css).toContain("--market-aligned:");
  });

  it("should define --market-above token", () => {
    expect(css).toContain("--market-above:");
  });

  it("should have dark mode variants", () => {
    const darkSection = css.substring(css.indexOf(".dark {"));
    expect(darkSection).toContain("--certified:");
    expect(darkSection).toContain("--market-below:");
  });
});
