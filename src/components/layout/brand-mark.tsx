// The app's name with its mark, at the top of the sidebar and the phone top bar.
import { GraduationCap } from "lucide-react";
import { useLang } from "@/lang";
import { cn } from "@/lib/cn";

export function BrandMark({ className }: { className?: string }) {
  const lang = useLang();
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-control bg-brand text-brand-foreground [&_svg]:size-5"
      >
        <GraduationCap />
      </span>
      <span className="font-display text-lg font-semibold">
        {lang.common.appName}
      </span>
    </span>
  );
}
