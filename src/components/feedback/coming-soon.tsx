// The placeholder for screens whose feature is not built yet.
import { Hammer } from "lucide-react";
import { useLang } from "@/lang";
import { EmptyState } from "./empty-state";

export function ComingSoon({ className }: { className?: string }) {
  const lang = useLang();
  return (
    <EmptyState
      icon={<Hammer />}
      title={lang.feedback.comingSoonTitle}
      description={lang.feedback.comingSoonBody}
      className={className}
    />
  );
}
