"use client";
import { useState, useEffect, useCallback } from "react";
import "./myincome.css";
import "../home/home.css"; // shared CSS vars + base

import {
  FiArrowLeft,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiLoader,
  FiRefreshCw,
} from "react-icons/fi";
import {
  TbTrophy,
  TbCurrencyDollar,
  TbChartBar,
  TbGift,
  TbQuestionMark,
} from "react-icons/tb";
import { BiBitcoin } from "react-icons/bi";

// ─── Constants ───────────────────────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => {
  if (typeof window === "undefined") return "";
  const type  = localStorage.getItem("cpx_token_type") || "Bearer";
  const token = localStorage.getItem("cpx_token")      || "";
  return `${type} ${token}`;
};

// ─── Income type helpers ─────────────────────────────────────────────────────
// type: 1=?, 2=Direct Win, 3=Platform Fee (credited to user), 4=Referral, 5=Other
const TYPE_MAP = {
  1: { label: "Win Bonus",    cls: "win",      Icon: TbTrophy         },
  2: { label: "Direct Win",   cls: "direct",   Icon: TbCurrencyDollar },
  3: { label: "Win Reward",   cls: "win",      Icon: FiTrendingUp     },
  4: { label: "Referral",     cls: "referral", Icon: FiUsers          },
  5: { label: "Bonus",        cls: "direct",   Icon: TbGift           },
};

const getType = (t) => TYPE_MAP[t] ?? { label: "Income", cls: "other", Icon: TbQuestionMark };

// filter tabs
const TABS = [
  { key: "all",      label: "All" },
  { key: "win",      label: "Wins" },
  { key: "referral", label: "Referral" },
  { key: "direct",   label: "Direct" },
];

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="income-skeleton-row">
      <div className="sk sk-circle" />
      <div style={{ flex: 1 }}>
        <div className="sk sk-line-lg" />
        <div className="sk sk-line-sm" />
      </div>
      <div className="sk sk-amount" />
    </div>
  );
}

// ─── Single transaction row ───────────────────────────────────────────────────
function IncomeRow({ item }) {
  const { label, cls, Icon } = getType(item.type);
  const round = item.round;

  const date = new Date(item.created_at);
  const timeStr = date.toLocaleString("en-IN", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  const amountCls = cls === "direct" || cls === "win" ? "" : cls === "referral" ? "green" : "";

  return (
    <div className="income-row">
      {/* icon */}
      <div className={`income-row-icon ${cls}`}>
        <Icon size={16} />
      </div>

      {/* info */}
      <div className="income-row-info">
        <div className="income-row-type">{label}</div>
        <div className="income-row-meta">
          {round && (
            <>
              <span className="income-row-round">RND #{round.id}</span>
              <span className="income-row-dot" />
            </>
          )}
          <span className="income-row-time">{timeStr}</span>
        </div>
        {round?.winning_digit !== null && round?.winning_digit !== undefined && (
          <div className="income-winning-chip">
            <BiBitcoin size={10} />
            ${parseFloat(round.winning_number ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            &nbsp;· Digit {round.winning_digit}
          </div>
        )}
        <div className={`income-type-pill ${cls}`}>
          <Icon size={9} />
          {label}
        </div>
      </div>

      {/* amount */}
      <div className="income-row-right">
        <div className={`income-row-amount ${amountCls}`}>
          +{parseFloat(item.amount).toFixed(2)}
        </div>
        <div className="income-row-usdt">USDT</div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MyIncomePage() {
  const [data,       setData]       = useState([]);
  const [summary,    setSummary]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page,       setPage]       = useState(1);
  const [lastPage,   setLastPage]   = useState(1);
  const [loadingMore,setLoadingMore]= useState(false);
  const [activeTab,  setActiveTab]  = useState("all");
  const [error,      setError]      = useState(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchIncome = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) append ? setRefreshing(true) : setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const res  = await fetch(`${BASE}/my-income?page=${pageNum}`, {
        headers: { Accept: "application/json", Authorization: getToken() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.success) {
        setSummary(json.summary ?? null);
        const rows = json.data?.data ?? [];
        setData((prev) => append ? [...prev, ...rows] : rows);
        setLastPage(json.data?.last_page ?? 1);
        setPage(pageNum);
      } else {
        setError("Could not load income data.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchIncome(1); }, [fetchIncome]);

  // ── filter ──────────────────────────────────────────────────────────────────
  const filtered = data.filter((item) => {
    if (activeTab === "all")      return true;
    if (activeTab === "win")      return item.type === 1 || item.type === 2 || item.type === 3;
    if (activeTab === "referral") return item.type === 4;
    if (activeTab === "direct")   return item.type === 2;
    return true;
  });

  // ── derived totals ──────────────────────────────────────────────────────────
  const totalIncome   = parseFloat(summary?.total_income    ?? 0).toFixed(2);
  const winIncome     = parseFloat(summary?.winning_income  ?? 0).toFixed(2);
  const directIncome  = parseFloat(summary?.direct_income   ?? 0).toFixed(2);

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="income-page">

      {/* ── top nav ─────────────────────────────────────────────────── */}
      <div className="income-nav">
        <button className="income-nav-back" onClick={() => window.history.back()}>
          <FiArrowLeft size={16} />
        </button>
        <span className="income-nav-title">My Income</span>
        <button
          className="income-nav-back"
          onClick={() => fetchIncome(1, false)}
          disabled={refreshing}
          style={{ marginLeft: "auto" }}
        >
          <FiRefreshCw size={15} className={refreshing ? "spin-icon" : ""} />
        </button>
        <span className="income-nav-badge">{data.length} Records</span>
      </div>

      {/* ── summary hero ────────────────────────────────────────────── */}
      <div className="income-summary">
        <div className="income-summary-eyebrow">
          <TbChartBar size={11} />
          Income Overview
        </div>
        <div className="income-summary-total-label">Total Earned</div>
        <div className="income-summary-total">
          {loading ? "—" : `$${totalIncome}`}
          <span style={{ fontSize: 16, fontWeight: 500, marginLeft: 6, letterSpacing: 0 }}>USDT</span>
        </div>

        <div className="income-summary-row">
          <div className="income-summary-stat">
            <div className="income-summary-stat-label">
              <TbTrophy size={10} /> Win Income
            </div>
            <div className="income-summary-stat-val">
              {loading ? "—" : `$${winIncome}`}
            </div>
          </div>
          <div className="income-summary-stat">
            <div className="income-summary-stat-label">
              <FiUsers size={10} /> Direct Income
            </div>
            <div className="income-summary-stat-val green">
              {loading ? "—" : `$${directIncome}`}
            </div>
          </div>
        </div>
      </div>

      {/* ── filter tabs ─────────────────────────────────────────────── */}
      <div className="income-filter-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`income-filter-tab${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── section label ───────────────────────────────────────────── */}
      <div className="income-section-label">
        <div className="income-section-line" />
        <span className="income-section-text">Transactions</span>
        <div className="income-section-line" />
      </div>

      {/* ── list ────────────────────────────────────────────────────── */}
      <div className="income-list">
        <div className="income-list-header">
          <span className="income-list-title">
            <TbCurrencyDollar size={13} />
            All Transactions
          </span>
          <span className="income-list-count">{filtered.length} shown</span>
        </div>

        <div className="income-list-body">
          {/* loading skeletons */}
          {loading && [0,1,2,3,4].map((i) => <SkeletonRow key={i} />)}

          {/* error */}
          {!loading && error && (
            <div className="income-empty">
              <div className="income-empty-icon"><FiLoader /></div>
              {error}
            </div>
          )}

          {/* empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="income-empty">
              <div className="income-empty-icon"><TbCurrencyDollar /></div>
              No income records yet
            </div>
          )}

          {/* rows */}
          {!loading && !error && filtered.map((item) => (
            <IncomeRow key={item.id} item={item} />
          ))}

          {/* inline load-more indicator */}
          {loadingMore && [0,1].map((i) => <SkeletonRow key={`lm-${i}`} />)}
        </div>
      </div>

      {/* ── load more button ─────────────────────────────────────────── */}
      {!loading && page < lastPage && (
        <button
          className="income-load-more"
          disabled={loadingMore}
          onClick={() => fetchIncome(page + 1, true)}
        >
          {loadingMore
            ? <><FiLoader className="spin-icon" style={{ marginRight: 6, verticalAlign: "middle" }} /> Loading…</>
            : "Load More Transactions"}
        </button>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}