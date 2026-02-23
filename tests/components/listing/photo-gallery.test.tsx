import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhotoGallery } from "@/components/listing/photo-gallery";
import type { PhotoItem } from "@/stores/photo-store";

function makePhoto(overrides: Partial<PhotoItem> = {}): PhotoItem {
  return {
    id: "p1",
    cdnUrl: "https://cdn.example.com/photo1.jpg",
    sortOrder: 0,
    isPrimary: true,
    fileSize: 1024,
    mimeType: "image/jpeg",
    width: 800,
    height: 600,
    uploadStatus: "success",
    uploadProgress: 100,
    ...overrides,
  };
}

describe("PhotoGallery", () => {
  const mockOnReorder = vi.fn();
  const mockOnDelete = vi.fn();

  const threePhotos: PhotoItem[] = [
    makePhoto({ id: "p1", sortOrder: 0, isPrimary: true }),
    makePhoto({
      id: "p2",
      sortOrder: 1,
      isPrimary: false,
      cdnUrl: "https://cdn.example.com/photo2.jpg",
    }),
    makePhoto({
      id: "p3",
      sortOrder: 2,
      isPrimary: false,
      cdnUrl: "https://cdn.example.com/photo3.jpg",
    }),
  ];

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // ─── Rendering ──────────────────────────────────────────────────────

  it("should show empty state when no photos", () => {
    render(<PhotoGallery photos={[]} onReorder={mockOnReorder} onDelete={mockOnDelete} />);
    expect(screen.getByTestId("photo-gallery-empty")).toHaveTextContent("Aucune photo ajoutée");
  });

  it("should render photo grid", () => {
    render(<PhotoGallery photos={threePhotos} onReorder={mockOnReorder} onDelete={mockOnDelete} />);
    expect(screen.getByTestId("photo-gallery")).toBeInTheDocument();
    expect(screen.getByTestId("photo-item-p1")).toBeInTheDocument();
    expect(screen.getByTestId("photo-item-p2")).toBeInTheDocument();
    expect(screen.getByTestId("photo-item-p3")).toBeInTheDocument();
  });

  it("should show primary badge on first photo", () => {
    render(<PhotoGallery photos={threePhotos} onReorder={mockOnReorder} onDelete={mockOnDelete} />);
    expect(screen.getByTestId("photo-primary-badge")).toBeInTheDocument();
  });

  it("should show delete button for each photo", () => {
    render(<PhotoGallery photos={threePhotos} onReorder={mockOnReorder} onDelete={mockOnDelete} />);
    expect(screen.getByTestId("photo-delete-p1")).toBeInTheDocument();
    expect(screen.getByTestId("photo-delete-p2")).toBeInTheDocument();
    expect(screen.getByTestId("photo-delete-p3")).toBeInTheDocument();
  });

  // ─── Upload status indicators ──────────────────────────────────────

  it("should show progress overlay for uploading photo", () => {
    const uploadingPhoto = makePhoto({
      id: "p-uploading",
      uploadStatus: "uploading",
      uploadProgress: 50,
    });
    render(
      <PhotoGallery photos={[uploadingPhoto]} onReorder={mockOnReorder} onDelete={mockOnDelete} />,
    );
    expect(screen.getByTestId("photo-progress-p-uploading")).toBeInTheDocument();
  });

  it("should show error overlay for failed photo", () => {
    const errorPhoto = makePhoto({
      id: "p-error",
      uploadStatus: "error",
      errorMessage: "Upload failed",
    });
    render(
      <PhotoGallery photos={[errorPhoto]} onReorder={mockOnReorder} onDelete={mockOnDelete} />,
    );
    expect(screen.getByTestId("photo-error-p-error")).toHaveTextContent("Upload failed");
  });

  // ─── Delete confirmation ──────────────────────────────────────────

  it("should require double click to delete", async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={threePhotos} onReorder={mockOnReorder} onDelete={mockOnDelete} />);

    const deleteBtn = screen.getByTestId("photo-delete-p2");

    // First click: confirm
    await user.click(deleteBtn);
    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(deleteBtn).toHaveAttribute("aria-label", "Confirmer la suppression");

    // Second click: delete
    await user.click(deleteBtn);
    expect(mockOnDelete).toHaveBeenCalledWith("p2");
  });

  // ─── Keyboard reordering ──────────────────────────────────────────

  it("should move photo left on ArrowLeft", async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={threePhotos} onReorder={mockOnReorder} onDelete={mockOnDelete} />);

    const item = screen.getByTestId("photo-item-p2");
    item.focus();
    await user.keyboard("{ArrowLeft}");

    expect(mockOnReorder).toHaveBeenCalledWith(["p2", "p1", "p3"]);
  });

  it("should move photo right on ArrowRight", async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={threePhotos} onReorder={mockOnReorder} onDelete={mockOnDelete} />);

    const item = screen.getByTestId("photo-item-p1");
    item.focus();
    await user.keyboard("{ArrowRight}");

    expect(mockOnReorder).toHaveBeenCalledWith(["p2", "p1", "p3"]);
  });

  it("should not move past start on ArrowLeft at first position", async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={threePhotos} onReorder={mockOnReorder} onDelete={mockOnDelete} />);

    const item = screen.getByTestId("photo-item-p1");
    item.focus();
    await user.keyboard("{ArrowLeft}");

    // Should not reorder since item is already at position 0
    expect(mockOnReorder).not.toHaveBeenCalled();
  });

  it("should not move past end on ArrowRight at last position", async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={threePhotos} onReorder={mockOnReorder} onDelete={mockOnDelete} />);

    const item = screen.getByTestId("photo-item-p3");
    item.focus();
    await user.keyboard("{ArrowRight}");

    expect(mockOnReorder).not.toHaveBeenCalled();
  });

  // ─── Accessibility ────────────────────────────────────────────────

  it("should have role=list on gallery container", () => {
    render(<PhotoGallery photos={threePhotos} onReorder={mockOnReorder} onDelete={mockOnDelete} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("should have role=listitem on each photo", () => {
    render(<PhotoGallery photos={threePhotos} onReorder={mockOnReorder} onDelete={mockOnDelete} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("should have aria-label with position and primary indicator", () => {
    render(<PhotoGallery photos={threePhotos} onReorder={mockOnReorder} onDelete={mockOnDelete} />);
    const firstItem = screen.getByTestId("photo-item-p1");
    expect(firstItem.getAttribute("aria-label")).toContain("Photo 1");
    expect(firstItem.getAttribute("aria-label")).toContain("principale");
  });

  it("should have 44px minimum touch targets on delete buttons", () => {
    render(<PhotoGallery photos={threePhotos} onReorder={mockOnReorder} onDelete={mockOnDelete} />);
    const deleteBtn = screen.getByTestId("photo-delete-p1");
    expect(deleteBtn.className).toContain("min-h-[44px]");
    expect(deleteBtn.className).toContain("min-w-[44px]");
  });

  // ─── Disabled state ───────────────────────────────────────────────

  it("should not allow keyboard reorder when disabled", async () => {
    const user = userEvent.setup();
    render(
      <PhotoGallery
        photos={threePhotos}
        onReorder={mockOnReorder}
        onDelete={mockOnDelete}
        disabled
      />,
    );

    const item = screen.getByTestId("photo-item-p2");
    item.focus();
    await user.keyboard("{ArrowLeft}");

    expect(mockOnReorder).not.toHaveBeenCalled();
  });
});
