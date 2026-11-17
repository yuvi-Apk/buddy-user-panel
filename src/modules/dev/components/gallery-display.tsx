// Cards, badges, topic chips, progress rings and avatars; then the feedback states.
import { BookOpen, CircleCheck, Flame, Sprout } from "lucide-react";
import { useState } from "react";
import {
  AskIllustration,
  ComingSoon,
  DashboardIllustration,
  EmptyState,
  ErrorState,
  LoadingState,
  OfflineBanner,
  PeopleIllustration,
  PlanIllustration,
  ProfileIllustration,
  JoinIllustration,
  TodayIllustration,
  TopicsIllustration,
} from "@/components/states";
import { Grid, Inline, Stack } from "@/components/layout";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Divider,
  ProgressRing,
  Skeleton,
  toast,
  TopicChip,
} from "@/components/ui";

export function GalleryDisplay() {
  return (
    <Stack gap={6}>
      <Grid columns={{ base: 1, md: 2 }}>
        <Card>
          <CardHeader>
            <CardTitle>Today · Physics</CardTitle>
            <CardDescription>
              3 of 5 tasks done. 25 minutes left.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressRing label="Today's tasks" value={3} max={5} size="sm" />
          </CardContent>
          <CardFooter>
            <Button size="sm">Continue</Button>
            <Button size="sm" variant="ghost">
              See the plan
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <ProgressRing label="Syllabus covered" value={68} size="lg" />
            <p className="text-sm text-muted-foreground">Syllabus covered</p>
          </CardContent>
        </Card>
      </Grid>

      <Inline gap={2}>
        <Badge>Neutral</Badge>
        <Badge variant="primary" icon={<BookOpen />}>
          Primary
        </Badge>
        <Badge variant="progress" icon={<CircleCheck />}>
          Done
        </Badge>
        <Badge variant="weak" icon={<Sprout />}>
          Needs practice
        </Badge>
        <Badge variant="destructive">Failed to send</Badge>
      </Inline>

      <Inline gap={2}>
        <TopicChip name="Algebra" strength="strong" />
        <TopicChip name="Optics" strength="needs-practice" />
        <TopicChip name="Modern history" strength="needs-practice" />
        <TopicChip name="Grammar" strength="strong" />
      </Inline>

      <Inline gap={6} align="end">
        <ProgressRing label="Small" value={25} size="sm" />
        <ProgressRing label="Medium" value={50} variant="primary" />
        <ProgressRing label="Large" value={90} size="lg" />
        <ProgressRing label="Needs practice" value={30} variant="weak" />
      </Inline>

      <Inline gap={3}>
        <Avatar name="Asha Verma" size="sm" />
        <Avatar name="Rahul Kumar" />
        <Avatar name="Meera" size="lg" />
        <Divider orientation="vertical" />
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Flame aria-hidden className="size-4" />
          Streak icons stay neutral: amber is only for weak topics.
        </span>
      </Inline>
    </Stack>
  );
}

export function GalleryFeedback() {
  const [loading, setLoading] = useState(true);

  return (
    <Stack gap={6}>
      <Grid columns={{ base: 1, md: 2 }}>
        <Alert title="Your plan is ready">
          We built 42 days of study around your exam date.
        </Alert>
        <Alert variant="success" title="Great week!">
          You finished every task for 5 days.
        </Alert>
        <Alert variant="weak" title="3 topics need practice">
          Optics, Modern history and Ratios.
        </Alert>
        <Alert
          variant="destructive"
          title="Couldn't save your answers"
          action={
            <Button size="sm" variant="outline">
              Try again
            </Button>
          }
        >
          Check your connection, then try again.
        </Alert>
      </Grid>

      <Inline gap={2}>
        <Button variant="outline" onClick={() => toast({ title: "Saved" })}>
          Neutral toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Plan updated",
              description: "Tomorrow starts with Optics.",
              variant: "success",
            })
          }
        >
          Success toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Couldn't send",
              description: "Please try again.",
              variant: "destructive",
            })
          }
        >
          Error toast
        </Button>
      </Inline>

      <Stack gap={2}>
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => setLoading((on) => !on)}
        >
          {loading ? "Show content" : "Show loading"}
        </Button>
        {loading ? (
          <LoadingState>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-16 w-full" />
          </LoadingState>
        ) : (
          <p>The content has loaded.</p>
        )}
      </Stack>

      <Grid columns={{ base: 1, lg: 3 }}>
        <Card>
          <EmptyState
            icon={<BookOpen />}
            title="No topics yet"
            description="Take a short test and we'll find your strong and weak topics."
            action={<Button>Start the test</Button>}
          />
        </Card>
        <Card>
          <ErrorState
            onRetry={() => toast({ title: "Retrying…" })}
            reference="7f3c9a1e"
          />
        </Card>
        <Card>
          <ComingSoon />
        </Card>
      </Grid>

      {/* The pictures for coming-soon and empty states (src/components/states/illustrations.tsx). */}
      <Grid columns={{ base: 1, md: 2 }}>
        {[
          <TodayIllustration key="today" />,
          <PlanIllustration key="plan" />,
          <TopicsIllustration key="topics" />,
          <AskIllustration key="ask" />,
          <DashboardIllustration key="dashboard" />,
          <PeopleIllustration key="people" />,
          <ProfileIllustration key="profile" />,
          <JoinIllustration key="join" />,
        ].map((picture) => (
          <Card key={picture.key} className="py-6">
            {picture}
          </Card>
        ))}
      </Grid>

      <p className="text-sm text-muted-foreground">
        The offline banner appears below when the browser goes offline (DevTools
        → Network → Offline).
      </p>
      <OfflineBanner />
    </Stack>
  );
}
