import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Download, Share2, Twitter, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ── QR Code SVG (realistic finder-pattern style) ──────────────────
// Encodes a simplified but visually-authentic QR code for HalfBuilt.com
function QRCodeSVG() {
  // QR grid: 1 = dark module, 0 = light module (21x21 simplified version)
  // Finder patterns + timing + a few data modules for realism
  const size = 21;
  const modules: number[][] = Array.from({ length: size }, () =>
    Array(size).fill(0),
  );

  // Helper to draw a finder pattern (top-left, top-right, bottom-left)
  function drawFinder(r: number, c: number) {
    for (let dr = 0; dr < 7; dr++) {
      for (let dc = 0; dc < 7; dc++) {
        const onOuter = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const onInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        modules[r + dr][c + dc] = onOuter || onInner ? 1 : 0;
      }
    }
  }

  drawFinder(0, 0); // top-left
  drawFinder(0, 14); // top-right
  drawFinder(14, 0); // bottom-left

  // Timing patterns
  for (let i = 8; i <= 12; i++) {
    modules[6][i] = i % 2 === 0 ? 1 : 0;
    modules[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Separators (white border around finders)
  // already handled by finder drawing leaving them 0

  // Some realistic-looking data modules in the data area
  const dataModules = [
    [8, 8],
    [9, 9],
    [10, 8],
    [8, 10],
    [11, 11],
    [12, 10],
    [10, 12],
    [9, 13],
    [13, 9],
    [14, 10],
    [10, 14],
    [11, 15],
    [15, 11],
    [16, 12],
    [12, 16],
    [13, 17],
    [17, 13],
    [18, 14],
    [14, 18],
    [15, 19],
    [19, 15],
    [9, 10],
    [10, 9],
    [11, 8],
    [8, 11],
    [12, 9],
    [9, 12],
    [13, 13],
    [14, 14],
    [15, 15],
    [16, 16],
    [17, 17],
    [18, 18],
    [19, 19],
    [20, 14],
    [14, 20],
    [20, 16],
    [16, 20],
    [8, 14],
    [8, 16],
    [8, 18],
    [8, 20],
    [10, 15],
    [12, 17],
    [11, 19],
  ];

  for (const [r, c] of dataModules) {
    if (r < size && c < size) {
      modules[r][c] = 1;
    }
  }

  const cellSize = 2.4;
  const svgSize = size * cellSize;

  // Build a flat list of lit cells with stable string keys (not derived from array indices)
  const litCells: Array<{ key: string; x: number; y: number }> = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules[r][c] === 1) {
        litCells.push({
          key: `qr-${r}-${c}`,
          x: c * cellSize,
          y: r * cellSize,
        });
      }
    }
  }

  return (
    <svg
      width={52}
      height={52}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="QR code for HalfBuilt.com"
      role="img"
    >
      {litCells.map((cell) => (
        <rect
          key={cell.key}
          x={cell.x}
          y={cell.y}
          width={cellSize}
          height={cellSize}
          fill="white"
        />
      ))}
    </svg>
  );
}

// ── CoD color helper (self-contained for the card) ─────────────────
function getCodColors(cod: string): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  const lower = cod.toLowerCase();
  if (lower.includes("burn") || lower.includes("time"))
    return {
      text: "#fb923c",
      bg: "rgba(251,146,60,0.12)",
      border: "rgba(251,146,60,0.4)",
      glow: "0 0 12px rgba(251,146,60,0.5)",
    };
  if (
    lower.includes("fund") ||
    lower.includes("money") ||
    lower.includes("budget")
  )
    return {
      text: "#f87171",
      bg: "rgba(248,113,113,0.12)",
      border: "rgba(248,113,113,0.4)",
      glow: "0 0 12px rgba(248,113,113,0.5)",
    };
  if (lower.includes("scope") || lower.includes("complex"))
    return {
      text: "#facc15",
      bg: "rgba(250,204,21,0.12)",
      border: "rgba(250,204,21,0.4)",
      glow: "0 0 12px rgba(250,204,21,0.5)",
    };
  if (lower.includes("pivot") || lower.includes("interest"))
    return {
      text: "#38bdf8",
      bg: "rgba(56,189,248,0.12)",
      border: "rgba(56,189,248,0.4)",
      glow: "0 0 12px rgba(56,189,248,0.5)",
    };
  if (lower.includes("tech") || lower.includes("stack"))
    return {
      text: "#34d399",
      bg: "rgba(52,211,153,0.12)",
      border: "rgba(52,211,153,0.4)",
      glow: "0 0 12px rgba(52,211,153,0.5)",
    };
  if (lower.includes("market") || lower.includes("fatigue"))
    return {
      text: "#f472b6",
      bg: "rgba(244,114,182,0.12)",
      border: "rgba(244,114,182,0.4)",
      glow: "0 0 12px rgba(244,114,182,0.5)",
    };
  return {
    text: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.4)",
    glow: "0 0 12px rgba(167,139,250,0.5)",
  };
}

// ── Circular Score Gauge ──────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const radius = 40;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const cx = 52;
  const cy = 52;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg
        width={cx * 2}
        height={cy * 2}
        viewBox={`0 0 ${cx * 2} ${cy * 2}`}
        style={{ filter: "drop-shadow(0 0 8px #00e5ff)" }}
        aria-label={`Potential Score: ${score}%`}
        role="img"
      >
        {/* Glow filter */}
        <defs>
          <filter id="score-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dark track circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(0,229,255,0.08)"
          strokeWidth={strokeWidth + 2}
        />

        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(0,229,255,0.15)"
          strokeWidth={strokeWidth}
        />

        {/* Score arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#00e5ff"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          filter="url(#score-glow)"
        />

        {/* Center text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="18"
          fontFamily="'Geist Mono', 'JetBrains Mono', monospace"
          fontWeight="900"
          letterSpacing="-0.5"
        >
          {score}%
        </text>
      </svg>

      <span
        style={{
          fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
          fontSize: "9px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(0,229,255,0.6)",
          fontWeight: 700,
        }}
      >
        POTENTIAL
      </span>
    </div>
  );
}

// ── The Card Visual (exported for reuse) ──────────────────────────
export interface ShareableProjectCardVisualProps {
  projectName: string;
  potentialScore: number;
  causeOfDeath: string;
  price?: number;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export function ShareableProjectCardVisual({
  projectName,
  potentialScore,
  causeOfDeath,
  price,
  cardRef,
}: ShareableProjectCardVisualProps) {
  const scorePercent = Math.round(potentialScore * 10);
  const codColors = getCodColors(causeOfDeath);

  return (
    <div
      ref={cardRef}
      style={{
        width: "600px",
        height: "340px",
        position: "relative",
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,229,255,0.12) 0%, rgb(9, 15, 22) 55%)",
        border: "2px solid #00e5ff",
        borderRadius: "16px",
        boxShadow:
          "0 0 20px #00e5ff, 0 0 60px rgba(0,229,255,0.3), inset 0 0 30px rgba(0,229,255,0.05)",
        overflow: "hidden",
        flexShrink: 0,
        fontFamily: "inherit",
      }}
    >
      {/* Scanline texture */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)",
          pointerEvents: "none",
          zIndex: 1,
          borderRadius: "14px",
        }}
      />

      {/* Holographic foil sheen */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, transparent 0%, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 2,
          borderRadius: "14px",
        }}
      />

      {/* Ambient cyan corner glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Main content layer */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "0",
        }}
      >
        {/* ── Top strip ─────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 22px 14px",
            borderBottom: "1px solid rgba(0,229,255,0.15)",
          }}
        >
          {/* Wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            <span style={{ color: "rgba(0,229,255,0.7)", fontSize: "11px" }}>
              ⚡
            </span>
            <span style={{ color: "white" }}>Half</span>
            <span style={{ color: "#00e5ff" }}>Built</span>
          </div>

          {/* TRADEABLE badge */}
          <div
            style={{
              fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(0,229,255,0.65)",
              border: "1px solid rgba(0,229,255,0.35)",
              borderRadius: "999px",
              padding: "3px 10px",
            }}
          >
            TRADEABLE
          </div>
        </div>

        {/* ── Main body ─────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "stretch",
            padding: "20px 22px 0",
            gap: "24px",
          }}
        >
          {/* Left column */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "12px",
              minWidth: 0,
            }}
          >
            {/* Dead project label */}
            <div
              style={{
                fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "rgba(0,229,255,0.55)",
              }}
            >
              DEAD PROJECT
            </div>

            {/* Project name */}
            <div
              style={{
                fontFamily:
                  "'Cabinet Grotesk', 'Bricolage Grotesque', 'Mona Sans', sans-serif",
                fontSize:
                  projectName.length > 16
                    ? "32px"
                    : projectName.length > 10
                      ? "40px"
                      : "48px",
                fontWeight: 900,
                color: "white",
                lineHeight: 1.0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                letterSpacing: "-0.02em",
              }}
            >
              {projectName}
            </div>

            {/* CoD pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "999px",
                border: `1px solid ${codColors.border}`,
                background: codColors.bg,
                boxShadow: codColors.glow,
                fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
                fontSize: "11px",
                fontWeight: 700,
                color: codColors.text,
                width: "fit-content",
              }}
            >
              <span>☠</span>
              <span>{causeOfDeath}</span>
            </div>

            {/* Price (optional) */}
            {price !== undefined && (
              <div
                style={{
                  fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: "0.03em",
                }}
              >
                ASK:{" "}
                <span style={{ color: "rgba(255,255,255,0.9)" }}>
                  ${price.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Right column — Score gauge */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              paddingTop: "4px",
            }}
          >
            <ScoreGauge score={scorePercent} />
          </div>
        </div>

        {/* ── Footer strip ──────────────────────────── */}
        <div
          style={{
            padding: "12px 22px",
            borderTop: "1px solid rgba(0,229,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "14px",
          }}
        >
          {/* Resurrect text */}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span
              style={{
                fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
                fontSize: "8px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(0,229,255,0.55)",
                fontWeight: 700,
              }}
            >
              RESURRECT THIS ON
            </span>
            <span
              style={{
                fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
                fontSize: "13px",
                fontWeight: 800,
                color: "white",
                letterSpacing: "0.02em",
                textShadow: "0 0 12px rgba(0,229,255,0.6)",
              }}
            >
              HalfBuilt.com
            </span>
          </div>

          {/* QR code */}
          <div
            style={{
              opacity: 0.85,
              filter: "drop-shadow(0 0 4px rgba(0,229,255,0.3))",
            }}
          >
            <QRCodeSVG />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dialog wrapper props ──────────────────────────────────────────
export interface ShareableProjectCardProps {
  projectName: string;
  potentialScore: number;
  causeOfDeath: string;
  price?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Full shareable card dialog ────────────────────────────────────
export function ShareableProjectCard({
  projectName,
  potentialScore,
  causeOfDeath,
  price,
  open,
  onOpenChange,
}: ShareableProjectCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const scorePercent = Math.round(potentialScore * 10);

  function handleCopyLink() {
    const url = `https://halfbuilt.com/project/${encodeURIComponent(projectName.toLowerCase().replace(/\s+/g, "-"))}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Could not copy link"));
  }

  async function handleDownload() {
    if (!cardRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to capture card");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "halfbuilt-project-card.png";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Card saved as PNG!");
      }, "image/png");
    } catch {
      toast.error("Download failed. Try screenshotting instead.");
    } finally {
      setIsCapturing(false);
    }
  }

  function handleTwitterShare() {
    const tweetText = encodeURIComponent(
      `My project scored ${scorePercent}% on @HalfBuilt! 🔥`,
    );
    const url = encodeURIComponent("https://halfbuilt.com");
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetText}&url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="share_card.modal"
        className="max-w-[680px] w-full p-0 gap-0 border-[rgba(0,229,255,0.25)] bg-[oklch(0.07_0.008_200)] backdrop-blur-xl overflow-hidden rounded-2xl"
        style={{ background: "oklch(0.07 0.008 200 / 0.98)" }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, #00e5ff 50%, transparent)",
            opacity: 0.6,
          }}
        />

        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,229,255,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="relative">
          {/* Header */}
          <DialogHeader className="px-7 pt-7 pb-5 border-b border-[rgba(0,229,255,0.12)]">
            <div className="flex items-center justify-between pr-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(0,229,255,0.1)",
                    border: "1px solid rgba(0,229,255,0.25)",
                  }}
                >
                  <Share2 className="h-4 w-4" style={{ color: "#00e5ff" }} />
                </div>
                <DialogTitle
                  className="font-display font-black text-xl text-white"
                  style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
                >
                  Share This Flex
                </DialogTitle>
              </div>

              <button
                type="button"
                data-ocid="share_card.close_button"
                onClick={() => onOpenChange(false)}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-150 outline-none focus-visible:ring-2"
                style={
                  {
                    "--tw-ring-color": "rgba(0,229,255,0.5)",
                  } as React.CSSProperties
                }
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p
              className="text-sm mt-2"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Download as PNG or share your Potential Score on X/Twitter.
            </p>
          </DialogHeader>

          {/* Card preview area */}
          <div
            className="px-7 py-6 flex justify-center items-center"
            style={{ background: "rgba(0,0,0,0.2)" }}
          >
            {/* Scale wrapper for smaller screens */}
            <div
              style={{
                maxWidth: "100%",
                overflowX: "auto",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  transform: "scale(0.95)",
                  transformOrigin: "center center",
                }}
              >
                <ShareableProjectCardVisual
                  projectName={projectName}
                  potentialScore={potentialScore}
                  causeOfDeath={causeOfDeath}
                  price={price}
                  cardRef={cardRef}
                />
              </div>
            </div>
          </div>

          {/* Action row */}
          <div className="px-7 pb-7 pt-1 flex items-center gap-3 flex-wrap">
            {/* Copy Link */}
            <button
              type="button"
              data-ocid="share_card.copy_link.button"
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 outline-none focus-visible:ring-2"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.8)",
                fontFamily: "'Geist Mono', monospace",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.09)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Link
            </button>

            {/* Twitter share */}
            <button
              type="button"
              data-ocid="share_card.twitter.button"
              onClick={handleTwitterShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 outline-none focus-visible:ring-2"
              style={{
                background: "rgba(29,155,240,0.1)",
                border: "1px solid rgba(29,155,240,0.35)",
                color: "rgba(29,155,240,0.9)",
                fontFamily: "'Geist Mono', monospace",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(29,155,240,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(29,155,240,0.1)";
              }}
            >
              <Twitter className="h-3.5 w-3.5" />
              Post on X
            </button>

            {/* Download Card */}
            <button
              type="button"
              data-ocid="share_card.download.button"
              onClick={handleDownload}
              disabled={isCapturing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 outline-none focus-visible:ring-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: isCapturing ? "rgba(0,229,255,0.6)" : "#00e5ff",
                border: "1px solid rgba(0,229,255,0.8)",
                color: "#000",
                fontFamily: "'Geist Mono', monospace",
                boxShadow: "0 0 16px rgba(0,229,255,0.35)",
              }}
              onMouseEnter={(e) => {
                if (!isCapturing) {
                  e.currentTarget.style.background = "#33eaff";
                  e.currentTarget.style.boxShadow =
                    "0 0 24px rgba(0,229,255,0.55)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isCapturing) {
                  e.currentTarget.style.background = "#00e5ff";
                  e.currentTarget.style.boxShadow =
                    "0 0 16px rgba(0,229,255,0.35)";
                }
              }}
            >
              <Download className="h-3.5 w-3.5" />
              {isCapturing ? "Capturing..." : "Download PNG"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
