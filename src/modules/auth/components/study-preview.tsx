// A picture of the app for the login screen: today's plan at work. Plays once, when it scrolls
// into view:
//   1. "Photosynthesis" is done: its tick, badge and highlight change, the ring counts 40% → 60%.
//   2. A card says Buddy found a topic that needs practice ("Fractions").
//   3. Fractions opens into the plan as the next task; the rows below make room.
// The last frame is the picture: it stays, and it is all that shows with reduced motion or when
// the browser can't tell us the panel is in view. Decorative only (hidden from screen readers);
// built from the shared components so it follows the theme and mode.
//   <StudyPreview />
import { Circle, CircleCheck, CircleDot } from "lucide-react";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { Badge, ProgressRing, TopicChip } from "@/components/ui";
import { useLang } from "@/lang";
import { cn } from "@/utils/cn";

/** When each beat starts, in ms after the panel comes into view. */
const BEATS = [900, 2300, 3100] as const;
const LAST_STEP = BEATS.length;
const RING_FROM = 40;
const RING_TO = 60;
const RING_MS = 700;
/** Widths of the grey lines in the rows nobody needs to read. */
const PLACEHOLDER_WIDTHS = ["w-40", "w-28", "w-36", "w-24", "w-32", "w-20"];

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The beat the picture is on: 0 at rest, LAST_STEP when it is done. Plays once. `isPlaying` is
 * false when the picture starts on its last frame (reduced motion, or no IntersectionObserver).
 */
function useStepsWhenInView(ref: RefObject<HTMLElement | null>): {
  step: number;
  isPlaying: boolean;
} {
  const [canPlay] = useState(
    () => typeof IntersectionObserver === "function" && !prefersReducedMotion()
  );
  const [step, setStep] = useState(canPlay ? 0 : LAST_STEP);

  useEffect(() => {
    const element = ref.current;
    if (!canPlay || !element) return;
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        BEATS.forEach((at, index) => {
          timers.push(window.setTimeout(() => setStep(index + 1), at));
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [canPlay, ref]);

  return { step, isPlaying: canPlay };
}

/** Counts from `from` to `to` once `isRunning` turns true, so the ring's number rolls. */
function useCountUp(from: number, to: number, isRunning: boolean): number {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!isRunning) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / RING_MS, 1);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [from, to, isRunning]);

  return isRunning ? value : from;
}

/** Two things in one place; the shown one fades in over the other, so nothing jumps. */
function Crossfade({
  showSecond,
  first,
  second,
}: {
  showSecond: boolean;
  first: ReactNode;
  second: ReactNode;
}) {
  const layer =
    "col-start-1 row-start-1 flex items-center justify-end transition-opacity duration-200";
  return (
    <span className="grid shrink-0">
      <span className={cn(layer, showSecond && "opacity-0")}>{first}</span>
      <span className={cn(layer, !showSecond && "opacity-0")}>{second}</span>
    </span>
  );
}

/** A grey line standing in for text the picture does not need to spell out. */
function PlaceholderLine({ className }: { className: string }) {
  return <span className={cn("block h-2.5 rounded-sm bg-muted", className)} />;
}

const rowClasses =
  "flex items-center gap-3 rounded-control border px-3 py-3 transition-colors duration-250";
const nextRowClasses =
  "border-primary/30 bg-primary-soft text-primary-soft-foreground";

export function StudyPreview() {
  const { preview } = useLang().auth;
  const rootRef = useRef<HTMLDivElement>(null);
  const { step, isPlaying } = useStepsWhenInView(rootRef);
  const isNextDone = step >= 1;
  const isCardShown = step >= 2;
  const isPracticeAdded = step >= 3;
  const countedRing = useCountUp(RING_FROM, RING_TO, isPlaying && isNextDone);
  const ringValue = isPlaying ? countedRing : RING_TO;

  return (
    <div
      ref={rootRef}
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
            value={ringValue}
            size="sm"
            variant="progress"
          />
        </div>

        <ul className="flex flex-col p-2">
          <li className={cn(rowClasses, "border-transparent")}>
            <CircleCheck className="size-5 shrink-0 text-progress" />
            <span className="flex-1 text-muted-foreground line-through">
              {preview.doneTopic}
            </span>
            <Badge variant="progress">{preview.done}</Badge>
          </li>

          <li
            className={cn(
              rowClasses,
              "mt-1",
              isNextDone ? "border-transparent" : nextRowClasses
            )}
          >
            <Crossfade
              showSecond={isNextDone}
              first={<CircleDot className="size-5" />}
              second={<CircleCheck className="size-5 text-progress" />}
            />
            <span
              className={cn(
                "flex-1 line-through transition-[color,text-decoration-color] duration-250",
                isNextDone
                  ? "text-muted-foreground decoration-current"
                  : "font-semibold decoration-transparent"
              )}
            >
              {preview.nextTopic}
            </span>
            <Crossfade
              showSecond={isNextDone}
              first={<Badge>{preview.upNext}</Badge>}
              second={<Badge variant="progress">{preview.done}</Badge>}
            />
          </li>

          {/* The new task opens with its height, carrying the rows below it down. */}
          <li
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-250 ease-out",
              isPracticeAdded
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className={cn(rowClasses, "mt-1", nextRowClasses)}>
                <CircleDot className="size-5 shrink-0" />
                <span className="flex-1 font-semibold">
                  {preview.practiceTopic}
                </span>
                <Badge>{preview.upNext}</Badge>
              </div>
            </div>
          </li>

          {PLACEHOLDER_WIDTHS.map((width) => (
            <li
              key={width}
              className={cn(rowClasses, "mt-1 border-transparent")}
            >
              <Circle className="size-5 shrink-0 text-muted-foreground" />
              <PlaceholderLine className={width} />
            </li>
          ))}
        </ul>
      </div>

      {/* The satellite: Buddy found a weak topic and put it in the plan, just above. It straddles
          the plan's left edge; left out on narrow phones, where it would cover the plan. */}
      <div
        className={cn(
          "absolute top-64 -left-10 hidden flex-col items-start gap-2 rounded-card border border-border bg-popover p-3 text-popover-foreground shadow-overlay transition-[opacity,translate] duration-250 ease-out sm:flex",
          isCardShown ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
        )}
      >
        <TopicChip name={preview.practiceTopic} strength="needs-practice" />
        <span className="px-1 text-sm text-muted-foreground">
          {preview.addedToPlan}
        </span>
      </div>
    </div>
  );
}
