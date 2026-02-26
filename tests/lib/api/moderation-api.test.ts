import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();

vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockFetch(...args),
}));

import {
  fetchReportReasons,
  submitReport,
  fetchReportQueue,
  fetchReportMetrics,
  fetchReportDetail,
  assignReport,
} from "@/lib/api/moderation-api";

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

  describe("fetchReportQueue", () => {
    it("returns paginated report queue", async () => {
      const mockItems = [{ ID: "r1", severity: "high", status: "pending", targetType: "listing" }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: JSON.stringify(mockItems), total: 1, hasMore: false }),
      });

      const result = await fetchReportQueue({ status: "pending", skip: 0, top: 20 });
      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/moderation/getReportQueue"),
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("handles pre-parsed items array", async () => {
      const mockItems = [{ ID: "r1" }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: mockItems, total: 1, hasMore: false }),
      });

      const result = await fetchReportQueue();
      expect(result.items).toEqual(mockItems);
    });

    it("throws on API error", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await expect(fetchReportQueue()).rejects.toThrow("Erreur");
    });
  });

  describe("fetchReportMetrics", () => {
    it("returns metrics summary", async () => {
      const mockMetrics = {
        pendingCount: 5,
        inProgressCount: 3,
        treatedThisWeek: 10,
        dismissedThisWeek: 2,
        weeklyTrend: 20,
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockMetrics),
      });

      const result = await fetchReportMetrics();
      expect(result).toEqual(mockMetrics);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/moderation/getReportMetrics"),
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("throws on API error", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await expect(fetchReportMetrics()).rejects.toThrow("Erreur");
    });
  });

  describe("fetchReportDetail", () => {
    it("returns parsed report detail", async () => {
      const detail = {
        ID: "r1",
        reporterName: "Jean",
        severity: "high",
        targetType: "listing",
      };
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(detail)),
      });

      const result = await fetchReportDetail("r1");
      expect(result).toEqual(detail);
    });

    it("handles double-stringified response", async () => {
      const detail = { ID: "r1" };
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(JSON.stringify(detail))),
      });

      const result = await fetchReportDetail("r1");
      expect(result).toEqual(detail);
    });

    it("throws on 404", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });
      await expect(fetchReportDetail("r1")).rejects.toThrow("introuvable");
    });
  });

  describe("assignReport", () => {
    it("assigns report successfully", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, status: "in_progress" }),
      });

      const result = await assignReport("r1");
      expect(result.success).toBe(true);
      expect(result.status).toBe("in_progress");
    });

    it("throws on 409 conflict", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 409 });
      await expect(assignReport("r1")).rejects.toThrow("autre modérateur");
    });

    it("throws on generic error", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await expect(assignReport("r1")).rejects.toThrow("Erreur");
    });
  });
});
