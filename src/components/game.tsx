import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { HatId } from "@/lib/grading";

type Tone = "primary" | "accent" | "gold" | "plain";
const tones: Record<Tone, string> = {
  primary: "bg-primary text-primary-foreground [--chunk:var(--primary-deep)]",
  accent: "bg-accent text-accent-foreground [--chunk:var(--accent-deep)]",
  gold: "bg-gold text-gold-foreground [--chunk:var(--gold-deep)]",
  plain: "bg-card text-foreground border-2 border-border [--chunk:var(--border)]",
};

export function ChunkyButton({
  tone = "primary",
  className,
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; children: ReactNode }) {
  return (
    <button
      {...p}
      className={cn(
        "chunky font-display inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 py-3 text-lg font-bold uppercase tracking-wide disabled:opacity-50",
        tones[tone],
        className,
      )}
    >
      {children}
    </button>
  );
}

export type Mood = "neutral" | "thinking" | "pleased" | "disappointed" | "devastated" | "delighted";

export function Professor({ mood, size = 200 }: { mood: Mood; size?: number }) {
  const brow = {
    neutral: "M58 70 L88 68 M112 68 L142 70",
    thinking: "M58 64 L88 70 M112 66 L142 60",
    pleased: "M58 66 Q73 60 88 66 M112 66 Q127 60 142 66",
    disappointed: "M58 72 L88 64 M112 64 L142 72",
    devastated: "M60 76 L88 62 M112 62 L140 76",
    delighted: "M58 60 Q73 50 88 60 M112 60 Q127 50 142 60",
  }[mood];
  const mouth = {
    neutral: "M82 142 L118 142",
    thinking: "M84 144 Q100 138 116 146",
    pleased: "M80 138 Q100 156 120 138",
    disappointed: "M82 148 Q100 138 118 148",
    devastated: "M80 152 Q100 132 120 152",
    delighted: "M76 134 Q100 168 124 134 Z",
  }[mood];
  const eyesClosed = mood === "delighted";
  return (
    <motion.svg
      key={mood}
      initial={{ scale: 0.9, rotate: -3 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 12 }}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-label={`Professor looking ${mood}`}
      className="drop-shadow-lg"
    >
      {/* hair tufts */}
      <path d="M30 90 Q20 60 45 55 Q40 80 50 95 Z M170 90 Q180 60 155 55 Q160 80 150 95 Z" className="fill-muted-foreground" />
      <ellipse cx="100" cy="105" rx="68" ry="78" className="fill-skin" />
      <ellipse cx="34" cy="110" rx="10" ry="16" className="fill-skin-shade" />
      <ellipse cx="166" cy="110" rx="10" ry="16" className="fill-skin-shade" />
      <path d="M60 40 Q100 20 140 40 Q120 32 100 34 Q80 32 60 40" className="fill-muted-foreground" />
      <path d={brow} className="stroke-foreground" strokeWidth="7" strokeLinecap="round" fill="none" />
      {eyesClosed ? (
        <path d="M62 88 Q73 80 84 88 M116 88 Q127 80 138 88" className="stroke-foreground" strokeWidth="5" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="73" cy="88" r="16" className="fill-card stroke-foreground" strokeWidth="3" />
          <circle cx="127" cy="88" r="16" className="fill-card stroke-foreground" strokeWidth="3" />
          <circle cx={mood === "thinking" ? 78 : 73} cy={mood === "thinking" ? 83 : 90} r="6" className="fill-foreground" />
          <circle cx={mood === "thinking" ? 132 : 127} cy={mood === "thinking" ? 83 : 90} r="6" className="fill-foreground" />
          <path d="M89 88 L111 88" className="stroke-foreground" strokeWidth="3" />
        </>
      )}
      {mood === "devastated" && <path d="M66 106 Q62 120 66 126 Q70 120 66 106" className="fill-primary opacity-60" />}
      <path d="M96 96 Q90 118 100 122 Q108 120 104 112" className="fill-skin-shade" />
      {/* big moustache */}
      <path d="M100 126 Q80 116 58 132 Q76 128 84 136 Q94 132 100 128 Q106 132 116 136 Q124 128 142 132 Q120 116 100 126 Z" className="fill-muted-foreground" />
      <path d={mouth} className={mood === "delighted" ? "fill-accent-deep stroke-foreground" : "stroke-foreground"} strokeWidth="5" strokeLinecap="round" fill={mood === "delighted" ? undefined : "none"} />
      {/* bow tie */}
      <path d="M100 186 L76 174 L76 198 Z M100 186 L124 174 L124 198 Z" className="fill-accent" />
      <circle cx="100" cy="186" r="6" className="fill-accent-deep" />
    </motion.svg>
  );
}

export function Hat({ id }: { id: HatId }) {
  switch (id) {
    case "cap":
      return (
        <g>
          <path d="M20 30 L60 14 L100 30 L60 46 Z" className="fill-foreground" />
          <path d="M38 36 L38 50 Q60 60 82 50 L82 36" className="fill-foreground" />
          <path d="M92 32 L94 54" className="stroke-gold" strokeWidth="3" />
          <circle cx="94" cy="56" r="4" className="fill-gold" />
        </g>
      );
    case "chef":
      return (
        <g>
          <path d="M36 50 Q20 40 30 22 Q38 8 52 16 Q60 2 72 14 Q88 6 94 24 Q102 40 84 50 Z" className="fill-card stroke-border" strokeWidth="3" />
          <rect x="36" y="44" width="48" height="12" rx="3" className="fill-card stroke-border" strokeWidth="3" />
        </g>
      );
    case "crown":
      return (
        <g>
          <path d="M30 54 L26 20 L44 36 L60 12 L76 36 L94 20 L90 54 Z" className="fill-gold stroke-gold-deep" strokeWidth="3" />
          <circle cx="60" cy="42" r="5" className="fill-accent" />
        </g>
      );
    case "laurel":
      return (
        <g className="fill-primary stroke-primary-deep" strokeWidth="1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <ellipse cx={22 + i * 8} cy={58 - i * 8} rx="8" ry="4" transform={`rotate(-50 ${22 + i * 8} ${58 - i * 8})`} />
              <ellipse cx={98 - i * 8} cy={58 - i * 8} rx="8" ry="4" transform={`rotate(50 ${98 - i * 8} ${58 - i * 8})`} />
            </g>
          ))}
        </g>
      );
  }
}

export function Avatar({ hat, size = 56 }: { hat: HatId | null; size?: number }) {
  return (
    <svg viewBox="0 0 120 140" width={size} height={size * (140 / 120)} aria-label="Your avatar">
      <circle cx="60" cy="84" r="44" className="fill-skin" />
      <path d="M18 76 Q24 38 60 38 Q96 38 102 76 Q86 56 60 58 Q34 56 18 76" className="fill-accent-deep" />
      <circle cx="44" cy="86" r="5" className="fill-foreground" />
      <circle cx="76" cy="86" r="5" className="fill-foreground" />
      <circle cx="36" cy="100" r="6" className="fill-accent opacity-40" />
      <circle cx="84" cy="100" r="6" className="fill-accent opacity-40" />
      <path d="M48 106 Q60 116 72 106" className="stroke-foreground" strokeWidth="4" fill="none" strokeLinecap="round" />
      {hat && (
        <motion.g key={hat} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
          <Hat id={hat} />
        </motion.g>
      )}
    </svg>
  );
}

export function moodFor(grade: number | null | undefined, lode = false): Mood {
  if (lode) return "delighted";
  if (grade === undefined) return "neutral";
  if (grade === null) return "devastated";
  if (grade >= 28) return "delighted";
  if (grade >= 24) return "pleased";
  if (grade >= 21) return "neutral";
  return "disappointed";
}
