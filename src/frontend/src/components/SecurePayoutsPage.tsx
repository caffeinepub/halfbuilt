import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lock,
  RefreshCw,
  Shield,
  Wallet,
} from "lucide-react";
import { type Variants, motion } from "motion/react";

// ── Types ─────────────────────────────────────────────────────────
interface SecurePayoutsPageProps {
  onBack: () => void;
}

type PayoutStatus = "Pending" | "Cleared" | "Transferred";

interface PayoutRow {
  id: number;
  date: string;
  projectName: string;
  amount: string;
  status: PayoutStatus;
}

// ── Sample data ───────────────────────────────────────────────────
const PAYOUT_HISTORY: PayoutRow[] = [
  {
    id: 1,
    date: "Jan 14, 2026",
    projectName: "FlowSync",
    amount: "$2,142.00",
    status: "Transferred",
  },
  {
    id: 2,
    date: "Dec 28, 2025",
    projectName: "PricePulse",
    amount: "$3,382.00",
    status: "Transferred",
  },
  {
    id: 3,
    date: "Feb 2, 2026",
    projectName: "CodeMentor AI",
    amount: "$1,691.00",
    status: "Cleared",
  },
  {
    id: 4,
    date: "Feb 18, 2026",
    projectName: "GigStack",
    amount: "$1,068.00",
    status: "Pending",
  },
  {
    id: 5,
    date: "Mar 1, 2026",
    projectName: "ChartBlocks",
    amount: "$1,424.00",
    status: "Pending",
  },
];

// ── Fee structure data ────────────────────────────────────────────
const FEE_ITEMS = [
  {
    label: "Platform Fee",
    percentage: 8,
    description: "Covers escrow, verification & marketplace ops",
    color: "bg-indigo-500",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    bgColor: "bg-indigo-500/8",
  },
  {
    label: "Payment Processing",
    percentage: 2.9,
    description: "Stripe processing on every transaction",
    color: "bg-cyan-400",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-400/30",
    bgColor: "bg-cyan-400/8",
  },
  {
    label: "Seller Payout",
    percentage: 89.1,
    description: "Transferred directly to your Stripe account",
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/8",
  },
];

// ── Status badge ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: PayoutStatus }) {
  if (status === "Transferred") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/12 text-emerald-400 border border-emerald-500/25">
        <CheckCircle2 className="h-3 w-3" />
        Transferred
      </span>
    );
  }
  if (status === "Cleared") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-400/12 text-cyan-400 border border-cyan-400/25">
        <RefreshCw className="h-3 w-3" />
        Cleared
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/12 text-amber-400 border border-amber-500/25">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  );
}

// ── Stripe Logo SVG ───────────────────────────────────────────────
function StripeLogo() {
  return (
    <svg
      role="img"
      aria-label="Stripe"
      width="52"
      height="22"
      viewBox="0 0 52 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Stripe</title>
      <path
        d="M4.96 7.86c0-.93.77-1.29 2.03-1.29 1.82 0 4.12.55 5.94 1.53V3.3C11.1 2.47 9.23 2.1 7.35 2.1 2.93 2.1 0 4.37 0 8.08c0 5.76 7.93 4.84 7.93 7.32 0 1.1-.96 1.46-2.29 1.46-1.98 0-4.52-.82-6.5-1.92v4.88c2.21.95 4.45 1.35 6.5 1.35 4.54 0 7.65-2.24 7.65-6.04-.04-6.22-7.93-5.12-7.93-7.27M20.42 0l-5.48 1.17-.02 18.1 5.5-1.16V0zm5.66 4.63L21.6 5.72v11.67l5.48-1.16V4.63zm0-3.74L21.6.66v4.9l4.48-.95V.89zm6.7 14.7V7.98c1.08-.4 2.8-.8 4.54-.83v-5c-1.68.08-3.34.79-4.54 1.65V3.3L27.3 4.46v13.5l5.48-1.17v.8zm9.73-5.26c0-3.36-.96-5.67-2.8-6.78 1.42-.62 2.8-2.3 2.8-4.46V3h-.04c.13-.96-.45-1.97-1.5-1.97C39.9 1.03 39 1.86 39 2.83v.13c0 1.26.82 2.22 2.03 2.22.53 0 .9-.17 1.2-.43v.19c0 1.78-1.02 2.68-2.32 2.68-1.2 0-2.08-.68-2.49-1.62L35.28 8.1c.7 2.15 2.5 3.6 4.95 3.6 2.5 0 4.26-1.53 4.8-3.67-.06.43-.28.88-.28 1.4 0 3.56 2.47 5.96 5.73 5.96 1.85 0 3.27-.74 4.31-1.95v1.9l4.92-1.05V6.01c0-3.3-2.1-5.4-5.28-5.4-3.22 0-5.42 2.1-5.42 5.4v.55h4.59v-.55c0-1.08.5-1.72 1.4-1.72.87 0 1.38.64 1.38 1.72v3.9c-.5.55-1.14.88-1.93.88-1.5 0-2.5-1.2-2.5-2.88z"
        fill="#635BFF"
      />
    </svg>
  );
}

// ── Fade-up animation variants ────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// ── Main Component ────────────────────────────────────────────────
export function SecurePayoutsPage({ onBack }: SecurePayoutsPageProps) {
  const totalTransferred = PAYOUT_HISTORY.filter(
    (r) => r.status === "Transferred",
  ).reduce(
    (sum, r) => sum + Number.parseFloat(r.amount.replace(/[$,]/g, "")),
    0,
  );

  const totalPending = PAYOUT_HISTORY.filter(
    (r) => r.status === "Pending",
  ).reduce(
    (sum, r) => sum + Number.parseFloat(r.amount.replace(/[$,]/g, "")),
    0,
  );

  return (
    <div
      data-ocid="payouts.page"
      className="min-h-screen bg-[#0a0f1e] text-white font-sans"
      style={{ fontFamily: "'Plus Jakarta Sans', 'General Sans', sans-serif" }}
    >
      {/* Subtle background texture */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.18_0.03_240/0.3)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom-right,_oklch(0.15_0.04_200/0.15)_0%,_transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* ── Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <button
            type="button"
            data-ocid="payouts.back.button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-[oklch(0.65_0.02_240)] hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Marketplace
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[oklch(0.16_0.03_240)] border border-[oklch(0.25_0.02_240/0.6)] flex items-center justify-center">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Secure Payouts
              </h1>
              <p className="mt-1 text-sm text-[oklch(0.62_0.02_240)]">
                Manage your payout preferences and track earnings
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          {/* ── Section 1: Stripe Connection ───────────────────── */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-[oklch(0.22_0.02_240/0.6)] bg-[oklch(0.12_0.015_240/0.8)] p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Wallet className="h-4 w-4 text-[oklch(0.62_0.02_240)]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[oklch(0.55_0.02_240)]">
                    Payment Provider
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs px-2.5 py-0.5 border-[oklch(0.35_0.01_240/0.5)] text-[oklch(0.55_0.02_240)] bg-[oklch(0.10_0.01_240/0.5)]"
                >
                  Not Connected
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                    <StripeLogo />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-snug">
                      Connect your Stripe account
                    </p>
                    <p className="mt-0.5 text-xs text-[oklch(0.58_0.02_240)] leading-relaxed max-w-xs">
                      Link Stripe to receive payouts directly to your bank
                      account when projects are sold.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[oklch(0.50_0.02_240)]">
                      <Lock className="h-3 w-3 text-emerald-500/70" />
                      <span>
                        Funds held in escrow until transfer is confirmed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    data-ocid="payouts.stripe_connect.button"
                    className="group relative w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200"
                    style={{
                      background: "#635BFF",
                      boxShadow: "0 0 0 0 rgba(99, 91, 255, 0)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 20px rgba(99, 91, 255, 0.4), 0 4px 12px rgba(99, 91, 255, 0.25)";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#7C75FF";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        "0 0 0 0 rgba(99, 91, 255, 0)";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "#635BFF";
                    }}
                  >
                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                    Connect with Stripe
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Section 2: Fee Structure ────────────────────────── */}
          <motion.div
            variants={itemVariants}
            data-ocid="payouts.fee_structure.section"
          >
            <div className="rounded-2xl border border-[oklch(0.22_0.02_240/0.6)] bg-[oklch(0.12_0.015_240/0.8)] p-6 backdrop-blur-sm">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-white">
                  Fee Structure
                </h2>
                <p className="mt-0.5 text-xs text-[oklch(0.55_0.02_240)]">
                  Every transaction is transparent. No hidden costs.
                </p>
              </div>

              {/* Segmented bar */}
              <div className="mb-6">
                <div className="flex rounded-full overflow-hidden h-3 gap-px bg-[oklch(0.10_0.01_240)]">
                  <div
                    className="bg-indigo-500 transition-all"
                    style={{ width: "8%" }}
                    title="8% Platform Fee"
                  />
                  <div
                    className="bg-cyan-400 transition-all"
                    style={{ width: "2.9%" }}
                    title="2.9% Payment Processing"
                  />
                  <div
                    className="bg-emerald-500 flex-1 transition-all"
                    title="89.1% Seller Payout"
                  />
                </div>
                {/* Bar labels */}
                <div className="mt-2 flex text-[10px] text-[oklch(0.48_0.02_240)]">
                  <span style={{ width: "8%" }} className="text-indigo-400/70">
                    8%
                  </span>
                  <span
                    style={{ width: "2.9%" }}
                    className="text-cyan-400/70 whitespace-nowrap"
                  >
                    2.9%
                  </span>
                  <span className="flex-1 text-right text-emerald-400/70">
                    89.1%
                  </span>
                </div>
              </div>

              {/* Fee cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FEE_ITEMS.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-xl p-4 border ${item.borderColor} ${item.bgColor}`}
                  >
                    <div
                      className={`text-2xl font-bold font-mono tracking-tight ${item.textColor}`}
                    >
                      {item.percentage}%
                    </div>
                    <div className="mt-1 text-xs font-semibold text-white/80">
                      {item.label}
                    </div>
                    <div className="mt-1 text-xs text-[oklch(0.50_0.02_240)] leading-relaxed">
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Section 3: Payout History ───────────────────────── */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-[oklch(0.22_0.02_240/0.6)] bg-[oklch(0.12_0.015_240/0.8)] p-6 backdrop-blur-sm">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-white">
                  Payout History
                </h2>
                <p className="mt-0.5 text-xs text-[oklch(0.55_0.02_240)]">
                  All payouts processed through HalfBuilt escrow
                </p>
              </div>

              {PAYOUT_HISTORY.length === 0 ? (
                <div
                  data-ocid="payouts.history.empty_state"
                  className="py-16 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[oklch(0.16_0.02_240)] border border-[oklch(0.22_0.02_240)] flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-[oklch(0.42_0.02_240)]" />
                  </div>
                  <p className="text-sm text-[oklch(0.50_0.02_240)]">
                    No payouts yet
                  </p>
                  <p className="mt-1 text-xs text-[oklch(0.40_0.02_240)]">
                    Payouts appear here once a project sale is completed
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto -mx-6 px-6">
                    <Table data-ocid="payouts.history.table">
                      <TableHeader>
                        <TableRow className="border-[oklch(0.20_0.015_240/0.5)] hover:bg-transparent">
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.48_0.02_240)] py-3 pl-0">
                            Date
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.48_0.02_240)] py-3">
                            Project Name
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.48_0.02_240)] py-3">
                            Amount
                          </TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.48_0.02_240)] py-3 text-right pr-0">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {PAYOUT_HISTORY.map((row) => (
                          <TableRow
                            key={row.id}
                            data-ocid={`payouts.history.row.${row.id}`}
                            className="border-[oklch(0.18_0.015_240/0.4)] hover:bg-white/[0.02] transition-colors"
                          >
                            <TableCell className="py-3.5 pl-0 text-sm text-[oklch(0.60_0.02_240)] whitespace-nowrap font-mono text-xs">
                              {row.date}
                            </TableCell>
                            <TableCell className="py-3.5 text-sm font-medium text-white">
                              {row.projectName}
                            </TableCell>
                            <TableCell className="py-3.5 text-sm font-mono font-semibold text-white tabular-nums">
                              {row.amount}
                            </TableCell>
                            <TableCell className="py-3.5 text-right pr-0">
                              <StatusBadge status={row.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Summary footer */}
                  <div className="mt-5 pt-5 border-t border-[oklch(0.18_0.015_240/0.4)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-[oklch(0.45_0.02_240)] mb-0.5">
                          Total Transferred
                        </div>
                        <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                          $
                          {totalTransferred.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div className="h-8 w-px bg-[oklch(0.20_0.015_240/0.5)]" />
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-[oklch(0.45_0.02_240)] mb-0.5">
                          Pending
                        </div>
                        <div className="text-base font-bold font-mono text-amber-400 tabular-nums">
                          $
                          {totalPending.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[oklch(0.42_0.02_240)]">
                      Amounts reflect post-fee seller payouts
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* ── Footer note ─────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[oklch(0.10_0.01_240/0.5)] border border-[oklch(0.18_0.015_240/0.4)]">
              <Lock className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500/60" />
              <p className="text-xs text-[oklch(0.50_0.02_240)] leading-relaxed">
                All transactions are secured via HalfBuilt escrow. Funds are
                never released until both parties confirm the handoff. Need
                help?{" "}
                <button
                  type="button"
                  className="text-[oklch(0.65_0.06_200)] hover:text-white transition-colors underline underline-offset-2"
                >
                  Contact support
                </button>
                .
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
