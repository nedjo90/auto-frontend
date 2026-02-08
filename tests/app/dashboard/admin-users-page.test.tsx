import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import AdminUsersPage from "@/app/(dashboard)/admin/users/page";

const mockUsersResponse = {
  value: [
    {
      user: {
        ID: "u1",
        email: "buyer@test.com",
        firstName: "Jean",
        lastName: "Dupont",
      },
      role: { code: "buyer", name: "Acheteur" },
    },
    {
      user: {
        ID: "u2",
        email: "seller@test.com",
        firstName: "Marie",
        lastName: "Martin",
      },
      role: { code: "seller", name: "Vendeur" },
    },
  ],
};

const mockRolesResponse = {
  value: [
    { code: "buyer", name: "Acheteur" },
    { code: "seller", name: "Vendeur" },
    { code: "moderator", name: "Moderateur" },
    { code: "administrator", name: "Administrateur" },
  ],
};

function setupFetch() {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes("UserRoles")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsersResponse),
      });
    }
    if (url.includes("Roles")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRolesResponse),
      });
    }
    return Promise.resolve({ ok: false, status: 404 });
  });
}

function setupFetchError() {
  mockFetch.mockImplementation(() => Promise.resolve({ ok: false, status: 500 }));
}

describe("AdminUsersPage", () => {
  beforeEach(() => {
    cleanup();
    mockFetch.mockReset();
  });

  it("renders page heading", () => {
    setupFetch();
    render(<AdminUsersPage />);
    expect(screen.getByText("Gestion des utilisateurs")).toBeInTheDocument();
  });

  it("renders users table with data", async () => {
    setupFetch();
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
      expect(screen.getByText("Marie Martin")).toBeInTheDocument();
    });
  });

  it("renders user emails in table", async () => {
    setupFetch();
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText("buyer@test.com")).toBeInTheDocument();
      expect(screen.getByText("seller@test.com")).toBeInTheDocument();
    });
  });

  it("renders table column headers", async () => {
    setupFetch();
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Nom")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<AdminUsersPage />);
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  it("shows error state on fetch failure", async () => {
    setupFetchError();
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger/i)).toBeInTheDocument();
    });
  });
});
