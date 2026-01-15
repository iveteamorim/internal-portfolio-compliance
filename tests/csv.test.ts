import { describe, expect, it } from "vitest";
import { parseCsv } from "@/lib/csv";

describe("parseCsv", () => {
  it("parses headers and rows", () => {
    const text = "name,owner\nFormula 1,Alicia";
    const rows = parseCsv(text);
    expect(rows).toEqual([{ name: "Formula 1", owner: "Alicia" }]);
  });

  it("handles quoted values", () => {
    const text = "name,owner\n\"Formula, 2\",\"Bruno\"";
    const rows = parseCsv(text);
    expect(rows[0].name).toBe("Formula, 2");
  });
});
