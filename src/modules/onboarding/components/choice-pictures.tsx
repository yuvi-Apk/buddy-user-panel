// Small pictures for the two onboarding choices, shown at the start of each card: a plan of your
// own, or a class you study with. No words, only shapes; the card's title says it. Decorative
// (ChoiceCardGroup hides `media` from screen readers) and built from tokens, so they follow the
// theme and mode.
//   media: <OnMyOwnPicture />
import { CircleCheck } from "lucide-react";
import { cn } from "@/utils/cn";

const frameClasses =
  "flex h-16 w-20 flex-col gap-1.5 overflow-hidden rounded-control border border-border bg-card p-2 shadow-card transition-[rotate,translate] duration-200 ease-out group-hover:-translate-y-0.5 group-data-[state=checked]:-rotate-2 motion-reduce:transition-none";

/** One person and their plan: a tick on the first task. */
export function OnMyOwnPicture() {
  return (
    <span className={frameClasses}>
      <span className="flex items-center gap-1.5">
        <span className="size-4 shrink-0 rounded-full bg-primary" />
        <span className="h-1.5 w-8 rounded-sm bg-muted" />
      </span>
      <span className="flex items-center gap-1">
        <CircleCheck className="size-3 shrink-0 text-progress" />
        <span className="h-1.5 w-10 rounded-sm bg-progress-soft" />
      </span>
      <span className="flex items-center gap-1">
        <span className="size-3 shrink-0 rounded-full border border-border" />
        <span className="h-1.5 w-7 rounded-sm bg-muted" />
      </span>
    </span>
  );
}

/** A class: a header bar and the people in it, one of them you. */
export function WithOrganizationPicture() {
  return (
    <span className={frameClasses}>
      <span className="h-2 w-12 rounded-sm bg-primary" />
      <span className="flex gap-1">
        {[0, 1, 2, 3].map((person) => (
          <span
            key={person}
            className={cn(
              "size-3.5 rounded-full",
              person === 1 ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </span>
      <span className="h-1.5 w-14 rounded-sm bg-muted" />
    </span>
  );
}
