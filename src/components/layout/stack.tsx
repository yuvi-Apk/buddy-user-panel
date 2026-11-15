// Spacing without one-off margins. Gaps come from one scale, so every screen lines up.
//   <Stack gap={4}>…</Stack>                     top to bottom
//   <Inline gap={2} justify="between">…</Inline> side by side, wrapping on small screens
//   <Grid columns={{ base: 1, md: 2, lg: 3 }}>…</Grid>
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Full class names, so Tailwind can find them in the source.
const gaps = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
} as const;

export type Gap = keyof typeof gaps;

const aligns = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
} as const;

const justifies = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
} as const;

interface BaseProps {
  gap?: Gap;
  className?: string;
  children: ReactNode;
}

export function Stack({
  gap = 4,
  align = "stretch",
  className,
  children,
}: BaseProps & { align?: keyof typeof aligns }) {
  return (
    <div className={cn("flex flex-col", gaps[gap], aligns[align], className)}>
      {children}
    </div>
  );
}

export function Inline({
  gap = 2,
  align = "center",
  justify = "start",
  wrap = true,
  className,
  children,
}: BaseProps & {
  align?: keyof typeof aligns;
  justify?: keyof typeof justifies;
  wrap?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-row",
        wrap && "flex-wrap",
        gaps[gap],
        aligns[align],
        justifies[justify],
        className
      )}
    >
      {children}
    </div>
  );
}

const baseColumns = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
} as const;
const mdColumns = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
} as const;
const lgColumns = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
} as const;

type Columns = keyof typeof baseColumns;

export function Grid({
  columns = { base: 1, md: 2, lg: 3 },
  gap = 4,
  className,
  children,
}: BaseProps & { columns?: { base?: Columns; md?: Columns; lg?: Columns } }) {
  return (
    <div
      className={cn(
        "grid",
        baseColumns[columns.base ?? 1],
        columns.md && mdColumns[columns.md],
        columns.lg && lgColumns[columns.lg],
        gaps[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
