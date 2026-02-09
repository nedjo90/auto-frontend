"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";

export type SignalRStatus = "disconnected" | "connecting" | "connected" | "error";

export interface UseSignalROptions {
  hubPath: string;
  events: Record<string, (data: unknown) => void>;
  enabled?: boolean;
}

/**
 * Hook for connecting to an Azure SignalR hub and subscribing to events.
 */
export function useSignalR({ hubPath, events, enabled = true }: UseSignalROptions) {
  const connectionRef = useRef<HubConnection | null>(null);
  const eventsRef = useRef(events);
  const [status, setStatus] = useState<SignalRStatus>("disconnected");

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    const signalrUrl = process.env.NEXT_PUBLIC_SIGNALR_URL || "";
    if (!signalrUrl || !enabled) return;

    let cancelled = false;
    const url = `${signalrUrl}/${hubPath}`;

    const connection = new HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // Register event handlers
    for (const [eventName, handler] of Object.entries(eventsRef.current)) {
      connection.on(eventName, handler);
    }

    connection.onreconnecting(() => {
      if (!cancelled) setStatus("connecting");
    });
    connection.onreconnected(() => {
      if (!cancelled) setStatus("connected");
    });
    connection.onclose(() => {
      if (!cancelled) setStatus("disconnected");
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: show connecting status immediately
    setStatus("connecting");
    connection.start().then(
      () => {
        if (!cancelled) setStatus("connected");
      },
      () => {
        if (!cancelled) setStatus("error");
      },
    );

    return () => {
      cancelled = true;
      if (connection.state !== HubConnectionState.Disconnected) {
        connection.stop();
      }
      connectionRef.current = null;
      setStatus("disconnected");
    };
  }, [hubPath, enabled]);

  const disconnect = useCallback(async () => {
    const connection = connectionRef.current;
    if (connection && connection.state !== HubConnectionState.Disconnected) {
      await connection.stop();
    }
    connectionRef.current = null;
    setStatus("disconnected");
  }, []);

  return { status, disconnect };
}
