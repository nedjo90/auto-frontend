import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TopBar } from "@/components/layout/top-bar";

describe("Layout components", () => {
  afterEach(() => {
    cleanup();
  });

  describe("Header", () => {
    it("should render the Auto brand link", () => {
      render(<Header />);
      expect(screen.getByText("Auto")).toBeInTheDocument();
    });

    it("should render a Sign In link", () => {
      render(<Header />);
      expect(screen.getByText("Sign In")).toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("should render legal and privacy links", () => {
      render(<Footer />);
      expect(screen.getByText("Legal")).toBeInTheDocument();
      expect(screen.getByText("Privacy")).toBeInTheDocument();
    });
  });

  describe("TopBar", () => {
    it("should render Dashboard title", () => {
      render(<TopBar />);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });
});
