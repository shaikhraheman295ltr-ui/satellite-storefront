/**
 * Frame loader + registry.
 * - lazy batching: first 10% of a sequence loads instantly, remainder idles in
 * - `stride` lets mobile mount every 2nd frame (RAM cut in half)
 * - `prioritizeSequence` pulls the frames around the visible playhead forward
 * - `releaseSequence` drops Image refs once no mounted section has touched the
 *   entry recently (hero + cta share one v1 cache, so a plain delete is unsafe)
 */

export type FrameSeqEntry = {
  imgs: (HTMLImageElement | undefined)[];
  loaded: number;
  total: number; // slots (post-stride)
  ready: boolean; // initial batch done
};

type EntryState = FrameSeqEntry & {
  folder: string;
  stride: number;
  lastUsed: number;
  push?: (slot: number) => void;
};

const cache = new Map<string, EntryState>();
const listeners = new Set<() => void>();
const MAX_INFLIGHT = 6;
const RELEASE_GRACE_MS = 900;

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getEntry(seqId: string): EntryState | undefined {
  return cache.get(seqId);
}

export function isLoaded(seqId: string) {
  const e = cache.get(seqId);
  return !!e && e.ready;
}

/** Free all bitmap memory for a sequence once every consumer has let go. */
export function releaseSequence(seqId: string) {
  const e = cache.get(seqId);
  if (!e) return;
  if (performance.now() - e.lastUsed < RELEASE_GRACE_MS) return;
  e.imgs = [];
  e.loaded = 0;
  cache.delete(seqId);
  emit();
}

function idle(fn: () => void) {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(fn, { timeout: 1600 });
  } else {
    setTimeout(fn, 90);
  }
}

function startEntry(
  seqId: string,
  folder: string,
  total: number,
  poster: string,
  stride: number
) {
  const existing = cache.get(seqId);
  if (existing) {
    existing.lastUsed = performance.now();
    return existing;
  }

  const slots = Math.ceil(total / stride);
  const entry: EntryState = {
    imgs: new Array<undefined>(slots).fill(undefined),
    loaded: 0,
    total: slots,
    ready: false,
    folder,
    stride,
    lastUsed: performance.now(),
  };
  cache.set(seqId, entry);

  const srcIndexFor = (slot: number) => 1 + (slot - 1) * stride; // 1-based frame in folder
  const urlFor = (folder2: string, i: number) =>
    `${folder2}/f${String(i).padStart(4, "0")}.webp`;

  const first = Math.max(1, Math.round(slots * 0.1));
  const inflight = new Set<number>();

  const push = (slot: number) => {
    if (slot < 1 || slot > slots) return;
    if (entry.imgs[slot - 1] || inflight.has(slot)) return;
    if (inflight.size >= MAX_INFLIGHT) return;
    inflight.add(slot);
    const img = new Image();
    img.onload = img.onerror = () => {
      inflight.delete(slot);
      if (cache.get(seqId) !== entry) return; // released while decoding
      if (!entry.imgs[slot - 1]) {
        entry.imgs[slot - 1] = img;
        entry.loaded++;
        if (!entry.ready && entry.loaded >= first) entry.ready = true;
        emit();
      }
    };
    img.src = urlFor(folder, srcIndexFor(slot));
  };
  entry.push = push;

  // Phase 1 — first 10% at once
  for (let i = 1; i <= first; i++) push(i);

  // Phase 2 — background, in-flight capped, parked at idle
  let idx = first + 1;
  const pump = () => {
    if (cache.get(seqId) !== entry) return;
    if (idx > slots) return;
    while (idx <= slots && inflight.size < MAX_INFLIGHT) {
      push(idx++);
    }
    if (idx <= slots) idle(pump);
  };
  setTimeout(() => idle(pump), 450); // let the initial burst win
  return entry;
}

export function loadSequence(
  seqId: string,
  folder: string,
  total: number,
  poster: string,
  stride = 1
) {
  return startEntry(seqId, folder, total, poster, stride);
}

/**
 * Front-of-queue loading for the frame currently on screen.
 * Calls are cheap when the neighbourhood is already cached or in flight.
 */
export function prioritizeSequence(seqId: string, slot: number, radius = 12) {
  const e = cache.get(seqId);
  if (!e?.push) return;
  e.lastUsed = performance.now();
  for (let d = 0; d <= radius; d++) {
    if (slot - d >= 1) e.push(slot - d);
    if (d > 0 && slot + d <= e.total) e.push(slot + d);
  }
}
