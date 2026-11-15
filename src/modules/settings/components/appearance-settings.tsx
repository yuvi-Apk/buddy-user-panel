// Settings → Appearance: light, dark or system, and one of the 4 themes. Each theme card shows
// a live swatch of that theme (its primary, progress and needs-practice colors) in the current mode.
import { Monitor, Moon, Sun } from "lucide-react";
import { Stack } from "@/components/layout";
import { ChoiceCardGroup, SegmentedControl } from "@/components/ui";
import { useLang } from "@/lang";
import {
  type Accent,
  ACCENT_TEXT_KEY,
  ACCENTS,
  isAccent,
  isMode,
  MODES,
  type ResolvedMode,
  useTheme,
} from "@/theme";

const modeIcons = {
  light: <Sun />,
  dark: <Moon />,
  system: <Monitor />,
} as const;

export function AppearanceSettings() {
  const lang = useLang();
  const { mode, accent, resolvedMode, setMode, setAccent } = useTheme();

  return (
    <Stack gap={6}>
      <SegmentedControl
        label={lang.theme.modeLabel}
        value={mode}
        onValueChange={(value) => {
          if (isMode(value)) setMode(value);
        }}
        options={MODES.map((id) => ({
          value: id,
          label: lang.theme.modes[id],
          icon: modeIcons[id],
        }))}
      />
      <ChoiceCardGroup
        label={lang.theme.accentLabel}
        value={accent}
        onValueChange={(value) => {
          if (isAccent(value)) setAccent(value);
        }}
        options={ACCENTS.map((id) => {
          const text = lang.theme.accents[ACCENT_TEXT_KEY[id]];
          return {
            value: id,
            title: (
              <>
                {text.name}{" "}
                <span className="font-normal text-muted-foreground">
                  · {text.mood}
                </span>
              </>
            ),
            description: text.description,
            media: <ThemeSwatch accent={id} mode={resolvedMode} />,
          };
        })}
      />
    </Stack>
  );
}

/** Renders with the theme's own data attributes, so it shows that theme's real colors. */
function ThemeSwatch({ accent, mode }: { accent: Accent; mode: ResolvedMode }) {
  return (
    <span
      data-accent={accent}
      data-mode={mode}
      className="flex size-12 items-stretch justify-center gap-1 rounded-control border border-border bg-background p-2"
    >
      <span className="w-2 rounded-full bg-primary" />
      <span className="w-2 rounded-full bg-progress" />
      <span className="w-2 rounded-full bg-weak" />
    </span>
  );
}
