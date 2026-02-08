import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/auth/auth-utils", () => ({
  getAccessToken: vi.fn(),
  loginRedirect: vi.fn(() => Promise.resolve()),
}));

import { apiClient } from "@/lib/auth/api-client";
import { getAccessToken, loginRedirect } from "@/lib/auth/auth-utils";

describe("api-client", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("attaches Bearer token to requests", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-abc");
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await apiClient("/api/test");

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const headers = callArgs[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer token-abc");
  });

  it("merges custom headers with auth header", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-abc");
    vi.mocked(global.fetch).mockResolvedValue(new Response("{}", { status: 200 }));

    await apiClient("/api/test", {
      headers: { "Content-Type": "application/json" },
    });

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const headers = callArgs[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer token-abc");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("throws and triggers loginRedirect on 401 response", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("expired-token");
    vi.mocked(global.fetch).mockResolvedValue(new Response("Unauthorized", { status: 401 }));

    await expect(apiClient("/api/protected")).rejects.toThrow("Authentication required");
    expect(loginRedirect).toHaveBeenCalled();
  });

  it("works without token (unauthenticated request)", async () => {
    vi.mocked(getAccessToken).mockResolvedValue(null);
    vi.mocked(global.fetch).mockResolvedValue(new Response("{}", { status: 200 }));

    await apiClient("/api/public");

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const headers = callArgs[1]?.headers as Headers;
    expect(headers.has("Authorization")).toBe(false);
  });

  it("passes through non-401 error responses", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token");
    vi.mocked(global.fetch).mockResolvedValue(new Response("Server Error", { status: 500 }));

    const response = await apiClient("/api/test");

    expect(response.status).toBe(500);
    expect(loginRedirect).not.toHaveBeenCalled();
  });
});
