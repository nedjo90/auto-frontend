import { describe, it, expect } from "vitest";
import robots from "@/app/robots";

describe("robots.txt", () => {
  it("should allow all crawlers for public pages", () => {
    const result = robots();

    expect(result.rules).toBeDefined();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules[0].userAgent).toBe("*");
    expect(rules[0].allow).toBe("/");
  });

  it("should disallow authenticated routes", () => {
    const result = robots();

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const disallowed = rules[0].disallow as string[];
    expect(disallowed).toContain("/favorites");
    expect(disallowed).toContain("/dashboard");
    expect(disallowed).toContain("/api/");
  });

  it("should reference sitemap", () => {
    const result = robots();

    expect(result.sitemap).toContain("/sitemap.xml");
  });
});
