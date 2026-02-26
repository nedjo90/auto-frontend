import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();

vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockFetch(...args),
}));

import { fetchReportReasons, submitReport } from "@/lib/api/moderation-api";

describe("moderation-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchReportReasons", () => {
    it("returns active report reasons", async () => {
      const mockReasons = [{ ID: "r1", key: "spam", label: "Spam", severity: "low", active: true }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: mockReasons }),
      });

      const result = await fetchReportReasons();
      expect(result).toEqual(mockReasons);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/moderation/ReportReasons"),
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("throws on API error", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await expect(fetchReportReasons()).rejects.toThrow("Erreur");
    });
  });

  describe("submitReport", () => {
    const input = {
      targetType: "listing",
      targetId: "abc",
      reasonId: "r1",
      description: "Test description with enough chars",
    };

    it("submits report successfully", async () => {
      const mockResult = {
        reportId: "rpt-1",
        status: "pending",
        createdAt: "2026-02-25T00:00:00Z",
      };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResult),
      });

      const result = await submitReport(input);
      expect(result).toEqual(mockResult);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/moderation/submitReport"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(input),
        }),
      );
    });

    it("throws specific message on 429 rate limit", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 429 });
      await expect(submitReport(input)).rejects.toThrow("limite");
    });

    it("throws specific message on 409 duplicate", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 409 });
      await expect(submitReport(input)).rejects.toThrow("déjà signalé");
    });

    it("throws generic error on other failures", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Server error"),
      });
      await expect(submitReport(input)).rejects.toThrow("Server error");
    });
  });
});
