import { describe, it, expect, beforeEach } from "vitest";
import { useListingStore } from "@/stores/listing-store";
import type { CertifiedFieldResult } from "@auto/shared";

describe("listing-store", () => {
  beforeEach(() => {
    // Reset store state
    useListingStore.setState({
      listingId: null,
      fields: {},
      visibilityScore: 0,
      isLoading: false,
    });
  });

  describe("setListingId", () => {
    it("should set the listing ID", () => {
      useListingStore.getState().setListingId("listing-123");
      expect(useListingStore.getState().listingId).toBe("listing-123");
    });
  });

  describe("initializeFields", () => {
    it("should initialize fields from certified field results", () => {
      const certifiedFields: CertifiedFieldResult[] = [
        {
          fieldName: "make",
          fieldValue: "Renault",
          source: "SIV",
          sourceTimestamp: "2026-02-23T10:00:00Z",
          isCertified: true,
        },
        {
          fieldName: "model",
          fieldValue: "Clio",
          source: "SIV",
          sourceTimestamp: "2026-02-23T10:00:00Z",
          isCertified: true,
        },
      ];

      useListingStore.getState().initializeFields(certifiedFields);
      const fields = useListingStore.getState().fields;

      expect(fields.make).toEqual({
        fieldName: "make",
        value: "Renault",
        status: "certified",
        certifiedSource: "SIV",
        certifiedTimestamp: "2026-02-23T10:00:00Z",
      });

      expect(fields.model).toEqual({
        fieldName: "model",
        value: "Clio",
        status: "certified",
        certifiedSource: "SIV",
        certifiedTimestamp: "2026-02-23T10:00:00Z",
      });
    });

    it("should preserve existing user-input fields when initializing certified fields", () => {
      // User has already typed in a price (declared field)
      useListingStore.getState().updateField("price", 15000, "declared");

      const certifiedFields: CertifiedFieldResult[] = [
        {
          fieldName: "make",
          fieldValue: "Renault",
          source: "SIV",
          sourceTimestamp: "2026-02-23T10:00:00Z",
          isCertified: true,
        },
      ];

      useListingStore.getState().initializeFields(certifiedFields);
      const fields = useListingStore.getState().fields;

      // Certified field should be added
      expect(fields.make.value).toBe("Renault");
      expect(fields.make.status).toBe("certified");

      // Existing declared field should be preserved
      expect(fields.price.value).toBe(15000);
      expect(fields.price.status).toBe("declared");
    });

    it("should mark non-certified fields as declared", () => {
      const fields: CertifiedFieldResult[] = [
        {
          fieldName: "mileage",
          fieldValue: "50000",
          source: "seller_declared",
          sourceTimestamp: "2026-02-23T12:00:00Z",
          isCertified: false,
        },
      ];

      useListingStore.getState().initializeFields(fields);
      expect(useListingStore.getState().fields.mileage.status).toBe("declared");
    });
  });

  describe("updateField", () => {
    it("should update a field value and status", () => {
      useListingStore.getState().updateField("price", 15000, "declared");
      const field = useListingStore.getState().fields.price;
      expect(field.value).toBe(15000);
      expect(field.status).toBe("declared");
    });

    it("should preserve other fields when updating one", () => {
      useListingStore.getState().updateField("make", "Renault", "certified");
      useListingStore.getState().updateField("price", 15000, "declared");

      expect(useListingStore.getState().fields.make.value).toBe("Renault");
      expect(useListingStore.getState().fields.price.value).toBe(15000);
    });

    it("should handle null value (field cleared)", () => {
      useListingStore.getState().updateField("price", null, "empty");
      expect(useListingStore.getState().fields.price.value).toBeNull();
      expect(useListingStore.getState().fields.price.status).toBe("empty");
    });
  });

  describe("setFieldStatus", () => {
    it("should update field status", () => {
      useListingStore.getState().updateField("make", "Renault", "certified");
      useListingStore.getState().setFieldStatus("make", "declared");
      expect(useListingStore.getState().fields.make.status).toBe("declared");
    });

    it("should create field entry if not existing", () => {
      useListingStore.getState().setFieldStatus("newField", "empty");
      expect(useListingStore.getState().fields.newField.status).toBe("empty");
    });

    it("should set certified source when provided", () => {
      useListingStore.getState().setFieldStatus("make", "certified", "SIV");
      expect(useListingStore.getState().fields.make.certifiedSource).toBe("SIV");
    });
  });

  describe("setVisibilityScore", () => {
    it("should update the visibility score", () => {
      useListingStore.getState().setVisibilityScore(75);
      expect(useListingStore.getState().visibilityScore).toBe(75);
    });
  });

  describe("setLoading", () => {
    it("should update loading state", () => {
      useListingStore.getState().setLoading(true);
      expect(useListingStore.getState().isLoading).toBe(true);

      useListingStore.getState().setLoading(false);
      expect(useListingStore.getState().isLoading).toBe(false);
    });
  });

  describe("getFieldState", () => {
    it("should return field state by name", () => {
      useListingStore.getState().updateField("make", "Renault", "certified");
      const state = useListingStore.getState().getFieldState("make");
      expect(state?.value).toBe("Renault");
    });

    it("should return undefined for unknown fields", () => {
      const state = useListingStore.getState().getFieldState("unknown");
      expect(state).toBeUndefined();
    });
  });

  describe("setOriginalCertifiedValue", () => {
    it("should set original certified value on existing field", () => {
      useListingStore.getState().updateField("mileage", "55000", "declared");
      useListingStore.getState().setOriginalCertifiedValue("mileage", "50000");
      expect(useListingStore.getState().fields.mileage.originalCertifiedValue).toBe("50000");
    });

    it("should not crash for non-existing field", () => {
      useListingStore.getState().setOriginalCertifiedValue("unknown", "value");
      expect(useListingStore.getState().fields.unknown).toBeUndefined();
    });
  });
});
