// `pnpm pwa:icons` makes every app icon from public/logo.svg (pwa.md): the favicon, the PWA icons,
// the maskable icon (logo on the Indigo Ink color, with room for round and squircle masks) and the
// Apple touch icon. The files land next to the logo in public/ and are committed; never edit them
// by hand. Run it again after changing the logo.
import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config";
import { defaultThemeColors } from "./tooling/pwa.ts";

const { primary } = defaultThemeColors();

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { background: primary },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { background: primary },
    },
  },
  images: ["public/logo.svg"],
});
