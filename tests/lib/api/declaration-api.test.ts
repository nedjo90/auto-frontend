import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiClient = vi.fn();
vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

import {
  getDeclarationTemplate,
  submitDeclaration,
  getDeclarationSummary,
} from "@/lib/api/declaration-api";

describe("declaration-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDeclarationTemplate", () => {
    it("should call the correct endpoint and return parsed template", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            version: "v1.0",
            checkboxItems: JSON.stringify(["Item 1", "Item 2"]),
            introText: "Intro",
            legalNotice: "Legal",
          }),
      });

      const result = await getDeclarationTemplate();

      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/seller/getDeclarationTemplate"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result.checkboxItems).toEqual(["Item 1", "Item 2"]);
      expect(result.version).toBe("v1.0");
    });

    it("should handle checkboxItems already as array", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            version: "v1.0",
            checkboxItems: ["Item 1"],
            introText: "",
            legalNotice: "",
          }),
      });

      const result = await getDeclarationTemplate();
      expect(result.checkboxItems).toEqual(["Item 1"]);
    });

    it("should throw on non-ok response", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not found"),
      });

      await expect(getDeclarationTemplate()).rejects.toThrow("Failed to load declaration template");
    });
  });

  describe("submitDeclaration", () => {
    it("should submit declaration and return result", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            declarationId: "decl-1",
            signedAt: "2026-02-24T10:00:00Z",
            success: true,
          }),
      });

      const result = await submitDeclaration({
        listingId: "listing-1",
        checkboxStates: [{ label: "Item 1", checked: true }],
      });

      expect(result.success).toBe(true);
      expect(result.declarationId).toBe("decl-1");
    });

    it("should stringify checkboxStates in request body", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const states = [{ label: "A", checked: true }];
      await submitDeclaration({ listingId: "l-1", checkboxStates: states });

      const body = JSON.parse(mockApiClient.mock.calls[0][1].body);
      expect(body.checkboxStates).toBe(JSON.stringify(states));
    });

    it("should throw on non-ok response", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve("All checkboxes must be checked"),
      });

      await expect(
        submitDeclaration({
          listingId: "l-1",
          checkboxStates: [{ label: "A", checked: false }],
        }),
      ).rejects.toThrow("Declaration submission failed");
    });
  });

  describe("getDeclarationSummary", () => {
    it("should return declaration summary for listing", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            hasDeclared: true,
            signedAt: "2026-02-24T10:00:00Z",
            declarationVersion: "v1.0",
          }),
      });

      const result = await getDeclarationSummary("listing-1");

      expect(result.hasDeclared).toBe(true);
      expect(result.signedAt).toBe("2026-02-24T10:00:00Z");
    });

    it("should return hasDeclared false when no declaration", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            hasDeclared: false,
            signedAt: null,
            declarationVersion: null,
          }),
      });

      const result = await getDeclarationSummary("listing-2");
      expect(result.hasDeclared).toBe(false);
    });

    it("should throw on non-ok response", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Server error"),
      });

      await expect(getDeclarationSummary("l-1")).rejects.toThrow(
        "Failed to load declaration summary",
      );
    });
  });
});
