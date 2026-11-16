// A person's picture, or their initials when there is none (or it fails to load).
import { Avatar as AvatarPrimitive } from "radix-ui";
import { cn } from "@/utils/cn";

const sizes = {
  sm: "size-8 text-sm",
  default: "size-11 text-base",
  lg: "size-16 text-xl",
} as const;

export interface AvatarProps {
  name: string;
  /** An image URL from our API. */
  src?: string;
  size?: keyof typeof sizes;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase())
    .join("");
}

export function Avatar({
  name,
  src,
  size = "default",
  className,
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft font-semibold text-primary-soft-foreground select-none",
        sizes[size],
        className
      )}
    >
      {src ? (
        <AvatarPrimitive.Image
          src={src}
          alt={name}
          className="size-full object-cover"
        />
      ) : null}
      <AvatarPrimitive.Fallback>
        <span aria-hidden>{getInitials(name)}</span>
        <span className="sr-only">{name}</span>
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
