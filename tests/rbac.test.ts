import { describe, expect, it } from "vitest";
import { can } from "@/lib/rbac";

describe("rbac", () => {
  it("allows admin approvals", () => {
    expect(can("admin", "document.approve")).toBe(true);
  });

  it("blocks viewers from approvals", () => {
    expect(can("viewer", "document.approve")).toBe(false);
  });
});
