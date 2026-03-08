import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Flame,
  Github,
  Handshake,
  Lock,
  Package,
  Repeat2,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useEffect, useState } from "react";

// ── Animation Variants ────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

// ── Stat Card Data ────────────────────────────────────────────────
interface StatCard {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  glow: string;
}

const STATS: StatCard[] = [
  {
    label: "Projects Listed",
    value: "7",
    icon: Package,
    color: "text-violet-400",
    glow: "shadow-[0_0_20px_oklch(0.62_0.24_285/0.25)]",
  },
  {
    label: "Projects Revived",
    value: "3",
    icon: Repeat2,
    color: "text-cyan-400",
    glow: "shadow-[0_0_20px_oklch(0.7_0.2_200/0.25)]",
  },
  {
    label: "Total XP",
    value: "4,820",
    icon: Zap,
    color: "text-amber-400",
    glow: "shadow-[0_0_20px_oklch(0.82_0.18_70/0.25)]",
  },
  {
    label: "Market Rank",
    value: "#142",
    icon: Trophy,
    color: "text-emerald-400",
    glow: "shadow-[0_0_20px_oklch(0.72_0.18_160/0.25)]",
  },
];

// ── Achievement Badge Data ─────────────────────────────────────────
interface Achievement {
  label: string;
  icon: LucideIcon;
  active: boolean;
  ringColor: string;
  iconColor: string;
  bgColor: string;
  glowShadow: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    label: "First List",
    icon: Package,
    active: true,
    ringColor: "border-emerald-500/70",
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    glowShadow: "shadow-[0_0_16px_oklch(0.72_0.18_160/0.6)]",
  },
  {
    label: "Reviver",
    icon: Zap,
    active: true,
    ringColor: "border-cyan-500/70",
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    glowShadow: "shadow-[0_0_16px_oklch(0.7_0.2_200/0.6)]",
  },
  {
    label: "Streak 7",
    icon: Flame,
    active: true,
    ringColor: "border-orange-500/70",
    iconColor: "text-orange-400",
    bgColor: "bg-orange-500/10",
    glowShadow: "shadow-[0_0_16px_oklch(0.75_0.18_60/0.6)]",
  },
  {
    label: "Top 200",
    icon: Trophy,
    active: true,
    ringColor: "border-violet-500/70",
    iconColor: "text-violet-400",
    bgColor: "bg-violet-500/10",
    glowShadow: "shadow-[0_0_16px_oklch(0.62_0.24_285/0.6)]",
  },
  {
    label: "Code Pusher",
    icon: Github,
    active: true,
    ringColor: "border-blue-500/70",
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
    glowShadow: "shadow-[0_0_16px_oklch(0.62_0.2_250/0.6)]",
  },
  {
    label: "Streak 30",
    icon: Flame,
    active: false,
    ringColor: "border-white/10",
    iconColor: "text-zinc-600",
    bgColor: "bg-white/[0.03]",
    glowShadow: "",
  },
  {
    label: "Top 10",
    icon: Trophy,
    active: false,
    ringColor: "border-white/10",
    iconColor: "text-zinc-600",
    bgColor: "bg-white/[0.03]",
    glowShadow: "",
  },
  {
    label: "Diamond Seller",
    icon: Zap,
    active: false,
    ringColor: "border-white/10",
    iconColor: "text-zinc-600",
    bgColor: "bg-white/[0.03]",
    glowShadow: "",
  },
  {
    label: "Legend",
    icon: Eye,
    active: false,
    ringColor: "border-white/10",
    iconColor: "text-zinc-600",
    bgColor: "bg-white/[0.03]",
    glowShadow: "",
  },
];

// ── Activity Feed Data ─────────────────────────────────────────────
interface ActivityItem {
  icon: LucideIcon;
  text: string;
  context: string;
  time: string;
  xp?: string;
  dotColor: string;
  iconColor: string;
  iconBg: string;
}

const ACTIVITY: ActivityItem[] = [
  {
    icon: Github,
    text: "Pushed code to",
    context: "TaskForge",
    time: "2h ago",
    dotColor: "bg-blue-500",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: Package,
    text: "Listed a new project",
    context: "CodeMentor AI",
    time: "Yesterday",
    xp: "+100 XP",
    dotColor: "bg-violet-500",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
  },
  {
    icon: Zap,
    text: "Gained experience points",
    context: "Milestone bonus",
    time: "2 days ago",
    xp: "+50 XP",
    dotColor: "bg-amber-500",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
  },
  {
    icon: Eye,
    text: "Profile viewed 24 times",
    context: "this week",
    time: "3 days ago",
    dotColor: "bg-emerald-500",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  {
    icon: Handshake,
    text: "Received an offer on",
    context: "FlowSync",
    time: "5 days ago",
    dotColor: "bg-cyan-500",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
  },
  {
    icon: Flame,
    text: "Completed 7-day streak",
    context: "Build Streak",
    time: "1 week ago",
    xp: "+200 XP",
    dotColor: "bg-orange-500",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/10",
  },
  {
    icon: Repeat2,
    text: "Revived a project:",
    context: "PricePulse",
    time: "2 weeks ago",
    xp: "+500 XP",
    dotColor: "bg-teal-500",
    iconColor: "text-teal-400",
    iconBg: "bg-teal-500/10",
  },
  {
    icon: CheckCircle2,
    text: "Joined HalfBuilt",
    context: "Welcome aboard",
    time: "1 month ago",
    dotColor: "bg-violet-500",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
  },
];

// ── XP Progress Bar ───────────────────────────────────────────────
function XpProgressBar() {
  const currentXp = 4820;
  const targetXp = 6000;
  const percentage = (currentXp / targetXp) * 100;
  const remaining = targetXp - currentXp;
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setBarWidth(percentage), 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <motion.div
      data-ocid="profile.xp_progress.panel"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUp}
      className="mb-14"
    >
      <div
        className="rounded-xl p-5 backdrop-blur-md bg-white/[0.05] border border-white/[0.08]"
        style={{
          boxShadow: "0 0 20px oklch(0.82 0.18 70 / 0.2)",
        }}
      >
        {/* Top row: labels */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-sm text-amber-400 tracking-widest uppercase">
              Level 7
            </span>
            <div className="h-px w-8 bg-white/[0.1]" />
            <span className="font-mono text-sm text-muted-foreground/60 uppercase tracking-widest">
              Level 8
            </span>
          </div>
          {/* Weekly badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-300 whitespace-nowrap">
            🔥 +180 XP this week
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-full rounded-full overflow-hidden mb-2"
          style={{ height: "10px", background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${barWidth}%`,
              background:
                "linear-gradient(90deg, oklch(0.82 0.18 70), oklch(0.85 0.2 55))",
              boxShadow: "0 0 8px oklch(0.82 0.18 70 / 0.5)",
            }}
          />
        </div>

        {/* Sub-label */}
        <p className="font-mono text-xs text-muted-foreground/50">
          {currentXp.toLocaleString()} / {targetXp.toLocaleString()} XP ·{" "}
          <span className="text-amber-400/60">
            {remaining.toLocaleString()} XP to next level
          </span>
        </p>
      </div>
    </motion.div>
  );
}

// ── Props ─────────────────────────────────────────────────────────
interface BuilderProfilePageProps {
  onBack: () => void;
}

// ── Component ─────────────────────────────────────────────────────
export function BuilderProfilePage({ onBack }: BuilderProfilePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-foreground relative overflow-x-hidden"
    >
      {/* ── Dot-grid texture ──────────────────────────────── */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 w-full h-full z-0 opacity-[0.02]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="profile-dotgrid"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.8" fill="oklch(0.62 0.24 285)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#profile-dotgrid)" />
      </svg>

      {/* ── Ambient glow orbs ─────────────────────────────── */}
      <div className="pointer-events-none fixed top-0 left-1/4 w-[500px] h-[400px] rounded-full blur-[160px] z-0 opacity-30 bg-violet-600/10" />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[180px] z-0 opacity-20 bg-cyan-500/10" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* ── Back nav ─────────────────────────────────────── */}
        <div className="pt-6 pb-2">
          <button
            type="button"
            data-ocid="profile.back.button"
            onClick={onBack}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-violet-400 transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform duration-150" />
            Back to Marketplace
          </button>
        </div>

        {/* ── Header Section ───────────────────────────────── */}
        <motion.section
          data-ocid="profile.header.section"
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="pt-10 pb-12"
        >
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center sm:items-end gap-6"
          >
            {/* Avatar + streak badge */}
            <div className="relative flex-shrink-0">
              {/* Ambient violet glow behind avatar */}
              <div className="absolute inset-0 rounded-full blur-2xl bg-violet-600/30 scale-150 pointer-events-none" />

              {/* Avatar circle */}
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center font-display font-black text-3xl text-white border-2 border-violet-500/40"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.22 285 / 0.9), oklch(0.45 0.2 295 / 0.9))",
                  boxShadow:
                    "0 0 0 3px oklch(0.62 0.24 285 / 0.15), 0 0 30px oklch(0.62 0.24 285 / 0.2)",
                }}
              >
                AK
              </div>

              {/* Streak badge — bottom-right */}
              <div
                data-ocid="profile.streak.badge"
                className="absolute -bottom-2 -right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-amber-200 whitespace-nowrap"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.22 0.04 60), oklch(0.18 0.04 55))",
                  border: "1px solid oklch(0.75 0.18 60 / 0.5)",
                  boxShadow:
                    "0 0 16px oklch(0.75 0.18 60 / 0.8), 0 0 32px oklch(0.75 0.18 60 / 0.3), inset 0 1px 0 oklch(1 0 0 / 0.1)",
                }}
              >
                🔥 12 Day Build Streak
              </div>
            </div>

            {/* Name + tagline */}
            <div className="text-center sm:text-left">
              <h1 className="font-display font-black text-4xl sm:text-5xl text-foreground tracking-tight leading-none mb-2">
                0xAlex
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                Full-stack builder &amp; side-project addict
              </p>
              {/* Member badge */}
              <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300">
                  🏅 Founder Badge
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                  ✓ Verified Builder
                </span>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ── Stats Row ────────────────────────────────────── */}
        <motion.section
          data-ocid="profile.stats.section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="mb-14"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  data-ocid={`profile.stats.card.${i + 1}`}
                  className={`relative rounded-xl p-5 flex flex-col gap-3 group cursor-default
                    backdrop-blur-md bg-white/[0.05] border border-white/[0.08]
                    hover:bg-white/[0.08] hover:border-white/[0.14] transition-all duration-300
                    ${stat.glow}`}
                >
                  {/* Icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.color} bg-white/[0.06]`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  {/* Value */}
                  <div
                    className={`font-mono font-black text-3xl leading-none ${stat.color}`}
                  >
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    {stat.label}
                  </div>

                  {/* Subtle glow line at bottom */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "radial-gradient(ellipse, currentColor, transparent)",
                    }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── XP Level-Up Progress Bar ─────────────────────── */}
        <XpProgressBar />

        {/* ── Achievements Section ──────────────────────────── */}
        <motion.section
          data-ocid="profile.achievements.section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
          className="mb-14"
        >
          {/* Section heading */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 mb-6"
          >
            <h2 className="font-display font-black text-xl text-foreground">
              Achievements
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              5 / {ACHIEVEMENTS.length} unlocked
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </motion.div>

          {/* Horizontal scrollable badges */}
          <motion.div
            variants={fadeUp}
            className="overflow-x-auto pb-2 -mx-1 px-1"
          >
            <div className="flex gap-5 min-w-max">
              {ACHIEVEMENTS.map((badge, i) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.label}
                    data-ocid={`profile.achievement.badge.${i + 1}`}
                    className="flex flex-col items-center gap-2.5 flex-shrink-0"
                  >
                    {/* Circle badge */}
                    <div
                      className={`relative w-[72px] h-[72px] rounded-full border-2 flex items-center justify-center
                        ${badge.bgColor} ${badge.ringColor}
                        ${badge.active ? badge.glowShadow : "opacity-35 grayscale-[60%]"}
                        transition-all duration-300
                      `}
                    >
                      <Icon
                        className={`h-7 w-7 ${badge.iconColor}`}
                        strokeWidth={1.5}
                      />

                      {/* Lock overlay for inactive badges */}
                      {!badge.active && (
                        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40">
                          <Lock className="h-4 w-4 text-zinc-500" />
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`text-[10px] font-mono text-center leading-tight max-w-[72px]
                        ${badge.active ? "text-foreground/80" : "text-muted-foreground/40"}
                      `}
                    >
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.section>

        {/* ── Activity Feed ──────────────────────────────────── */}
        <motion.section
          data-ocid="profile.activity.section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          {/* Section heading */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 mb-8"
          >
            <h2 className="font-display font-black text-xl text-foreground">
              Recent Activity
            </h2>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-violet-500/30 via-white/[0.06] to-transparent pointer-events-none" />

            <div className="flex flex-col gap-0">
              {ACTIVITY.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={`${item.text}-${i}`}
                    variants={fadeUp}
                    data-ocid={`profile.activity.item.${i + 1}`}
                    className="relative flex gap-4 group py-4"
                  >
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 relative z-10 mt-1">
                      <div
                        className={`w-[10px] h-[10px] rounded-full mt-1 ring-2 ring-background ${item.dotColor}`}
                        style={{
                          boxShadow: "0 0 8px currentColor",
                        }}
                      />
                    </div>

                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg} ${item.iconColor} mt-0.5`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm text-foreground/80 font-medium">
                          {item.text}
                        </span>
                        <span className="text-sm text-foreground font-semibold">
                          {item.context}
                        </span>
                        {item.xp && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                            {item.xp}
                          </span>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-xs font-mono text-muted-foreground/60 flex-shrink-0">
                        {item.time}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
