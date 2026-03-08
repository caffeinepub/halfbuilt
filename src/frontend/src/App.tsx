import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  ExternalLink,
  Github,
  Handshake,
  Heart,
  Menu,
  Package,
  Search,
  Twitter,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useEffect, useState } from "react";
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

// ── Sample data (shown while backend loads or if empty) ────────────
const SAMPLE_PROJECTS: Project[] = [
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
  },
];

// ── Navbar ─────────────────────────────────────────────────────────
function Navbar() {
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
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            data-ocid="navbar.primary_button"
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
              <Button
                data-ocid="navbar.primary_button"
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
function Hero() {
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
              asChild
              variant="outline"
              data-ocid="hero.secondary_button"
              className="border-[oklch(0.35_0.04_285/0.4)] bg-white/5 hover:bg-white/10 text-foreground font-semibold text-base px-7 py-6 rounded-lg transition-all duration-200 w-full sm:w-auto"
            >
              <a href="#list">List Yours Free</a>
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

// ── Project Card ──────────────────────────────────────────────────
interface ProjectCardProps {
  project: Project;
  index: number;
}

function ProjectCard({ project, index }: ProjectCardProps) {
  const scoreColor = getScoreColor(project.potentialScore);
  const codStyle = getCodColor(project.causeOfDeath);

  return (
    <motion.article
      variants={itemVariants}
      data-ocid={`projects.item.${index + 1}`}
      className="glass-card card-lift rounded-xl p-5 flex flex-col gap-4 group cursor-pointer"
    >
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
          className="w-full bg-white/8 hover:bg-violet-600/90 border border-white/10 hover:border-violet-500 text-foreground hover:text-white font-semibold text-sm transition-all duration-200 group-hover:bg-violet-600/80 group-hover:border-violet-500 group-hover:text-white"
          variant="outline"
        >
          View Project
          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
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

// ── Projects Section ──────────────────────────────────────────────
function ProjectsSection() {
  const { data: projects, isLoading, isError } = useListProjects();

  const displayProjects =
    projects && projects.length > 0 ? projects : SAMPLE_PROJECTS;

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
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300 mb-5">
            <Package className="h-3 w-3" />
            Featured Projects
          </span>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4"
        >
          Brilliant projects,{" "}
          <span className="gradient-text">waiting to ship.</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="text-muted-foreground text-lg max-w-xl mx-auto"
        >
          Each listing includes a Potential Score, Cause of Death, and full
          source access.
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

      {/* Error state */}
      {isError && !isLoading && (
        <div data-ocid="projects.error_state" className="text-center py-20">
          <p className="text-muted-foreground text-sm">
            Unable to load projects. Showing sample listings below.
          </p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10"
          >
            {SAMPLE_PROJECTS.map((project, i) => (
              <ProjectCard
                key={project.id.toString()}
                project={project}
                index={i}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Data loaded */}
      {!isLoading &&
        !isError &&
        (displayProjects.length === 0 ? (
          <div
            data-ocid="projects.empty_state"
            className="text-center py-20 glass-card rounded-xl"
          >
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No projects listed yet. Be the first!
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {displayProjects.map((project, i) => (
              <ProjectCard
                key={project.id.toString()}
                project={project}
                index={i}
              />
            ))}
          </motion.div>
        ))}

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
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
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The marketplace for abandoned side projects. Every unfinished
              dream deserves a builder who'll take it to the finish line.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://github.com"
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded hover:bg-white/5"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded hover:bg-white/5"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Marketplace
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                { label: "Browse Projects", href: "#projects" },
                { label: "List a Project", href: "#list" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Company
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[oklch(0.35_0.04_285/0.15)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {year}. Built with{" "}
            <Heart className="inline h-3 w-3 text-violet-400 fill-violet-400" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              className="hover:text-foreground transition-colors underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
          <p className="font-mono">HalfBuilt v1.0 · All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <ProjectsSection />
        <HowItWorksSection />
        <ListCtaSection />
      </main>
      <Footer />
    </div>
  );
}
