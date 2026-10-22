type Props = {
  text: string;
  invert?: boolean;
  speed?: number; // seconds per loop
  className?: string;
};

export default function Marquee({ text, invert = false, speed = 26, className = "" }: Props) {
  const row = (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="flex items-center">
          <span className="px-6 font-display text-[10vw] uppercase leading-none tracking-[-0.03em] md:text-[6.4vw]">
            {text}
          </span>
          <span className={`text-[6vw] leading-none md:text-[3vw] ${invert ? "text-accent" : "text-accent"}`}>
            ✳
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`overflow-hidden border-y-2 py-3 md:py-4 ${
        invert ? "border-invertink/30 bg-invertbg text-invertink" : "border-ink bg-bg text-ink"
      } ${className}`}
      aria-hidden="true"
    >
      <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
        {row}
        {row}
      </div>
    </div>
  );
}
