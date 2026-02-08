import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/auth/auth-utils", () => ({
  getAccessToken: vi.fn(),
  loginRedirect: vi.fn(),
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

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-abc",
        }),
      }),
    );
  });

  it("merges custom headers with auth header", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-abc");
    vi.mocked(global.fetch).mockResolvedValue(
      new Response("{}", { status: 200 }),
    );

    await apiClient("/api/test", {
      headers: { "Content-Type": "application/json" },
    });

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const headers = (callArgs[1] as RequestInit).headers as Record<
      string,
      string
    >;
    expect(headers["Authorization"]).toBe("Bearer token-abc");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("triggers loginRedirect on 401 response", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("expired-token");
    vi.mocked(global.fetch).mockResolvedValue(
      new Response("Unauthorized", { status: 401 }),
    );

    const response = await apiClient("/api/protected");

    expect(response.status).toBe(401);
    expect(loginRedirect).toHaveBeenCalled();
  });

  it("works without token (unauthenticated request)", async () => {
    vi.mocked(getAccessToken).mockResolvedValue(null);
    vi.mocked(global.fetch).mockResolvedValue(
      new Response("{}", { status: 200 }),
    );

    await apiClient("/api/public");

    const callArgs = vi.mocked(global.fetch).mock.calls[0];
    const headers = (callArgs[1] as RequestInit).headers as Record<
      string,
      string
    >;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("passes through non-401 error responses", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token");
    vi.mocked(global.fetch).mockResolvedValue(
      new Response("Server Error", { status: 500 }),
    );

    const response = await apiClient("/api/test");

    expect(response.status).toBe(500);
    expect(loginRedirect).not.toHaveBeenCalled();
  });
});
