import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhotoUpload } from "@/components/listing/photo-upload";

vi.mock("@auto/shared", () => ({
  PHOTO_ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp", "image/heic"],
}));

describe("PhotoUpload", () => {
  const defaultProps = {
    onFilesSelected: vi.fn(),
    currentCount: 3,
    maxPhotos: 20,
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render with label and photo count", () => {
    render(<PhotoUpload {...defaultProps} />);
    expect(screen.getByTestId("photo-upload-label")).toHaveTextContent("Photos du véhicule");
    expect(screen.getByTestId("photo-count")).toHaveTextContent("3/20 photos");
  });

  it("should render file picker and camera buttons", () => {
    render(<PhotoUpload {...defaultProps} />);
    expect(screen.getByTestId("photo-picker-btn")).toBeInTheDocument();
    expect(screen.getByTestId("photo-camera-btn")).toBeInTheDocument();
  });

  it("should have minimum 44x44px touch targets", () => {
    render(<PhotoUpload {...defaultProps} />);
    const pickerBtn = screen.getByTestId("photo-picker-btn");
    const cameraBtn = screen.getByTestId("photo-camera-btn");
    // Check class contains min-h and min-w for 44px
    expect(pickerBtn.className).toContain("min-h-[44px]");
    expect(pickerBtn.className).toContain("min-w-[44px]");
    expect(cameraBtn.className).toContain("min-h-[44px]");
    expect(cameraBtn.className).toContain("min-w-[44px]");
  });

  it("should have accessible aria-labels", () => {
    render(<PhotoUpload {...defaultProps} />);
    expect(screen.getByLabelText("Sélectionner des photos")).toBeInTheDocument();
    expect(screen.getByLabelText("Prendre une photo")).toBeInTheDocument();
  });

  it("should show drop zone when slots available", () => {
    render(<PhotoUpload {...defaultProps} />);
    expect(screen.getByTestId("photo-drop-zone")).toBeInTheDocument();
  });

  it("should show limit message when at max photos", () => {
    render(<PhotoUpload {...defaultProps} currentCount={20} />);
    expect(screen.getByTestId("photo-limit-message")).toHaveTextContent(
      "Nombre maximum de photos atteint (20)",
    );
  });

  it("should not show drop zone when at max photos", () => {
    render(<PhotoUpload {...defaultProps} currentCount={20} />);
    expect(screen.queryByTestId("photo-drop-zone")).not.toBeInTheDocument();
  });

  it("should disable buttons when at max photos", () => {
    render(<PhotoUpload {...defaultProps} currentCount={20} />);
    expect(screen.getByTestId("photo-picker-btn")).toBeDisabled();
    expect(screen.getByTestId("photo-camera-btn")).toBeDisabled();
  });

  it("should disable buttons when disabled prop is true", () => {
    render(<PhotoUpload {...defaultProps} disabled />);
    expect(screen.getByTestId("photo-picker-btn")).toBeDisabled();
    expect(screen.getByTestId("photo-camera-btn")).toBeDisabled();
  });

  it("should have hidden file input with correct accept attribute", () => {
    render(<PhotoUpload {...defaultProps} />);
    const input = screen.getByTestId("photo-file-input") as HTMLInputElement;
    expect(input.accept).toBe("image/jpeg,image/png,image/webp,image/heic");
    expect(input.multiple).toBe(true);
  });

  it("should have camera input with capture attribute", () => {
    render(<PhotoUpload {...defaultProps} />);
    const input = screen.getByTestId("photo-camera-input") as HTMLInputElement;
    expect(input.getAttribute("capture")).toBe("environment");
  });

  it("should trigger file input when picker button clicked", async () => {
    const user = userEvent.setup();
    render(<PhotoUpload {...defaultProps} />);
    const pickerBtn = screen.getByTestId("photo-picker-btn");
    const fileInput = screen.getByTestId("photo-file-input") as HTMLInputElement;

    const clickSpy = vi.spyOn(fileInput, "click");
    await user.click(pickerBtn);
    expect(clickSpy).toHaveBeenCalled();
  });

  it("should show remaining slots warning when <= 3 slots", () => {
    render(<PhotoUpload {...defaultProps} currentCount={18} />);
    expect(screen.getByText(/2 emplacements restants/)).toBeInTheDocument();
  });

  it("should show singular remaining slot message", () => {
    render(<PhotoUpload {...defaultProps} currentCount={19} />);
    expect(screen.getByText(/1 emplacement restant$/)).toBeInTheDocument();
  });
});
