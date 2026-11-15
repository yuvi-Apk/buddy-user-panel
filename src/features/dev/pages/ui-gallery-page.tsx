// The UI gallery (/dev/ui): every shared component in every variant, with a theme switcher and the live
// contrast of each color pair. Dev builds only.
// Use it to review a new component or variant in all 4 themes × light and dark.
import { Page, PageHeader, Section } from "@/components/layout/page";
import { Card, CardContent } from "@/components/ui/card";
import { AppearanceSettings } from "@/features/settings";
import { GalleryColors } from "../components/gallery-colors";
import {
  GalleryButtons,
  GalleryChoices,
  GalleryFields,
  GalleryForm,
} from "../components/gallery-controls";
import { GalleryDisplay, GalleryFeedback } from "../components/gallery-display";
import { GalleryOverlays, GalleryTabs } from "../components/gallery-overlays";

export function UiGalleryPage() {
  return (
    <Page>
      <PageHeader
        title="UI gallery"
        description="Every shared component in every variant. Switch the theme and the mode to check them all."
      />
      <Section title="Appearance">
        <Card>
          <CardContent>
            <AppearanceSettings />
          </CardContent>
        </Card>
      </Section>
      <Section
        title="Colors"
        description="Live contrast for the current theme. AA: 4.5:1 for text, 3:1 for borders and bars."
      >
        <GalleryColors />
      </Section>
      <Section title="Type">
        <div className="flex flex-col gap-2">
          <p className="font-display text-4xl font-semibold">
            Heading 4xl · Lexend
          </p>
          <p className="font-display text-2xl font-semibold">
            Heading 2xl · 42 days to go
          </p>
          <p className="text-base">
            Body text in Atkinson Hyperlegible Next: Il1 O0 rn m. Easy to tell
            apart in questions and codes.
          </p>
          <p className="max-w-reading text-reading">
            Reading text is 17px with a 1.65 line height and lines of at most 68
            characters, so long answers and explanations stay comfortable to
            read late at night.
          </p>
          <p className="text-sm text-muted-foreground">
            Muted text for secondary details.
          </p>
        </div>
      </Section>
      <Section title="Buttons">
        <GalleryButtons />
      </Section>
      <Section title="Fields">
        <GalleryFields />
      </Section>
      <Section title="Choices">
        <GalleryChoices />
      </Section>
      <Section
        title="Form"
        description="Submit empty to see the errors; React Hook Form focuses the first one."
      >
        <GalleryForm />
      </Section>
      <Section title="Display">
        <GalleryDisplay />
      </Section>
      <Section title="Feedback">
        <GalleryFeedback />
      </Section>
      <Section title="Overlays">
        <GalleryOverlays />
      </Section>
      <Section title="Tabs">
        <GalleryTabs />
      </Section>
    </Page>
  );
}
