import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { RoleAssignmentDialog } from "@/components/admin/role-assignment-dialog";

const mockUser = {
  ID: "u1",
  email: "buyer@test.com",
  firstName: "Jean",
  lastName: "Dupont",
  currentRole: "buyer",
};

const mockRoles = [
  { code: "buyer", name: "Acheteur" },
  { code: "seller", name: "Vendeur" },
  { code: "moderator", name: "Moderateur" },
  { code: "administrator", name: "Administrateur" },
];

describe("RoleAssignmentDialog", () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    cleanup();
    mockFetch.mockReset();
    onClose.mockClear();
    onSuccess.mockClear();
  });

  it("renders dialog with user info when open", () => {
    render(
      <RoleAssignmentDialog
        open
        user={mockUser}
        roles={mockRoles}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText(/Jean Dupont/)).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <RoleAssignmentDialog
        open={false}
        user={mockUser}
        roles={mockRoles}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(container.textContent).toBe("");
  });

  it("shows a confirmation button", () => {
    render(
      <RoleAssignmentDialog
        open
        user={mockUser}
        roles={mockRoles}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText(/Confirmer/i)).toBeInTheDocument();
  });

  it("calls onSuccess after successful role assignment", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(
      <RoleAssignmentDialog
        open
        user={{ ...mockUser, currentRole: "buyer" }}
        roles={mockRoles}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    const confirmBtn = screen.getByText(/Confirmer/i);
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("shows cancel button that calls onClose", async () => {
    render(
      <RoleAssignmentDialog
        open
        user={mockUser}
        roles={mockRoles}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );

    const cancelBtn = screen.getByText(/Annuler/i);
    await userEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
