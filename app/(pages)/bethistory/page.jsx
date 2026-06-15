"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import "./bethistory.css";
import {
  FiArrowLeft,
  FiLoader,
} from "react-icons/fi";
import {
  TbTrophy,
  TbChartCandle,
  TbCurrencyDollar,
} from "react-icons/tb";

const BASE = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => {
  if (typeof window === "undefined") return "";
  const type  = localStorage.getItem("cpx_token_type") || "Bearer";
  const token = localStorage.getItem("cpx_token") || "";
  return `${type} ${token}`;
};

// ─── Status badge ─────────────────────────────────────────────────
function StatusBadge({ isWin, isLoss, isPending }) {
  if (isWin)     return <span className="hist-badge hist-badge-win">WIN</span>;
  if (isLoss)    return <span className="hist-badge hist-badge-loss">LOSS</span>;
  if (isPending) return <span className="hist-badge hist-badge-pending">PENDING</span>;
  return null;
}

// ─── Filter Tabs ──────────────────────────────────────────────────
function FilterTabs({ active, onChange }) {
  const tabs = [
    { key: "all",     label: "All" },
    { key: "win",     label: "Won" },
    { key: "loss",    label: "Lost" },
    { key: "pending", label: "Pending" },
  ];
  return (
    <div className="hist-filter-row">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`hist-filter-tab${active === t.key ? " hist-filter-active" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────
function SummaryCards({ bets }) {
  const won     = bets.filter((b) => parseFloat(b.win_amount  ?? 0) > 0);
  const lost    = bets.filter((b) => parseFloat(b.loss_amount ?? 0) > 0 && parseFloat(b.win_amount ?? 0) === 0);
  const totalWon  = won.reduce((s, b)  => s + parseFloat(b.win_amount  ?? 0), 0);
  const totalLost = lost.reduce((s, b) => s + parseFloat(b.loss_amount ?? 0), 0);
  const net = totalWon - totalLost;

  return (
    <div className="hist-summary-grid">
      <div className="hist-sum-card">
        <div className="hist-sum-label">Total</div>
        <div className="hist-sum-val hist-sum-gold">{bets.length}</div>
      </div>
      <div className="hist-sum-card">
        <div className="hist-sum-label">Won</div>
        <div className="hist-sum-val hist-sum-green">{won.length}</div>
      </div>
      <div className="hist-sum-card">
        <div className="hist-sum-label">Lost</div>
        <div className="hist-sum-val hist-sum-red">{lost.length}</div>
      </div>
      <div className="hist-sum-card">
        <div className="hist-sum-label">Net P&amp;L</div>
        <div className={`hist-sum-val ${net >= 0 ? "hist-sum-green" : "hist-sum-red"}`}>
          {net >= 0 ? "+" : ""}${net.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

// ─── Bet Row ──────────────────────────────────────────────────────
function BetRow({ bet }) {
  const isWin     = parseFloat(bet.win_amount  ?? 0) > 0;
  const isLoss    = parseFloat(bet.loss_amount ?? 0) > 0 && !isWin;
  const isPending = !isWin && !isLoss;

  const preds = [
    `#${bet.question_1_ans}`,
    bet.question_2_ans === 0 ? "Big"  : "Small",
    bet.question_3_ans === 0 ? "Odd"  : "Even",
    bet.question_4_ans === 0 ? "Rise" : "Fall",
  ];

  const date = bet.created_at
    ? new Date(bet.created_at).toLocaleString("en-IN", {
        day: "2-digit", month: "short",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

  return (
    <div className={`hist-bet-row${isWin ? " hist-row-win" : isLoss ? " hist-row-loss" : ""}`}>

      {/* Left — round + date */}
      <div className="hist-bet-left">
        <div className="hist-rnd-num">#{bet.round_id + 24000}</div>
        <div className="hist-rnd-date">{date}</div>
      </div>

      {/* Middle — prediction tags + badge */}
      <div className="hist-bet-mid">
        <div className="hist-pred-tags">
          {preds.map((p, i) => (
            <span key={i} className="hist-pred-tag">{p}</span>
          ))}
        </div>
        <StatusBadge isWin={isWin} isLoss={isLoss} isPending={isPending} />
      </div>

      {/* Right — amounts */}
      <div className="hist-bet-right">
        <div className="hist-bet-amount">${parseFloat(bet.amount).toFixed(2)}</div>
        {isWin     && <div className="hist-bet-pnl-win">+${parseFloat(bet.win_amount).toFixed(2)}</div>}
        {isLoss    && <div className="hist-bet-pnl-loss">-${parseFloat(bet.loss_amount).toFixed(2)}</div>}
        {isPending && <div className="hist-bet-pnl-pending">Pending</div>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function HistoryPage() {
  const router = useRouter();
  const [bets,    setBets]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  const fetchBets = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/my-bets`, {
        headers: { Accept: "application/json", Authorization: getToken() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status) {
        setBets(json.bets        ?? []);
        setTotal(json.total_bets ?? 0);
      }
    } catch (err) {
      console.error("[History] Fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("cpx_token");
    if (!token) { router.replace("/login"); return; }
    fetchBets();
  }, [router, fetchBets]);

  const filtered = bets.filter((b) => {
    if (filter === "all")     return true;
    if (filter === "win")     return parseFloat(b.win_amount  ?? 0) > 0;
    if (filter === "loss")    return parseFloat(b.loss_amount ?? 0) > 0 && parseFloat(b.win_amount ?? 0) === 0;
    if (filter === "pending") return parseFloat(b.win_amount  ?? 0) === 0 && parseFloat(b.loss_amount ?? 0) === 0;
    return true;
  });

  return (
    <div className="hist-page">

      {/* ── STICKY HEADER ── */}
      <div className="hist-header">
        <button className="hist-back-btn" onClick={() => router.back()}>
          <FiArrowLeft size={20} />
        </button>
        <div className="hist-header-title">
          <TbChartCandle size={16} />
          Bet History
        </div>
        <div className="hist-header-count">{total} Bets</div>
      </div>

      {/* ── SUMMARY CARDS (sticky below header) ── */}
      {!loading && bets.length > 0 && (
        <div className="hist-sticky-summary">
          <SummaryCards bets={bets} />
        </div>
      )}

      {/* ── STICKY FILTER TABS ── */}
      <div className="hist-sticky-filter">
        <FilterTabs active={filter} onChange={setFilter} />
      </div>

      {/* ── SCROLLABLE BET LIST ── */}
      <div className="hist-scroll-area">
        {loading ? (
          <div className="hist-loading">
            <div className="hist-spin" />
            <span className="hist-loading-text">Loading your bets…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="hist-empty">
            <div className="hist-empty-icon">
              <TbTrophy size={28} />
            </div>
            <div className="hist-empty-title">
              {filter === "all" ? "No bets yet" : `No ${filter} bets`}
            </div>
            <div className="hist-empty-sub">
              {filter === "all"
                ? "Place your first prediction on the home screen!"
                : "Switch to another filter to see more bets."}
            </div>
          </div>
        ) : (
          <div className="hist-list">
            {filtered.map((bet) => (
              <BetRow key={bet.id} bet={bet} />
            ))}
          </div>
        )}
        <div style={{ height: 32 }} />
      </div>

    </div>
  );
}