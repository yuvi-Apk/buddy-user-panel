// The structure of every screen:
//   <Page>
//     <PageHeader title={lang.plan.title} description={…} actions={<Button>…</Button>} />
//     <Section title={lang.plan.thisWeek}>…</Section>
//   </Page>
// Page sets the gutters (16px phone, 24px tablet, 32px laptop) and the content width.
import { type ReactNode, useId } from "react";
import { cn } from "@/utils/cn";

export interface PageProps {
  /** `content` (up to about 1120px) by default; `reading` for long text (68 characters). */
  width?: "content" | "reading";
  className?: string;
  children: ReactNode;
}

export function Page({ width = "content", className, children }: PageProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-6 px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8",
        width === "reading" ? "max-w-reading" : "max-w-content",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** The screen's one h1. After navigation, focus moves to it so screen readers announce it. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-1">
        <h1
          tabIndex={-1}
          data-page-heading
          className="text-2xl outline-none md:text-3xl"
        >
          {title}
        </h1>
        {description ? (
          <p className="max-w-reading text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export interface SectionProps {
  title?: ReactNode;
  description?: ReactNode;
  /** A button or link at the end of the section heading ("See all"). */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Section({
  title,
  description,
  action,
  className,
  children,
}: SectionProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cn("flex flex-col gap-3", className)}
    >
      {title || action ? (
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            {title ? (
              <h2 id={headingId} className="text-lg md:text-xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
