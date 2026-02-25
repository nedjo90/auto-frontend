import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const mockGetConversations = vi.fn();
const mockPush = vi.fn();

vi.mock("@/lib/api/chat-api", () => ({
  getConversations: (...args: unknown[]) => mockGetConversations(...args),
}));

vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: () => ({ isAuthenticated: true, userId: "seller-1", displayName: "Test Seller" }),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/hooks/use-signalr", () => ({
  useSignalR: vi.fn(() => ({ status: "disconnected", disconnect: vi.fn() })),
}));

import SellerChatPage from "@/app/(dashboard)/seller/chat/page";

const mockConversations = [
  {
    conversationId: "conv-1",
    listingId: "listing-1",
    listingTitle: "BMW Serie 3 (2020)",
    listingPhoto: null,
    listingPrice: 25000,
    otherPartyId: "buyer-1",
    otherPartyName: "Jean Dupont",
    lastMessage: "Bonjour",
    lastMessageAt: "2026-02-25T10:00:00Z",
    unreadCount: 2,
  },
];

describe("SellerChatPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockGetConversations.mockReturnValue(new Promise(() => {})); // never resolves
    render(<SellerChatPage />);
    expect(screen.getByText("Messages")).toBeInTheDocument();
  });

  it("should render conversations after loading", async () => {
    mockGetConversations.mockResolvedValue({
      items: mockConversations,
      total: 1,
      hasMore: false,
    });

    render(<SellerChatPage />);

    await waitFor(() => {
      expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    });
  });

  it("should show empty state when no conversations", async () => {
    mockGetConversations.mockResolvedValue({
      items: [],
      total: 0,
      hasMore: false,
    });

    render(<SellerChatPage />);

    await waitFor(() => {
      expect(screen.getByText(/Aucune conversation/)).toBeInTheDocument();
    });
  });

  it("should show select prompt on desktop when no conversation selected", async () => {
    mockGetConversations.mockResolvedValue({
      items: mockConversations,
      total: 1,
      hasMore: false,
    });

    render(<SellerChatPage />);

    await waitFor(() => {
      expect(screen.getByText("Sélectionnez une conversation")).toBeInTheDocument();
    });
  });
});
