import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(),
}));

import { useIsMobile } from "@/hooks/use-mobile";

describe("ResponsiveDialog", () => {
  beforeEach(() => {
    vi.mocked(useIsMobile).mockReturnValue(false);
  });

  it("renders as Dialog on desktop", () => {
    vi.mocked(useIsMobile).mockReturnValue(false);
    render(
      <ResponsiveDialog open>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Test Title</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>Test Description</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
        </ResponsiveDialogContent>
      </ResponsiveDialog>,
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    // Dialog uses data-slot="dialog-content"
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeInTheDocument();
  });

  it("renders as Sheet on mobile", () => {
    vi.mocked(useIsMobile).mockReturnValue(true);
    render(
      <ResponsiveDialog open>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Mobile Title</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>Mobile Desc</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
        </ResponsiveDialogContent>
      </ResponsiveDialog>,
    );
    expect(screen.getByText("Mobile Title")).toBeInTheDocument();
    // Sheet uses data-slot="sheet-content"
    expect(document.querySelector('[data-slot="sheet-content"]')).toBeInTheDocument();
  });

  it("supports controlled open/close", async () => {
    const onOpenChange = vi.fn();
    vi.mocked(useIsMobile).mockReturnValue(false);

    render(
      <ResponsiveDialog open onOpenChange={onOpenChange}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Controlled</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
        </ResponsiveDialogContent>
      </ResponsiveDialog>,
    );
    expect(screen.getByText("Controlled")).toBeInTheDocument();
  });
});
