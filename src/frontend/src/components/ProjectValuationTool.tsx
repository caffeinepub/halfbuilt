import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────
interface ProjectValuationToolProps {
  onOpenSubmission: () => void;
}

// ── Score color config ─────────────────────────────────────────────
function getScoreConfig(score: number): {
  color: string;
  glowColor: string;
  label: string;
  trackColor: string;
} {
  if (score >= 80)
    return {
      color: "oklch(0.78 0.22 155)",
      glowColor: "oklch(0.78 0.22 155 / 0.7)",
      label: "Exceptional",
      trackColor: "oklch(0.78 0.22 155 / 0.15)",
    };
  if (score >= 60)
    return {
      color: "oklch(0.78 0.16 200)",
      glowColor: "oklch(0.78 0.16 200 / 0.7)",
      label: "Strong",
      trackColor: "oklch(0.78 0.16 200 / 0.15)",
    };
  if (score >= 40)
    return {
      color: "oklch(0.85 0.18 80)",
      glowColor: "oklch(0.85 0.18 80 / 0.7)",
      label: "Moderate",
      trackColor: "oklch(0.85 0.18 80 / 0.15)",
    };
  return {
    color: "oklch(0.7 0.22 25)",
    glowColor: "oklch(0.7 0.22 25 / 0.7)",
    label: "Early Stage",
    trackColor: "oklch(0.7 0.22 25 / 0.15)",
  };
}

// ── Circular Gauge ─────────────────────────────────────────────────
function CircularGauge({ score }: { score: number }) {
  const size = 240;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const cfg = getScoreConfig(score);

  const filterId = "gauge-glow";

  return (
    <div
      data-ocid="valuation.score.panel"
      className="relative flex flex-col items-center gap-4"
    >
      {/* SVG Gauge */}
      <div
        className="relative"
        style={{
          filter: `drop-shadow(0 0 24px ${cfg.glowColor}) drop-shadow(0 0 48px ${cfg.glowColor.replace("/ 0.7", "/ 0.3")})`,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`Potential Score: ${score.toFixed(1)}%`}
        >
          <defs>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background track ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="oklch(0.2 0.015 280 / 0.6)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Score arc — rotated so 0% starts at top */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={cfg.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span
            className="font-display font-black leading-none"
            style={{
              fontSize: "3.25rem",
              color: cfg.color,
              transition: "color 0.5s ease",
              textShadow: `0 0 20px ${cfg.glowColor}`,
            }}
          >
            {score.toFixed(1)}
          </span>
          <span
            className="font-mono text-xs font-semibold uppercase tracking-widest"
            style={{ color: cfg.color, opacity: 0.7 }}
          >
            %
          </span>
        </div>
      </div>

      {/* Labels below gauge */}
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Potential Score
        </p>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
          style={{
            color: cfg.color,
            borderColor: cfg.glowColor.replace("/ 0.7", "/ 0.35"),
            background: cfg.trackColor,
            transition: "all 0.5s ease",
          }}
        >
          <TrendingUp className="h-3 w-3" />
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

// ── Slider Row ─────────────────────────────────────────────────────
interface SliderRowProps {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  ocid: string;
  accentColor: string;
}

function SliderRow({
  label,
  sublabel,
  value,
  min,
  max,
  step,
  format,
  onChange,
  ocid,
  accentColor,
}: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <label
            htmlFor={ocid}
            className="text-sm font-semibold text-foreground/90"
          >
            {label}
          </label>
          {sublabel && (
            <span className="text-[11px] font-mono text-muted-foreground/60">
              {sublabel}
            </span>
          )}
        </div>
        <span
          className="font-mono font-bold text-sm whitespace-nowrap flex-shrink-0 tabular-nums"
          style={{ color: accentColor }}
        >
          {format(value)}
        </span>
      </div>

      {/* Custom-styled range input */}
      <div className="relative h-6 flex items-center">
        <style>{`
          #${CSS.escape(ocid)} {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 6px;
            border-radius: 3px;
            outline: none;
            cursor: pointer;
            background: linear-gradient(
              to right,
              ${accentColor} 0%,
              ${accentColor} ${pct}%,
              oklch(0.2 0.015 280 / 0.7) ${pct}%,
              oklch(0.2 0.015 280 / 0.7) 100%
            );
            transition: background 0.1s ease;
          }
          #${CSS.escape(ocid)}::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${accentColor};
            border: 3px solid oklch(0.08 0.005 280);
            cursor: pointer;
            box-shadow: 0 0 10px ${accentColor.replace(")", " / 0.6)").replace("oklch(", "oklch(")};
            transition: box-shadow 0.2s ease, transform 0.1s ease;
          }
          #${CSS.escape(ocid)}::-webkit-slider-thumb:hover {
            box-shadow: 0 0 18px ${accentColor.replace(")", " / 0.8)").replace("oklch(", "oklch(")};
            transform: scale(1.15);
          }
          #${CSS.escape(ocid)}::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${accentColor};
            border: 3px solid oklch(0.08 0.005 280);
            cursor: pointer;
            box-shadow: 0 0 10px ${accentColor.replace(")", " / 0.6)").replace("oklch(", "oklch(")};
          }
          #${CSS.escape(ocid)}:focus-visible {
            outline: 2px solid ${accentColor};
            outline-offset: 3px;
            border-radius: 3px;
          }
        `}</style>
        <input
          id={ocid}
          data-ocid={ocid}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={format(value)}
        />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export function ProjectValuationTool({
  onOpenSubmission,
}: ProjectValuationToolProps) {
  const [users, setUsers] = useState(5000);
  const [commits, setCommits] = useState(200);
  const [revenue, setRevenue] = useState(500);
  const [competition, setCompetition] = useState(50);

  const score = useMemo(() => {
    const raw =
      (users / 50000) * 30 +
      (commits / 2000) * 25 +
      (revenue / 10000) * 25 +
      ((100 - competition) / 100) * 20;
    return Math.round(Math.min(100, Math.max(0, raw)) * 10) / 10;
  }, [users, commits, revenue, competition]);

  const cfg = getScoreConfig(score);

  const sliders: SliderRowProps[] = [
    {
      label: "Monthly Users",
      value: users,
      min: 0,
      max: 50000,
      step: 100,
      format: (v) => v.toLocaleString(),
      onChange: setUsers,
      ocid: "valuation.users.input",
      accentColor: "oklch(0.72 0.22 285)",
    },
    {
      label: "GitHub Commits",
      value: commits,
      min: 0,
      max: 2000,
      step: 10,
      format: (v) => v.toLocaleString(),
      onChange: setCommits,
      ocid: "valuation.commits.input",
      accentColor: "oklch(0.72 0.16 200)",
    },
    {
      label: "Revenue ($)",
      value: revenue,
      min: 0,
      max: 10000,
      step: 50,
      format: (v) => `$${v.toLocaleString()}`,
      onChange: setRevenue,
      ocid: "valuation.revenue.input",
      accentColor: "oklch(0.82 0.18 155)",
    },
    {
      label: "Niche Competition",
      sublabel: "0 = Blue Ocean · 100 = Saturated",
      value: competition,
      min: 0,
      max: 100,
      step: 1,
      format: (v) => `${v}`,
      onChange: setCompetition,
      ocid: "valuation.competition.input",
      accentColor: "oklch(0.78 0.18 50)",
    },
  ];

  return (
    <section
      id="valuation"
      data-ocid="valuation.section"
      className="py-24 px-4 sm:px-6 relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: `${cfg.glowColor.replace("/ 0.7", "/ 0.06")}` }}
      />
      <div className="absolute top-1/4 right-1/3 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-5"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300">
              <TrendingUp className="h-3 w-3" />
              Lead Magnet Calculator
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4"
          >
            What Is Your Project <span className="gradient-text">Worth?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Move the sliders. See your Potential Score calculate in real-time.
          </motion.p>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="glass-card rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent pointer-events-none" />
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-indigo-600/5 pointer-events-none rounded-2xl" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-10 lg:gap-16 items-center lg:items-start">
            {/* ── Left: Sliders ─────────────────────────────── */}
            <div className="flex-1 w-full flex flex-col gap-6">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Project Metrics
              </h3>

              {sliders.map((s) => (
                <SliderRow key={s.ocid} {...s} />
              ))}

              {/* Score breakdown hint */}
              <div className="mt-2 pt-5 border-t border-white/[0.07]">
                <p className="text-xs font-mono text-muted-foreground/60 mb-3 uppercase tracking-wider">
                  Score Weights
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "Monthly Users",
                      weight: "30%",
                      color: "oklch(0.72 0.22 285)",
                    },
                    {
                      label: "GitHub Commits",
                      weight: "25%",
                      color: "oklch(0.72 0.16 200)",
                    },
                    {
                      label: "Revenue",
                      weight: "25%",
                      color: "oklch(0.82 0.18 155)",
                    },
                    {
                      label: "Blue Ocean",
                      weight: "20%",
                      color: "oklch(0.78 0.18 50)",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: item.color }}
                      />
                      <span className="text-muted-foreground/70">
                        {item.label}
                      </span>
                      <span
                        className="ml-auto font-mono font-semibold"
                        style={{ color: item.color }}
                      >
                        {item.weight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Gauge + CTA ─────────────────────────── */}
            <div className="flex flex-col items-center gap-8 lg:pt-6">
              {/* Gauge */}
              <CircularGauge score={score} />

              {/* Insight chips */}
              <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                {score >= 70 && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                    🔥 High demand niche
                  </span>
                )}
                {commits >= 500 && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300">
                    💻 Well-developed
                  </span>
                )}
                {users >= 1000 && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300">
                    👥 Proven traction
                  </span>
                )}
                {revenue >= 500 && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-300">
                    💰 Revenue-generating
                  </span>
                )}
                {competition <= 30 && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300">
                    🌊 Blue ocean
                  </span>
                )}
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                <Button
                  data-ocid="valuation.list_now.primary_button"
                  onClick={onOpenSubmission}
                  className="w-full h-12 font-bold text-base rounded-xl transition-all duration-300"
                  style={{
                    background: "oklch(0.62 0.24 285)",
                    color: "white",
                    boxShadow: `0 0 30px ${cfg.glowColor.replace("/ 0.7", "/ 0.35")}`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      `0 0 50px ${cfg.glowColor.replace("/ 0.7", "/ 0.6")}`;
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "oklch(0.68 0.24 285)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      `0 0 30px ${cfg.glowColor.replace("/ 0.7", "/ 0.35")}`;
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "oklch(0.62 0.24 285)";
                  }}
                >
                  List Now to Lock in This Score
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-[11px] text-muted-foreground/60 text-center font-mono">
                  Your score is saved. List before it changes.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
