// The login screen. Google is the only way in, and the first Google login also creates the
// account. How the redirect works: ../google-sign-in.ts.
//
// Laptop: the login on the left, a picture of the app on a brand panel on the right.
// Phone: the login first, the panel below it, cropped. On a pointer screen the panel's dots light
// up around the pointer.
import { CalendarCheck, MessageCircleQuestion, Target } from "lucide-react";
import { type RefObject, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { PageHeader } from "@/components/layout";
import { Alert, Button } from "@/components/ui";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useLang } from "@/lang";
import { GoogleMark } from "../components/google-mark";
import { StudyPreview } from "../components/study-preview";
import { getGoogleSignInUrl, readGoogleSignInError } from "../google-sign-in";

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

export function LoginPage() {
  const lang = useLang();
  const isOnline = useOnlineStatus();
  const [searchParams] = useSearchParams();
  const signInError = readGoogleSignInError(searchParams.get("error"));
  const googleSignInUrl = getGoogleSignInUrl(searchParams.get("redirect"));
  const panelRef = useRef<HTMLDivElement>(null);
  usePointerSpot(panelRef);

  const benefits = [
    { icon: CalendarCheck, text: lang.auth.benefitPlan },
    { icon: Target, text: lang.auth.benefitPractice },
    { icon: MessageCircleQuestion, text: lang.auth.benefitDoubts },
  ];

  return (
    <div className="grid gap-6 p-4 md:p-6 lg:min-h-[calc(100dvh-3.5rem)] lg:grid-cols-2 lg:gap-8 lg:p-4 lg:ps-8">
      <div className="flex flex-col justify-center py-4 lg:py-12">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
          <PageHeader
            title={lang.auth.loginTitle}
            description={lang.auth.loginIntro}
          />

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

          <div className="flex flex-col gap-3">
            {isOnline ? (
              <Button asChild size="lg" fullWidth>
                <a href={googleSignInUrl}>
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
            <ul className="flex flex-col gap-4">
              {benefits.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary-soft-foreground">
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
        className="group/panel relative isolate flex h-[30rem] flex-col overflow-hidden rounded-sheet bg-primary text-primary-foreground lg:h-auto"
      >
        {/* Dot paper, in the panel's own text color. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(var(--color-primary-foreground)_1px,transparent_1px)] bg-size-[22px_22px] opacity-15"
        />
        {/* The same dots, brighter, seen only in a circle around the pointer. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(var(--color-primary-foreground)_1.5px,transparent_1.5px)] bg-size-[22px_22px] opacity-0 transition-opacity duration-250 [mask-image:radial-gradient(180px_circle_at_var(--spot-x,50%)_var(--spot-y,50%),black,transparent)] group-hover/panel:opacity-60"
        />
        <div className="flex max-w-md flex-col items-start gap-4 px-6 pt-8 md:px-10 md:pt-10 lg:px-12 lg:pt-16">
          <span className="-rotate-2 rounded-full border border-primary-foreground/40 px-3 py-1 text-sm font-semibold transition-[rotate] duration-250 ease-out hover:rotate-0">
            {lang.auth.panelEyebrow}
          </span>
          <p className="font-display text-2xl font-semibold text-balance lg:text-3xl">
            {lang.auth.panelTitle}
          </p>
        </div>
        {/* The picture hangs from the top of what is left and is cropped at the panel's foot. */}
        <div className="relative mx-6 mt-10 flex-1 md:mx-10 lg:mx-12 lg:mt-14">
          <div className="absolute inset-x-0 top-0 -bottom-8">
            <StudyPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
