// A hand-drawn line that climbs from the bottom-left corner to the top-right, with small dips on
// the way: steady study goes up. It sits behind the login panel's content, draws itself once, and
// brightens while the pointer is on the panel (needs a `group/panel` parent). Decorative only.
//   <GrowthLine />
const LINE =
  "M0,292 C24,282 34,236 56,246 S86,206 104,178 S146,122 172,140 S214,96 246,74 S292,104 314,70 S352,28 380,22";
/** The same line closed along the bottom, for the soft wash under it. */
const AREA = `${LINE} L400,22 L400,300 L0,300 Z`;

export function GrowthLine() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        className="size-full text-primary-foreground"
      >
        <path
          d={AREA}
          className="fill-current opacity-5 transition-opacity duration-250 group-hover/panel:opacity-10"
        />
        <path
          d={LINE}
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="opacity-30 transition-opacity duration-250 [stroke-dasharray:1] group-hover/panel:opacity-60 motion-safe:animate-draw-line"
        />
      </svg>
      {/* Where the line ends: a dot with a slow halo. Placed in % because the drawing stretches. */}
      <span className="absolute top-[7.3%] left-[95%] flex size-3 -translate-1/2 items-center justify-center">
        <span className="absolute size-full rounded-full bg-primary-foreground opacity-40 motion-safe:animate-ping" />
        <span className="size-full rounded-full bg-primary-foreground opacity-70 transition-opacity duration-250 group-hover/panel:opacity-100" />
      </span>
    </div>
  );
}
