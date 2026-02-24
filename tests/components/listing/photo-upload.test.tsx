import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhotoUpload } from "@/components/listing/photo-upload";

vi.mock("@auto/shared", () => ({
  PHOTO_ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp", "image/heic"],
}));

/** Helper to create a fake File object */
function createFile(name: string, type: string): File {
  return new File(["content"], name, { type });
}

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

  // ── handleCameraClick ──────────────────────────────────────────────────

  it("should trigger camera input when camera button clicked", async () => {
    const user = userEvent.setup();
    render(<PhotoUpload {...defaultProps} />);
    const cameraBtn = screen.getByTestId("photo-camera-btn");
    const cameraInput = screen.getByTestId("photo-camera-input") as HTMLInputElement;

    const clickSpy = vi.spyOn(cameraInput, "click");
    await user.click(cameraBtn);
    expect(clickSpy).toHaveBeenCalled();
  });

  // ── handleFileChange ───────────────────────────────────────────────────

  it("should call onFilesSelected when files are selected via file input", () => {
    render(<PhotoUpload {...defaultProps} />);
    const fileInput = screen.getByTestId("photo-file-input") as HTMLInputElement;

    const file = createFile("photo.jpg", "image/jpeg");
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(defaultProps.onFilesSelected).toHaveBeenCalledWith([file]);
  });

  it("should call onFilesSelected when files are selected via camera input", () => {
    render(<PhotoUpload {...defaultProps} />);
    const cameraInput = screen.getByTestId("photo-camera-input") as HTMLInputElement;

    const file = createFile("camera.jpg", "image/jpeg");
    fireEvent.change(cameraInput, { target: { files: [file] } });

    expect(defaultProps.onFilesSelected).toHaveBeenCalledWith([file]);
  });

  it("should not call onFilesSelected when no files are in the change event", () => {
    render(<PhotoUpload {...defaultProps} />);
    const fileInput = screen.getByTestId("photo-file-input") as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [] } });

    expect(defaultProps.onFilesSelected).not.toHaveBeenCalled();
  });

  it("should limit selected files to remaining slots", () => {
    // currentCount=18, maxPhotos=20 => remainingSlots=2
    render(<PhotoUpload {...defaultProps} currentCount={18} />);
    const fileInput = screen.getByTestId("photo-file-input") as HTMLInputElement;

    const files = [
      createFile("a.jpg", "image/jpeg"),
      createFile("b.jpg", "image/jpeg"),
      createFile("c.jpg", "image/jpeg"),
      createFile("d.jpg", "image/jpeg"),
    ];
    fireEvent.change(fileInput, { target: { files } });

    // Should only pass the first 2 files (remaining slots)
    expect(defaultProps.onFilesSelected).toHaveBeenCalledWith([files[0], files[1]]);
  });

  it("should reset file input value after selection", () => {
    render(<PhotoUpload {...defaultProps} />);
    const fileInput = screen.getByTestId("photo-file-input") as HTMLInputElement;

    const file = createFile("photo.jpg", "image/jpeg");
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(fileInput.value).toBe("");
  });

  // ── DropZone handleDrop ────────────────────────────────────────────────

  it("should call onFilesSelected when valid files are dropped", () => {
    render(<PhotoUpload {...defaultProps} />);
    const dropZone = screen.getByTestId("photo-drop-zone");

    const file = createFile("dropped.jpg", "image/jpeg");
    const dataTransfer = { files: [file] };

    fireEvent.drop(dropZone, { dataTransfer });

    expect(defaultProps.onFilesSelected).toHaveBeenCalledWith([file]);
  });

  it("should filter out non-image files on drop", () => {
    render(<PhotoUpload {...defaultProps} />);
    const dropZone = screen.getByTestId("photo-drop-zone");

    const jpegFile = createFile("photo.jpg", "image/jpeg");
    const pdfFile = createFile("doc.pdf", "application/pdf");
    const pngFile = createFile("img.png", "image/png");
    const dataTransfer = { files: [jpegFile, pdfFile, pngFile] };

    fireEvent.drop(dropZone, { dataTransfer });

    // Only image/jpeg and image/png should pass the MIME type filter
    expect(defaultProps.onFilesSelected).toHaveBeenCalledWith([jpegFile, pngFile]);
  });

  it("should not call onFilesSelected when only invalid files are dropped", () => {
    render(<PhotoUpload {...defaultProps} />);
    const dropZone = screen.getByTestId("photo-drop-zone");

    const pdfFile = createFile("doc.pdf", "application/pdf");
    const txtFile = createFile("note.txt", "text/plain");
    const dataTransfer = { files: [pdfFile, txtFile] };

    fireEvent.drop(dropZone, { dataTransfer });

    expect(defaultProps.onFilesSelected).not.toHaveBeenCalled();
  });

  it("should not process drop when disabled", () => {
    render(<PhotoUpload {...defaultProps} disabled />);
    const dropZone = screen.getByTestId("photo-drop-zone");

    const file = createFile("photo.jpg", "image/jpeg");
    const dataTransfer = { files: [file] };

    fireEvent.drop(dropZone, { dataTransfer });

    expect(defaultProps.onFilesSelected).not.toHaveBeenCalled();
  });

  it("should limit dropped files to remaining slots", () => {
    // currentCount=18, maxPhotos=20 => remainingSlots=2
    render(<PhotoUpload {...defaultProps} currentCount={18} />);
    const dropZone = screen.getByTestId("photo-drop-zone");

    const files = [
      createFile("a.jpg", "image/jpeg"),
      createFile("b.png", "image/png"),
      createFile("c.webp", "image/webp"),
    ];
    const dataTransfer = { files };

    fireEvent.drop(dropZone, { dataTransfer });

    // onFilesSelected is called from the DropZone which slices to remainingSlots
    const passedFiles = defaultProps.onFilesSelected.mock.calls[0][0];
    expect(passedFiles.length).toBeLessThanOrEqual(2);
  });

  // ── DropZone handleDragOver ────────────────────────────────────────────

  it("should prevent default on dragover", () => {
    render(<PhotoUpload {...defaultProps} />);
    const dropZone = screen.getByTestId("photo-drop-zone");

    const dragOverEvent = new Event("dragover", { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(dragOverEvent, "preventDefault");
    dropZone.dispatchEvent(dragOverEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  // ── No remaining-slots message when > 3 slots ─────────────────────────

  it("should not show remaining slots message when more than 3 slots remain", () => {
    render(<PhotoUpload {...defaultProps} currentCount={5} />);
    // 15 slots remaining — no warning
    expect(screen.queryByText(/emplacement/)).not.toBeInTheDocument();
  });

  it("should show 3 emplacements restants when exactly 3 remaining", () => {
    render(<PhotoUpload {...defaultProps} currentCount={17} />);
    expect(screen.getByText(/3 emplacements restants/)).toBeInTheDocument();
  });
});
