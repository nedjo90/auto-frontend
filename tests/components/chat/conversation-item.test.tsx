import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversationItem } from "@/components/chat/conversation-item";
import type { IConversationListItem } from "@auto/shared";

const mockConversation: IConversationListItem = {
  conversationId: "conv-1",
  listingId: "listing-1",
  listingTitle: "BMW Serie 3 (2020)",
  listingPhoto: "https://cdn.example.com/photo.jpg",
  listingPrice: 25000,
  otherPartyId: "user-2",
  otherPartyName: "Jean Dupont",
  lastMessage: "Est-ce toujours disponible ?",
  lastMessageAt: new Date().toISOString(),
  unreadCount: 3,
};

describe("ConversationItem", () => {
  it("should render other party name", () => {
    render(<ConversationItem conversation={mockConversation} onClick={vi.fn()} />);
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
  });

  it("should render listing title", () => {
    render(<ConversationItem conversation={mockConversation} onClick={vi.fn()} />);
    expect(screen.getByText("BMW Serie 3 (2020)")).toBeInTheDocument();
  });

  it("should render last message preview", () => {
    render(<ConversationItem conversation={mockConversation} onClick={vi.fn()} />);
    expect(screen.getByText("Est-ce toujours disponible ?")).toBeInTheDocument();
  });

  it("should render unread badge when unread > 0", () => {
    render(<ConversationItem conversation={mockConversation} onClick={vi.fn()} />);
    expect(screen.getByTestId("unread-badge-conv-1")).toHaveTextContent("3");
  });

  it("should not render unread badge when unread is 0", () => {
    render(
      <ConversationItem conversation={{ ...mockConversation, unreadCount: 0 }} onClick={vi.fn()} />,
    );
    expect(screen.queryByTestId("unread-badge-conv-1")).not.toBeInTheDocument();
  });

  it("should render vehicle photo", () => {
    render(<ConversationItem conversation={mockConversation} onClick={vi.fn()} />);
    const img = screen.getByAltText("BMW Serie 3 (2020)");
    expect(img).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<ConversationItem conversation={mockConversation} onClick={onClick} />);
    await userEvent.click(screen.getByTestId("conversation-item-conv-1"));
    expect(onClick).toHaveBeenCalled();
  });

  it("should show active state when isActive", () => {
    render(<ConversationItem conversation={mockConversation} isActive onClick={vi.fn()} />);
    const button = screen.getByTestId("conversation-item-conv-1");
    expect(button.className).toContain("bg-muted");
  });

  it("should show placeholder when no photo", () => {
    render(
      <ConversationItem
        conversation={{ ...mockConversation, listingPhoto: null }}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByText("Auto")).toBeInTheDocument();
  });

  it("should show fallback for new conversations", () => {
    render(
      <ConversationItem
        conversation={{ ...mockConversation, lastMessage: null }}
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByText("Nouvelle conversation")).toBeInTheDocument();
  });
});
