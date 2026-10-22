"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { isAutoLoopExcluded } from "@/lib/sequences.config";
import type { SequenceCfg } from "@/lib/sequences.config";
import { loadSequence, releaseSequence, getEntry, subscribe, prioritizeSequence } from "@/lib/frames";
import { useUI } from "@/store/ui";

export type Chapter = { from: number; to: number; node: ReactNode };

type Props = {
  cfg: SequenceCfg;
  /** 1-based frame inside the folder */
  start?: number;
  /** inclusive end frame inside the folder */
  end?: number;
  chapters?: Chapter[];
  mode?: "pin" | "hover";
  /** pin wrapper height as a multiple of the viewport */
  pinVH?: number;
  /** segment-relative frame where autoplay parks */
  hold?: number;
  inverted?: boolean;
  scrollHint?: boolean;
  playOnHover?: boolean;
  /**
   * Continuous muted autoplay while the section is idle. Used for every
   * sequence except the v1 hero/CTA scroll film. Scrolling scrubs; stopping
   * resumes the loop. Hover pauses hover-mode sequences.
   */
  autoLoop?: boolean;
  /** show the small sequence/frame HUD (bottom-left identity chip) */
  hud?: boolean;
  /** show the loading progress chip over the film */
  loadingChip?: boolean;
  className?: string;
  canvasClassName?: string;
  children?: ReactNode;
};

const DPR_CAP = 2;

export default function FrameSequence({
  cfg,
  start = 1,
  end,
  chapters = [],
  mode = "pin",
  pinVH = 3.4,
  hold,
  inverted = false,
  scrollHint = false,
  playOnHover = false,
  autoLoop,
  hud = true,
  loadingChip = true,
  className = "",
  canvasClassName = "",
  children,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [frame, setFrame] = useState(1);
  const [percent, setPercent] = useState(0);
  const [ready, setReady] = useState(false);
  const [holdDone, setHoldDone] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [nearView, setNearView] = useState(false);

  const segEnd = Math.min(end ?? cfg.frames, cfg.frames);
  const N = Math.max(1, segEnd - start + 1);

  const dip = useRef({
    display: 1,
    target: 1,
    playing: false,
    engaged: false,
    interacted: false,
    playhead: 1,
    last: 0,
    hovered: false,
    wasHovered: false,
    ready: false,
    scrollAtTakeover: 0,
    frameAtTakeover: 1,
    takeTop: 0,
    takeScrollable: 1,
    lastDrawn: -1,
    lastEmitted: 1,
    lastScrollY: 0,
    lastScrollAt: 0,
    loopStarted: false,
  });

  useEffect(() => {
    const dipS = dip.current;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stride = isMobile ? 2 : 1;
    const folder =
      isMobile && cfg.mobileFolder ? cfg.mobileFolder : cfg.folder;
    const key = folder; // hero + cta share the v1 cache

    // Default policy: every sequence autoplays except /frames/v1 (hero + CTA).
    // The folder exclusion wins; an explicit autoLoop={false} can disable a
    // single non-v1 instance, but nothing can force the v1 folder to loop.
    const autoLoopEnabled =
      !isAutoLoopExcluded(folder) && (autoLoop ?? true);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    let unsubFrames: (() => void) | undefined;

    /* ---------- poster ---------- */
    let poster: HTMLImageElement | undefined;
    const posterImg = new Image();
    posterImg.onload = () => {
      poster = posterImg;
      if (dipS.display <= 1) drawPosterNow();
    };
    posterImg.src = cfg.poster;

    const drawCover = (img: HTMLImageElement | HTMLCanvasElement | ImageBitmap) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = (img as HTMLImageElement).width || cfg.width;
      const ih = (img as HTMLImageElement).height || cfg.height;
      const s = Math.max(cw / iw, ch / ih);
      const w = iw * s;
      const h = ih * s;
      ctx.fillStyle = inverted ? "#0a0a0a" : "#f2f0eb";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const drawPosterNow = () => {
      if (poster) drawCover(poster);
    };

    const slotOfLocal = (local: number) =>
      Math.floor((start - 1 + (local - 1)) / stride);

    const usable = (img?: HTMLImageElement) =>
      img && img.complete && img.naturalWidth ? img : undefined;

    /** Exact frame when decoded, otherwise the nearest decoded neighbour. */
    const imgFor = (local: number) => {
      const e = getEntry(key);
      if (!e) return undefined;
      const idx = slotOfLocal(local);
      const exact = usable(e.imgs[idx]);
      if (exact) return exact;
      for (let d = 1; d <= 16; d++) {
        const back = usable(e.imgs[idx - d]);
        if (back) return back;
        const forward = usable(e.imgs[idx + d]);
        if (forward) return forward;
      }
      return undefined;
    };

    const drawLocal = (local: number) => {
      const img = imgFor(local);
      if (img) drawCover(img);
      else drawPosterNow();
    };

    /* redraw as background frames arrive (poster stays until then) */
    const onFrames = () => {
      if (dipS.lastDrawn >= 0) drawLocal(Math.round(dipS.display));
    };
    unsubFrames = subscribe(onFrames);

    const resize = () => {
      const el = canvas.parentElement;
      if (!el) return;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : DPR_CAP);
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      dipS.lastDrawn = -1;
      drawLocal(Math.round(dipS.display));
    };

    const ro = new ResizeObserver(resize);
    if (frameRef.current) ro.observe(frameRef.current);
    resize();


    /* ---------- loading ---------- */
    const ensure = () => {
      loadSequence(key, folder, cfg.frames, cfg.poster, stride);
    };
    ensure();

    let raf = 0;
    let lastTime = performance.now();

    const onWheel = () => takeOver();
    const onTouch = () => takeOver();
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(e.key))
        takeOver();
    };

    const takeOver = () => {
      // Auto-looping sequences keep their own scrubbing/loop state; a wheel
      // event must not permanently disable their autoplay.
      if (autoLoopEnabled) return;
      if (dipS.interacted) return;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      // only the section occupying the stage may hand off
      const centered = rect.top < vh * 0.35 && rect.bottom > vh * 0.5;
      if (!centered) return;
      dipS.engaged = false;
      dipS.playing = false;
      dipS.interacted = true;
      setHoldDone(true);
      // rebase so scroll continues from the exact frame on screen
      dipS.scrollAtTakeover = window.scrollY;
      dipS.frameAtTakeover = dipS.display;
      dipS.takeTop = rect.top + window.scrollY;
      dipS.takeScrollable = Math.max(1, rect.height - vh);
    };

    /** Autoplay finished: park on the hold frame, ready for a scroll hand-off. */
    const parkAtHold = () => {
      dipS.playing = false;
      dipS.engaged = false;
      dipS.interacted = true;
      setHoldDone(true);
      const wrap = wrapRef.current;
      dipS.scrollAtTakeover = window.scrollY;
      dipS.frameAtTakeover = dipS.playhead;
      if (wrap) {
        const rect = wrap.getBoundingClientRect();
        dipS.takeTop = rect.top + window.scrollY;
        dipS.takeScrollable = Math.max(1, rect.height - window.innerHeight);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);

    /* ---------- main loop ---------- */
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const wrap = wrapRef.current;
      if (wrap) {
        const rect = wrap.getBoundingClientRect();
        const vh = window.innerHeight;

        /* viewport gating — memory */
        const visible = rect.bottom > -vh * 0.15 && rect.top < vh * 1.25;
        const near = rect.bottom > -vh * 1.5 && rect.top < vh * 2.5;
        if (near) ensure();
        else if (visible) ensure();
        if (!near) releaseSequence(key);
        setNearView((prev) => (prev === near ? prev : near));

        /* autoplay start when settled in view (v1 scroll-film only) */
        const inView =
          rect.top < vh * 0.35 && rect.top > -vh * 0.25 && rect.bottom > vh * 0.5;
        // Short sections (the 16:9 collection film on mobile) never satisfy
        // the full-stage `inView` test above, so autoplay must use a plain
        // viewport-intersection test or it silently stays parked.
        const loopInView = rect.bottom > vh * 0.1 && rect.top < vh * 0.9;
        const autoplayOn = useUI.getState().autoplay;
        const scrollYNow = window.scrollY;
        if (Math.abs(scrollYNow - dipS.lastScrollY) > 0.5) {
          dipS.lastScrollY = scrollYNow;
          dipS.lastScrollAt = now;
        }
        const idle = now - dipS.lastScrollAt > 850;

        if (
          !autoLoopEnabled &&
          autoplayOn &&
          !reduced &&
          !dipS.interacted &&
          !dipS.engaged &&
          inView &&
          !playOnHover
        ) {
          dipS.engaged = true;
          dipS.playing = true;
          dipS.playhead = 1;
        }
        if (!autoLoopEnabled && !autoplayOn && dipS.engaged && !dipS.interacted) {
          takeOver();
        }

        /* progress (pin mode) */
        let p = 0;
        if (mode === "pin") {
          const scrollable = Math.max(1, rect.height - vh);
          p = Math.min(1, Math.max(0, -rect.top / scrollable));
        } else {
          p = Math.min(1, Math.max(0, (vh * 0.85 - rect.top) / (vh * 0.85)));
          if (playOnHover && dipS.hovered && !autoLoopEnabled) {
            // start playback from the frame currently on screen
            if (!dipS.wasHovered) {
              dipS.wasHovered = true;
              dipS.playhead = dipS.display;
            }
            dipS.playhead += dt * cfg.fps;
            if (dipS.playhead > N) dipS.playhead = 1;
            p = (dipS.playhead - 1) / Math.max(1, N - 1);
          } else {
            dipS.wasHovered = false;
          }
        }

        /*
         * Continuous muted autoplay for 2.1 / 2.2 / 2.3.
         * Scrolling scrubs while it is moving; after 850 ms of stillness the
         * loop resumes from the frame on screen. Hover pauses the collection.
         */
        const loopEligible =
          autoLoopEnabled && autoplayOn && !reduced && loopInView && !dipS.interacted;
        if (loopEligible) {
          if (mode === "hover" && canHover && dipS.hovered) {
            dipS.loopStarted = false;
            dipS.engaged = false;
            p = (dipS.display - 1) / Math.max(1, N - 1);
          } else if (idle) {
            if (!dipS.loopStarted) {
              dipS.loopStarted = true;
              dipS.playhead = Math.min(N, Math.max(1, dipS.display));
            }
            dipS.playhead += dt * cfg.fps;
            if (dipS.playhead > N) {
              dipS.playhead = 1 + ((dipS.playhead - N) % N);
              // Hard cut at the loop seam; do not lerp backwards from N to 1.
              dipS.display = dipS.playhead;
            }
            p = (dipS.playhead - 1) / Math.max(1, N - 1);
            dipS.engaged = true;
          } else {
            // The page is scrolling: respect the scroll-scrub position.
            dipS.loopStarted = false;
            dipS.engaged = false;
          }
        } else {
          dipS.loopStarted = false;
          dipS.engaged = false;
        }

        if (!autoLoopEnabled && dipS.playing && !dipS.hovered) {
          dipS.playhead += dt * cfg.fps;
          const holdFrame = hold ?? Math.round(N * 0.5);
          if (dipS.playhead >= holdFrame) {
            dipS.playhead = holdFrame;
            parkAtHold();
          }
        }

        let target: number;
        if (dipS.interacted) {
          // offset-rebased scrub: no rewind jump after autoplay
          const delta = window.scrollY - dipS.scrollAtTakeover;
          const remaining = Math.max(
            1,
            dipS.takeTop + dipS.takeScrollable - dipS.scrollAtTakeover
          );
          const factor = (N - dipS.frameAtTakeover) / remaining;
          target = dipS.frameAtTakeover + delta * factor;
        } else if (dipS.engaged) {
          target = dipS.playhead;
        } else {
          target = 1 + p * (N - 1);
        }
        target = Math.min(N, Math.max(1, target));
        dipS.target = target;

        if (reduced) {
          dipS.display = target;
        } else {
          const k = 1 - Math.pow(0.0018, dt); // weighty lerp
          dipS.display += (dipS.target - dipS.display) * Math.min(1, k);
        }

        const shown = Math.round(dipS.display);
        if (shown !== dipS.lastDrawn) {
          dipS.lastDrawn = shown;
          drawLocal(shown);
          prioritizeSequence(key, slotOfLocal(shown));
        }
        if (shown !== dipS.lastEmitted) {
          dipS.lastEmitted = shown;
          setFrame(shown);
        }

        const e = getEntry(key);
        if (e) {
          setPercent(Math.round((e.loaded / e.total) * 100));
          const r = e.ready;
          setReady((prev) => (prev === r ? prev : r));
        }
        setHoldDone((prev) => {
          const next = dipS.interacted || !dipS.playing;
          return prev === next ? prev : next;
        });
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    if (reduced || !useUI.getState().autoplay) setHoldDone(true);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      unsubFrames?.();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.id, cfg.folder, cfg.frames, cfg.fps, cfg.poster, start, segEnd, mode, pinVH, inverted, playOnHover, autoLoop, hold]);

  useEffect(() => {
    dip.current.hovered = hovered;
  }, [hovered]);

  const wrapH = mode === "pin" ? `${pinVH * 100}vh` : undefined;

  return (
    <div
      ref={wrapRef}
      className={`relative ${inverted ? "bg-invertbg text-invertink" : "bg-bg text-ink"} ${className}`}
      style={wrapH ? { height: wrapH } : undefined}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      data-frame={frame}
    >
      <div
        ref={frameRef}
        className={`${
          mode === "pin"
            ? "sticky top-0 h-screen"
            : "relative aspect-video h-auto md:h-[62vh]"
        } w-full overflow-hidden`}
      >
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full ${canvasClassName}`}
          aria-hidden="true"
        />
        {/* legibility vignette for overlaid type */}
        {chapters.length > 0 && (
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,10,0.5),rgba(10,10,10,0.12)_22%,rgba(10,10,10,0.18)_55%,rgba(10,10,10,0.7))]"
            aria-hidden="true"
          />
        )}
        {/* chapters */}
        <div className="pointer-events-none absolute inset-0">
          {chapters.map((c, i) => {
            const on = frame >= c.from && frame <= c.to;
            return (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-200 ease-snap ${
                  on ? "opacity-100" : "opacity-0 invisible"
                }`}
                aria-hidden={!on}
              >
                {c.node}
              </div>
            );
          })}
        </div>

        {children}

        {/* sequence HUD */}
        {hud && (
          <div className="pointer-events-none absolute left-4 top-[4.5rem] z-20 flex items-center gap-2 md:left-6">
            <span className="border border-white/30 bg-ink/50 px-2 py-1 font-mono text-[10px] tracking-[0.3em] text-white/90">
              {cfg.label}
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-white/70 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
              {String(frame).padStart(3, "0")}/{String(N).padStart(3, "0")}
            </span>
          </div>
        )}

        {/* loading chip */}
        {loadingChip && nearView && !ready && (
          <div className="absolute bottom-4 right-4 z-30 border-2 border-ink bg-bg px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink">
            LOADING {String(percent).padStart(3, "0")}%
          </div>
        )}

        {/* scroll hint */}
        {scrollHint && holdDone && frame <= (hold ?? N * 0.5) + 2 && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 text-center text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.7)] md:block">
            <div className="font-mono text-[10px] tracking-[0.35em]">SCROLL</div>
            <div className="mx-auto mt-2 h-8 w-[2px] bg-white/70" />
          </div>
        )}
      </div>
    </div>
  );
}
