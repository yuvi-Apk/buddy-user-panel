// The login screen. Google is the only way in, and the first Google login also creates the
// account. How the redirect works: ../google-sign-in.ts.
//
// Laptop: the login on the left, a picture of the app on a brand panel on the right.
// Phone: the login first, the panel below it, cropped. On a pointer screen the panel's dots light
// up around the pointer, a growth line climbs behind the picture, and the left side's parts rise in
// one after another (skipped with reduced motion).
import { CalendarCheck, MessageCircleQuestion, Target } from "lucide-react";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";
import { PageHeader } from "@/components/layout";
import { Alert, Button } from "@/components/ui";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useLang } from "@/lang";
import { cn } from "@/utils/cn";
import { GoogleMark } from "../components/google-mark";
import { GrowthLine } from "../components/growth-line";
import { StudyPreview } from "../components/study-preview";
import {
  createGoogleSignInRequest,
  readGoogleSignInError,
} from "../google-sign-in";

/**
 * Keeps `--spot-x` / `--spot-y` on the element at the pointer, for a light that follows it. Only on
 * screens with a hovering pointer and without reduced motion.
 */
function usePointerSpot(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window.matchMedia !== "function") return;
    const canFollow =
      window.matchMedia("(hover: hover)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canFollow) return;
    const onMove = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      element.style.setProperty("--spot-x", `${event.clientX - box.left}px`);
      element.style.setProperty("--spot-y", `${event.clientY - box.top}px`);
    };
    element.addEventListener("pointermove", onMove);
    return () => element.removeEventListener("pointermove", onMove);
  }, [ref]);
}

/** Each part of the login column rises in a little after the one above it. */
const enterClasses =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-250 motion-safe:fill-mode-both";

export function LoginPage() {
  const lang = useLang();
  const isOnline = useOnlineStatus();
  const [searchParams] = useSearchParams();
  const signInError = readGoogleSignInError(searchParams.get("error"));
  const redirect = searchParams.get("redirect");
  const googleSignIn = useMemo(
    () => createGoogleSignInRequest(redirect),
    [redirect]
  );
  const panelRef = useRef<HTMLDivElement>(null);
  usePointerSpot(panelRef);

  // `id` ties a benefit to its part of the picture, which lifts while the benefit is pointed at.
  const benefits = [
    { id: "plan", icon: CalendarCheck, text: lang.auth.benefitPlan },
    { id: "practice", icon: Target, text: lang.auth.benefitPractice },
    {
      id: "doubts",
      icon: MessageCircleQuestion,
      text: lang.auth.benefitDoubts,
    },
  ];

  return (
    <div className="group/login grid gap-6 p-4 md:p-6 lg:min-h-[calc(100dvh-3.5rem)] lg:grid-cols-2 lg:gap-8 lg:p-4 lg:ps-8">
      <div className="flex flex-col justify-center py-4 lg:py-12">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
          <div className={enterClasses}>
            <PageHeader
              title={lang.auth.loginTitle}
              description={lang.auth.loginIntro}
            />
          </div>

          {signInError === "google-cancelled" ? (
            <Alert title={lang.auth.googleCancelledTitle}>
              {lang.auth.googleCancelledBody}
            </Alert>
          ) : null}
          {signInError === "google-failed" ? (
            <Alert variant="destructive" title={lang.auth.googleFailedTitle}>
              {lang.auth.googleFailedBody}
            </Alert>
          ) : null}

          <div className={cn("flex flex-col gap-3", enterClasses, "delay-100")}>
            {isOnline ? (
              <Button asChild size="lg" fullWidth>
                <a href={googleSignIn.url} onClick={googleSignIn.remember}>
                  <GoogleMark />
                  {lang.auth.continueWithGoogle}
                </a>
              </Button>
            ) : (
              <Button size="lg" fullWidth disabled>
                <GoogleMark />
                {lang.auth.continueWithGoogle}
              </Button>
            )}
            <p className="text-center text-sm text-muted-foreground">
              {isOnline ? lang.auth.newHere : lang.auth.offlineHint}
            </p>
          </div>

          <section
            aria-label={lang.auth.benefitsLabel}
            className="border-t border-border pt-6"
          >
            {/* Under the pointer a benefit leans in: its row tints and its icon tilts. */}
            <ul className="-mx-2 flex flex-col gap-1">
              {benefits.map(({ id, icon: Icon, text }, index) => (
                <li
                  key={id}
                  data-benefit={id}
                  style={{ animationDelay: `${200 + index * 80}ms` }}
                  className={cn(
                    "group flex items-center gap-3 rounded-control p-2 transition-colors duration-200 hover:bg-primary-soft/60",
                    enterClasses
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary-soft-foreground transition-[rotate,scale,background-color,color] duration-200 ease-out group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div
        ref={panelRef}
        className="group/panel relative isolate flex h-[30rem] flex-col overflow-hidden rounded-sheet bg-primary text-primary-foreground sm:h-[36rem] lg:h-auto"
      >
        {/* Dot paper, in the panel's own text color. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(var(--color-primary-foreground)_1px,transparent_1px)] bg-size-[22px_22px] opacity-15"
        />
        {/* The same dots, brighter, seen only in a circle around the pointer. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(var(--color-primary-foreground)_1.5px,transparent_1.5px)] [mask-image:radial-gradient(180px_circle_at_var(--spot-x,50%)_var(--spot-y,50%),black,transparent)] bg-size-[22px_22px] opacity-0 transition-opacity duration-250 group-hover/panel:opacity-60"
        />
        <GrowthLine />
        <div className="flex max-w-md flex-col items-start gap-4 px-6 pt-8 md:px-10 md:pt-10 lg:px-12 lg:pt-12">
          <span className="-rotate-2 rounded-full border border-primary-foreground/40 px-3 py-1 text-sm font-semibold transition-[rotate] duration-250 ease-out hover:rotate-0">
            {lang.auth.panelEyebrow}
          </span>
          <p className="font-display text-2xl font-semibold text-balance lg:text-3xl">
            {lang.auth.panelTitle}
          </p>
        </div>
        {/* The picture hangs from the top of what is left and is cropped at the panel's foot. */}
        <div className="relative mx-6 mt-10 flex-1 md:mx-10 lg:mx-12 lg:mt-12">
          <div className="absolute inset-x-0 top-0 -bottom-8">
            <StudyPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
