import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowBigUp,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Eye,
  Github,
  Handshake,
  Heart,
  Loader2,
  Menu,
  MessageSquare,
  Package,
  Repeat2,
  Search,
  Share2,
  Shield,
  Twitter,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BuilderProfilePage } from "./components/BuilderProfilePage";
import { ProjectAutopsyPage } from "./components/ProjectAutopsyPage";
import { ProjectValuationTool } from "./components/ProjectValuationTool";
import { ShareableProjectCard } from "./components/ShareableProjectCard";
import { TransactionStatusPage } from "./components/TransactionStatusPage";
import { useListProjects } from "./hooks/useQueries";
import type { Project } from "./hooks/useQueries";

// ── Stagger variants ───────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// ── Cause-of-Death color mapping ───────────────────────────────────
function getCodColor(cod: string): string {
  const lower = cod.toLowerCase();
  if (lower.includes("burn") || lower.includes("time"))
    return "text-orange-400 bg-orange-400/10 border-orange-400/20";
  if (
    lower.includes("fund") ||
    lower.includes("money") ||
    lower.includes("budget")
  )
    return "text-red-400 bg-red-400/10 border-red-400/20";
  if (lower.includes("scope") || lower.includes("complex"))
    return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
  if (lower.includes("pivot") || lower.includes("interest"))
    return "text-sky-400 bg-sky-400/10 border-sky-400/20";
  if (lower.includes("tech") || lower.includes("stack"))
    return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  return "text-violet-400 bg-violet-400/10 border-violet-400/20";
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-300";
  if (score >= 6) return "text-violet-300";
  if (score >= 4) return "text-yellow-300";
  return "text-red-300";
}

// ── Frontend-only augmented project type ──────────────────────────
interface AugmentedProject extends Project {
  githubLanguages?: string[];
  watchers?: number;
}

// ── Sample data (shown while backend loads or if empty) ────────────
const SAMPLE_PROJECTS: AugmentedProject[] = [
  {
    id: BigInt(1),
    name: "FlowSync",
    category: "Productivity",
    description:
      "A Notion-killer with real-time collaboration, bi-directional links, and a custom query language. 80% complete with a working editor.",
    causeOfDeath: "Burnout",
    potentialScore: 9.1,
    price: 2400,
    tags: ["react", "typescript", "crdt", "notion-alternative"],
    githubLanguages: ["TypeScript", "React", "CSS"],
    watchers: 284,
  },
  {
    id: BigInt(2),
    name: "PricePulse",
    category: "SaaS",
    description:
      "Competitor price monitoring SaaS with email digests, Slack integration, and AI-powered trend detection.",
    causeOfDeath: "Lost Funding",
    potentialScore: 8.6,
    price: 3800,
    tags: ["python", "scraping", "saas", "pricing"],
    githubLanguages: ["Python", "FastAPI", "PostgreSQL"],
    watchers: 142,
  },
  {
    id: BigInt(3),
    name: "CodeMentor AI",
    category: "Developer Tools",
    description:
      "VS Code extension that reviews your code in real-time, suggests refactors, and generates tests. Has 200 beta users still waiting.",
    causeOfDeath: "Pivot",
    potentialScore: 8.8,
    price: 1900,
    tags: ["vscode", "llm", "typescript", "ai"],
    githubLanguages: ["TypeScript", "Node.js", "WebAssembly"],
    watchers: 371,
  },
  {
    id: BigInt(4),
    name: "GigStack",
    category: "Marketplace",
    description:
      "Freelancer invoicing + client portal with automatic payment reminders, tax summaries, and integrated contracts.",
    causeOfDeath: "Scope Creep",
    potentialScore: 7.4,
    price: 1200,
    tags: ["nextjs", "stripe", "saas", "freelance"],
    githubLanguages: ["Next.js", "TypeScript", "Prisma"],
    watchers: 97,
  },
  {
    id: BigInt(5),
    name: "ChartBlocks",
    category: "Data Viz",
    description:
      "Drag-and-drop dashboard builder — connect to any API, compose charts, share embeddable dashboards. Core engine is solid.",
    causeOfDeath: "Tech Stack Issues",
    potentialScore: 7.9,
    price: 1600,
    tags: ["react", "d3", "dashboard", "embed"],
    githubLanguages: ["React", "D3.js", "GraphQL"],
    watchers: 208,
  },
  {
    id: BigInt(6),
    name: "Habitflow",
    category: "Health & Wellness",
    description:
      "Atomic habits tracker with streak science, weekly retrospectives, and peer accountability groups. Clean mobile-first UI.",
    causeOfDeath: "Lost Interest",
    potentialScore: 6.8,
    price: 850,
    tags: ["react-native", "mobile", "habits", "wellness"],
    githubLanguages: ["React Native", "Expo", "SQLite"],
    watchers: 63,
  },
];

// ── Project Submission Modal ───────────────────────────────────────
type GitHubVerifyState = "idle" | "verifying" | "verified" | "error";
type SubmitState = "idle" | "loading" | "success";

interface ProjectSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ProjectSubmissionModal({
  open,
  onOpenChange,
}: ProjectSubmissionModalProps) {
  const [projectName, setProjectName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [verifyState, setVerifyState] = useState<GitHubVerifyState>("idle");
  const [abandonmentReason, setAbandonmentReason] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [publicity, setPublicity] = useState<"graveyard" | "private">(
    "graveyard",
  );
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const verifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount or close
  useEffect(() => {
    if (!open) {
      // Reset form state when closed
      setProjectName("");
      setGithubUrl("");
      setVerifyState("idle");
      setAbandonmentReason("");
      setAskingPrice("");
      setPublicity("graveyard");
      setSubmitState("idle");
    }
    return () => {
      if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current);
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [open]);

  function handleVerify() {
    if (verifyState === "verifying") return;
    setVerifyState("verifying");
    verifyTimerRef.current = setTimeout(() => {
      const isValid =
        githubUrl.trim().startsWith("https://github.com/") &&
        githubUrl.trim().length > "https://github.com/".length;
      setVerifyState(isValid ? "verified" : "error");
    }, 1500);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitState !== "idle") return;
    setSubmitState("loading");
    submitTimerRef.current = setTimeout(() => {
      setSubmitState("success");
      closeTimerRef.current = setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    }, 1000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="submission.modal"
        className="max-w-[550px] w-full p-0 gap-0 border-[oklch(0.35_0.04_285/0.2)] bg-[oklch(0.09_0.008_280)] backdrop-blur-xl overflow-hidden rounded-2xl"
        style={{
          background: "oklch(0.09 0.008 280 / 0.97)",
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent pointer-events-none" />

        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/8 via-transparent to-indigo-600/8 pointer-events-none rounded-2xl" />

        {/* Scrollable inner */}
        <div className="relative overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <DialogHeader className="px-7 pt-7 pb-5 border-b border-white/[0.07]">
            <div className="flex items-start justify-between gap-4 pr-6">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <DialogTitle className="font-display font-black text-2xl text-foreground leading-tight">
                    List Your Project
                  </DialogTitle>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-300 whitespace-nowrap">
                    🏅 Founder Badge
                  </span>
                </div>
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  Get in front of builders ready to take your project to the
                  next level.
                </DialogDescription>
              </div>
            </div>
            {/* Custom close button */}
            <button
              type="button"
              data-ocid="submission.close_button"
              onClick={() => onOpenChange(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-violet-500/50 outline-none"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-7 py-6 flex flex-col gap-5"
          >
            {/* Project Name */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="project-name"
                className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Project Name
              </Label>
              <Input
                id="project-name"
                data-ocid="submission.project_name.input"
                type="text"
                placeholder="e.g. FlowSync"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                autoComplete="off"
                className="bg-white/[0.04] border-white/[0.1] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-violet-500/60 focus-visible:ring-1 focus-visible:ring-violet-500/30 h-11 rounded-lg text-sm transition-colors"
              />
            </div>

            {/* GitHub Repository URL */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="github-url"
                className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground"
              >
                GitHub Repository URL
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="github-url"
                    data-ocid="submission.github_url.input"
                    type="url"
                    placeholder="https://github.com/you/repo"
                    value={githubUrl}
                    onChange={(e) => {
                      setGithubUrl(e.target.value);
                      if (verifyState !== "idle") setVerifyState("idle");
                    }}
                    required
                    autoComplete="off"
                    className="bg-white/[0.04] border-white/[0.1] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-violet-500/60 focus-visible:ring-1 focus-visible:ring-violet-500/30 h-11 rounded-lg text-sm pr-3 transition-colors"
                  />
                </div>
                <Button
                  type="button"
                  data-ocid="submission.github_verify.button"
                  onClick={handleVerify}
                  disabled={!githubUrl.trim() || verifyState === "verifying"}
                  className="h-11 px-4 font-semibold text-sm rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex-shrink-0"
                  variant="outline"
                >
                  {verifyState === "verifying" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>

              {/* Verify state feedback */}
              <AnimatePresence mode="wait">
                {verifyState === "verified" && (
                  <motion.div
                    key="verified"
                    data-ocid="submission.github.success_state"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    Verified
                  </motion.div>
                )}
                {verifyState === "error" && (
                  <motion.div
                    key="error"
                    data-ocid="submission.github.error_state"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 text-red-400 text-xs font-medium"
                  >
                    <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    Not found. Make sure the URL starts with https://github.com/
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reason for Abandonment */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="abandonment-reason"
                className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Reason for Abandonment
              </Label>
              <Textarea
                id="abandonment-reason"
                data-ocid="submission.abandonment_reason.textarea"
                placeholder="What stopped you from finishing this?"
                value={abandonmentReason}
                onChange={(e) => setAbandonmentReason(e.target.value)}
                required
                rows={3}
                className="bg-white/[0.04] border-white/[0.1] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-violet-500/60 focus-visible:ring-1 focus-visible:ring-violet-500/30 rounded-lg text-sm resize-none transition-colors min-h-[88px]"
              />
            </div>

            {/* Asking Price */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="asking-price"
                className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Asking Price
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 text-sm font-mono pointer-events-none select-none">
                  $
                </span>
                <Input
                  id="asking-price"
                  data-ocid="submission.asking_price.input"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  required
                  className="bg-white/[0.04] border-white/[0.1] text-foreground placeholder:text-muted-foreground/50 focus-visible:border-violet-500/60 focus-visible:ring-1 focus-visible:ring-violet-500/30 h-11 rounded-lg text-sm pl-8 transition-colors"
                />
              </div>
            </div>

            {/* Publicity Toggle */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground">
                Listing Visibility
              </Label>
              <fieldset
                data-ocid="submission.publicity.toggle"
                className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]"
              >
                <button
                  type="button"
                  data-ocid="submission.publicity_graveyard.button"
                  onClick={() => setPublicity("graveyard")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    publicity === "graveyard"
                      ? "bg-violet-600/90 text-white shadow-[0_0_16px_oklch(0.62_0.24_285/0.3)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                  }`}
                  aria-pressed={publicity === "graveyard"}
                >
                  <span className="text-base leading-none">🪦</span>
                  List on Graveyard
                </button>
                <button
                  type="button"
                  data-ocid="submission.publicity_private.button"
                  onClick={() => setPublicity("private")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    publicity === "private"
                      ? "bg-violet-600/90 text-white shadow-[0_0_16px_oklch(0.62_0.24_285/0.3)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                  }`}
                  aria-pressed={publicity === "private"}
                >
                  <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                  Private Sale
                </button>
              </fieldset>
            </div>

            {/* Submit / Success state */}
            <div className="pt-2">
              <AnimatePresence mode="wait">
                {submitState === "success" ? (
                  <motion.div
                    key="success"
                    data-ocid="submission.submit.success_state"
                    initial={{ opacity: 0, scale: 0.96, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 px-4 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm font-medium"
                  >
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>
                      Submitted! We&rsquo;ll review your project within 48
                      hours.
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="button"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button
                      type="submit"
                      data-ocid="submission.submit_button"
                      disabled={submitState === "loading"}
                      className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-bold text-base rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_oklch(0.62_0.24_285/0.45)] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submitState === "loading" ? (
                        <span
                          data-ocid="submission.submit.loading_state"
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting…
                        </span>
                      ) : (
                        <>
                          Submit for Review
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/60 pt-1">
              <Shield className="h-3 w-3 flex-shrink-0" />
              <span>
                Manual review by the HalfBuilt team for quality assurance.
              </span>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────
function Navbar({
  onOpenSubmission,
  onNavigateProfile,
  onNavigateTransaction,
}: {
  onOpenSubmission: () => void;
  onNavigateProfile: () => void;
  onNavigateTransaction: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "Browse", href: "#projects" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "List Your Project", href: "#list" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(0.08_0.005_280/0.92)] backdrop-blur-xl border-b border-[oklch(0.35_0.04_285/0.2)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <img
            src="/assets/generated/halfbuilt-logo-transparent.dim_80x80.png"
            alt="HalfBuilt"
            className="w-7 h-7 object-contain"
          />
          <span className="font-display font-black text-lg tracking-tight text-foreground">
            Half<span className="text-violet-400">Built</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              data-ocid={`navbar.link.${i + 1}`}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            data-ocid="navbar.profile.link"
            onClick={onNavigateProfile}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5"
          >
            Profile
          </button>
          <button
            type="button"
            data-ocid="navbar.transaction.link"
            onClick={onNavigateTransaction}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5"
          >
            Track
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            data-ocid="navbar.primary_button"
            onClick={onOpenSubmission}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm px-4 py-2 rounded-md transition-all duration-200 hover:shadow-[0_0_20px_oklch(0.62_0.24_285/0.4)]"
          >
            Start Selling
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[oklch(0.35_0.04_285/0.2)] bg-[oklch(0.08_0.005_280/0.96)] backdrop-blur-xl"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  data-ocid={`navbar.link.${i + 1}`}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                data-ocid="navbar.profile.link"
                onClick={() => {
                  setMobileOpen(false);
                  onNavigateProfile();
                }}
                className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-white/5 transition-colors text-left"
              >
                Profile
              </button>
              <button
                type="button"
                data-ocid="navbar.transaction.link"
                onClick={() => {
                  setMobileOpen(false);
                  onNavigateTransaction();
                }}
                className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-white/5 transition-colors text-left"
              >
                Track
              </button>
              <Button
                data-ocid="navbar.primary_button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenSubmission();
                }}
                className="mt-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm w-full"
              >
                Start Selling
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────
function Hero({ onOpenSubmission }: { onOpenSubmission: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 noise-overlay">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/assets/generated/hero-bg.dim_1600x900.jpg"
          alt=""
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
      </div>

      {/* Grid texture */}
      <div className="absolute inset-0 grid-texture opacity-60" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/8 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300">
              <Zap className="h-3 w-3" />
              Marketplace for unfinished builders
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-8"
          >
            <span className="text-foreground">Your unfinished</span>
            <br />
            <span className="gradient-text text-glow">projects deserve</span>
            <br />
            <span className="text-foreground">a second life.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            HalfBuilt is the marketplace where developers sell their abandoned
            side projects — and savvy builders find hidden gems with real
            potential.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              asChild
              data-ocid="hero.primary_button"
              className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-base px-7 py-6 rounded-lg transition-all duration-200 hover:shadow-[0_0_30px_oklch(0.62_0.24_285/0.5)] w-full sm:w-auto"
            >
              <a href="#projects">
                Browse Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              data-ocid="hero.secondary_button"
              onClick={onOpenSubmission}
              className="border-[oklch(0.35_0.04_285/0.4)] bg-white/5 hover:bg-white/10 text-foreground font-semibold text-base px-7 py-6 rounded-lg transition-all duration-200 w-full sm:w-auto"
            >
              List Yours Free
            </Button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            {[
              { value: "1,200+", label: "Projects Listed" },
              { value: "$2.4M", label: "Total Value Sold" },
              { value: "8,400+", label: "Builders" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono font-bold text-xl text-foreground mb-0.5">
                  {stat.value}
                </div>
                <div className="text-xs">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Wall of Failure Data ──────────────────────────────────────────
interface FailurePost {
  platform: "x" | "reddit";
  handle: string;
  displayName: string;
  avatarInitials: string;
  timestamp: string;
  body: string;
  likes?: number;
  retweets?: number;
  upvotes?: number;
  comments?: number;
  subreddit?: string;
}

const FAILURE_POSTS: FailurePost[] = [
  {
    platform: "x",
    handle: "@devfounder",
    displayName: "Dev Founder",
    avatarInitials: "DF",
    timestamp: "2h",
    body: "I give up on this SaaS. 18 months of work. Deleting the repo tomorrow.",
    likes: 2847,
    retweets: 914,
  },
  {
    platform: "reddit",
    handle: "u/maker_burn",
    displayName: "maker_burn",
    avatarInitials: "MB",
    timestamp: "3 days ago",
    body: "No time to finish my Chrome Extension. Just sitting there with 847 stars.",
    upvotes: 4312,
    comments: 287,
    subreddit: "r/startups",
  },
  {
    platform: "x",
    handle: "@indie_grind",
    displayName: "Indie Grind",
    avatarInitials: "IG",
    timestamp: "5h",
    body: "3k users but 0 revenue. Not sure what I'm doing anymore.",
    likes: 6201,
    retweets: 1843,
  },
  {
    platform: "reddit",
    handle: "u/solo_builder",
    displayName: "solo_builder",
    avatarInitials: "SB",
    timestamp: "1 week ago",
    body: "Officially abandoning my productivity app. It was going to be the next Notion.",
    upvotes: 7891,
    comments: 512,
    subreddit: "r/entrepreneur",
  },
  {
    platform: "x",
    handle: "@pixelshipper",
    displayName: "Pixel Shipper",
    avatarInitials: "PS",
    timestamp: "1d",
    body: "Burned out. My indie game is 90% done and I just... can't.",
    likes: 12450,
    retweets: 3201,
  },
  {
    platform: "x",
    handle: "@saas_wreckage",
    displayName: "SaaS Wreckage",
    avatarInitials: "SW",
    timestamp: "3d",
    body: "Solo founder life: spent $4k on infra for a product nobody paid for.",
    likes: 9882,
    retweets: 2654,
  },
  {
    platform: "reddit",
    handle: "u/perpetual_wip",
    displayName: "perpetual_wip",
    avatarInitials: "PW",
    timestamp: "2 weeks ago",
    body: "Posted about my AI writing tool 6 months ago. Still not shipped.",
    upvotes: 5634,
    comments: 341,
    subreddit: "r/SideProject",
  },
  {
    platform: "x",
    handle: "@twoKids_coder",
    displayName: "Two Kids Coder",
    avatarInitials: "TK",
    timestamp: "6h",
    body: "My startup idea is great but I ran out of time between my job and two kids.",
    likes: 18203,
    retweets: 4971,
  },
  {
    platform: "reddit",
    handle: "u/waitlist_ghost",
    displayName: "waitlist_ghost",
    avatarInitials: "WG",
    timestamp: "5 days ago",
    body: "Shutting down the waitlist. 600 signups, 0 launches. I'm sorry.",
    upvotes: 9142,
    comments: 623,
    subreddit: "r/entrepreneur",
  },
  {
    platform: "x",
    handle: "@repo_graveyard",
    displayName: "Repo Graveyard",
    avatarInitials: "RG",
    timestamp: "12h",
    body: "The side project graveyard is real. I have 12 repos I'll never finish.",
    likes: 24601,
    retweets: 7834,
  },
];

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function XCard({ post, index }: { post: FailurePost; index: number }) {
  return (
    <article
      data-ocid={`wall_of_failure.item.${index + 1}`}
      className="w-72 flex-shrink-0 rounded-xl p-4 flex flex-col gap-3
        backdrop-blur-md bg-white/[0.04] border border-white/[0.08]
        opacity-60 grayscale-[30%]
        hover:opacity-75 hover:grayscale-0 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-700/60 to-indigo-800/60 border border-white/10 text-xs font-bold text-white">
          {post.avatarInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground/90 truncate">
            {post.displayName}
          </div>
          <div className="text-xs text-muted-foreground/70 truncate">
            {post.handle} · {post.timestamp}
          </div>
        </div>
        <X className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
      </div>

      {/* Body */}
      <p className="text-sm text-foreground/80 leading-relaxed">{post.body}</p>

      {/* Footer */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground/60 pt-1 border-t border-white/[0.06]">
        <span className="flex items-center gap-1">
          <Heart className="h-3 w-3" />
          {formatCount(post.likes ?? 0)}
        </span>
        <span className="flex items-center gap-1">
          <Repeat2 className="h-3 w-3" />
          {formatCount(post.retweets ?? 0)}
        </span>
      </div>
    </article>
  );
}

function RedditCard({ post, index }: { post: FailurePost; index: number }) {
  return (
    <article
      data-ocid={`wall_of_failure.item.${index + 1}`}
      className="w-72 flex-shrink-0 rounded-xl p-4 flex flex-col gap-3
        backdrop-blur-md bg-white/[0.04] border border-white/[0.08]
        opacity-60 grayscale-[30%]
        hover:opacity-75 hover:grayscale-0 transition-all duration-300"
    >
      {/* Subreddit */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold text-orange-400/80 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">
          {post.subreddit}
        </span>
        <span className="text-lg">💀</span>
      </div>

      {/* Author + time */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-orange-700/60 to-red-800/60 border border-white/10 text-[10px] font-bold text-white">
          {post.avatarInitials}
        </div>
        <div className="text-xs text-muted-foreground/70">
          {post.handle} · {post.timestamp}
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-foreground/80 leading-relaxed">{post.body}</p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground/60 pt-1 border-t border-white/[0.06]">
        <span className="flex items-center gap-1">
          <ArrowBigUp className="h-3.5 w-3.5 text-orange-400/60" />
          {formatCount(post.upvotes ?? 0)}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {formatCount(post.comments ?? 0)} comments
        </span>
      </div>
    </article>
  );
}

// ── Wall of Failure Section ───────────────────────────────────────
function WallOfFailureSection() {
  const doubled = [...FAILURE_POSTS, ...FAILURE_POSTS];

  return (
    <section
      id="wall-of-failure"
      data-ocid="wall_of_failure.section"
      className="py-24 relative overflow-hidden"
    >
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 40s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-violet-600/8 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/6 blur-[120px] pointer-events-none" />

      {/* Section heading */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
        className="text-center mb-14 px-4"
      >
        <motion.div variants={fadeUp} className="mb-5">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300">
            <span className="text-sm">🪦</span>
            Wall of Failure
          </span>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-foreground max-w-3xl mx-auto leading-tight"
        >
          The internet is full of{" "}
          <span className="gradient-text">abandoned gems.</span>
          <br />
          <span className="text-foreground/90">We find them.</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-muted-foreground text-base mt-5 max-w-lg mx-auto"
        >
          Real posts from real builders who gave up. Their loss is your
          opportunity.
        </motion.p>
      </motion.div>

      {/* Marquee strip */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="overflow-hidden">
          <div className="marquee-track flex gap-4 w-max py-2 px-4">
            {doubled.map((post, i) => {
              const originalIndex = i % FAILURE_POSTS.length;
              if (post.platform === "x") {
                return (
                  <XCard
                    key={`${post.handle}-${i}`}
                    post={post}
                    index={originalIndex}
                  />
                );
              }
              return (
                <RedditCard
                  key={`${post.handle}-${i}`}
                  post={post}
                  index={originalIndex}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom CTA nudge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center mt-12 px-4"
      >
        <p className="text-sm text-muted-foreground">
          Don&apos;t let yours end up here.{" "}
          <a
            href="#list"
            className="text-violet-400 hover:text-violet-300 transition-colors font-semibold underline underline-offset-2"
          >
            List your project free →
          </a>
        </p>
      </motion.div>
    </section>
  );
}

// ── Project Card ──────────────────────────────────────────────────
interface ProjectCardProps {
  project: AugmentedProject;
  index: number;
  onViewProject?: (project: Project) => void;
}

function ProjectCard({ project, index, onViewProject }: ProjectCardProps) {
  const scoreColor = getScoreColor(project.potentialScore);
  const codStyle = getCodColor(project.causeOfDeath);
  const [hovered, setHovered] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <motion.article
      variants={itemVariants}
      data-ocid={`projects.item.${index + 1}`}
      className="glass-card card-lift rounded-xl p-5 flex flex-col gap-4 group cursor-pointer relative overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Share icon — visible on hover */}
      <button
        type="button"
        data-ocid={`projects.card.share_button.${index + 1}`}
        onClick={(e) => {
          e.stopPropagation();
          setShareOpen(true);
        }}
        aria-label={`Share ${project.name}`}
        className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 outline-none focus-visible:opacity-100 focus-visible:ring-2"
        style={{
          background: "rgba(0,229,255,0.08)",
          border: "1px solid rgba(0,229,255,0.3)",
          color: "#00e5ff",
        }}
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-black text-lg text-foreground truncate mb-1">
            {project.name}
          </h3>
          <Badge
            variant="outline"
            className="text-xs font-mono font-medium px-2 py-0.5 border-[oklch(0.35_0.04_285/0.3)] text-muted-foreground"
          >
            {project.category}
          </Badge>
        </div>

        {/* Potential Score */}
        <div className="flex-shrink-0 score-glow rounded-lg px-3 py-2 text-center bg-violet-500/10 border border-violet-500/25">
          <div
            className={`font-mono font-black text-lg leading-none ${scoreColor}`}
          >
            {project.potentialScore.toFixed(1)}
          </div>
          <div className="text-[9px] font-mono text-muted-foreground mt-0.5 uppercase tracking-widest">
            /10
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {project.description}
      </p>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/10"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-[oklch(0.35_0.04_285/0.15)]">
        <div className="flex items-center justify-between mb-3">
          {/* Cause of Death */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              CoD:
            </span>
            <span
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${codStyle}`}
            >
              {project.causeOfDeath}
            </span>
          </div>
          {/* Price */}
          <span className="font-mono font-bold text-base text-foreground">
            ${project.price.toLocaleString()}
          </span>
        </div>

        <Button
          data-ocid={`projects.card.button.${index + 1}`}
          onClick={() => onViewProject?.(project)}
          className="w-full bg-white/8 hover:bg-violet-600/90 border border-white/10 hover:border-violet-500 text-foreground hover:text-white font-semibold text-sm transition-all duration-200 group-hover:bg-violet-600/80 group-hover:border-violet-500 group-hover:text-white"
          variant="outline"
        >
          View Project
          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>

      {/* ── Quick Peek Overlay ── */}
      <AnimatePresence>
        {hovered &&
          (project.githubLanguages || project.watchers !== undefined) && (
            <motion.div
              key="quickpeek"
              data-ocid={`projects.card.quickpeek.${index + 1}`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-black/70 border-t border-violet-500/40 px-4 py-3 flex flex-col gap-2.5 rounded-b-xl"
            >
              {/* Languages row */}
              {project.githubLanguages &&
                project.githubLanguages.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-violet-400/80 flex-shrink-0 w-20">
                      Languages
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {project.githubLanguages.map((lang) => (
                        <span
                          key={lang}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/15 border border-violet-500/25 text-violet-200"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Watchers row */}
              {project.watchers !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-violet-400/80 flex-shrink-0 w-20">
                    Watchers
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* Live pulse dot */}
                    <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                    </span>
                    <Eye className="h-3 w-3 text-emerald-400/80" />
                    <span className="font-mono text-xs font-semibold text-emerald-300">
                      {project.watchers.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/60">
                      tracking
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
      </AnimatePresence>

      {/* Shareable card dialog */}
      <ShareableProjectCard
        open={shareOpen}
        onOpenChange={setShareOpen}
        projectName={project.name}
        potentialScore={project.potentialScore}
        causeOfDeath={project.causeOfDeath}
        price={project.price}
      />
    </motion.article>
  );
}

// ── Project Card Skeleton ─────────────────────────────────────────
function ProjectCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2 bg-white/8" />
          <Skeleton className="h-5 w-1/3 bg-white/8" />
        </div>
        <Skeleton className="h-14 w-14 rounded-lg bg-white/8" />
      </div>
      <Skeleton className="h-4 w-full bg-white/8" />
      <Skeleton className="h-4 w-5/6 bg-white/8" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 bg-white/8" />
        <Skeleton className="h-5 w-16 bg-white/8" />
        <Skeleton className="h-5 w-16 bg-white/8" />
      </div>
      <div className="pt-3 border-t border-white/8">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-24 bg-white/8" />
          <Skeleton className="h-5 w-16 bg-white/8" />
        </div>
        <Skeleton className="h-9 w-full bg-white/8" />
      </div>
    </div>
  );
}

// ── Graveyard Skeleton Card (3D isometric feel) ───────────────────
function GraveyardSkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      style={{ transform: "perspective(600px) rotateX(2deg) rotateY(-3deg)" }}
      className="relative backdrop-blur-md bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 flex flex-col gap-4 overflow-hidden"
    >
      {/* Diagonal isometric grid overlay */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.04 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="iso-grid"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(30)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="24"
              stroke="white"
              strokeWidth="0.5"
            />
            <line
              x1="0"
              y1="0"
              x2="24"
              y2="0"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#iso-grid)" />
      </svg>

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="animate-pulse w-8 h-8 rounded-full bg-white/[0.06] flex-shrink-0" />
          <div className="animate-pulse h-5 w-40 rounded bg-white/[0.06]" />
        </div>
        <div className="animate-pulse h-10 w-12 rounded-lg bg-white/[0.06] flex-shrink-0" />
      </div>

      {/* Users row */}
      <div className="flex flex-col gap-1.5 relative z-10">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
          Users
        </span>
        <div className="animate-pulse h-4 w-24 rounded bg-white/[0.06]" />
      </div>

      {/* Tech Stack row */}
      <div className="flex flex-col gap-1.5 relative z-10">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
          Tech Stack
        </span>
        <div className="flex gap-1.5">
          {["a", "b", "c"].map((k) => (
            <div
              key={k}
              className="animate-pulse h-5 w-14 rounded-full bg-white/[0.06]"
            />
          ))}
        </div>
      </div>

      {/* Potential Score row */}
      <div className="flex flex-col gap-1.5 relative z-10">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
          Potential Score
        </span>
        <div className="animate-pulse h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full w-2/3 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.62 0.24 285 / 0.2), oklch(0.62 0.24 285 / 0.4))",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── Graveyard Empty State ─────────────────────────────────────────
function GraveyardEmptyState({
  onOpenSubmission,
}: {
  onOpenSubmission: () => void;
}) {
  return (
    <div data-ocid="projects.empty_state" className="relative pt-2 pb-8">
      {/* 3 skeleton cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <GraveyardSkeletonCard delay={0} />
        <GraveyardSkeletonCard delay={0.12} />
        <GraveyardSkeletonCard delay={0.24} />
      </div>

      {/* Hero overlay card — floats above the skeleton grid */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        className="mt-[-60px] relative z-10 mx-auto max-w-sm"
      >
        <div className="glass-card rounded-2xl p-8 text-center relative overflow-hidden border-violet-500/30 shadow-[0_0_60px_oklch(0.62_0.24_285/0.2)]">
          {/* Glow orb */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-indigo-600/15 pointer-events-none rounded-2xl" />
          {/* Top line accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />

          <div className="relative z-10">
            {/* Tombstone */}
            <div className="text-4xl mb-3">🪦</div>

            <h3 className="font-display font-black text-2xl sm:text-3xl text-foreground mb-2">
              Be the first to list.
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              The graveyard is quiet. Your project deserves better.
            </p>

            <Button
              data-ocid="graveyard.primary_button"
              onClick={onOpenSubmission}
              className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-[0_0_24px_oklch(0.62_0.24_285/0.4)] w-full sm:w-auto"
            >
              Secure Your Founder Badge
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Filter / Sort types ───────────────────────────────────────────
type FeedFilter = "All" | "SaaS" | "Extensions" | "Mobile" | "Web";
type FeedSort = "Most Recent" | "Highest Potential" | "Lowest Price";

function matchesFilter(project: AugmentedProject, filter: FeedFilter): boolean {
  if (filter === "All") return true;
  const cat = project.category.toLowerCase();
  const tags = project.tags.map((t) => t.toLowerCase());
  if (filter === "SaaS") {
    return cat === "saas" || tags.some((t) => t === "saas");
  }
  if (filter === "Extensions") {
    return (
      cat.includes("extension") ||
      cat.includes("developer") ||
      tags.some((t) => t === "vscode" || t === "extension")
    );
  }
  if (filter === "Mobile") {
    return (
      cat.includes("health") ||
      tags.some((t) => t === "mobile" || t === "react-native")
    );
  }
  if (filter === "Web") {
    return (
      cat === "marketplace" ||
      cat === "data viz" ||
      cat === "productivity" ||
      tags.some((t) => ["nextjs", "react", "dashboard"].includes(t))
    );
  }
  return true;
}

function sortProjects(
  list: AugmentedProject[],
  sort: FeedSort,
): AugmentedProject[] {
  const copy = [...list];
  if (sort === "Most Recent") {
    return copy.sort((a, b) => Number(b.id) - Number(a.id));
  }
  if (sort === "Highest Potential") {
    return copy.sort((a, b) => b.potentialScore - a.potentialScore);
  }
  if (sort === "Lowest Price") {
    return copy.sort((a, b) => a.price - b.price);
  }
  return copy;
}

// ── Filter + Sort Bar ─────────────────────────────────────────────
const FEED_FILTERS: FeedFilter[] = [
  "All",
  "SaaS",
  "Extensions",
  "Mobile",
  "Web",
];
const FEED_SORTS: FeedSort[] = [
  "Most Recent",
  "Highest Potential",
  "Lowest Price",
];

const FILTER_OCID: Record<FeedFilter, string> = {
  All: "graveyard_feed.filter.all.button",
  SaaS: "graveyard_feed.filter.saas.button",
  Extensions: "graveyard_feed.filter.extensions.button",
  Mobile: "graveyard_feed.filter.mobile.button",
  Web: "graveyard_feed.filter.web.button",
};

const SORT_OCID: Record<FeedSort, string> = {
  "Most Recent": "graveyard_feed.sort.recent.button",
  "Highest Potential": "graveyard_feed.sort.potential.button",
  "Lowest Price": "graveyard_feed.sort.price.button",
};

interface FeedControlsProps {
  activeFilter: FeedFilter;
  activeSort: FeedSort;
  onFilterChange: (f: FeedFilter) => void;
  onSortChange: (s: FeedSort) => void;
}

function FeedControls({
  activeFilter,
  activeSort,
  onFilterChange,
  onSortChange,
}: FeedControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8"
    >
      {/* Filter pills */}
      <fieldset
        aria-label="Filter by category"
        className="flex flex-wrap gap-1.5 border-0 p-0 m-0"
      >
        {FEED_FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              data-ocid={FILTER_OCID[filter]}
              onClick={() => onFilterChange(filter)}
              aria-pressed={isActive}
              className={`
                px-3 py-1.5 rounded-full text-xs font-mono font-semibold
                border transition-all duration-150 outline-none
                focus-visible:ring-2 focus-visible:ring-violet-500/50
                ${
                  isActive
                    ? "bg-violet-600/90 border-violet-500 text-white shadow-[0_0_12px_oklch(0.62_0.24_285/0.35)]"
                    : "bg-white/[0.04] border-white/[0.1] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] hover:border-violet-500/30"
                }
              `}
            >
              {filter}
            </button>
          );
        })}
      </fieldset>

      {/* Sort segmented control */}
      <fieldset
        aria-label="Sort projects"
        className="flex items-center gap-0 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] m-0"
      >
        {FEED_SORTS.map((sort) => {
          const isActive = activeSort === sort;
          return (
            <button
              key={sort}
              type="button"
              data-ocid={SORT_OCID[sort]}
              onClick={() => onSortChange(sort)}
              aria-pressed={isActive}
              className={`
                px-3 py-1.5 text-[11px] font-mono font-semibold rounded-md
                transition-all duration-150 outline-none whitespace-nowrap
                focus-visible:ring-2 focus-visible:ring-violet-500/50
                ${
                  isActive
                    ? "bg-violet-600/80 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                }
              `}
            >
              {sort}
            </button>
          );
        })}
      </fieldset>
    </motion.div>
  );
}

// ── Projects Section ──────────────────────────────────────────────
function ProjectsSection({
  onOpenSubmission,
  onViewProject,
}: {
  onOpenSubmission: () => void;
  onViewProject: (project: Project) => void;
}) {
  const { data: projects, isLoading, isError } = useListProjects();
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("All");
  const [activeSort, setActiveSort] = useState<FeedSort>("Most Recent");

  const isGraveyard =
    !isLoading && !isError && (!projects || projects.length === 0);
  const hasProjects = !isLoading && !isError && projects && projects.length > 0;

  // Build augmented list for real backend projects (no githubLanguages/watchers from backend)
  const augmentedProjects: AugmentedProject[] = hasProjects
    ? (projects as AugmentedProject[])
    : [];

  // Derive filtered + sorted lists
  const filteredSample = sortProjects(
    SAMPLE_PROJECTS.filter((p) => matchesFilter(p, activeFilter)),
    activeSort,
  );
  const filteredReal = sortProjects(
    augmentedProjects.filter((p) => matchesFilter(p, activeFilter)),
    activeSort,
  );

  const showFilterBar = !isLoading && !isGraveyard;

  return (
    <section
      id="projects"
      data-ocid="projects.section"
      className="py-24 px-4 sm:px-6 max-w-7xl mx-auto"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
        className="mb-14 text-center"
      >
        <motion.div variants={fadeUp}>
          {isGraveyard ? (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300 mb-5">
              <span className="text-sm">🪦</span>
              Project Graveyard
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300 mb-5">
              {/* Live pulse indicator */}
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_6px_#4ade80]" />
              </span>
              Graveyard Feed
            </span>
          )}
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4"
        >
          {isGraveyard ? (
            <>
              Project <span className="gradient-text">Graveyard.</span>
            </>
          ) : (
            <>
              Brilliant projects,{" "}
              <span className="gradient-text">waiting to ship.</span>
            </>
          )}
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-muted-foreground text-lg max-w-xl mx-auto"
        >
          {isGraveyard
            ? "The next big thing is buried here. Be the first builder to claim it."
            : "Each listing includes a Potential Score, Cause of Death, and full source access."}
        </motion.p>
      </motion.div>

      {/* Loading state */}
      {isLoading && (
        <div
          data-ocid="projects.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {(["a", "b", "c", "d", "e", "f"] as const).map((k) => (
            <ProjectCardSkeleton key={k} />
          ))}
        </div>
      )}

      {/* Error state — show sample projects with filter/sort */}
      {isError && !isLoading && (
        <div data-ocid="projects.error_state">
          <p className="text-muted-foreground text-sm text-center mb-6">
            Unable to load projects. Showing sample listings below.
          </p>
          <FeedControls
            activeFilter={activeFilter}
            activeSort={activeSort}
            onFilterChange={setActiveFilter}
            onSortChange={setActiveSort}
          />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredSample.length === 0 ? (
              <div
                data-ocid="projects.empty_state"
                className="col-span-full text-center py-16 text-muted-foreground text-sm font-mono"
              >
                No projects match this filter.
              </div>
            ) : (
              filteredSample.map((project, i) => (
                <ProjectCard
                  key={project.id.toString()}
                  project={project}
                  index={i}
                  onViewProject={onViewProject}
                />
              ))
            )}
          </motion.div>
        </div>
      )}

      {/* Graveyard empty state */}
      {isGraveyard && (
        <GraveyardEmptyState onOpenSubmission={onOpenSubmission} />
      )}

      {/* Data loaded — real projects with filter/sort */}
      {hasProjects && (
        <>
          {showFilterBar && (
            <FeedControls
              activeFilter={activeFilter}
              activeSort={activeSort}
              onFilterChange={setActiveFilter}
              onSortChange={setActiveSort}
            />
          )}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredReal.length === 0 ? (
              <div
                data-ocid="projects.empty_state"
                className="col-span-full text-center py-16 text-muted-foreground text-sm font-mono"
              >
                No projects match this filter.
              </div>
            ) : (
              filteredReal.map((project, i) => (
                <ProjectCard
                  key={project.id.toString()}
                  project={project}
                  index={i}
                  onViewProject={onViewProject}
                />
              ))
            )}
          </motion.div>
        </>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-center mt-12"
      >
        <Button
          variant="outline"
          className="border-[oklch(0.35_0.04_285/0.4)] bg-white/5 hover:bg-white/10 text-foreground font-semibold px-8 py-5"
        >
          <Search className="mr-2 h-4 w-4" />
          Browse All Projects
        </Button>
      </motion.div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────
const steps = [
  {
    number: "01",
    icon: Package,
    title: "List your project",
    description:
      "Fill in your project details, set a Potential Score, pick a Cause of Death tag, and set your price. Takes 5 minutes.",
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
    borderColor: "border-violet-400/20",
  },
  {
    number: "02",
    icon: Search,
    title: "Browse & discover",
    description:
      "Buyers explore projects by category, tech stack, and potential. Your next big thing might be someone else's abandoned weekend project.",
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
    borderColor: "border-sky-400/20",
  },
  {
    number: "03",
    icon: Handshake,
    title: "Transfer & thrive",
    description:
      "Secure handoff with source code, documentation, and a 1-hour walkthrough call. Your project gets the builder it deserves.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
  },
];

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      data-ocid="howitworks.section"
      className="py-24 px-4 sm:px-6 relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-950/10 to-background pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-violet-600/5 blur-[150px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300 mb-5">
              <Zap className="h-3 w-3" />
              Simple process
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4"
          >
            From abandoned to <span className="gradient-text">acquired.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            The simplest way to sell or find promising half-built products.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 relative"
        >
          {/* Connector line - desktop */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-violet-500/30 via-sky-500/30 to-emerald-500/30" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="glass-card rounded-xl p-7 flex flex-col gap-4 relative"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-lg ${step.bgColor} border ${step.borderColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <span
                    className={`font-mono font-black text-3xl ${step.color} opacity-30 leading-none mt-1`}
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display font-black text-xl text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ── Resurrection / Trust & Escrow Section ────────────────────────
const resurrectionSteps = [
  {
    number: "01",
    title: "Connect & Verify",
    description:
      "Link GitHub and Stripe to prove your project is real. Verified sellers close 3× faster.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8"
        aria-hidden="true"
      >
        {/* Two interlocked chain links */}
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Secure Escrow",
    description:
      "We hold the buyer's funds until the code is transferred. No risk for either side.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8"
        aria-hidden="true"
      >
        {/* Shield outline */}
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        {/* Lock body */}
        <rect x="9" y="11" width="6" height="5" rx="1" />
        {/* Lock shackle */}
        <path d="M10 11V9a2 2 0 1 1 4 0v2" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Handoff",
    description:
      "Smooth transfer of GitHub repos, domains, and assets. Keys in hand in under 24 hours.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8"
        aria-hidden="true"
      >
        {/* Source box */}
        <rect x="2" y="7" width="7" height="7" rx="1" />
        {/* Destination box */}
        <rect x="15" y="7" width="7" height="7" rx="1" />
        {/* Arrow shaft */}
        <line x1="9" y1="10.5" x2="15" y2="10.5" />
        {/* Arrow head */}
        <polyline points="12.5 8 15 10.5 12.5 13" />
      </svg>
    ),
  },
];

function ResurrectionSection() {
  return (
    <section
      id="trust-escrow"
      data-ocid="resurrection.section"
      className="py-24 px-4 sm:px-6 relative overflow-hidden"
    >
      {/* Background accent — subtle cyan tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-cyan-950/5 to-background pointer-events-none" />
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-cyan-500/5 blur-[160px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300 mb-5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-3 w-3"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Trust &amp; Escrow
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4"
          >
            How the <span className="text-cyan-400">Resurrection</span> Works
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Every deal is protected — from first handshake to final transfer.
          </motion.p>
        </motion.div>

        {/* 3-column step grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 relative"
        >
          {/* Circuit board PCB connector — desktop only */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute pointer-events-none"
            style={{
              top: "52px",
              left: "calc(16.67% + 16px)",
              right: "calc(16.67% + 16px)",
              height: "2px",
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 2"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Circuit board connector"
            >
              {/* PCB trace line */}
              <line
                x1="0"
                y1="1"
                x2="100"
                y2="1"
                stroke="oklch(0.7 0.15 195 / 0.5)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {/* Node circle at left */}
              <circle
                cx="0"
                cy="1"
                r="3"
                fill="oklch(0.7 0.15 195 / 0.7)"
                vectorEffect="non-scaling-stroke"
              />
              {/* Node circle at center */}
              <circle
                cx="50"
                cy="1"
                r="3"
                fill="oklch(0.7 0.15 195 / 0.7)"
                vectorEffect="non-scaling-stroke"
              />
              {/* Node circle at right */}
              <circle
                cx="100"
                cy="1"
                r="3"
                fill="oklch(0.7 0.15 195 / 0.7)"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          {resurrectionSteps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              data-ocid={`resurrection.item.${i + 1}`}
              className="glass-card rounded-xl p-7 flex flex-col gap-5 relative group
                border border-transparent hover:border-cyan-500/20
                transition-colors duration-300"
            >
              {/* Bottom glow on hover */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                {step.icon}
              </div>

              {/* Step number */}
              <div className="flex items-center gap-4">
                <span className="font-mono font-black text-3xl text-cyan-400 opacity-30 leading-none">
                  {step.number}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display font-black text-xl text-foreground -mt-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── List CTA Section ──────────────────────────────────────────────
function ListCtaSection() {
  return (
    <section id="list" className="py-24 px-4 sm:px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        <motion.div
          variants={fadeUp}
          className="glass-card rounded-2xl p-10 md:p-16 text-center relative overflow-hidden"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-indigo-600/10 pointer-events-none rounded-2xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

          <motion.div variants={itemVariants} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300">
              Free to list
            </span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4 relative"
          >
            Stop hoarding <span className="gradient-text">code.</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-muted-foreground text-lg max-w-xl mx-auto mb-10"
          >
            That SaaS you started 3 years ago? It could be worth thousands to
            the right builder. List it free today.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-base px-8 py-6 rounded-lg transition-all duration-200 hover:shadow-[0_0_30px_oklch(0.62_0.24_285/0.5)] w-full sm:w-auto">
              List Your Project Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground">
              No upfront cost · 5% success fee
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer
      data-ocid="footer.section"
      className="border-t border-[oklch(0.35_0.04_285/0.2)] bg-[oklch(0.07_0.005_280/0.9)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-0">
        {/* Four-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/assets/generated/halfbuilt-logo-transparent.dim_80x80.png"
                alt="HalfBuilt"
                className="w-7 h-7 object-contain"
              />
              <span className="font-display font-black text-lg tracking-tight text-foreground">
                Half<span className="text-violet-400">Built</span>
              </span>
            </div>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              The marketplace for abandoned side projects.{" "}
              <span className="text-muted-foreground/70">
                Built for builders, by builders.
              </span>
            </p>
          </div>

          {/* Marketplace column */}
          <div>
            <h4 className="font-mono font-semibold text-xs uppercase tracking-widest text-muted-foreground/60 mb-5">
              MARKETPLACE
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  data-ocid="footer.marketplace.link.1"
                  href="#projects"
                  className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Browse
                </a>
              </li>
              <li>
                <a
                  data-ocid="footer.marketplace.link.2"
                  href="#list"
                  className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sell
                </a>
              </li>
              <li>
                <a
                  data-ocid="footer.marketplace.link.3"
                  href="#pricing"
                  className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Trust column */}
          <div>
            <h4 className="font-mono font-semibold text-xs uppercase tracking-widest text-muted-foreground/60 mb-5">
              TRUST
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  data-ocid="footer.trust.link.1"
                  href="#trust-escrow"
                  className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Escrow Policy
                </a>
              </li>
              <li>
                <a
                  data-ocid="footer.trust.link.2"
                  href="#trust-escrow"
                  className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Code Verification
                </a>
              </li>
              <li>
                <a
                  data-ocid="footer.trust.link.3"
                  href="#trust-escrow"
                  className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </a>
              </li>
            </ul>
          </div>

          {/* Community column */}
          <div>
            <h4 className="font-mono font-semibold text-xs uppercase tracking-widest text-muted-foreground/60 mb-5">
              COMMUNITY
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  data-ocid="footer.community.discord.link"
                  href="https://discord.gg"
                  className="flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  Discord
                </a>
              </li>
              <li>
                <a
                  data-ocid="footer.community.x.link"
                  href="https://x.com"
                  className="flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-3.5 w-3.5 shrink-0" />
                  X&nbsp;
                  <span className="text-muted-foreground/50">(Twitter)</span>
                </a>
              </li>
              <li>
                <a
                  data-ocid="footer.community.reddit.link"
                  href="https://reddit.com"
                  className="flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* Reddit inline SVG */}
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5 shrink-0 text-orange-400"
                    aria-hidden="true"
                  >
                    <path d="M10 0C4.478 0 0 4.478 0 10s4.478 10 10 10 10-4.478 10-10S15.522 0 10 0Zm5.863 10.527a1.39 1.39 0 0 1 .55 1.113c0 1.61-1.871 2.916-4.179 2.916s-4.179-1.305-4.179-2.916a1.39 1.39 0 0 1 .55-1.113 1.095 1.095 0 1 1 1.37-1.703 5.39 5.39 0 0 1 2.908-.83l.493-2.315-1.607.336a.77.77 0 1 1-.083-.506l1.796-.375a.196.196 0 0 1 .233.15l.549 2.576a5.392 5.392 0 0 1 2.96.964 1.095 1.095 0 1 1 .639 2.703ZM7.5 11a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm4.25.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-.674 1.426c-.328.328-.96.445-1.076.445s-.748-.117-1.076-.445a.197.197 0 0 0-.278.278c.436.436 1.119.566 1.354.566s.918-.13 1.354-.566a.197.197 0 0 0-.278-.278Z" />
                  </svg>
                  <span>Reddit</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Live Platform Stats bar */}
        <div
          data-ocid="footer.stats.section"
          className="border-t border-[oklch(0.35_0.04_285/0.15)] py-4"
        >
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-6 gap-y-2">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {/* Stat 1 */}
              <span className="font-mono text-xs">
                <span className="text-muted-foreground/60">
                  Projects Revived:
                </span>{" "}
                <span className="text-foreground/80">0</span>
              </span>
              <span className="text-muted-foreground/30 font-mono text-xs select-none">
                ·
              </span>
              {/* Stat 2 */}
              <span className="font-mono text-xs">
                <span className="text-muted-foreground/60">
                  Total Value Transferred:
                </span>{" "}
                <span className="text-foreground/80">$0</span>
              </span>
              <span className="text-muted-foreground/30 font-mono text-xs select-none">
                ·
              </span>
              {/* Stat 3 — with green pulse dot */}
              <span className="font-mono text-xs flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                <span className="text-muted-foreground/60">
                  Active Builders:
                </span>{" "}
                <span className="text-foreground/80">1</span>
              </span>
            </div>
            <span className="font-mono text-xs text-muted-foreground/40 hidden sm:block">
              LIVE
            </span>
          </div>
        </div>

        {/* Copyright bottom bar */}
        <div className="border-t border-[oklch(0.35_0.04_285/0.10)] py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/50">
          <p className="font-mono">
            © {year}. Built with{" "}
            <Heart className="inline h-3 w-3 text-violet-400/70 fill-violet-400/70" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              className="hover:text-foreground/70 transition-colors underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
          <p className="font-mono text-muted-foreground/30">
            {"// open-source. transparent by default."}
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────
type AppView = "home" | "profile" | "transaction";

export default function App() {
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [view, setView] = useState<AppView>("home");

  // Transaction view
  if (view === "transaction") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <TransactionStatusPage onBack={() => setView("home")} />
        <Toaster theme="dark" position="bottom-right" />
      </div>
    );
  }

  // Profile view
  if (view === "profile") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar
          onOpenSubmission={() => setSubmissionOpen(true)}
          onNavigateProfile={() => setView("profile")}
          onNavigateTransaction={() => setView("transaction")}
        />
        <main className="pt-16">
          <BuilderProfilePage onBack={() => setView("home")} />
        </main>
        <Footer />
        <ProjectSubmissionModal
          open={submissionOpen}
          onOpenChange={setSubmissionOpen}
        />
        <Toaster theme="dark" position="bottom-right" />
      </div>
    );
  }

  // Autopsy view
  if (selectedProject) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ProjectAutopsyPage
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
        <Toaster theme="dark" position="bottom-right" />
      </div>
    );
  }

  // Home view
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        onOpenSubmission={() => setSubmissionOpen(true)}
        onNavigateProfile={() => setView("profile")}
        onNavigateTransaction={() => setView("transaction")}
      />
      <main>
        <Hero onOpenSubmission={() => setSubmissionOpen(true)} />
        <WallOfFailureSection />
        <ProjectValuationTool
          onOpenSubmission={() => setSubmissionOpen(true)}
        />
        <ProjectsSection
          onOpenSubmission={() => setSubmissionOpen(true)}
          onViewProject={(project) => setSelectedProject(project)}
        />
        <HowItWorksSection />
        <ResurrectionSection />
        <ListCtaSection />
      </main>
      <Footer />
      <ProjectSubmissionModal
        open={submissionOpen}
        onOpenChange={setSubmissionOpen}
      />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "oklch(0.09 0.008 200)",
            border: "1px solid rgba(0,229,255,0.2)",
            color: "white",
          },
        }}
      />
    </div>
  );
}
