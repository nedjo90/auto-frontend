import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatHeader } from "@/components/chat/chat-header";

describe("ChatHeader", () => {
  it("should render listing title", () => {
    render(
      <ChatHeader listingTitle="BMW Serie 3 (2020)" listingPhoto={null} listingPrice={25000} />,
    );
    expect(screen.getByTestId("chat-header-title")).toHaveTextContent("BMW Serie 3 (2020)");
  });

  it("should render listing price formatted", () => {
    render(<ChatHeader listingTitle="BMW" listingPhoto={null} listingPrice={25000} />);
    const price = screen.getByTestId("chat-header-price");
    expect(price).toBeInTheDocument();
    expect(price.textContent).toContain("25");
  });

  it("should render listing photo when available", () => {
    render(
      <ChatHeader
        listingTitle="BMW"
        listingPhoto="https://cdn.example.com/photo.jpg"
        listingPrice={25000}
      />,
    );
    expect(screen.getByTestId("chat-header-photo")).toBeInTheDocument();
  });

  it("should not render photo when null", () => {
    render(<ChatHeader listingTitle="BMW" listingPhoto={null} listingPrice={null} />);
    expect(screen.queryByTestId("chat-header-photo")).not.toBeInTheDocument();
  });

  it("should render back button when onBack provided", async () => {
    const onBack = vi.fn();
    render(
      <ChatHeader listingTitle="BMW" listingPhoto={null} listingPrice={25000} onBack={onBack} />,
    );
    const backBtn = screen.getByText("Retour");
    await userEvent.click(backBtn);
    expect(onBack).toHaveBeenCalled();
  });

  it("should not render back button when onBack not provided", () => {
    render(<ChatHeader listingTitle="BMW" listingPhoto={null} listingPrice={25000} />);
    expect(screen.queryByText("Retour")).not.toBeInTheDocument();
  });
});
