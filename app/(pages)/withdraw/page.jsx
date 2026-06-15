"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight, Zap, Trophy, Banknote, Upload, Clock,
  AlertTriangle, CheckCircle, XCircle, Link2, FileText,
  Send, CircleDollarSign, Wallet, ShieldAlert,
  CheckCircle2, Hash, RefreshCw, Activity,
  ArrowDownToLine, BadgeDollarSign, Coins,
} from "lucide-react";
import { TbBrandBinance } from "react-icons/tb";
import {useRouter} from "next/navigation";
import "./withdraw.css";

const BASE = process.env.NEXT_PUBLIC_API_URL;

const QUICK_AMOUNTS = [10, 25, 50, 100];

const STATUS_MAP = {
  pending:  { label: "PENDING",  key: "pending",  Icon: Clock },
  approved: { label: "APPROVED", key: "approved", Icon: CheckCircle2 },
  rejected: { label: "REJECTED", key: "rejected", Icon: XCircle },
};

const NETWORKS = [
  { Icon: TbBrandBinance, label: "USDT", tag: "BEP20", color: "#D4AF37" },
];

const getToken = () => {
  if (typeof window === "undefined") return "";
  const type  = localStorage.getItem("cpx_token_type") || "Bearer";
  const token = localStorage.getItem("cpx_token") || "";
  return `${type} ${token}`;
};

const fmtDate = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const truncate = (str, n = 18) =>
  str && str.length > n ? `${str.slice(0, 8)}...${str.slice(-6)}` : str;

const fmt = (n) =>
  parseFloat(n ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function Withdraw() {
  const router = useRouter();
  
    useEffect(() => {
      const token = localStorage.getItem("cpx_token");
  
      if (!token) {
        router.replace("/login"); 
      }
    }, [router]);
  /* ── profile ── */
  const [profile,        setProfile]        = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError,   setProfileError]   = useState(null);

  /* ── form ── */
  const [amount,        setAmount]        = useState(10);
  const [address,       setAddress]       = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [toast,         setToast]         = useState(null);

  /* ── history ── */
  const [withdrawals, setWithdrawals] = useState([]);
  const [meta,        setMeta]        = useState(null);
  const [page,        setPage]        = useState(1);
  const [histLoading, setHistLoading] = useState(true);
  const [histError,   setHistError]   = useState(null);

  const showToast = useCallback((msg, type = "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetch(`${BASE}/profile`, {
        headers: { Accept: "application/json", Authorization: getToken() },
      });
      if (!res.ok) throw new Error(`Server error: HTTP ${res.status}`);
      const json = await res.json();
      if (json.status) setProfile(json.data);
      else throw new Error("Failed to load profile. Please try again.");
    } catch (err) {
      setProfileError(err.message);
      showToast(err.message, "err");
    } finally {
      setProfileLoading(false);
    }
  }, [showToast]);

  const handleMyWithdrawals = useCallback(async (pageNum = 1) => {
    setHistLoading(true);
    setHistError(null);
    try {
      const res = await fetch(`${BASE}/my-withdrawals?page=${pageNum}`, {
        headers: { Accept: "application/json", Authorization: getToken() },
      });
      if (!res.ok) throw new Error(`Server error: HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setWithdrawals(json.data?.data || []);
        setMeta(json.data);
        setPage(pageNum);
      } else {
        throw new Error("Failed to load withdrawal history. Please try again.");
      }
    } catch (err) {
      setHistError(err.message);
    } finally {
      setHistLoading(false);
    }
  }, []);

  useEffect(() => {
    handleProfile();
    handleMyWithdrawals(1);
  }, [handleProfile, handleMyWithdrawals]);

  const handleWithdraw = async () => {
    if (!address.trim()) {
      showToast("Please enter your BEP20 wallet address.", "err");
      return;
    }
    if (amount <= 0) {
      showToast("Withdrawal amount must be greater than zero.", "err");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/withdraw`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
        body: JSON.stringify({ amount: String(amount), bep20_address: address.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitSuccess(true);
        showToast("Withdrawal request submitted successfully!", "ok");
        setAddress("");
        setAmount(10);
        setTimeout(() => setSubmitSuccess(false), 2500);
        handleMyWithdrawals(1);
        handleProfile();
      } else {
        throw new Error(json.message || "Withdrawal request failed. Please try again.");
      }
    } catch (err) {
      showToast(err.message, "err");
    } finally {
      setSubmitting(false);
    }
  };

  const stepAmount = (dir) => setAmount((prev) => Math.max(1, prev + dir));

  const fin      = profile?.financial ?? {};
  const betStats = profile?.bet_stats ?? {};

  const balance        = fin.total_wallet_balance ?? 0;
  const totalWin       = fin.total_win_amount      ?? 0;
  const totalBet       = betStats.total_bet_amount ?? 0;
  const totalWithdrawn = fin.total_withdraw        ?? 0;

  return (
    <div className="wlt-root">

      {/* ── TOAST ── */}
      {toast && (
        <div className={`wlt-toast wlt-toast-${toast.type === "ok" ? "ok" : "err"}`}>
          {toast.type === "ok"
            ? <CheckCircle2 size={13} strokeWidth={2.5} />
            : <AlertTriangle size={13} strokeWidth={2.5} />
          }
          {toast.msg}
        </div>
      )}

      {/* ══ BALANCE HERO ══ */}
      <div className="wlt-hero">
        <div className="wlt-hero-glow" />
        <div className="wlt-hero-ring-1" />
        <div className="wlt-hero-ring-2" />

        <div className="wlt-bal-section">
          <p className="wlt-bal-label">TOTAL BALANCE</p>
          {profileLoading ? (
            <div className="wlt-bal-skeleton-wrap">
              <div className="wlt-skeleton" style={{ height: 44, width: 160, borderRadius: 10, margin: "0 auto 6px" }} />
            </div>
          ) : (
            <>
              <div className="wlt-bal-amount">
                {/* BadgeDollarSign as tether symbol replacement */}
                <BadgeDollarSign size={22} className="wlt-tether-icon" strokeWidth={1.8} />
                <span className="wlt-bal-num">{fmt(balance)}</span>
              </div>
              <p className="wlt-bal-cur">USDT</p>
            </>
          )}
        </div>

        {/* Mini stats */}
        <div className="wlt-mini-stats">
          <div className="wlt-mini-stat">
            <Trophy size={15} strokeWidth={1.8} className="wlt-ms-icon-svg c-green" />
            {profileLoading
              ? <div className="wlt-skeleton" style={{ height: 14, width: 50, borderRadius: 6 }} />
              : <span className="wlt-ms-val c-green">+{fmt(totalWin)}</span>
            }
            <span className="wlt-ms-lbl">TOTAL WON</span>
          </div>
          <div className="wlt-mini-divider" />
          <div className="wlt-mini-stat">
            <Banknote size={15} strokeWidth={1.8} className="wlt-ms-icon-svg c-red" />
            {profileLoading
              ? <div className="wlt-skeleton" style={{ height: 14, width: 50, borderRadius: 6 }} />
              : <span className="wlt-ms-val c-red">-{fmt(totalBet)}</span>
            }
            <span className="wlt-ms-lbl">TOTAL BET</span>
          </div>
          <div className="wlt-mini-divider" />
          <div className="wlt-mini-stat">
            <ArrowDownToLine size={15} strokeWidth={1.8} className="wlt-ms-icon-svg c-gold" />
            {profileLoading
              ? <div className="wlt-skeleton" style={{ height: 14, width: 50, borderRadius: 6 }} />
              : <span className="wlt-ms-val c-gold">-{fmt(totalWithdrawn)}</span>
            }
            <span className="wlt-ms-lbl">WITHDRAWN</span>
          </div>
        </div>

        {profileError && (
          <div className="wlt-hero-err">
            <AlertTriangle size={12} strokeWidth={2} /> {profileError}
          </div>
        )}
      </div>

      {/* ══ SUPPORTED NETWORKS ══ */}
      <div className="wlt-section-head">
        <div className="wlt-section-line" />
        <span className="wlt-section-text">SUPPORTED NETWORK</span>
        <div className="wlt-section-line" />
      </div>

      <div className="wlt-networks-row">
        {NETWORKS.map((n, i) => (
          <div key={i} className="wlt-network-card" style={{ "--wlt-nc": n.color }}>
            <div className="wlt-wnc-glow" />
            <n.Icon size={22} strokeWidth={1.8} style={{ color: n.color, flexShrink: 0 }} />
            <div className="wlt-wnc-info">
              <span className="wlt-wnc-label">{n.label}</span>
              <span className="wlt-wnc-tag" style={{
                color: n.color,
                borderColor: `${n.color}40`,
                background: `${n.color}15`,
                width: n.tag.length > 6 ? "fit-content" : 50,
              }}>
                {n.tag}
              </span>
            </div>
            <div className="wlt-wnc-status">
              {/* Activity icon instead of plain dot div */}
              <Activity size={11} strokeWidth={2.5} style={{ color: n.color }} />
              <span className="wlt-wnc-active">ACTIVE</span>
            </div>
          </div>
        ))}
      </div>

      <div className="wlt-notice">
        <AlertTriangle size={14} strokeWidth={2} className="wlt-notice-icon-svg" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <span className="wlt-notice-gold">Withdrawals</span> are processed exclusively via{" "}
          <span className="wlt-notice-cyan">BEP20</span>. KYC verification may be required for
          large withdrawals. Standard processing time: 24–48 hours.
        </div>
      </div>

      {/* ══ WITHDRAW FORM ══ */}
      <div className="wlt-section-head">
        <div className="wlt-section-line" />
        <span className="wlt-section-text">WITHDRAW FUNDS</span>
        <div className="wlt-section-line" />
      </div>

      <div className="wlt-form-card">
        <div className="wlt-form-glow" />

        <p className="wlt-field-label">AMOUNT (USDT)</p>
        <div className="wlt-amount-stepper">
          <button className="wlt-step-btn" onClick={() => stepAmount(-1)} disabled={amount <= 1 || submitting}>−</button>
          <div className="wlt-amount-display">
            <span className="wlt-amount-num">{amount}</span>
            <span className="wlt-amount-cur">USDT</span>
          </div>
          <button className="wlt-step-btn" onClick={() => stepAmount(1)} disabled={submitting}>+</button>
        </div>

        <div className="wlt-quick-row">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              className={`wlt-quick-btn${amount === q ? " wlt-active" : ""}`}
              onClick={() => setAmount(q)}
              disabled={submitting}
            >
              {q}
            </button>
          ))}
        </div>

        <p className="wlt-field-label">BEP20 WALLET ADDRESS</p>
        <div className="wlt-addr-input-wrap">
          {/* Wallet icon inside input wrapper */}
          <span className="wlt-addr-icon">
            <Wallet size={14} strokeWidth={1.8} />
          </span>
          <input
            className="wlt-addr-input"
            type="text"
            placeholder="0x... Enter your BEP20 wallet address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="wlt-network-badge">
          {/* Link2 icon instead of plain dot div */}
          <Link2 size={10} strokeWidth={2.5} style={{ color: "#D4AF37" }} />
          WITHDRAWAL VIA BEP20 ONLY
        </div>

        <button
          className={`wlt-submit-btn${submitSuccess ? " wlt-success-state" : ""}`}
          onClick={handleWithdraw}
          disabled={submitting || !address.trim() || amount <= 0}
        >
          <div className="wlt-submit-btn-glow" />
          {submitting ? (
            <><RefreshCw size={14} strokeWidth={2.5} className="wlt-spin-icon" /> PROCESSING...</>
          ) : submitSuccess ? (
            <><CheckCircle2 size={14} strokeWidth={2.5} /> REQUEST SUBMITTED</>
          ) : (
            <><Send size={14} strokeWidth={2.5} /> WITHDRAW NOW</>
          )}
        </button>

        <div className="wlt-form-warn">
          <ShieldAlert size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
          Please ensure your BEP20 address is correct. Funds sent to a wrong address cannot be recovered.
        </div>
      </div>

      {/* ══ WITHDRAWAL HISTORY ══ */}
      <div className="wlt-section-head" style={{ marginTop: 18 }}>
        <div className="wlt-section-line" />
        <span className="wlt-section-text">WITHDRAWAL HISTORY</span>
        <div className="wlt-section-line" />
      </div>

      {histError && (
        <div className="wlt-error-box">
          <AlertTriangle size={14} strokeWidth={2} /> {histError}
        </div>
      )}

      <div className="wlt-tx-list">
        {histLoading && [1, 2, 3].map((i) => (
          <div key={i} className="wlt-sk-row">
            <div className="wlt-skeleton" style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="wlt-skeleton" style={{ height: 10, width: "55%", marginBottom: 6 }} />
              <div className="wlt-skeleton" style={{ height: 8, width: "35%" }} />
            </div>
            <div>
              <div className="wlt-skeleton" style={{ height: 14, width: 55, marginBottom: 6, marginLeft: "auto" }} />
              <div className="wlt-skeleton" style={{ height: 8, width: 45, marginLeft: "auto" }} />
            </div>
          </div>
        ))}

        {!histLoading && withdrawals.length === 0 && !histError && (
          <div className="wlt-tx-empty">
            <div className="wlt-tx-empty-icon">
              <Coins size={22} strokeWidth={1.5} />
            </div>
            <span className="wlt-tx-empty-text">NO WITHDRAWALS YET</span>
          </div>
        )}

        {!histLoading && withdrawals.map((item) => {
          const status     = STATUS_MAP[item.status] || STATUS_MAP.pending;
          const StatusIcon = status.Icon;
          return (
            <div key={item.id} className="wlt-tx-row">
              <div className={`wlt-tx-icon-wrap wlt-tx-icon-${status.key}`}>
                <StatusIcon size={16} strokeWidth={2} />
              </div>
              <div className="wlt-tx-info">
                <span className="wlt-tx-address">{truncate(item.bep20_address)}</span>
                <div className="wlt-tx-meta">
                  {/* Hash icon for tx id */}
                  {/* <span className="wlt-tx-id">
                    <Hash size={9} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} />
                    {item.id}
                  </span> */}
                  <span className="wlt-tx-date">
                    <Clock size={10} strokeWidth={2} style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} />
                    {fmtDate(item.created_at)}
                  </span>
                </div>
                {item.admin_note && (
                  <div className="wlt-admin-note">
                    <FileText size={10} strokeWidth={2} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                    {item.admin_note}
                  </div>
                )}
              </div>
              <div className="wlt-tx-right">
                <div className="wlt-tx-amount">
                  <ArrowDownToLine size={11} strokeWidth={2.5} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                  {parseFloat(item.amount).toFixed(2)}
                </div>
                <div className={`wlt-status-pill s-${status.key}`}>{status.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {meta && meta.last_page > 1 && (
        <div className="wlt-pagination">
          <button
            className="wlt-page-btn"
            disabled={page <= 1 || histLoading}
            onClick={() => handleMyWithdrawals(page - 1)}
          >
            <ChevronRight size={12} strokeWidth={2.5} style={{ transform: "rotate(180deg)" }} /> PREV
          </button>
          <span className="wlt-page-info">{page} / {meta.last_page}</span>
          <button
            className="wlt-page-btn"
            disabled={page >= meta.last_page || histLoading}
            onClick={() => handleMyWithdrawals(page + 1)}
          >
            NEXT <ChevronRight size={12} strokeWidth={2.5} />
          </button>
        </div>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
}