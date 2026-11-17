// Small pictures of a screen, for coming-soon screens and empty states (built the stageshow way:
// one window cropped at its foot, a few real words only on what the picture is about, grey lines
// for the rest, and one small card on the window's edge). They rise in once when shown; with
// reduced motion they are simply there. Decorative: hidden from screen readers, and built from the
// shared components, so they follow the theme and mode.
//   <ComingSoonPage title={lang.nav.today} illustration={<TodayIllustration />} />
//   <EmptyState illustration={<PeopleIllustration />} title={…} />
import {
  CalendarCheck,
  CircleCheck,
  CircleDot,
  Circle,
  Clock,
  MessageCircleQuestion,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Avatar, Badge, ProgressRing, TopicChip } from "@/components/ui";
import { useLang } from "@/lang";
import { cn } from "@/utils/cn";

/** Widths of the grey lines in the rows nobody needs to read. */
const TODAY_LINES = ["w-32", "w-24", "w-36"];
const TOPIC_LINES = ["w-20", "w-28", "w-16", "w-24", "w-20", "w-28"];
const DASHBOARD_LINES = ["w-28", "w-36"];
const PEOPLE_LINES = ["w-28", "w-20"];
const PROFILE_LINES = ["w-32", "w-24", "w-36", "w-28"];

const enterClasses =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-250 motion-safe:fill-mode-both";

/** Rises in `delay` ms after the picture appears. */
function enterAfter(delay: number): CSSProperties {
  return { animationDelay: `${String(delay)}ms` };
}

/** A grey line standing in for text the picture does not need to spell out. */
function Line({ className }: { className: string }) {
  return <span className={cn("block h-2.5 rounded-sm bg-muted", className)} />;
}

/**
 * The frame: a window cropped by a fade at its foot, with an optional card straddling its right
 * edge. `header` is the window's title row.
 */
function Scene({
  header,
  satellite,
  children,
}: {
  header: ReactNode;
  satellite?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden
      data-slot="illustration"
      className="relative mx-auto w-full max-w-sm px-6 pt-2 select-none"
    >
      <div
        className={cn(
          "h-52 overflow-hidden rounded-card border border-border bg-card text-start text-card-foreground shadow-card",
          "mask-b-from-60% mask-b-to-100%",
          enterClasses
        )}
      >
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border px-4 py-3">
          {header}
        </div>
        <div className="flex flex-col gap-1 p-2">{children}</div>
      </div>
      {satellite ? (
        <div
          className={cn(
            "absolute right-0 bottom-8 flex max-w-56 rotate-2 items-center gap-2 rounded-card border border-border bg-popover px-3 py-2 text-sm font-semibold text-popover-foreground shadow-overlay",
            enterClasses
          )}
          style={enterAfter(500)}
        >
          {satellite}
        </div>
      ) : null}
    </div>
  );
}

function Title({ children }: { children: ReactNode }) {
  return <span className="font-display text-lg font-semibold">{children}</span>;
}

/** One row of a list. `isFocused` gives it the tinted "this one" look. */
function Row({
  index,
  isFocused = false,
  children,
}: {
  index: number;
  isFocused?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-control border px-3 py-2",
        isFocused
          ? "border-primary/30 bg-primary-soft text-primary-soft-foreground"
          : "border-transparent",
        enterClasses
      )}
      style={enterAfter(120 + index * 70)}
    >
      {children}
    </div>
  );
}

function SatelliteIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary-soft-foreground [&_svg]:size-4">
      {children}
    </span>
  );
}

/** Today: one task done, the next one up, the ring at 60%. */
export function TodayIllustration() {
  const text = useLang().illustrations;
  return (
    <Scene
      header={
        <>
          <Title>{text.today}</Title>
          <ProgressRing label={text.progress} value={60} size="sm" />
        </>
      }
      satellite={
        <>
          <SatelliteIcon>
            <TrendingUp />
          </SatelliteIcon>
          {text.onTrack}
        </>
      }
    >
      <Row index={0}>
        <CircleCheck className="size-5 shrink-0 text-progress" />
        <span className="flex-1 text-muted-foreground line-through">
          {text.doneTopic}
        </span>
      </Row>
      <Row index={1} isFocused>
        <CircleDot className="size-5 shrink-0" />
        <span className="flex-1 font-semibold">{text.nextTopic}</span>
        <Badge>{text.upNext}</Badge>
      </Row>
      {TODAY_LINES.map((width, index) => (
        <Row key={width} index={index + 2}>
          <Circle className="size-5 shrink-0 text-muted-foreground" />
          <Line className={width} />
        </Row>
      ))}
    </Scene>
  );
}

/** The plan: a week of study, today marked, the exam counted down. */
export function PlanIllustration() {
  const text = useLang().illustrations;
  const days = [3, 2, 3, 1, 2, 3, 2];
  const today = 2;
  return (
    <Scene
      header={<Title>{text.thisWeek}</Title>}
      satellite={
        <>
          <SatelliteIcon>
            <CalendarCheck />
          </SatelliteIcon>
          {text.examIn}
        </>
      }
    >
      <div className="grid grid-cols-7 gap-1.5 px-1 pt-1">
        {days.map((tasks, day) => (
          <div
            key={day}
            className={cn(
              "flex h-32 flex-col gap-1.5 rounded-control border p-1.5",
              day === today
                ? "border-primary/40 bg-primary-soft"
                : "border-border",
              enterClasses
            )}
            style={enterAfter(120 + day * 50)}
          >
            {Array.from({ length: tasks }, (_, task) => (
              <span
                key={task}
                className={cn(
                  "block h-5 rounded-sm",
                  day < today ? "bg-progress-soft" : "bg-muted",
                  day === today && task === 0 && "bg-primary"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </Scene>
  );
}

/** Topics: strong ones and one that needs practice. */
export function TopicsIllustration() {
  const text = useLang().illustrations;
  return (
    <Scene
      header={<Title>{text.yourTopics}</Title>}
      satellite={
        <TopicChip name={text.practiceTopic} strength="needs-practice" />
      }
    >
      <div className="flex flex-wrap gap-2 p-2">
        <span className={enterClasses} style={enterAfter(120)}>
          <TopicChip name={text.doneTopic} strength="strong" />
        </span>
        <span className={enterClasses} style={enterAfter(190)}>
          <TopicChip name={text.nextTopic} strength="strong" />
        </span>
        {TOPIC_LINES.map((width, index) => (
          <span
            key={`${width}-${String(index)}`}
            className={cn(
              "flex h-8 items-center rounded-full border border-border px-3",
              enterClasses
            )}
            style={enterAfter(260 + index * 60)}
          >
            <Line className={width} />
          </span>
        ))}
      </div>
    </Scene>
  );
}

/** Ask: a doubt sent, its answer coming in. */
export function AskIllustration() {
  const text = useLang().illustrations;
  return (
    <Scene
      header={<Title>{text.ask}</Title>}
      satellite={
        <>
          <SatelliteIcon>
            <MessageCircleQuestion />
          </SatelliteIcon>
          {text.answered}
        </>
      }
    >
      <div className="flex flex-col gap-3 p-2">
        <span
          className={cn(
            "max-w-[80%] self-end rounded-card rounded-br-sm bg-primary px-3 py-2 text-primary-foreground",
            enterClasses
          )}
          style={enterAfter(150)}
        >
          {text.question}
        </span>
        <span
          className={cn(
            "flex w-[80%] flex-col gap-2 rounded-card rounded-bl-sm bg-muted/60 p-3",
            enterClasses
          )}
          style={enterAfter(450)}
        >
          <Line className="w-full bg-hover" />
          <Line className="w-5/6 bg-hover" />
          <Line className="w-2/3 bg-hover" />
        </span>
      </div>
    </Scene>
  );
}

/** The Organization dashboard: a class's progress at a glance. */
export function DashboardIllustration() {
  const text = useLang().illustrations;
  return (
    <Scene
      header={<Title>{text.className}</Title>}
      satellite={
        <TopicChip name={text.practiceTopic} strength="needs-practice" />
      }
    >
      <div className="grid grid-cols-2 gap-2 p-1">
        <div
          className={cn(
            "flex flex-col gap-1 rounded-control border border-border p-3",
            enterClasses
          )}
          style={enterAfter(120)}
        >
          <span className="text-sm text-muted-foreground">
            {text.averageProgress}
          </span>
          <span className="font-display text-3xl font-semibold">
            {text.averageValue}
          </span>
        </div>
        <div
          className={cn(
            "flex items-center justify-center rounded-control border border-border p-3",
            enterClasses
          )}
          style={enterAfter(200)}
        >
          <ProgressRing label={text.averageProgress} value={72} />
        </div>
      </div>
      {DASHBOARD_LINES.map((width, index) => (
        <Row key={width} index={index + 3}>
          <span className="size-8 shrink-0 rounded-full bg-muted" />
          <Line className={width} />
        </Row>
      ))}
    </Scene>
  );
}

/** People in an Organization: classes, members, requests and invites. */
export function PeopleIllustration() {
  const text = useLang().illustrations;
  const people = [text.personOne, text.personTwo];
  return (
    <Scene
      header={
        <>
          <Title>{text.className}</Title>
          <Badge variant="primary">{text.students}</Badge>
        </>
      }
      satellite={
        <>
          <SatelliteIcon>
            <UserPlus />
          </SatelliteIcon>
          {text.newRequest}
        </>
      }
    >
      {people.map((name, index) => (
        <Row key={name} index={index} isFocused={index === 0}>
          <Avatar name={name} size="sm" />
          <span className="flex-1 font-semibold">{name}</span>
          <span className="h-2 w-16 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-progress"
              style={{ width: index === 0 ? "80%" : "55%" }}
            />
          </span>
        </Row>
      ))}
      {PEOPLE_LINES.map((width, index) => (
        <Row key={width} index={index + 2}>
          <span className="size-8 shrink-0 rounded-full bg-muted" />
          <Line className={width} />
        </Row>
      ))}
    </Scene>
  );
}

/** The profile: who you are and how far you have come. */
export function ProfileIllustration() {
  const text = useLang().illustrations;
  return (
    <Scene
      header={
        <span className="flex items-center gap-3">
          <Avatar name={text.personOne} />
          <span className="flex flex-col gap-1.5">
            <Title>{text.personOne}</Title>
            <Line className="w-24" />
          </span>
        </span>
      }
      satellite={
        <>
          <SatelliteIcon>
            <TrendingUp />
          </SatelliteIcon>
          {text.strongTopics}
        </>
      }
    >
      {PROFILE_LINES.map((width, index) => (
        <Row key={width} index={index}>
          <span className="size-5 shrink-0 rounded-sm bg-muted" />
          <Line className={width} />
        </Row>
      ))}
    </Scene>
  );
}

/** Join: a code typed in, the request on its way. */
export function JoinIllustration() {
  const text = useLang().illustrations;
  return (
    <Scene
      header={<Title>{text.joinTitle}</Title>}
      satellite={
        <>
          <SatelliteIcon>
            <Clock />
          </SatelliteIcon>
          {text.requestSent}
        </>
      }
    >
      <div className="flex flex-col gap-3 p-2">
        <div
          className={cn(
            "relative rounded-control border-2 border-primary px-3 pt-4 pb-2.5",
            enterClasses
          )}
          style={enterAfter(150)}
        >
          <span className="absolute -top-2.5 left-2 bg-card px-1 text-sm text-primary">
            {text.codeLabel}
          </span>
          <span className="font-display text-lg font-semibold tracking-[0.3em] tabular-nums">
            {text.codeValue}
          </span>
        </div>
        <span
          className={cn(
            "flex h-11 items-center justify-center rounded-control bg-primary",
            enterClasses
          )}
          style={enterAfter(300)}
        >
          <Line className="w-24 bg-primary-foreground/60" />
        </span>
      </div>
    </Scene>
  );
}
