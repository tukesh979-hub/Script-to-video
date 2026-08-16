/** The one ambient background texture (see globals.css .gridbg). Rendered once in
 * the root layout — pages must never add a second background effect on top. */
export function GridBackground() {
  return <div className="gridbg" aria-hidden />;
}
