import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  Globe,
  Lock,
  Send,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ── Stage definitions ─────────────────────────────────────────────
type StageStatus = "completed" | "active" | "future";

interface Stage {
  id: number;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  estimatedDate: string;
  status: StageStatus;
}

const STAGES: Stage[] = [
  {
    id: 1,
    label: "Payment in Escrow",
    description: "Funds secured & verified",
    icon: Lock,
    estimatedDate: "Mar 6, 2026",
    status: "completed",
  },
  {
    id: 2,
    label: "Repo Transfer",
    description: "GitHub ownership transferred",
    icon: CheckCircle2,
    estimatedDate: "Mar 8, 2026",
    status: "active",
  },
  {
    id: 3,
    label: "Domain Handoff",
    description: "DNS & domain keys passed",
    icon: Globe,
    estimatedDate: "Mar 9, 2026",
    status: "future",
  },
  {
    id: 4,
    label: "Final Payout",
    description: "Seller receives payment",
    icon: DollarSign,
    estimatedDate: "Mar 10, 2026",
    status: "future",
  },
];

// ── Chat message definitions ──────────────────────────────────────
type MessageSender = "buyer" | "seller";

interface ChatMessage {
  id: number;
  sender: MessageSender;
  senderName: string;
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    sender: "seller",
    senderName: "devfounder",
    text: "Just pushed final commit. All tests passing. Ready to transfer repo.",
    timestamp: "10:24 AM",
  },
  {
    id: 2,
    sender: "buyer",
    senderName: "Alex M.",
    text: "Great! Can you confirm the domain is also included?",
    timestamp: "10:31 AM",
  },
  {
    id: 3,
    sender: "seller",
    senderName: "devfounder",
    text: "Yes, transferring flowsync.com too. Will update DNS in ~24h.",
    timestamp: "10:35 AM",
  },
  {
    id: 4,
    sender: "buyer",
    senderName: "Alex M.",
    text: "Perfect. Confirming repo access once you add me as owner.",
    timestamp: "10:38 AM",
  },
];

// ── Stage node component ──────────────────────────────────────────
function StageNode({ stage, index }: { stage: Stage; index: number }) {
  const Icon = stage.icon;
  const isCompleted = stage.status === "completed";
  const isActive = stage.status === "active";

  return (
    <div
      data-ocid={`transaction.stage.item.${index + 1}`}
      className="flex flex-col items-center gap-3 flex-1 min-w-0"
    >
      {/* Node circle */}
      <div className="relative flex-shrink-0">
        {/* Pulsing ring for active stage */}
        {isActive && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping opacity-40 bg-[oklch(0.62_0.24_285)]" />
            <span
              className="absolute -inset-2 rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.62 0.24 285 / 0.6) 0%, transparent 70%)",
              }}
            />
          </>
        )}
        <div
          className={`
            relative z-10 w-12 h-12 rounded-full flex items-center justify-center
            transition-all duration-300
            ${
              isCompleted
                ? "bg-[oklch(0.7_0.15_195/0.25)] border-2 border-[oklch(0.7_0.15_195)] shadow-[0_0_16px_oklch(0.7_0.15_195/0.5)]"
                : isActive
                  ? "bg-[oklch(0.62_0.24_285/0.2)] border-2 border-[oklch(0.62_0.24_285)] shadow-[0_0_20px_oklch(0.62_0.24_285/0.6),0_0_40px_oklch(0.62_0.24_285/0.25)]"
                  : "bg-white/[0.03] border-2 border-white/[0.15]"
            }
          `}
        >
          <Icon
            className={`h-5 w-5 ${
              isCompleted
                ? "text-[oklch(0.85_0.15_195)]"
                : isActive
                  ? "text-[oklch(0.78_0.2_285)]"
                  : "text-white/20"
            }`}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="text-center min-w-0 px-1">
        <p
          className={`font-mono font-semibold text-xs sm:text-sm leading-tight mb-1 ${
            isCompleted
              ? "text-[oklch(0.85_0.15_195)]"
              : isActive
                ? "text-[oklch(0.78_0.2_285)]"
                : "text-white/30"
          }`}
          style={
            isActive
              ? {
                  textShadow:
                    "0 0 12px oklch(0.62 0.24 285 / 0.7), 0 0 24px oklch(0.62 0.24 285 / 0.3)",
                }
              : {}
          }
        >
          {stage.label}
        </p>
        <p
          className={`text-[10px] font-mono leading-tight ${
            isCompleted
              ? "text-[oklch(0.7_0.12_195/0.7)]"
              : isActive
                ? "text-[oklch(0.62_0.18_285/0.8)]"
                : "text-white/20"
          }`}
        >
          {stage.description}
        </p>
        <p
          className={`text-[9px] font-mono mt-1.5 ${
            isCompleted
              ? "text-[oklch(0.6_0.1_195/0.6)]"
              : isActive
                ? "text-[oklch(0.55_0.15_285/0.6)]"
                : "text-white/15"
          }`}
        >
          {isCompleted ? "✓ " : ""}
          {stage.estimatedDate}
        </p>
      </div>
    </div>
  );
}

// ── Active Stage Card (with countdown + dispute) ──────────────────
function ActiveStageCard() {
  // Start countdown from 14h 23m 17s
  const INITIAL_SECONDS = 14 * 3600 + 23 * 60 + 17;
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeConfirmed, setDisputeConfirmed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s remaining`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
      className="rounded-xl px-5 py-4 flex flex-col gap-4
        bg-[oklch(0.62_0.24_285/0.08)] border border-[oklch(0.62_0.24_285/0.25)]
        relative overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 0% 50%, oklch(0.62 0.24 285 / 0.1) 0%, transparent 60%)",
        }}
      />

      {/* Main stage info */}
      <div className="relative z-10 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-[oklch(0.62_0.24_285/0.2)] border border-[oklch(0.62_0.24_285/0.4)] flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="h-4 w-4 text-[oklch(0.78_0.2_285)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono font-semibold text-[oklch(0.78_0.2_285)] mb-0.5">
            Current Stage: Repo Transfer
          </p>
          <p className="text-xs font-mono text-white/50 leading-relaxed">
            The seller is adding Alex M. as a repository owner on GitHub.
            You&apos;ll receive an email invitation to confirm access. Estimated
            completion: Mar 8, 2026.
          </p>

          {/* Countdown timer */}
          <div className="flex items-center gap-1.5 mt-2">
            <Clock className="h-3 w-3 text-cyan-400/70 flex-shrink-0" />
            <span className="font-mono text-xs text-cyan-400 tracking-wide">
              {timeStr}
            </span>
          </div>
        </div>
      </div>

      {/* Dispute button row */}
      <div className="relative z-10 flex items-center gap-3">
        <button
          type="button"
          data-ocid="transaction.dispute.button"
          onClick={() => {
            if (!disputeConfirmed) setDisputeOpen((v) => !v);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
          style={{
            border: "1px solid rgba(239,68,68,0.4)",
            color: "rgba(252,165,165,1)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          Raise a Dispute
        </button>
      </div>

      {/* Dispute confirmation panel */}
      <AnimatePresence>
        {disputeOpen && !disputeConfirmed && (
          <motion.div
            key="dispute-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 overflow-hidden"
          >
            <div className="rounded-lg px-4 py-3 border border-red-500/25 bg-red-500/[0.06] flex flex-col gap-3">
              <p className="text-xs font-mono text-white/60 leading-relaxed">
                Are you sure you want to raise a dispute? This will pause the
                transaction and notify HalfBuilt support.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-ocid="transaction.dispute.confirm_button"
                  onClick={() => {
                    setDisputeConfirmed(true);
                    setDisputeOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-150 outline-none"
                  style={{
                    background: "rgba(239,68,68,0.85)",
                    color: "white",
                    border: "1px solid rgba(239,68,68,0.6)",
                  }}
                >
                  Confirm Dispute
                </button>
                <button
                  type="button"
                  data-ocid="transaction.dispute.cancel_button"
                  onClick={() => setDisputeOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-white/50 hover:text-white/80 transition-colors outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {disputeConfirmed && (
          <motion.div
            key="dispute-success"
            data-ocid="transaction.dispute.success_state"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="relative z-10 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06]">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <p className="text-xs font-mono text-emerald-300">
                Dispute raised. Our team will respond within 2h.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Transaction info bar ──────────────────────────────────────────
function TransactionInfoBar() {
  const infoItems = [
    { label: "Project", value: "FlowSync", icon: "📦" },
    { label: "Transaction ID", value: "TXN-28471-HB", icon: null, mono: true },
    {
      label: "Amount",
      value: "$2,400",
      icon: null,
      mono: true,
      highlight: true,
    },
    { label: "Buyer", value: "Alex M.", icon: null },
    { label: "Seller", value: "devfounder", icon: null, mono: true },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
      {infoItems.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5">
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/35">
            {item.label}
          </span>
          <span
            className={`text-xs font-mono font-semibold ${
              item.highlight
                ? "text-[oklch(0.85_0.15_195)] tracking-wide"
                : "text-white/80"
            }`}
          >
            {item.icon ? `${item.icon} ` : ""}
            {item.value}
          </span>
        </div>
      ))}
      {/* Status pill */}
      <div className="ml-auto flex-shrink-0">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[oklch(0.62_0.24_285/0.15)] border border-[oklch(0.62_0.24_285/0.35)] text-[oklch(0.78_0.2_285)]">
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(0.62_0.24_285)] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[oklch(0.62_0.24_285)]" />
          </span>
          In Progress
        </span>
      </div>
    </div>
  );
}

// ── Chat panel ────────────────────────────────────────────────────
function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [nextId, setNextId] = useState(5);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }

  function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        id: nextId,
        sender: "buyer",
        senderName: "Alex M.",
        text: trimmed,
        timestamp: timeStr,
      },
    ]);
    setNextId((n) => n + 1);
    setInputValue("");
    // Scroll after state update flushes
    setTimeout(scrollToBottom, 50);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <section
      data-ocid="transaction.chat.section"
      className="flex flex-col h-full rounded-2xl overflow-hidden
        bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]"
    >
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08] flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[oklch(0.62_0.24_285/0.15)] border border-[oklch(0.62_0.24_285/0.3)] flex items-center justify-center">
          <User className="h-4 w-4 text-[oklch(0.78_0.2_285)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono font-semibold text-sm text-white/90 leading-tight">
            Buyer-Seller Coordination
          </p>
          <p className="text-[10px] font-mono text-white/35 leading-tight">
            FlowSync · TXN-28471-HB
          </p>
        </div>
        {/* Online indicator */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[oklch(0.8_0.18_145/0.8)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[oklch(0.78_0.2_145)] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[oklch(0.78_0.2_145)]" />
          </span>
          Both online
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isBuyer = msg.sender === "buyer";
              const ocidIndex = index + 1;
              return (
                <motion.div
                  key={msg.id}
                  data-ocid={
                    index < 4
                      ? `transaction.chat.message.${ocidIndex}`
                      : undefined
                  }
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex flex-col gap-1 ${isBuyer ? "items-end" : "items-start"}`}
                >
                  {/* Sender name + timestamp */}
                  <div
                    className={`flex items-center gap-2 ${isBuyer ? "flex-row-reverse" : ""}`}
                  >
                    <span className="text-[9px] font-mono text-white/35 font-semibold uppercase tracking-wider">
                      {msg.senderName}
                    </span>
                    <span className="flex items-center gap-0.5 text-[9px] font-mono text-white/25">
                      <Clock className="h-2 w-2" />
                      {msg.timestamp}
                    </span>
                  </div>
                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed font-mono ${
                      isBuyer
                        ? "bg-[oklch(0.62_0.24_285/0.2)] border border-[oklch(0.62_0.24_285/0.35)] text-[oklch(0.88_0.12_285)] rounded-tr-sm"
                        : "bg-white/[0.06] border border-white/[0.1] text-white/80 rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Chat input */}
      <div className="px-4 py-3 border-t border-white/[0.08] flex items-center gap-2 flex-shrink-0 bg-white/[0.02]">
        <input
          data-ocid="transaction.chat.input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5
            text-xs font-mono text-white/85 placeholder:text-white/25
            focus:outline-none focus:border-[oklch(0.62_0.24_285/0.5)] focus:ring-1 focus:ring-[oklch(0.62_0.24_285/0.2)]
            transition-colors duration-150"
          autoComplete="off"
        />
        <Button
          data-ocid="transaction.chat.submit_button"
          type="button"
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="w-9 h-9 p-0 rounded-xl flex-shrink-0
            bg-[oklch(0.62_0.24_285/0.8)] hover:bg-[oklch(0.62_0.24_285)]
            border border-[oklch(0.62_0.24_285/0.5)]
            text-white transition-all duration-150
            disabled:opacity-30 disabled:cursor-not-allowed
            hover:shadow-[0_0_12px_oklch(0.62_0.24_285/0.5)]"
        >
          <Send className="h-3.5 w-3.5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </section>
  );
}

// ── Main TransactionStatusPage ────────────────────────────────────
interface TransactionStatusPageProps {
  onBack: () => void;
}

export function TransactionStatusPage({ onBack }: TransactionStatusPageProps) {
  return (
    <div
      data-ocid="transaction.page"
      className="min-h-screen bg-background text-foreground"
    >
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[oklch(0.62_0.24_285/0.06)] blur-[160px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[oklch(0.7_0.15_195/0.04)] blur-[140px] pointer-events-none" />

      {/* Grid texture background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.55 0.2 285 / 1) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.2 285 / 1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Page content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-between mb-8 sm:mb-12"
        >
          <div className="flex items-center gap-4">
            <button
              data-ocid="transaction.back.button"
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 rounded-lg
                text-white/50 hover:text-white/90
                bg-white/[0.04] hover:bg-white/[0.08]
                border border-white/[0.08] hover:border-white/[0.15]
                transition-all duration-150 text-sm font-mono
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.24_285/0.5)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>

            <div className="hidden sm:block h-5 w-px bg-white/15" />

            <div className="hidden sm:flex flex-col gap-0">
              <h1 className="font-display font-black text-xl sm:text-2xl text-foreground leading-tight">
                Secure Handoff
              </h1>
              <p className="text-xs font-mono text-white/40">
                Real-time transaction status
              </p>
            </div>
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[oklch(0.62_0.24_285/0.08)] border border-[oklch(0.62_0.24_285/0.2)]">
            <Lock className="h-3.5 w-3.5 text-[oklch(0.78_0.2_285)]" />
            <span className="text-[11px] font-mono font-semibold text-[oklch(0.78_0.2_285)]">
              Escrow Protected
            </span>
          </div>
        </motion.div>

        {/* Mobile title */}
        <div className="sm:hidden mb-6">
          <h1 className="font-display font-black text-2xl text-foreground">
            Secure Handoff
          </h1>
          <p className="text-xs font-mono text-white/40 mt-0.5">
            Real-time transaction status
          </p>
        </div>

        {/* Main layout: 2 columns on desktop */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* LEFT: Progress tracker + transaction info */}
          <div className="flex flex-col gap-6 lg:w-[60%]">
            {/* Transaction info bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            >
              <TransactionInfoBar />
            </motion.div>

            {/* Progress tracker */}
            <motion.section
              data-ocid="transaction.tracker.section"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="rounded-2xl p-6 sm:p-8
                bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]
                relative overflow-hidden"
            >
              {/* Inner glow accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.62_0.24_285/0.05)] via-transparent to-[oklch(0.7_0.15_195/0.04)] rounded-2xl pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[oklch(0.62_0.24_285/0.5)] to-transparent pointer-events-none" />

              <div className="relative z-10">
                {/* Section label */}
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/40">
                    Transaction Progress
                  </span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[10px] font-mono text-[oklch(0.62_0.24_285/0.7)]">
                    Stage 2 of 4
                  </span>
                </div>

                {/* Stage nodes with connector lines — horizontal layout */}
                <div className="relative">
                  {/* Connector track (desktop) */}
                  <div
                    className="hidden sm:block absolute"
                    style={{
                      top: "24px",
                      left: "calc(12.5% + 24px)",
                      right: "calc(12.5% + 24px)",
                      height: "2px",
                    }}
                    aria-hidden="true"
                  >
                    {/* Full grey track */}
                    <div className="absolute inset-0 bg-white/[0.08] rounded-full" />
                    {/* Completed segment — from start to ~33% */}
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                      style={{
                        width: "33.33%",
                        background:
                          "linear-gradient(90deg, oklch(0.7 0.15 195 / 0.8), oklch(0.7 0.15 195 / 0.5))",
                        boxShadow: "0 0 6px oklch(0.7 0.15 195 / 0.5)",
                      }}
                    />
                  </div>

                  {/* Mobile: vertical connector */}
                  <div
                    className="sm:hidden absolute left-6 top-6 bottom-6 w-px"
                    aria-hidden="true"
                  >
                    <div className="h-full bg-white/[0.08]" />
                    <div
                      className="absolute top-0 left-0 w-full rounded-full"
                      style={{
                        height: "25%",
                        background: "oklch(0.7 0.15 195 / 0.6)",
                        boxShadow: "0 0 4px oklch(0.7 0.15 195 / 0.4)",
                      }}
                    />
                  </div>

                  {/* Stage nodes */}
                  <div className="hidden sm:flex items-start gap-2">
                    {STAGES.map((stage, i) => (
                      <StageNode key={stage.id} stage={stage} index={i} />
                    ))}
                  </div>

                  {/* Mobile: vertical layout */}
                  <div className="sm:hidden flex flex-col gap-6 pl-2">
                    {STAGES.map((stage, i) => {
                      const Icon = stage.icon;
                      const isCompleted = stage.status === "completed";
                      const isActive = stage.status === "active";
                      return (
                        <div
                          key={stage.id}
                          data-ocid={`transaction.stage.item.${i + 1}`}
                          className="flex items-start gap-4"
                        >
                          <div className="relative flex-shrink-0 mt-0.5">
                            {isActive && (
                              <span className="absolute inset-0 rounded-full animate-ping opacity-40 bg-[oklch(0.62_0.24_285)]" />
                            )}
                            <div
                              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                                isCompleted
                                  ? "bg-[oklch(0.7_0.15_195/0.2)] border-[oklch(0.7_0.15_195)] shadow-[0_0_12px_oklch(0.7_0.15_195/0.4)]"
                                  : isActive
                                    ? "bg-[oklch(0.62_0.24_285/0.15)] border-[oklch(0.62_0.24_285)] shadow-[0_0_16px_oklch(0.62_0.24_285/0.5)]"
                                    : "bg-white/[0.02] border-white/[0.1]"
                              }`}
                            >
                              <Icon
                                className={`h-4 w-4 ${
                                  isCompleted
                                    ? "text-[oklch(0.85_0.15_195)]"
                                    : isActive
                                      ? "text-[oklch(0.78_0.2_285)]"
                                      : "text-white/20"
                                }`}
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p
                              className={`font-mono font-semibold text-sm ${
                                isCompleted
                                  ? "text-[oklch(0.85_0.15_195)]"
                                  : isActive
                                    ? "text-[oklch(0.78_0.2_285)]"
                                    : "text-white/30"
                              }`}
                              style={
                                isActive
                                  ? {
                                      textShadow:
                                        "0 0 10px oklch(0.62 0.24 285 / 0.6)",
                                    }
                                  : {}
                              }
                            >
                              {stage.label}
                            </p>
                            <p
                              className={`text-xs font-mono mt-0.5 ${
                                isCompleted
                                  ? "text-[oklch(0.7_0.12_195/0.6)]"
                                  : isActive
                                    ? "text-[oklch(0.62_0.18_285/0.7)]"
                                    : "text-white/20"
                              }`}
                            >
                              {stage.description}
                            </p>
                            <p
                              className={`text-[10px] font-mono mt-1 ${
                                isCompleted
                                  ? "text-[oklch(0.6_0.1_195/0.5)]"
                                  : isActive
                                    ? "text-[oklch(0.55_0.15_285/0.5)]"
                                    : "text-white/15"
                              }`}
                            >
                              {isCompleted && "✓ "}
                              {stage.estimatedDate}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Stage detail card — active stage spotlight */}
            <ActiveStageCard />
          </div>

          {/* RIGHT: Chat panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
            className="lg:w-[40%] h-[520px] lg:h-auto lg:min-h-[580px]"
          >
            <ChatPanel />
          </motion.div>
        </div>

        {/* Action row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          className="mt-6 flex flex-wrap items-center justify-between gap-4 px-5 py-4 rounded-xl
            bg-white/[0.02] border border-white/[0.06]"
        >
          <div className="flex items-center gap-2 text-xs font-mono text-white/40">
            <Lock className="h-3.5 w-3.5 text-[oklch(0.7_0.15_195/0.6)]" />
            <span>Funds are held in escrow until all stages are complete.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="h-8 px-4 text-xs font-mono
                bg-[oklch(0.62_0.24_285/0.8)] hover:bg-[oklch(0.62_0.24_285)]
                border border-[oklch(0.62_0.24_285/0.5)] text-white
                hover:shadow-[0_0_12px_oklch(0.62_0.24_285/0.4)]
                transition-all duration-150"
            >
              Confirm Repo Access
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
