// A picture of the app for the login screen: today's plan at work. Plays once, when it scrolls
// into view:
//   1. "Photosynthesis" is done: its tick, badge and highlight change, the ring counts 40% → 60%.
//   2. A card says Buddy found a topic that needs practice ("Fractions").
//   3. Fractions opens into the plan as the next task; the rows below make room.
//   4. A note says a doubt was answered, and a "Try it" chip invites a tap.
// Then it is a toy: tapping a grey task ticks it and the ring rolls up; the tilted cards straighten
// when the pointer is on them. The last frame is the picture: it is all that shows with reduced
// motion or when the browser can't tell us the panel is in view. Decorative only (hidden from
// screen readers; the toy is pointer-only and says nothing the page doesn't); built from the
// shared components so it follows the theme and mode.
//   <StudyPreview />
import {
  Circle,
  CircleCheck,
  CircleDot,
  MessageCircleQuestion,
  Pointer,
} from "lucide-react";
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
const BEATS = [900, 2300, 3100, 3900] as const;
const LAST_STEP = BEATS.length;
const RING_FROM = 40;
const RING_TO = 60;
/** How much the ring grows for each grey task ticked in the toy. */
const RING_PER_TICK = 6;
const RING_MS = 700;
/** Widths of the grey lines in the rows nobody needs to read. */
const PLACEHOLDER_WIDTHS = ["w-40", "w-28", "w-36", "w-24", "w-32", "w-20"];

/** A small card on the brand panel: tilted at rest, it straightens and lifts under the pointer. */
const stickerClasses =
  "absolute hidden items-center gap-2 rounded-card border border-border bg-popover p-3 text-popover-foreground shadow-overlay transition-[opacity,translate,rotate] duration-250 ease-out hover:-translate-y-1 hover:rotate-0 sm:flex";

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

/**
 * Rolls the shown number to `target` whenever it changes, from wherever it is now. Without
 * `shouldAnimate` (reduced motion) it is just `target`.
 */
function useRollingNumber(target: number, shouldAnimate: boolean): number {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    if (!shouldAnimate) return;
    const from = shownRef.current;
    if (from === target) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / RING_MS, 1);
      const eased = 1 - (1 - t) ** 3;
      shownRef.current = Math.round(from + (target - from) * eased);
      setShown(shownRef.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, shouldAnimate]);

  return shouldAnimate ? shown : target;
}

/**
 * Which grey tasks are ticked. Taps are read from the root with one listener, so the rows stay
 * plain list items (the toy is decorative and pointer-only).
 */
function useTickedRows(ref: RefObject<HTMLElement | null>): boolean[] {
  const [ticked, setTicked] = useState(() =>
    PLACEHOLDER_WIDTHS.map(() => false)
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onClick = (event: MouseEvent) => {
      const row =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-tick-row]")
          : null;
      const index = Number(row?.dataset.tickRow);
      if (!row || Number.isNaN(index)) return;
      setTicked((rows) =>
        rows.map((isTicked, at) => (at === index ? !isTicked : isTicked))
      );
    };
    element.addEventListener("click", onClick);
    return () => element.removeEventListener("click", onClick);
  }, [ref]);

  return ticked;
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
    "col-start-1 row-start-1 flex items-center justify-end transition-[opacity,scale] duration-200";
  return (
    <span className="grid shrink-0">
      <span className={cn(layer, showSecond && "scale-75 opacity-0")}>
        {first}
      </span>
      <span className={cn(layer, !showSecond && "scale-75 opacity-0")}>
        {second}
      </span>
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
  const ticked = useTickedRows(rootRef);
  const isNextDone = step >= 1;
  const isCardShown = step >= 2;
  const isPracticeAdded = step >= 3;
  const isDoubtShown = step >= 4;
  const tickCount = ticked.filter(Boolean).length;
  const ringTarget = Math.min(
    (isNextDone ? RING_TO : RING_FROM) + tickCount * RING_PER_TICK,
    100
  );
  const ringValue = useRollingNumber(
    ringTarget,
    isPlaying && !prefersReducedMotion()
  );
  // The invitation shows once the story is told, and leaves after the first tick.
  const isHintShown = isDoubtShown && tickCount === 0;

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

          {PLACEHOLDER_WIDTHS.map((width, index) => (
            <li
              key={width}
              data-tick-row={index}
              className={cn(
                rowClasses,
                "mt-1 cursor-pointer border-transparent hover:border-border hover:bg-muted/50 motion-safe:active:translate-y-px"
              )}
            >
              <Crossfade
                showSecond={ticked[index] ?? false}
                first={<Circle className="size-5 text-muted-foreground" />}
                second={<CircleCheck className="size-5 text-progress" />}
              />
              <PlaceholderLine
                className={cn(
                  width,
                  "transition-opacity duration-200",
                  ticked[index] && "opacity-40"
                )}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* "Try it": a chip on the plan's top edge, half outside, inviting the first tap. */}
      <span
        className={cn(
          "absolute -top-4 right-8 flex items-center gap-2 rounded-full border border-border bg-popover px-3 py-1.5 text-sm font-semibold text-popover-foreground shadow-overlay transition-[opacity,translate,rotate] duration-250 ease-out",
          isHintShown
            ? "rotate-2 opacity-100"
            : "pointer-events-none translate-y-1 rotate-2 opacity-0"
        )}
      >
        <Pointer className="size-4 text-primary" />
        {preview.tryIt}
      </span>

      {/* The satellite: Buddy found a weak topic and put it in the plan, just above. It straddles
          the plan's left edge; left out on narrow phones, where it would cover the plan. */}
      <div
        className={cn(
          stickerClasses,
          "top-64 -left-10 flex-col items-start",
          isCardShown
            ? "translate-x-0 -rotate-2 opacity-100"
            : "pointer-events-none -translate-x-2 -rotate-2 opacity-0"
        )}
      >
        <TopicChip name={preview.practiceTopic} strength="needs-practice" />
        <span className="px-1 text-sm text-muted-foreground">
          {preview.addedToPlan}
        </span>
      </div>

      {/* A second note on the right edge, over the grey rows' empty ends: doubts get answers. */}
      <div
        className={cn(
          stickerClasses,
          "top-[24rem] -right-8",
          isDoubtShown
            ? "translate-x-0 rotate-3 opacity-100"
            : "pointer-events-none translate-x-2 rotate-3 opacity-0"
        )}
      >
        <span className="flex size-8 items-center justify-center rounded-control bg-primary-soft text-primary-soft-foreground">
          <MessageCircleQuestion className="size-4" />
        </span>
        <span className="text-sm font-semibold">{preview.doubtAnswered}</span>
      </div>
    </div>
  );
}
