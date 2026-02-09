import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";

const mockConnection = {
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  onreconnecting: vi.fn(),
  onreconnected: vi.fn(),
  onclose: vi.fn(),
  state: "Disconnected",
};

vi.mock("@microsoft/signalr", () => {
  class MockHubConnectionBuilder {
    withUrl() {
      return this;
    }
    withAutomaticReconnect() {
      return this;
    }
    configureLogging() {
      return this;
    }
    build() {
      return mockConnection;
    }
  }
  return {
    HubConnectionBuilder: MockHubConnectionBuilder,
    LogLevel: { Warning: 2 },
    HubConnectionState: { Disconnected: "Disconnected" },
  };
});

import { useSignalR } from "@/hooks/use-signalr";

describe("useSignalR", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockConnection.start.mockResolvedValue(undefined);
    mockConnection.stop.mockResolvedValue(undefined);
    mockConnection.state = "Disconnected";
  });

  it("should start in disconnected state when no URL configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SIGNALR_URL", "");
    const { result } = renderHook(() => useSignalR({ hubPath: "admin", events: {} }));
    expect(result.current.status).toBe("disconnected");
  });

  it("should attempt connection when URL is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SIGNALR_URL", "https://test.signalr.net");
    renderHook(() => useSignalR({ hubPath: "admin", events: { kpiUpdate: vi.fn() } }));

    await vi.waitFor(() => {
      expect(mockConnection.start).toHaveBeenCalled();
    });
  });

  it("should register event handlers on connection", async () => {
    vi.stubEnv("NEXT_PUBLIC_SIGNALR_URL", "https://test.signalr.net");
    const handler = vi.fn();

    renderHook(() => useSignalR({ hubPath: "admin", events: { kpiUpdate: handler } }));

    await vi.waitFor(() => {
      expect(mockConnection.on).toHaveBeenCalledWith("kpiUpdate", handler);
    });
  });

  it("should not connect when enabled is false", () => {
    vi.stubEnv("NEXT_PUBLIC_SIGNALR_URL", "https://test.signalr.net");
    renderHook(() => useSignalR({ hubPath: "admin", events: {}, enabled: false }));
    expect(mockConnection.start).not.toHaveBeenCalled();
  });

  it("should handle connection error", async () => {
    vi.stubEnv("NEXT_PUBLIC_SIGNALR_URL", "https://test.signalr.net");
    mockConnection.start.mockRejectedValueOnce(new Error("Connection failed"));

    const { result } = renderHook(() => useSignalR({ hubPath: "admin", events: {} }));

    await vi.waitFor(() => {
      expect(result.current.status).toBe("error");
    });
  });

  it("should set up reconnection callbacks", async () => {
    vi.stubEnv("NEXT_PUBLIC_SIGNALR_URL", "https://test.signalr.net");
    renderHook(() => useSignalR({ hubPath: "admin", events: {} }));

    await vi.waitFor(() => {
      expect(mockConnection.onreconnecting).toHaveBeenCalled();
      expect(mockConnection.onreconnected).toHaveBeenCalled();
      expect(mockConnection.onclose).toHaveBeenCalled();
    });
  });
});
