import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Star,
  Users,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import type { Project } from "../hooks/useQueries";

// ── CoD color helper (mirrors App.tsx) ────────────────────────────
function getCodColor(cod: string): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  const lower = cod.toLowerCase();
  if (lower.includes("burn") || lower.includes("time"))
    return {
      text: "text-orange-300",
      bg: "bg-orange-500/15",
      border: "border-orange-400/40",
      glow: "shadow-[0_0_40px_oklch(0.75_0.18_55/0.3)]",
    };
  if (
    lower.includes("fund") ||
    lower.includes("money") ||
    lower.includes("budget")
  )
    return {
      text: "text-red-300",
      bg: "bg-red-500/15",
      border: "border-red-400/40",
      glow: "shadow-[0_0_40px_oklch(0.65_0.22_27/0.35)]",
    };
  if (lower.includes("scope") || lower.includes("complex"))
    return {
      text: "text-yellow-300",
      bg: "bg-yellow-500/15",
      border: "border-yellow-400/40",
      glow: "shadow-[0_0_40px_oklch(0.85_0.2_95/0.3)]",
    };
  if (lower.includes("pivot") || lower.includes("interest"))
    return {
      text: "text-sky-300",
      bg: "bg-sky-500/15",
      border: "border-sky-400/40",
      glow: "shadow-[0_0_40px_oklch(0.7_0.18_220/0.3)]",
    };
  if (lower.includes("tech") || lower.includes("stack"))
    return {
      text: "text-emerald-300",
      bg: "bg-emerald-500/15",
      border: "border-emerald-400/40",
      glow: "shadow-[0_0_40px_oklch(0.72_0.18_160/0.3)]",
    };
  if (lower.includes("market") || lower.includes("fatigue"))
    return {
      text: "text-pink-300",
      bg: "bg-pink-500/15",
      border: "border-pink-400/40",
      glow: "shadow-[0_0_40px_oklch(0.72_0.22_340/0.35)]",
    };
  return {
    text: "text-violet-300",
    bg: "bg-violet-500/15",
    border: "border-violet-400/40",
    glow: "shadow-[0_0_40px_oklch(0.62_0.24_285/0.3)]",
  };
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-300";
  if (score >= 6) return "text-violet-300";
  if (score >= 4) return "text-yellow-300";
  return "text-red-300";
}

function getScoreBarColor(score: number): string {
  if (score >= 8) return "bg-emerald-400";
  if (score >= 6) return "bg-violet-400";
  if (score >= 4) return "bg-yellow-400";
  return "bg-red-400";
}

// ── Tech Stack pill colors ─────────────────────────────────────────
const TECH_COLORS: Record<
  string,
  { dot: string; text: string; bg: string; border: string }
> = {
  react: {
    dot: "bg-cyan-400",
    text: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
  },
  flask: {
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  postgresql: {
    dot: "bg-blue-400",
    text: "text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  redis: {
    dot: "bg-red-400",
    text: "text-red-300",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  typescript: {
    dot: "bg-blue-400",
    text: "text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  crdt: {
    dot: "bg-violet-400",
    text: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
  },
};

function getTechColor(tag: string) {
  const lower = tag.toLowerCase();
  return (
    TECH_COLORS[lower] ?? {
      dot: "bg-zinc-400",
      text: "text-zinc-300",
      bg: "bg-zinc-500/10",
      border: "border-zinc-500/30",
    }
  );
}

// ── Demo static data for FlowSync ─────────────────────────────────
const DEMO_STATS = {
  totalUsers: "2,847",
  techStack: ["React", "Flask", "PostgreSQL", "Redis"],
  githubStars: "1,203",
  repoAge: "2 yrs 4 mo",
};

// ── Divider ───────────────────────────────────────────────────────
function CyanDivider() {
  return (
    <div
      className="w-full h-px"
      style={{ background: "oklch(0.7 0.15 195 / 0.15)" }}
    />
  );
}

// ── Page entrance variants ────────────────────────────────────────
const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const fadeSlide: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

// ── Props ─────────────────────────────────────────────────────────
interface ProjectAutopsyPageProps {
  project: Project;
  onBack: () => void;
}

// ── Component ────────────────────────────────────────────────────
export function ProjectAutopsyPage({
  project,
  onBack,
}: ProjectAutopsyPageProps) {
  const cod = getCodColor(project.causeOfDeath);
  const scoreColor = getScoreColor(project.potentialScore);
  const scoreBarColor = getScoreBarColor(project.potentialScore);
  const caseNum = `HB-${String(Number(project.id)).padStart(3, "0")}`;

  return (
    <motion.div
      data-ocid="autopsy.section"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background text-foreground relative overflow-x-hidden"
    >
      {/* ── Dot-grid scanline texture ─────────────────────────── */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 w-full h-full z-0 opacity-[0.025]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dotgrid"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.8" fill="oklch(0.7 0.15 195)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>

      {/* ── Ambient glow ──────────────────────────────────────── */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[600px] h-[400px] rounded-full blur-[160px] z-0 opacity-40"
        style={{ background: "oklch(0.55 0.18 195 / 0.06)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Medical report header bar ──────────────────────── */}
        <header
          className="sticky top-0 z-30 py-4 flex items-center justify-between"
          style={{
            borderBottom: "1px solid oklch(0.7 0.15 195 / 0.2)",
            background: "oklch(0.07 0.005 280 / 0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <span className="font-mono text-xs sm:text-sm tracking-widest uppercase text-cyan-400/80 select-none">
            <span className="text-cyan-400/50">{"// "}</span>
            PATIENT FILE — CASE #{caseNum}
          </span>
          <button
            type="button"
            data-ocid="autopsy.back_button"
            onClick={onBack}
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-cyan-400 transition-colors duration-150 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" />
            Back to Graveyard
          </button>
        </header>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="pt-10 pb-20"
        >
          {/* ── Project title block ────────────────────────── */}
          <motion.div variants={fadeSlide} className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-tight leading-none mb-3">
                  {project.name}
                </h1>
                <Badge
                  variant="outline"
                  className="font-mono text-xs uppercase tracking-widest border-white/20 text-muted-foreground"
                >
                  {project.category}
                </Badge>
              </div>

              {/* DECEASED stamp */}
              <div
                className="self-start flex-shrink-0 px-4 py-2 rounded font-mono font-black text-sm tracking-[0.25em] uppercase select-none"
                style={{
                  border: "2px solid oklch(0.65 0.22 27 / 0.7)",
                  color: "oklch(0.65 0.22 27 / 0.85)",
                  background: "oklch(0.65 0.22 27 / 0.06)",
                  transform: "rotate(-2deg)",
                  boxShadow: "0 0 20px oklch(0.65 0.22 27 / 0.15)",
                }}
              >
                ✝ DECEASED
              </div>
            </div>
          </motion.div>

          {/* ── Cause of Death — large badge ──────────────── */}
          <motion.div variants={fadeSlide} className="mb-12">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.3em] mb-3"
              style={{ color: "oklch(0.7 0.15 195 / 0.6)" }}
            >
              Cause of Death
            </p>
            <div
              className={`inline-flex items-center gap-4 px-8 py-5 rounded-2xl border-2 ${cod.bg} ${cod.border} ${cod.glow}`}
            >
              <span className="text-4xl select-none" aria-hidden="true">
                💀
              </span>
              <span
                className={`font-mono font-black text-3xl sm:text-4xl tracking-tight ${cod.text}`}
              >
                {project.causeOfDeath}
              </span>
            </div>
          </motion.div>

          {/* ── Thin horizontal divider ───────────────────── */}
          <motion.div variants={fadeSlide} className="mb-10">
            <div
              className="w-full h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.7 0.15 195 / 0.3) 20%, oklch(0.7 0.15 195 / 0.3) 80%, transparent)",
              }}
            />
          </motion.div>

          {/* ── Two-column grid ───────────────────────────── */}
          <motion.div
            variants={fadeSlide}
            className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-8"
          >
            {/* ─── LEFT: The Story ──────────────────────── */}
            <div
              data-ocid="autopsy.story.panel"
              className="flex flex-col gap-3"
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "oklch(0.7 0.15 195 / 0.7)" }}
              >
                <span style={{ color: "oklch(0.7 0.15 195 / 0.4)" }}>
                  {"// "}
                </span>
                The Story
              </p>

              <div
                className="rounded-xl p-7 flex-1"
                style={{
                  border: "1px solid oklch(0.7 0.15 195 / 0.2)",
                  background: "oklch(0.07 0.008 280 / 0.6)",
                }}
              >
                <div className="font-mono text-sm leading-[1.9] text-foreground/75 space-y-5">
                  <p>
                    It started the way they all do: with a{" "}
                    <em className="not-italic text-foreground/90 font-semibold">
                      "what if?"
                    </em>{" "}
                    sitting in a Notion doc at 2am. I'd been using Notion for
                    years — loved it, hated it, rebuilt my workspace from
                    scratch five times. The deeply personal frustration of
                    wanting bidirectional links that actually worked, block
                    references that didn't lag, a query language that didn't
                    feel like a workaround. I figured I could build it in a
                    weekend. That was 18 months ago.
                  </p>
                  <p>
                    The first three months were electric. I built a custom CRDT
                    sync layer from scratch, obsessively reading the Yjs source
                    code and the Automerge paper. The editor felt{" "}
                    <em className="not-italic text-foreground/90 font-semibold">
                      alive
                    </em>
                    . Two browser tabs, same document, zero conflicts. I posted
                    a 30-second screen recording to Twitter and somehow it got
                    4k views overnight. The DMs rolled in. I set up a waitlist
                    with a Google Form.
                  </p>
                  <p>
                    By month six I had a working alpha and 200 beta users. They
                    were generous with their time and genuinely excited.
                    Transcripts from user interviews filled four Notion pages
                    (the irony was not lost on me). But the feedback was all
                    over the map: some wanted daily notes, some wanted a Kanban
                    view, one person asked for iOS sync. I kept saying{" "}
                    <em className="not-italic text-foreground/90 font-semibold">
                      "coming soon"
                    </em>
                    .
                  </p>
                  <p>
                    Month nine: I rewrote the storage layer. Once. Then again.
                    The perfectionism crept in like damp into an old house.
                    Every time I was close to shipping the public beta, I'd
                    discover something that felt broken. Not critical bugs —
                    philosophical ones. Should blocks be immutable? Should the
                    graph be append-only? I read more papers. I refactored more
                    code. The beta users started going quiet.
                  </p>
                  <p>
                    By month fourteen my full-time job had gotten demanding, my
                    second kid arrived, and I was committing to the repo at 11pm
                    with the energy of a wet newspaper. The GitHub streak
                    stopped mattering. I moved the launch date three times in my
                    private Notion doc — the doc I used instead of the product I
                    was building.
                  </p>
                  <p>
                    The code isn't bad. The CRDT layer is actually really good.
                    The query engine handles nested block references in ways I'm
                    genuinely proud of. The React frontend has some of the
                    cleanest component architecture I've ever shipped. But
                    FlowSync never crossed the gap between{" "}
                    <em className="not-italic text-foreground/90 font-semibold">
                      impressive demo
                    </em>{" "}
                    and{" "}
                    <em className="not-italic text-foreground/90 font-semibold">
                      shippable product
                    </em>
                    .
                  </p>
                  <p>
                    I'm listing it here because I think someone with a different
                    set of constraints — more time, a co-founder, a specific
                    niche they want to win — could take it somewhere real. The
                    infrastructure is there. The hard engineering problems are
                    solved. What it needs is a builder who can resist the siren
                    call of "one more refactor" and just ship.
                  </p>
                  <p
                    className="text-foreground/50 text-xs border-t pt-4"
                    style={{ borderColor: "oklch(0.7 0.15 195 / 0.15)" }}
                  >
                    If that's you, I'll give you a 1-hour walkthrough of the
                    codebase. The beta users are still on the mailing list. Some
                    of them wrote me last month asking if anything changed.
                    That's the part that stings.
                  </p>
                </div>

                {/* Word count footnote */}
                <p
                  className="mt-5 font-mono text-[10px] tracking-wider"
                  style={{ color: "oklch(0.7 0.15 195 / 0.35)" }}
                >
                  ~500 words · Last updated by founder
                </p>
              </div>
            </div>

            {/* ─── RIGHT: Vital Signs ───────────────────── */}
            <div className="flex flex-col gap-5">
              {/* Vital Signs Card */}
              <div
                data-ocid="autopsy.vital_signs.panel"
                className="rounded-xl overflow-hidden"
                style={{
                  border: "1px solid oklch(0.7 0.15 195 / 0.25)",
                  background: "oklch(0.07 0.008 195 / 0.04)",
                }}
              >
                {/* Card header */}
                <div
                  className="px-6 py-4 flex items-center gap-2.5"
                  style={{
                    borderBottom: "1px solid oklch(0.7 0.15 195 / 0.2)",
                    background: "oklch(0.07 0.008 195 / 0.08)",
                  }}
                >
                  <Activity
                    className="h-4 w-4"
                    style={{ color: "oklch(0.7 0.15 195 / 0.9)" }}
                  />
                  <span
                    className="font-mono text-xs uppercase tracking-[0.25em] font-semibold"
                    style={{ color: "oklch(0.7 0.15 195 / 0.9)" }}
                  >
                    Vital Signs
                  </span>
                </div>

                <div className="px-6 py-5 flex flex-col gap-0">
                  {/* ── Total Users ── */}
                  <div className="py-4">
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
                      style={{ color: "oklch(0.7 0.15 195 / 0.5)" }}
                    >
                      Total Users
                    </p>
                    <div className="flex items-center gap-2.5">
                      <Users
                        className="h-4 w-4 text-foreground/40 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                      <span className="font-mono font-bold text-2xl text-foreground">
                        {DEMO_STATS.totalUsers}
                      </span>
                    </div>
                  </div>

                  <CyanDivider />

                  {/* ── Tech Stack ── */}
                  <div className="py-4">
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.25em] mb-3"
                      style={{ color: "oklch(0.7 0.15 195 / 0.5)" }}
                    >
                      Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DEMO_STATS.techStack.map((tech) => {
                        const c = getTechColor(tech);
                        return (
                          <span
                            key={tech}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${c.text} ${c.bg} ${c.border}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`}
                            />
                            {tech}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <CyanDivider />

                  {/* ── GitHub Stars ── */}
                  <div className="py-4">
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
                      style={{ color: "oklch(0.7 0.15 195 / 0.5)" }}
                    >
                      GitHub Stars
                    </p>
                    <div className="flex items-center gap-2.5">
                      <Star
                        className="h-4 w-4 text-yellow-400/70 flex-shrink-0"
                        strokeWidth={1.5}
                        fill="currentColor"
                      />
                      <span className="font-mono font-bold text-2xl text-foreground">
                        {DEMO_STATS.githubStars}
                      </span>
                      <span className="font-mono text-sm text-yellow-400/60">
                        ★
                      </span>
                    </div>
                  </div>

                  <CyanDivider />

                  {/* ── Repo Age ── */}
                  <div className="py-4">
                    <p
                      className="font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
                      style={{ color: "oklch(0.7 0.15 195 / 0.5)" }}
                    >
                      Age of Repo
                    </p>
                    <div className="flex items-center gap-2.5">
                      <Calendar
                        className="h-4 w-4 text-foreground/40 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                      <span className="font-mono font-bold text-2xl text-foreground">
                        {DEMO_STATS.repoAge}
                      </span>
                    </div>
                  </div>

                  <CyanDivider />

                  {/* ── Potential Score ── */}
                  <div className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <p
                        className="font-mono text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "oklch(0.7 0.15 195 / 0.5)" }}
                      >
                        Potential Score
                      </p>
                      <span
                        className={`font-mono font-black text-lg ${scoreColor}`}
                      >
                        {project.potentialScore.toFixed(1)}
                        <span className="text-foreground/30 text-sm font-normal">
                          /10
                        </span>
                      </span>
                    </div>
                    <div
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{
                        background: "oklch(0.7 0.15 195 / 0.1)",
                      }}
                    >
                      <motion.div
                        className={`h-full rounded-full ${scoreBarColor}`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(project.potentialScore / 10) * 100}%`,
                        }}
                        transition={{
                          duration: 1,
                          delay: 0.5,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Prognosis block ── */}
                <div
                  className="px-6 py-4 flex items-center gap-3"
                  style={{
                    borderTop: "1px solid oklch(0.7 0.15 195 / 0.2)",
                    background: "oklch(0.62 0.18 160 / 0.05)",
                  }}
                >
                  <ClipboardList
                    className="h-4 w-4 text-emerald-400/70 flex-shrink-0"
                    strokeWidth={1.5}
                  />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/50 mb-0.5">
                      Prognosis
                    </p>
                    <p className="font-mono text-xs font-semibold text-emerald-300/90">
                      High Viability — Buyer identified in 72h avg.
                    </p>
                  </div>
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-400/60 ml-auto flex-shrink-0"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Description (small, below vital signs card) */}
              <div
                className="rounded-xl p-5"
                style={{
                  border: "1px solid oklch(0.7 0.15 195 / 0.15)",
                  background: "oklch(0.07 0.005 280 / 0.4)",
                }}
              >
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
                  style={{ color: "oklch(0.7 0.15 195 / 0.5)" }}
                >
                  Summary
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed font-mono">
                  {project.description}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Bottom CTA ────────────────────────────────── */}
          <motion.div variants={fadeSlide} className="mt-14">
            <div
              className="w-full h-px mb-10"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.7 0.15 195 / 0.25) 20%, oklch(0.7 0.15 195 / 0.25) 80%, transparent)",
              }}
            />

            <div className="flex flex-col items-center gap-4">
              <motion.button
                type="button"
                data-ocid="autopsy.revive_button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full max-w-2xl py-6 rounded-2xl font-mono font-black text-xl sm:text-2xl tracking-wide text-black transition-all duration-200 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.85 0.18 160), oklch(0.78 0.2 175))",
                  boxShadow:
                    "0 0 50px oklch(0.85 0.18 160 / 0.45), 0 0 100px oklch(0.85 0.18 160 / 0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                ⚡ Revive This Project for ${project.price.toLocaleString()}
              </motion.button>

              <p
                className="font-mono text-xs tracking-widest text-center"
                style={{ color: "oklch(0.7 0.15 195 / 0.45)" }}
              >
                Secure escrow · Code transfer in 24h · 5% platform fee
              </p>
            </div>
          </motion.div>

          {/* ── Related / browse more ──────────────────── */}
          <motion.div variants={fadeSlide} className="mt-10 text-center">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-cyan-400 transition-colors group"
            >
              <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform duration-150" />
              Browse More Dead Projects
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
