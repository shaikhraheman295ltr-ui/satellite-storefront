/**
 * Reference-counted native scroll lock for full-screen overlays
 * (menu, search, cart drawer).
 *
 * Lenis can pause itself, but on touch devices the OS keeps scrolling the
 * document behind `position: fixed` overlays. Overflow-hidden on the html
 * element stops that; the counter keeps nested locks honest and the
 * scrollbar-width compensation keeps desktop layouts from shifting when the
 * scrollbar disappears.
 */

let locks = 0;

export function lockScroll() {
  if (typeof document === "undefined") return;
  if (locks++ > 0) return;
  const scrollbar =
    window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = "hidden";
  if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
}

export function unlockScroll() {
  if (typeof document === "undefined") return;
  if (locks === 0) return;
  if (--locks > 0) return;
  document.documentElement.style.overflow = "";
  document.body.style.paddingRight = "";
}
