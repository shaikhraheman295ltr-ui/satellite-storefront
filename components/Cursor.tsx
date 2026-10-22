"use client";

import { useEffect, useRef } from "react";

/**
 * Global crosshair cursor for fine-pointer desktops.
 *
 * - It is a real cursor replacement (the native cursor is hidden) so the
 *   crosshair never sits on top of a second arrow.
 * - Form controls keep the native I-beam/caret and the crosshair is hidden
 *   over them.
 * - Touch/coarse pointers and prefers-reduced-motion users keep the native
 *   cursor and never mount the visual cursor.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const el = ref.current;
    if (!el) return;

    // Keep the native cursor until the first real mouse move. Hiding it on
    // mount would leave a stationary pointer invisible until it moves.
    let cursorEnabled = false;
    const enableCursor = () => {
      if (cursorEnabled) return;
      cursorEnabled = true;
      document.documentElement.classList.add("cursor-none-desktop");
    };
    el.style.transform = "translate3d(-100px, -100px, 0) translate(-50%, -50%)";

    const isNativeField = (target: EventTarget | null) => {
      const t = target as HTMLElement | null;
      return !!t?.closest(
        'input, textarea, select, option, [contenteditable="true"]'
      );
    };

    const isInteractive = (target: EventTarget | null) => {
      const t = target as HTMLElement | null;
      return !!t?.closest("a, button, summary, [data-cursor], label");
    };

    const onMove = (e: PointerEvent) => {
      enableCursor();
      const native = isNativeField(e.target);
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      el.style.opacity = native ? "0" : "1";
      el.dataset.hover = isInteractive(e.target) ? "true" : "false";
      el.dataset.native = native ? "true" : "false";
    };

    const hide = () => {
      el.style.opacity = "0";
    };

    const onPointerOver = (e: PointerEvent) => {
      if (!(e.target instanceof Element)) return;
      onMove(e);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      document.documentElement.classList.remove("cursor-none-desktop");
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onPointerOver);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-hover="false"
      data-native="false"
      className="crosshair-cursor"
    >
      <span className="crosshair-bar crosshair-bar-top" />
      <span className="crosshair-bar crosshair-bar-right" />
      <span className="crosshair-bar crosshair-bar-bottom" />
      <span className="crosshair-bar crosshair-bar-left" />
      <span className="crosshair-dot" />
    </div>
  );
}
