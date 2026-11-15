import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins class names and drops the empty ones", () => {
    expect(cn("px-2", false, undefined, null, "py-1")).toBe("px-2 py-1");
  });

  it("lets the later class win a conflict", () => {
    expect(cn("px-2", "px-6")).toBe("px-6");
    expect(cn("bg-primary", "bg-card")).toBe("bg-card");
  });

  it("knows our text sizes, so a size and a color are both kept", () => {
    expect(cn("text-reading", "text-foreground")).toBe(
      "text-reading text-foreground"
    );
    expect(cn("text-sm", "text-reading")).toBe("text-reading");
  });

  it("knows our radius, shadow, width and font names", () => {
    expect(cn("rounded-control", "rounded-card")).toBe("rounded-card");
    expect(cn("shadow-card", "shadow-overlay")).toBe("shadow-overlay");
    expect(cn("max-w-reading", "max-w-content")).toBe("max-w-content");
    expect(cn("font-display", "font-semibold")).toBe(
      "font-display font-semibold"
    );
  });
});
