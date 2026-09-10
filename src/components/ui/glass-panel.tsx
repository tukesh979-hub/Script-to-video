/**
 * Double-bezel ("doppelrand") glass surface: an outer tray (.bezel-outer)
 * holding a distinct inner core (.bezel-inner) with a concentric, slightly
 * smaller radius -- like a glass plate sitting in a machined frame, rather
 * than one flat translucent panel. Reserved for hero/primary surfaces (see
 * globals.css's comment above .bezel-outer for which ones and why).
 */
export function GlassPanel({
  children,
  className = "",
  innerClassName = "",
  radius = 28,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  /** Outer corner radius in px; the inner core is always 6px smaller so the
   * two stay concentric regardless of size. */
  radius?: number;
  /** Outer wrapper element -- "aside" for the sidebar, "div" (default)
   * everywhere else. */
  as?: "div" | "aside" | "section";
}) {
  return (
    <Tag className={`bezel-outer p-1.5 ${className}`} style={{ borderRadius: radius }}>
      <div className={`bezel-inner h-full ${innerClassName}`} style={{ borderRadius: radius - 6 }}>
        {children}
      </div>
    </Tag>
  );
}
