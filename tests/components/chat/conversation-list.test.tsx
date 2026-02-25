import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConversationList } from "@/components/chat/conversation-list";
import type { IConversationListItem } from "@auto/shared";

const mockConversations: IConversationListItem[] = [
  {
    conversationId: "conv-1",
    listingId: "listing-1",
    listingTitle: "BMW Serie 3 (2020)",
    listingPhoto: null,
    listingPrice: 25000,
    otherPartyId: "user-2",
    otherPartyName: "Jean Dupont",
    lastMessage: "Hello",
    lastMessageAt: "2026-02-25T10:00:00Z",
    unreadCount: 1,
  },
  {
    conversationId: "conv-2",
    listingId: "listing-2",
    listingTitle: "Audi A4 (2021)",
    listingPhoto: null,
    listingPrice: 30000,
    otherPartyId: "user-3",
    otherPartyName: "Marie Martin",
    lastMessage: "Merci",
    lastMessageAt: "2026-02-25T09:00:00Z",
    unreadCount: 0,
  },
];

describe("ConversationList", () => {
  it("should render loading state", () => {
    render(
      <ConversationList
        conversations={[]}
        activeConversationId={null}
        isLoading={true}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByTestId("conversation-list-loading")).toBeInTheDocument();
  });

  it("should render empty state", () => {
    render(
      <ConversationList
        conversations={[]}
        activeConversationId={null}
        isLoading={false}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByTestId("conversation-list-empty")).toBeInTheDocument();
    expect(screen.getByText(/Aucune conversation/)).toBeInTheDocument();
  });

  it("should render conversation items", () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeConversationId={null}
        isLoading={false}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByTestId("conversation-list")).toBeInTheDocument();
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByText("Marie Martin")).toBeInTheDocument();
  });

  it("should highlight active conversation", () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeConversationId="conv-1"
        isLoading={false}
        onSelect={vi.fn()}
      />,
    );
    const item = screen.getByTestId("conversation-item-conv-1");
    expect(item.className).toContain("bg-muted");
  });
});
