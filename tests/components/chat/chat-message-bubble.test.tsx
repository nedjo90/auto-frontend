import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import type { IChatMessage } from "@auto/shared";

const baseMessage: IChatMessage = {
  ID: "msg-1",
  conversationId: "conv-1",
  senderId: "user-1",
  content: "Bonjour, est-ce disponible ?",
  timestamp: "2026-02-25T10:30:00Z",
  deliveryStatus: "sent",
};

describe("ChatMessageBubble", () => {
  it("should render message content", () => {
    render(<ChatMessageBubble message={baseMessage} isOwn={false} />);
    expect(screen.getByText("Bonjour, est-ce disponible ?")).toBeInTheDocument();
  });

  it("should show delivery indicator for own messages", () => {
    render(<ChatMessageBubble message={baseMessage} isOwn={true} />);
    expect(screen.getByLabelText("Envoyé")).toBeInTheDocument();
  });

  it("should show delivered indicator", () => {
    render(
      <ChatMessageBubble message={{ ...baseMessage, deliveryStatus: "delivered" }} isOwn={true} />,
    );
    expect(screen.getByLabelText("Distribué")).toBeInTheDocument();
  });

  it("should show read indicator", () => {
    render(<ChatMessageBubble message={{ ...baseMessage, deliveryStatus: "read" }} isOwn={true} />);
    expect(screen.getByLabelText("Lu")).toBeInTheDocument();
  });

  it("should not show delivery indicator for received messages", () => {
    render(<ChatMessageBubble message={baseMessage} isOwn={false} />);
    expect(screen.queryByLabelText("Envoyé")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Distribué")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Lu")).not.toBeInTheDocument();
  });

  it("should apply own message styling", () => {
    const { container } = render(<ChatMessageBubble message={baseMessage} isOwn={true} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("justify-end");
  });

  it("should apply received message styling", () => {
    const { container } = render(<ChatMessageBubble message={baseMessage} isOwn={false} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("justify-start");
  });

  it("should display the testid", () => {
    render(<ChatMessageBubble message={baseMessage} isOwn={false} />);
    expect(screen.getByTestId("chat-message-msg-1")).toBeInTheDocument();
  });
});
