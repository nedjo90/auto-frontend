import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "@/components/seo/json-ld";

describe("JsonLd", () => {
  it("should render a script tag with application/ld+json type", () => {
    const data = { "@context": "https://schema.org", "@type": "Product", name: "Test" };
    const { container } = render(<JsonLd data={data} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
  });

  it("should contain the JSON-LD data", () => {
    const data = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Vehicle", manufacturer: "Peugeot" },
        { "@type": "Product", name: "Peugeot 3008" },
      ],
    };
    const { container } = render(<JsonLd data={data} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).toContain("Peugeot");
    expect(script?.innerHTML).toContain("schema.org");
  });

  it("should escape HTML to prevent XSS", () => {
    const data = { "@context": "https://schema.org", name: "</script><script>alert(1)</script>" };
    const { container } = render(<JsonLd data={data} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).not.toContain("</script>");
    expect(script?.innerHTML).toContain("\\u003c");
  });
});
