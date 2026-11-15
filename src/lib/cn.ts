// Joins class names and resolves Tailwind conflicts: cn("px-2", isWide && "px-6") → "px-6".
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge our own scale names (index.css), so that for example "text-reading" (a
// size) and "text-foreground" (a color) are both kept instead of one replacing the other.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["reading"],
      radius: ["sm", "control", "card", "sheet"],
      shadow: ["card", "overlay"],
      container: ["reading", "content"],
      font: ["display"],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
