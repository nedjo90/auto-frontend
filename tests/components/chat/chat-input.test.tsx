import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "@/components/chat/chat-input";

describe("ChatInput", () => {
  const mockOnSend = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render input and send button", () => {
    render(<ChatInput onSend={mockOnSend} />);
    expect(screen.getByTestId("chat-input-textarea")).toBeInTheDocument();
    expect(screen.getByTestId("chat-send-button")).toBeInTheDocument();
  });

  it("should disable send button when input is empty", () => {
    render(<ChatInput onSend={mockOnSend} />);
    expect(screen.getByTestId("chat-send-button")).toBeDisabled();
  });

  it("should enable send button when input has content", async () => {
    render(<ChatInput onSend={mockOnSend} />);
    const textarea = screen.getByTestId("chat-input-textarea");
    await userEvent.type(textarea, "Hello");
    expect(screen.getByTestId("chat-send-button")).not.toBeDisabled();
  });

  it("should call onSend and clear input on send", async () => {
    render(<ChatInput onSend={mockOnSend} />);
    const textarea = screen.getByTestId("chat-input-textarea");
    await userEvent.type(textarea, "Hello");
    await userEvent.click(screen.getByTestId("chat-send-button"));

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith("Hello");
    });
  });

  it("should send on Enter key press", async () => {
    render(<ChatInput onSend={mockOnSend} />);
    const textarea = screen.getByTestId("chat-input-textarea");
    await userEvent.type(textarea, "Hello{enter}");

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith("Hello");
    });
  });

  it("should not send on Shift+Enter", async () => {
    render(<ChatInput onSend={mockOnSend} />);
    const textarea = screen.getByTestId("chat-input-textarea");
    fireEvent.change(textarea, { target: { value: "Hello" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<ChatInput onSend={mockOnSend} disabled />);
    expect(screen.getByTestId("chat-input-textarea")).toBeDisabled();
  });

  it("should not send whitespace-only content", async () => {
    render(<ChatInput onSend={mockOnSend} />);
    const textarea = screen.getByTestId("chat-input-textarea");
    await userEvent.type(textarea, "   ");
    expect(screen.getByTestId("chat-send-button")).toBeDisabled();
  });
});
