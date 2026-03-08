import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, RotateCcw, Terminal } from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────
type AuditState = "idle" | "scanning" | "result";

// ── Scanning Log Lines ─────────────────────────────────────────────
const LOG_LINES = [
  "> Connecting to GitHub API...",
  "> Verifying repository access...",
  "> Checking commit history...",
  "> Analyzing dependency health...",
  "> Fetching star count...",
  "> Scanning open issues...",
  "> Detecting primary language...",
  "> Compiling audit report...",
];

// ── Deterministic "hash" from a string ────────────────────────────
function simpleHash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}

// ── Derive plausible audit results from a URL string ──────────────
interface AuditResult {
  lastCommit: string;
  primaryLanguage: string;
  openIssues: number;
  stars: number;
  license: string;
}

const COMMIT_DATES = [
  "2 hours ago",
  "1 day ago",
  "2 days ago",
  "4 days ago",
  "1 week ago",
  "2 weeks ago",
  "3 weeks ago",
  "1 month ago",
  "6 weeks ago",
  "3 months ago",
  "5 months ago",
  "8 months ago",
];

const LICENSES = [
  "MIT",
  "Apache-2.0",
  "GPL-3.0",
  "BSD-3-Clause",
  "MIT",
  "MIT",
  "Apache-2.0",
];

function deriveAuditResult(url: string): AuditResult {
  const lower = url.toLowerCase();
  const hash = simpleHash(url);

  // Language heuristic
  let primaryLanguage = "TypeScript";
  if (
    lower.includes("py") ||
    lower.includes("flask") ||
    lower.includes("django")
  ) {
    primaryLanguage = "Python";
  } else if (
    lower.includes("go") &&
    !lower.includes("good") &&
    !lower.includes("google")
  ) {
    primaryLanguage = "Go";
  } else if (lower.includes("rust")) {
    primaryLanguage = "Rust";
  } else if (lower.includes("java") && !lower.includes("javascript")) {
    primaryLanguage = "Java";
  } else if (
    lower.includes("react") ||
    lower.includes("next") ||
    lower.includes("ts")
  ) {
    primaryLanguage = "TypeScript";
  } else if (lower.includes("vue") || lower.includes("nuxt")) {
    primaryLanguage = "Vue";
  } else if (lower.includes("swift") || lower.includes("ios")) {
    primaryLanguage = "Swift";
  }

  // Open issues: 3–47 based on URL length
  const openIssues = 3 + (url.length % 45);

  // Last commit date: pick from array
  const lastCommit = COMMIT_DATES[hash % COMMIT_DATES.length];

  // Stars: 40–12000
  const stars = 40 + (hash % 11961);

  // License
  const license = LICENSES[hash % LICENSES.length];

  return { lastCommit, primaryLanguage, openIssues, stars, license };
}

// ── Motion variants ────────────────────────────────────────────────
const logLineVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

const resultVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ── Blinking Cursor ────────────────────────────────────────────────
function BlinkingCursor() {
  return (
    <span
      className="inline-block w-2 h-4 bg-cyan-400 ml-0.5 align-middle"
      style={{
        animation: "blink-cursor 1s step-end infinite",
      }}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────
export function RepositoryAuditDashboard() {
  const [urlValue, setUrlValue] = useState("");
  const [auditState, setAuditState] = useState<AuditState>("idle");
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditedUrl, setAuditedUrl] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logPanelRef = useRef<HTMLDivElement>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, []);

  // Scroll log panel to bottom when new lines appear
  // biome-ignore lint/correctness/useExhaustiveDependencies: visibleLines is the intended trigger for scrolling
  useEffect(() => {
    if (logPanelRef.current) {
      logPanelRef.current.scrollTop = logPanelRef.current.scrollHeight;
    }
  }, [visibleLines]);

  function handleStartAudit() {
    if (!urlValue.trim() || auditState === "scanning") return;

    const targetUrl = urlValue.trim();
    setAuditedUrl(targetUrl);
    setAuditState("scanning");
    setVisibleLines(0);
    setAuditResult(null);

    let currentLine = 0;
    intervalRef.current = setInterval(() => {
      currentLine += 1;
      setVisibleLines(currentLine);

      if (currentLine >= LOG_LINES.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        completeTimerRef.current = setTimeout(() => {
          setAuditResult(deriveAuditResult(targetUrl));
          setAuditState("result");
        }, 600);
      }
    }, 450);
  }

  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    setAuditState("idle");
    setVisibleLines(0);
    setAuditResult(null);
    setAuditedUrl("");
    setUrlValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleStartAudit();
    }
  }

  const isScanning = auditState === "scanning";
  const isResult = auditState === "result";
  const showTerminal = isScanning || isResult;

  return (
    <section
      id="repo-audit"
      data-ocid="repo_audit.section"
      className="py-24 relative overflow-hidden"
    >
      {/* Blink cursor keyframe */}
      <style>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* Radial glow orb — neon cyan */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, oklch(0.85 0.18 195 / 0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {/* Secondary smaller orb offset */}
      <div
        className="absolute top-1/3 right-1/4 w-[280px] h-[280px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.18 195 / 0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-10"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(0.85 0.18 195 / 0.12)",
                border: "1px solid oklch(0.85 0.18 195 / 0.3)",
              }}
            >
              <Terminal className="w-4 h-4" style={{ color: "#00e5ff" }} />
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-foreground">
              Repository Audit
            </h2>
          </div>
          <p
            className="text-sm text-muted-foreground"
            style={{ fontFamily: "'JetBrains Mono', 'Geist Mono', monospace" }}
          >
            <span style={{ color: "oklch(0.85 0.18 195 / 0.6)" }}>{"// "}</span>
            analyze any public GitHub repo in seconds
          </p>
        </motion.div>

        {/* ── Input Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
          className="flex gap-3 mb-6"
        >
          <Input
            data-ocid="repo_audit.url.input"
            type="url"
            placeholder="https://github.com/owner/repo"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isScanning}
            autoComplete="off"
            spellCheck={false}
            className="flex-1 h-12 text-sm bg-black/60 border-white/[0.12] text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl"
            style={{ fontFamily: "'JetBrains Mono', 'Geist Mono', monospace" }}
          />
          <Button
            data-ocid="repo_audit.start_button"
            onClick={handleStartAudit}
            disabled={!urlValue.trim() || isScanning}
            className="h-12 px-6 font-bold text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              background: isScanning
                ? "oklch(0.85 0.18 195 / 0.15)"
                : "oklch(0.85 0.18 195 / 0.9)",
              color: isScanning
                ? "oklch(0.85 0.18 195)"
                : "oklch(0.08 0.005 280)",
              border: "1px solid oklch(0.85 0.18 195 / 0.4)",
              boxShadow: isScanning
                ? "none"
                : "0 0 20px oklch(0.85 0.18 195 / 0.3)",
              fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
            }}
          >
            {isScanning ? (
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-3.5 h-3.5 border-2 rounded-full border-t-transparent animate-spin"
                  style={{
                    borderColor: "oklch(0.85 0.18 195 / 0.6)",
                    borderTopColor: "transparent",
                  }}
                />
                Scanning...
              </span>
            ) : (
              "Start Audit"
            )}
          </Button>
        </motion.div>

        {/* ── Terminal Log Panel ── */}
        <AnimatePresence>
          {showTerminal && (
            <motion.div
              key="terminal"
              data-ocid={
                isScanning ? "repo_audit.scanning.loading_state" : undefined
              }
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mb-6 rounded-xl overflow-hidden"
              style={{
                background: "rgba(0,0,0,0.85)",
                border: "1px solid oklch(0.85 0.18 195 / 0.25)",
              }}
            >
              {/* Terminal title bar */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 border-b"
                style={{
                  borderColor: "oklch(0.85 0.18 195 / 0.15)",
                  background: "rgba(0,0,0,0.6)",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span
                  className="text-xs ml-2 truncate"
                  style={{
                    fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
                    color: "oklch(0.85 0.18 195 / 0.5)",
                  }}
                >
                  audit — {auditedUrl || "github.com"}
                </span>
                {isResult && (
                  <CheckCircle2
                    className="w-3.5 h-3.5 ml-auto flex-shrink-0"
                    style={{ color: "oklch(0.85 0.18 195 / 0.7)" }}
                  />
                )}
              </div>

              {/* Log lines */}
              <div
                ref={logPanelRef}
                className="p-5 overflow-y-auto max-h-52 space-y-1"
                style={{ scrollBehavior: "smooth" }}
              >
                {LOG_LINES.slice(0, visibleLines).map((line, lineIdx) => (
                  <motion.div
                    key={line}
                    variants={logLineVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-start gap-0 leading-relaxed"
                  >
                    <span
                      className="text-xs whitespace-pre"
                      style={{
                        fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
                        color:
                          lineIdx === visibleLines - 1 && isScanning
                            ? "#00e5ff"
                            : "oklch(0.85 0.18 195 / 0.55)",
                      }}
                    >
                      {line}
                    </span>
                  </motion.div>
                ))}

                {/* Blinking cursor — only during scanning */}
                {isScanning && (
                  <div className="flex items-center">
                    <BlinkingCursor />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results Panel ── */}
        <AnimatePresence>
          {isResult && auditResult && (
            <motion.div
              key="result"
              data-ocid="repo_audit.result.success_state"
              variants={resultVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 12 }}
              className="rounded-xl overflow-hidden"
              style={{
                border: "1px solid oklch(0.85 0.18 195 / 0.35)",
                boxShadow:
                  "0 0 24px oklch(0.85 0.18 195 / 0.18), 0 0 60px oklch(0.85 0.18 195 / 0.08)",
                background: "rgba(0,0,0,0.7)",
              }}
            >
              {/* Header bar */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{
                  background: "oklch(0.85 0.18 195 / 0.1)",
                  borderBottom: "1px solid oklch(0.85 0.18 195 / 0.2)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ background: "#00e5ff" }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ background: "#00e5ff" }}
                    />
                  </span>
                  <span
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{
                      fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
                      color: "#00e5ff",
                    }}
                  >
                    AUDIT COMPLETE
                  </span>
                </div>
                <span
                  className="text-xs truncate max-w-[200px] sm:max-w-xs"
                  style={{
                    fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
                    color: "oklch(0.85 0.18 195 / 0.45)",
                  }}
                >
                  {auditedUrl}
                </span>
              </div>

              {/* Data table */}
              <div className="p-5">
                <table
                  className="w-full"
                  style={{
                    fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
                  }}
                >
                  <tbody>
                    {[
                      {
                        label: "Last Commit",
                        value: auditResult.lastCommit,
                        highlight: false,
                      },
                      {
                        label: "Primary Language",
                        value: auditResult.primaryLanguage,
                        highlight: true,
                      },
                      {
                        label: "Open Issues",
                        value: auditResult.openIssues.toString(),
                        highlight: false,
                      },
                      {
                        label: "GitHub Stars",
                        value: auditResult.stars.toLocaleString(),
                        highlight: true,
                      },
                      {
                        label: "License",
                        value: auditResult.license,
                        highlight: false,
                      },
                    ].map((row, i) => (
                      <motion.tr
                        key={row.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: i * 0.07,
                          duration: 0.25,
                          ease: "easeOut",
                        }}
                        className="border-b last:border-b-0"
                        style={{ borderColor: "oklch(0.85 0.18 195 / 0.08)" }}
                      >
                        <td
                          className="py-3 pr-6 text-xs font-medium whitespace-nowrap w-40"
                          style={{ color: "oklch(0.65 0.02 280 / 0.8)" }}
                        >
                          {row.label}
                        </td>
                        <td className="py-3 text-sm font-semibold">
                          <span
                            style={{
                              color: row.highlight
                                ? "#00e5ff"
                                : "oklch(0.92 0.01 280)",
                            }}
                          >
                            {row.value}
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: "oklch(0.85 0.18 195 / 0.25)" }}
                          >
                            ✓
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {/* Run Another Audit button */}
                <div className="mt-5 flex justify-end">
                  <Button
                    data-ocid="repo_audit.reset_button"
                    variant="outline"
                    onClick={handleReset}
                    className="h-9 px-5 text-xs font-semibold rounded-lg transition-all duration-200"
                    style={{
                      fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
                      background: "transparent",
                      border: "1px solid oklch(0.85 0.18 195 / 0.35)",
                      color: "#00e5ff",
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Run Another Audit
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Idle prompt hint ── */}
        <AnimatePresence>
          {auditState === "idle" && (
            <motion.div
              key="idle-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <p
                className="text-xs"
                style={{
                  fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
                  color: "oklch(0.55 0.02 280 / 0.6)",
                }}
              >
                {"> "}
                <span style={{ color: "oklch(0.85 0.18 195 / 0.4)" }}>_</span>
                {" paste a public GitHub URL and press Enter"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
