// A still picture of the app for the login screen: today's plan, with a topic that needs practice
// added to it. Decorative only (hidden from screen readers); built from the shared components so it
// follows the theme and mode.
//   <StudyPreview />
import { CircleCheck, CircleDot, Circle } from "lucide-react";
import { Badge, ProgressRing, TopicChip } from "@/components/ui";
import { useLang } from "@/lang";
import { cn } from "@/utils/cn";

/** A grey line standing in for text the picture does not need to spell out. */
function PlaceholderLine({ className }: { className: string }) {
  return <span className={cn("block h-2.5 rounded-sm bg-muted", className)} />;
}

export function StudyPreview() {
  const { preview } = useLang().auth;

  return (
    <div
      aria-hidden
      className="relative mx-auto h-full w-full max-w-lg select-none"
    >
      {/* The plan: as tall as its box, which runs past the panel's foot, so it is always cropped. */}
      <div className="h-full overflow-hidden rounded-card border border-border bg-card text-card-foreground shadow-overlay motion-safe:animate-in motion-safe:duration-250 motion-safe:fade-in motion-safe:slide-in-from-bottom-3">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex flex-col gap-2">
            <span className="font-display text-xl font-semibold">
              {preview.today}
            </span>
            <PlaceholderLine className="w-24" />
          </div>
          <ProgressRing
            label={preview.progress}
            value={60}
            size="sm"
            tone="progress"
          />
        </div>

        <ul className="flex flex-col gap-1 p-2">
          <li className="flex items-center gap-3 rounded-control px-3 py-3">
            <CircleCheck className="size-5 shrink-0 text-progress" />
            <span className="flex-1 text-muted-foreground line-through">
              {preview.doneTopic}
            </span>
            <Badge tone="progress">{preview.done}</Badge>
          </li>
          <li className="flex items-center gap-3 rounded-control border border-primary/30 bg-primary-soft px-3 py-3 text-primary-soft-foreground">
            <CircleDot className="size-5 shrink-0" />
            <span className="flex-1 font-semibold">{preview.nextTopic}</span>
            <Badge>{preview.upNext}</Badge>
          </li>
          <li className="flex items-center gap-3 px-3 py-3">
            <Circle className="size-5 shrink-0 text-muted-foreground" />
            <PlaceholderLine className="w-40" />
          </li>
          <li className="flex items-center gap-3 px-3 py-3">
            <Circle className="size-5 shrink-0 text-muted-foreground" />
            <PlaceholderLine className="w-28" />
          </li>
          <li className="flex items-center gap-3 px-3 py-3">
            <Circle className="size-5 shrink-0 text-muted-foreground" />
            <PlaceholderLine className="w-36" />
          </li>
          <li className="flex items-center gap-3 px-3 py-3">
            <Circle className="size-5 shrink-0 text-muted-foreground" />
            <PlaceholderLine className="w-24" />
          </li>
          <li className="flex items-center gap-3 px-3 py-3">
            <Circle className="size-5 shrink-0 text-muted-foreground" />
            <PlaceholderLine className="w-32" />
          </li>
          <li className="flex items-center gap-3 px-3 py-3">
            <Circle className="size-5 shrink-0 text-muted-foreground" />
            <PlaceholderLine className="w-20" />
          </li>
        </ul>
      </div>

      {/* The satellite: a weak topic Buddy has just added, straddling the plan's left edge beside
          the empty rows it will fill. Left out on narrow phones, where it would cover the plan. */}
      <div className="absolute top-60 -left-10 hidden flex-col items-start gap-2 rounded-card border border-border bg-popover p-3 text-popover-foreground shadow-overlay motion-safe:animate-in motion-safe:delay-150 motion-safe:duration-250 motion-safe:fill-mode-backwards motion-safe:fade-in motion-safe:slide-in-from-left-2 sm:flex">
        <TopicChip name={preview.practiceTopic} strength="needs-practice" />
        <span className="px-1 text-sm text-muted-foreground">
          {preview.addedToPlan}
        </span>
      </div>
    </div>
  );
}
