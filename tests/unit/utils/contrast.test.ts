import { describe, expect, it } from "vitest";
import {
  AA_TEXT,
  AA_UI,
  contrastRatio,
  isHexColor,
  relativeLuminance,
} from "@/utils/contrast";

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for a color on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#4648d4", "#4648d4")).toBe(1);
  });

  it("matches a known WCAG value", () => {
    // #767676 on white is the classic lightest gray that passes AA for text.
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
  });

  it("does not depend on the order of the colors", () => {
    expect(contrastRatio("#ffffff", "#4648d4")).toBe(
      contrastRatio("#4648d4", "#ffffff")
    );
  });

  it("reads short hex like its long form", () => {
    expect(contrastRatio("#fff", "#000")).toBe(
      contrastRatio("#ffffff", "#000000")
    );
  });

  it("throws for anything that is not an opaque hex color", () => {
    expect(() => contrastRatio("rgb(0 0 0)", "#ffffff")).toThrow(
      /Not a hex color/
    );
    expect(() => relativeLuminance("#ffffff80")).toThrow(/Not a hex color/);
  });
});

describe("isHexColor", () => {
  it("accepts #rgb and #rrggbb only", () => {
    expect(isHexColor("#fff")).toBe(true);
    expect(isHexColor(" #4648D4 ")).toBe(true);
    expect(isHexColor("#ffffff80")).toBe(false);
    expect(isHexColor("var(--primary)")).toBe(false);
  });
});

describe("AA thresholds", () => {
  it("are the WCAG 2 AA minimums", () => {
    expect(AA_TEXT).toBe(4.5);
    expect(AA_UI).toBe(3);
  });
});
