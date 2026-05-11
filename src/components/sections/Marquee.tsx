"use client";

interface MarqueeSegment {
  text: string;
  filled?: boolean;
}

interface MarqueeRowProps {
  segments: MarqueeSegment[];
  direction?: "left" | "right";
  speed?: number;
  strokeWidth?: number;
  rotation?: number;
  className?: string;
}

function MarqueeRow({
  segments,
  direction = "left",
  speed = 25,
  strokeWidth = 2,
  rotation = -5,
  className = "",
}: MarqueeRowProps) {
  // Build one repeated strip
  const renderStrip = () => (
    <>
      {segments.map((seg, i) => (
        <span key={i} className="inline-flex items-center">
          <span
            className={`font-display text-[clamp(3rem,10vw,7.5rem)] font-bold uppercase tracking-tight select-none ${
              seg.filled ? "" : "text-transparent"
            }`}
            style={
              seg.filled
                ? { color: "#A31D1D" }
                : { WebkitTextStroke: `${strokeWidth}px #C4785C` }
            }
          >
            {seg.text}
          </span>
          {/* Mixed filled + outlined circle separator */}
          <span
            className="inline-block rounded-full mx-3 md:mx-5 align-middle"
            style={{
              width: "clamp(10px, 1.6vw, 16px)",
              height: "clamp(10px, 1.6vw, 16px)",
              backgroundColor: i % 2 === 0 ? "#A31D1D" : "transparent",
              border: "2px solid #A31D1D",
            }}
          />
        </span>
      ))}
    </>
  );

  return (
    <div
      className="flex overflow-hidden"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div
        className={`flex w-max whitespace-nowrap will-change-transform ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        } ${className}`}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        <span className="pr-4 md:pr-8">{renderStrip()}</span>
        <span className="pr-4 md:pr-8">{renderStrip()}</span>
      </div>
    </div>
  );
}

interface MarqueeProps {
  variant?: "background" | "section";
}

export default function Marquee({ variant = "section" }: MarqueeProps) {
  const line1Segments: MarqueeSegment[] = [
    { text: "SAFFRON", filled: true },
    { text: "PISTACHIO" },
    { text: "ALPHONSO", filled: true },
    { text: "MANGO" },
    { text: "DARK" },
    { text: "CHOCOLATE", filled: true },
    { text: "MALAI" },
    { text: "ROSE", filled: true },
  ];

  const line2Segments: MarqueeSegment[] = [
    { text: "HANDCRAFTED" },
    { text: "SMALL BATCH", filled: true },
    { text: "REAL INGREDIENTS" },
    { text: "NO SHORTCUTS", filled: true },
  ];

  const line3Segments: MarqueeSegment[] = [
    { text: "KULFFI", filled: true },
    { text: "ICE CREAM" },
    { text: "MANGO" },
    { text: "PISTACHIO", filled: true },
    { text: "SAFFRON" },
    { text: "CARDAMOM", filled: true },
  ];

  if (variant === "background") {
    return (
      <div className="absolute inset-0 z-0 flex flex-col justify-center overflow-hidden bg-[#F5E6D3]">
        <MarqueeRow
          segments={line1Segments}
          direction="left"
          speed={12}
          strokeWidth={2}
          rotation={-6}
        />
        <div className="mt-1 md:mt-2" />
        <MarqueeRow
          segments={line2Segments}
          direction="right"
          speed={6}
          strokeWidth={2}
          rotation={-6}
        />
        <div className="mt-1 md:mt-2" />
        <MarqueeRow
          segments={line3Segments}
          direction="left"
          speed={12}
          strokeWidth={2}
          rotation={-6}
        />
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#F5E6D3] py-6 md:py-10">
      <MarqueeRow
        segments={line1Segments}
        direction="left"
        speed={10}
        strokeWidth={2}
        rotation={-6}
      />
      <div className="mt-1 md:mt-2" />
      <MarqueeRow
        segments={line2Segments}
        direction="right"
        speed={5}
        strokeWidth={2}
        rotation={-6}
      />
      <div className="mt-1 md:mt-2" />
      <MarqueeRow
        segments={line3Segments}
        direction="left"
        speed={10}
        strokeWidth={2}
        rotation={-6}
      />
    </section>
  );
}
