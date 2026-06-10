"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser, FiMail, FiCalendar, FiCopy, FiCheck,
  FiRefreshCw, FiUsers, FiTrendingUp, FiDollarSign,
  FiCreditCard, FiTarget, FiAward, FiActivity,
  FiEdit2, FiLock, FiEye, FiEyeOff, FiSave, FiX,
  FiLogOut,
} from "react-icons/fi";
import {
  FaUserFriends, FaTrophy, FaWallet,
  FaMoneyBillWave, FaChartPie, FaBullseye,
} from "react-icons/fa";
import "./profile.css";

const API = process.env.NEXT_PUBLIC_API_URL;

const formatCurrency = (v) => "$" + Number(v || 0).toLocaleString();
const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
};
const getInitials = (name) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "??";

/* Tabs */
const TABS = [
  { id: "overview",  label: "OVERVIEW",  icon: <FiActivity /> },
  { id: "financial", label: "FINANCE",   icon: <FaWallet /> },
  { id: "referral",  label: "REFERRAL",  icon: <FaUserFriends /> },
  { id: "bets",      label: "BET STATS", icon: <FaBullseye /> },
];

const TOKEN_KEY      = "cpx_token";
const TOKEN_TYPE_KEY = "cpx_token_type";
const USER_KEY       = "cpx_user";

/* ── Toast ── */
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div className={`profile-toast profile-toast-${type}`}>
      {type === "success" ? <FiCheck /> : <FiX />}
      <span>{msg}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied,    setCopied]    = useState(false);

  /* ── Logout confirm state ── */
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  /* ── Edit Name modal ── */
  const [editName,      setEditName]      = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading,   setEditLoading]   = useState(false);
  const [editToast,     setEditToast]     = useState({ msg: "", type: "" });

  /* ── Change Password modal ── */
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwForm,      setPwForm]      = useState({
    current_password: "", new_password: "", new_password_confirmation: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwToast,   setPwToast]   = useState({ msg: "", type: "" });
  const [showPw,    setShowPw]    = useState({ current: false, new: false, confirm: false });

  /* ══ FETCH PROFILE ══ */
  const handleProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const token     = localStorage.getItem(TOKEN_KEY);
      const tokenType = localStorage.getItem(TOKEN_TYPE_KEY) || "Bearer";
      if (!token) { router.push("/login"); return; }
      if (!API)   { setError("API URL not configured."); setLoading(false); return; }

      const res = await fetch(`${API}/profile`, {
        method: "GET",
        headers: { Authorization: `${tokenType} ${token}`, Accept: "application/json" },
      });
      if (res.status === 401) {
        [TOKEN_KEY, TOKEN_TYPE_KEY, USER_KEY].forEach((k) => localStorage.removeItem(k));
        router.push("/login");
        return;
      }
      const data = await res.json().catch(() => null);
      if (!data)    { setError(`Server returned invalid JSON (status ${res.status})`); return; }
      if (!res.ok)  { setError(data?.message || `Server error: ${res.status}`); return; }
      if (data.status) {
        setProfile(data.data);
        setEditName(data.data.basic_info.name);
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (err) {
      setError(err.name === "TypeError"
        ? `Network error — check CORS or API URL. (${err.message})`
        : `Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { handleProfile(); }, []);

  /* ══ LOGOUT ══ */
  const handleLogout = () => {
    setLogoutConfirm(true);
  };

  const confirmLogout = () => {
    [TOKEN_KEY, TOKEN_TYPE_KEY, USER_KEY].forEach((k) => localStorage.removeItem(k));
    router.push("/login");
  };

  const cancelLogout = () => {
    setLogoutConfirm(false);
  };

  /* ══ UPDATE NAME ══ */
  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      setEditToast({ msg: "Name cannot be empty", type: "error" });
      setTimeout(() => setEditToast({ msg: "", type: "" }), 3000);
      return;
    }
    try {
      setEditLoading(true);
      const token     = localStorage.getItem(TOKEN_KEY);
      const tokenType = localStorage.getItem(TOKEN_TYPE_KEY) || "Bearer";
      const res  = await fetch(`${API}/update-profile`, {
        method: "POST",
        headers: { Authorization: `${tokenType} ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json().catch(() => { throw new Error("Invalid JSON response"); });
      if (data.status) {
        const newName = data.user?.name || editName.trim();
        setProfile((prev) => ({ ...prev, basic_info: { ...prev.basic_info, name: newName } }));
        const cached = localStorage.getItem(USER_KEY);
        if (cached) {
          try { localStorage.setItem(USER_KEY, JSON.stringify({ ...JSON.parse(cached), name: newName })); } catch (_) {}
        }
        setEditToast({ msg: "Profile updated successfully!", type: "success" });
        setTimeout(() => { setEditModalOpen(false); setEditToast({ msg: "", type: "" }); }, 1200);
      } else {
        setEditToast({ msg: data.message || "Update failed", type: "error" });
      }
    } catch (err) {
      setEditToast({ msg: err.message || "Something went wrong", type: "error" });
    } finally {
      setEditLoading(false);
      setTimeout(() => setEditToast({ msg: "", type: "" }), 3500);
    }
  };

  /* ══ CHANGE PASSWORD ══ */
  const handleChangePassword = async () => {
    const { current_password, new_password, new_password_confirmation } = pwForm;
    if (!current_password || !new_password || !new_password_confirmation) {
      setPwToast({ msg: "All fields are required", type: "error" });
      setTimeout(() => setPwToast({ msg: "", type: "" }), 3000);
      return;
    }
    if (new_password !== new_password_confirmation) {
      setPwToast({ msg: "New passwords do not match", type: "error" });
      setTimeout(() => setPwToast({ msg: "", type: "" }), 3000);
      return;
    }
    if (new_password.length < 6) {
      setPwToast({ msg: "Password must be at least 6 characters", type: "error" });
      setTimeout(() => setPwToast({ msg: "", type: "" }), 3000);
      return;
    }
    try {
      setPwLoading(true);
      const token     = localStorage.getItem(TOKEN_KEY);
      const tokenType = localStorage.getItem(TOKEN_TYPE_KEY) || "Bearer";
      const res  = await fetch(`${API}/change-password`, {
        method: "POST",
        headers: { Authorization: `${tokenType} ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ current_password, new_password, new_password_confirmation }),
      });
      const data = await res.json().catch(() => { throw new Error("Invalid JSON response"); });
      if (data.status) {
        setPwToast({ msg: "Password changed successfully!", type: "success" });
        setPwForm({ current_password: "", new_password: "", new_password_confirmation: "" });
        setTimeout(() => { setPwModalOpen(false); setPwToast({ msg: "", type: "" }); }, 1400);
      } else {
        setPwToast({ msg: data.message || "Failed to change password", type: "error" });
      }
    } catch (err) {
      setPwToast({ msg: err.message || "Something went wrong", type: "error" });
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwToast({ msg: "", type: "" }), 3500);
    }
  };

  /* ── Copy referral ── */
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Close helpers ── */
  const closeEditModal = () => {
    if (editLoading) return;
    setEditModalOpen(false);
    setEditToast({ msg: "", type: "" });
  };
  const closePwModal = () => {
    if (pwLoading) return;
    setPwModalOpen(false);
    setPwToast({ msg: "", type: "" });
    setPwForm({ current_password: "", new_password: "", new_password_confirmation: "" });
    setShowPw({ current: false, new: false, confirm: false });
  };

  /* ══ LOADING / ERROR ══ */
  if (loading) {
    return (
      <div className="main profile-state-wrap">
        <div className="profile-loading-ring" />
        <p className="profile-state-text">Loading profile...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="main profile-state-wrap">
        <div className="profile-error-box">
          <span className="profile-error-icon"><FiRefreshCw /></span>
          <p className="profile-error-title">Failed to load profile</p>
          <p className="profile-error-msg">{error}</p>
          <button className="profile-retry-btn" onClick={handleProfile}>
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    );
  }
  if (!profile) return null;

  const { basic_info: bi, financial: fin, referral: ref, bet_stats: bs } = profile;
  const winRate = bs.total_bets > 0 ? Math.round((bs.won_bets / bs.total_bets) * 100) : 0;

  return (
    <div className="main profile-page">

      {/* ─── HERO ─── */}
      <div className="profile-hero">
        <div className="profile-hero-bg" />
        <div className="profile-hero-grid" />

        <div className="profile-avatar-wrap">
          <div className="profile-avatar-ring" />
          <div className="profile-avatar"><span>{getInitials(bi.name)}</span></div>
          <div className="profile-online-dot" />
        </div>

        <div className="profile-name">{bi.name}</div>
        <div className="profile-handle"><FiMail />{bi.email}</div>

        <div className="profile-badges-row">
          <div className="profile-badge profile-badge-status">
            <span className="profile-badge-dot" />
            <span>{bi.status === "1" ? "ACTIVE" : "INACTIVE"}</span>
          </div>
        </div>

        <div className="profile-joined">
          <FiCalendar />
          <span>Member since {formatDate(bi.joined_at)}</span>
        </div>

        <div className="profile-quick-stats">
          <div className="profile-pqs-item">
            <span className="profile-pqs-val">{bs.total_bets}</span>
            <span className="profile-pqs-lbl">Bets</span>
          </div>
          <div className="profile-pqs-div" />
          <div className="profile-pqs-item">
            <span className="profile-pqs-val" style={{ color: "var(--profile-green)" }}>{bs.won_bets}</span>
            <span className="profile-pqs-lbl">Won</span>
          </div>
          <div className="profile-pqs-div" />
          <div className="profile-pqs-item">
            <span className="profile-pqs-val" style={{ color: "var(--profile-red)" }}>{bs.lost_bets}</span>
            <span className="profile-pqs-lbl">Lost</span>
          </div>
          <div className="profile-pqs-div" />
          <div className="profile-pqs-item">
            <span className="profile-pqs-val" style={{ color: "var(--profile-gold)" }}>{winRate}%</span>
            <span className="profile-pqs-lbl">Win Rate</span>
          </div>
          <div className="profile-pqs-div" />
          {/* <div className="profile-pqs-item">
            <span className="profile-pqs-val" style={{ color: "var(--profile-cyan)" }}>{ref.total_direct}</span>
            <span className="profile-pqs-lbl">Referrals</span>
          </div> */}
        </div>

        {/* Logout Button */}
        <button className="profile-logout-btn" onClick={handleLogout}>
          <FiLogOut /> LOGOUT
        </button>
      </div>

      {/* ─── TABS ─── */}
      <div className="profile-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`profile-tab-btn ${activeTab === t.id ? "profile-tab-active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="profile-tab-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ══ */}
      {activeTab === "overview" && (
        <>
          <div className="profile-section-label">
            <div className="profile-section-line" />
            <span className="profile-section-text">ACCOUNT INFO</span>
            <div className="profile-section-line" />
          </div>

          <div className="profile-info-card">
            {/* Name row */}
            <div className="profile-info-row">
              <span className="profile-info-icon"><FiUser /></span>
              <div className="profile-info-content">
                <span className="profile-info-label">Full Name</span>
                <span className="profile-info-val">{bi.name}</span>
              </div>
              <button
                className="profile-info-edit-btn"
                onClick={() => { setEditName(bi.name); setEditToast({ msg: "", type: "" }); setEditModalOpen(true); }}
                title="Edit Name"
              >
                <FiEdit2 />
              </button>
            </div>

            {/* Email row */}
            <div className="profile-info-row">
              <span className="profile-info-icon"><FiMail /></span>
              <div className="profile-info-content">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-val">{bi.email}</span>
              </div>
            </div>

            {/* Joined row */}
            <div className="profile-info-row">
              <span className="profile-info-icon"><FiCalendar /></span>
              <div className="profile-info-content">
                <span className="profile-info-label">Joined</span>
                <span className="profile-info-val">{formatDate(bi.joined_at)}</span>
              </div>
            </div>

            {/* Referral Code row */}
            <div className="profile-info-row">
              <span className="profile-info-icon"><FiUsers /></span>
              <div className="profile-info-content">
                <span className="profile-info-label">Referral Code</span>
                <span className="profile-info-val">{bi.referal_code}</span>
              </div>
            </div>

            {/* Change Password row */}
            <div className="profile-info-row">
              <span className="profile-info-icon"><FiLock /></span>
              <div className="profile-info-content">
                <span className="profile-info-label">Password</span>
                <span className="profile-info-val">••••••••</span>
              </div>
              <button
                className="profile-info-edit-btn"
                onClick={() => { setPwToast({ msg: "", type: "" }); setPwModalOpen(true); }}
                title="Change Password"
              >
                <FiLock />
              </button>
            </div>
          </div>

          {/* Referred By */}
          {ref.referred_by && (
            <>
              <div className="profile-section-label">
                <div className="profile-section-line" />
                <span className="profile-section-text">REFERRED BY</span>
                <div className="profile-section-line" />
              </div>
              <div className="profile-referrer-card">
                <div className="profile-referrer-avatar">{getInitials(ref.referred_by.name)}</div>
                <div className="profile-referrer-info">
                  <span className="profile-referrer-name">{ref.referred_by.name}</span>
                  <span className="profile-referrer-email">{ref.referred_by.email}</span>
                  <span className="profile-referrer-code">Code: {ref.referred_by.referal_code}</span>
                </div>
                <div className="profile-referrer-badge">Sponsor</div>
              </div>
            </>
          )}
        </>
      )}

      {/* ══ FINANCIAL TAB ══ */}
      {activeTab === "financial" && (
        <>
          <div className="profile-section-label">
            <div className="profile-section-line" />
            <span className="profile-section-text">WALLET SUMMARY</span>
            <div className="profile-section-line" />
          </div>
          <div className="profile-balance-hero-card">
            <div className="profile-bhc-label">Total Wallet Balance</div>
            <div className="profile-bhc-val">{formatCurrency(fin.total_wallet_balance)}</div>
            <div className="profile-bhc-sub">Available to withdraw</div>
          </div>
          <div className="profile-fin-grid">
            {[
              { icon: <FiCreditCard />,    label: "Total Deposit",  val: formatCurrency(fin.total_deposit),    color: "#f4d47c" },
              { icon: <FiTrendingUp />,    label: "Direct Income",  val: formatCurrency(fin.direct_income),    color: "#f4d47c" },
              { icon: <FaTrophy />,        label: "Total Winnings", val: formatCurrency(fin.total_win_amount), color: "#f4d47c" },
              { icon: <FaMoneyBillWave />, label: "Total Withdraw", val: formatCurrency(fin.total_withdraw),   color: "#f4d47c" },
            ].map((item, i) => (
              <div key={i} className="profile-fin-card" style={{ "--profile-fin-color": item.color }}>
                <span className="profile-fin-icon">{item.icon}</span>
                <span className="profile-fin-val">{item.val}</span>
                <span className="profile-fin-lbl">{item.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══ REFERRAL TAB ══ */}
      {activeTab === "referral" && (
        <>
          <div className="profile-section-label">
            <div className="profile-section-line" />
            <span className="profile-section-text">MY REFERRAL CODE</span>
            <div className="profile-section-line" />
          </div>
          <div className="profile-ref-code-card">
            <div className="profile-ref-code-display">
              <span className="profile-ref-code-text">{ref.my_referal_code}</span>
              <button
                className={`profile-ref-copy-btn ${copied ? "profile-copied" : ""}`}
                onClick={() => copyCode(ref.my_referal_code)}
              >
                {copied ? <><FiCheck />Copied</> : <><FiCopy />Copy</>}
              </button>
            </div>
            <div className="profile-ref-code-sub">Share this code to earn referral bonuses</div>
            <div className="profile-ref-stats-row">
              <div className="profile-ref-stat">
                <span className="profile-ref-stat-val">{ref.total_direct}</span>
                <span className="profile-ref-stat-lbl">Direct Referrals</span>
              </div>
            </div>
          </div>

          <div className="profile-section-label">
            <div className="profile-section-line" />
            <span className="profile-section-text">YOUR TEAM ({ref.total_direct})</span>
            <div className="profile-section-line" />
          </div>

          {ref.direct_referrals.length === 0 ? (
            <div className="profile-empty-state">
              <FaUserFriends />
              <p>No referrals yet. Share your code to get started!</p>
            </div>
          ) : (
            <div className="profile-lb-card">
              {ref.direct_referrals.map((r) => (
                <div key={r.id} className="profile-lb-row">
                  <div className="profile-ref-user-avatar">{getInitials(r.name)}</div>
                  <div className="profile-lb-info">
                    <span className="profile-lb-name">{r.name}</span>
                    <span className="profile-lb-streak">{r.email}</span>
                    <span className="profile-ref-date">Joined {formatDate(r.created_at)}</span>
                  </div>
                  <div className="profile-ref-code-chip">{r.referal_code}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══ BET STATS TAB ══ */}
      {activeTab === "bets" && (
        <>
          <div className="profile-section-label">
            <div className="profile-section-line" />
            <span className="profile-section-text">BET PERFORMANCE</span>
            <div className="profile-section-line" />
          </div>
          <div className="profile-winrate-hero">
            <div className="profile-wr-circle-wrap">
              <svg className="profile-wr-svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#wrGrad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${winRate * 2.638} 263.8`}
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="wrGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="profile-wr-center">
                <span className="profile-wr-pct">{winRate}%</span>
                <span className="profile-wr-lbl">WIN RATE</span>
              </div>
            </div>
          </div>
          <div className="profile-bet-stat-grid">
            {[
           { icon: <FiTarget />,     label: "Total Bets",  val: bs.total_bets,                        color: "#F4D47C" },
{ icon: <FiCheck />,      label: "Won",         val: bs.won_bets,                          color: "#D4AF37" },
{ icon: <FiActivity />,   label: "Lost",        val: bs.lost_bets,                         color: "#c9901a" },
{ icon: <FiActivity />,   label: "Pending",     val: bs.pending_bets,                      color: "#7a6420" },
{ icon: <FiDollarSign />, label: "Bet Amount",  val: formatCurrency(bs.total_bet_amount),  color: "#F4D47C" },
{ icon: <FiAward />,      label: "Won Amount",  val: formatCurrency(bs.total_win_amount),  color: "#D4AF37" },
{ icon: <FaChartPie />,   label: "Lost Amount", val: formatCurrency(bs.total_loss_amount), color: "#c9901a" },
            ].map((s, i) => (
              <div key={i} className="profile-bet-stat-card" style={{ "--profile-bs-color": s.color }}>
                <span className="profile-bs-icon">{s.icon}</span>
                <span className="profile-bs-val">{s.val}</span>
                <span className="profile-bs-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══ EDIT NAME MODAL ══ */}
      {editModalOpen && (
        <div className="profile-modal-backdrop" onClick={closeEditModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="profile-modal-title-row">
                <div className="profile-modal-icon-wrap"><FiEdit2 /></div>
                <span className="profile-modal-title">EDIT NAME</span>
              </div>
              <button className="profile-modal-close" onClick={closeEditModal}><FiX /></button>
            </div>

            {editToast.msg && <Toast msg={editToast.msg} type={editToast.type} />}

            <div className="profile-modal-body">
              <div>
                <label className="profile-modal-field-label">FULL NAME</label>
                <div className="profile-modal-input-wrap">
                  <span className="profile-modal-input-icon"><FiUser /></span>
                  <input
                    className="profile-modal-input"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateProfile();
                      if (e.key === "Escape") closeEditModal();
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="profile-modal-footer">
              <button className="profile-modal-cancel-btn" onClick={closeEditModal} disabled={editLoading}>
                Cancel
              </button>
              <button className="profile-modal-save-btn" onClick={handleUpdateProfile} disabled={editLoading}>
                {editLoading
                  ? <><div className="profile-btn-spinner" />Saving...</>
                  : <><FiSave />Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ CHANGE PASSWORD MODAL ══ */}
      {pwModalOpen && (
        <div className="profile-modal-backdrop" onClick={closePwModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="profile-modal-title-row">
                <div className="profile-modal-icon-wrap profile-modal-icon-lock"><FiLock /></div>
                <span className="profile-modal-title">CHANGE PASSWORD</span>
              </div>
              <button className="profile-modal-close" onClick={closePwModal}><FiX /></button>
            </div>

            {pwToast.msg && <Toast msg={pwToast.msg} type={pwToast.type} />}

            <div className="profile-modal-body">
              <div>
                <label className="profile-modal-field-label">CURRENT PASSWORD</label>
                <div className="profile-modal-input-wrap">
                  <span className="profile-modal-input-icon profile-modal-icon-cyan"><FiLock /></span>
                  <input
                    className="profile-modal-input profile-modal-input-pw"
                    type={showPw.current ? "text" : "password"}
                    value={pwForm.current_password}
                    onChange={(e) => setPwForm((p) => ({ ...p, current_password: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <button
                    className="profile-modal-pw-eye"
                    onClick={() => setShowPw((p) => ({ ...p, current: !p.current }))}
                    type="button"
                  >
                    {showPw.current ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="profile-modal-field-label">NEW PASSWORD</label>
                <div className="profile-modal-input-wrap">
                  <span className="profile-modal-input-icon profile-modal-icon-cyan"><FiLock /></span>
                  <input
                    className="profile-modal-input profile-modal-input-pw"
                    type={showPw.new ? "text" : "password"}
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <button
                    className="profile-modal-pw-eye"
                    onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}
                    type="button"
                  >
                    {showPw.new ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="profile-modal-field-label">CONFIRM NEW PASSWORD</label>
                <div className="profile-modal-input-wrap">
                  <span className="profile-modal-input-icon profile-modal-icon-cyan"><FiLock /></span>
                  <input
                    className="profile-modal-input profile-modal-input-pw"
                    type={showPw.confirm ? "text" : "password"}
                    value={pwForm.new_password_confirmation}
                    onChange={(e) => setPwForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
                    placeholder="Confirm new password"
                    onKeyDown={(e) => { if (e.key === "Enter") handleChangePassword(); }}
                  />
                  <button
                    className="profile-modal-pw-eye"
                    onClick={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                    type="button"
                  >
                    {showPw.confirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="profile-modal-footer">
              <button className="profile-modal-cancel-btn" onClick={closePwModal} disabled={pwLoading}>
                Cancel
              </button>
              <button
                className="profile-modal-save-btn profile-modal-save-btn-cyan"
                onClick={handleChangePassword}
                disabled={pwLoading}
              >
                {pwLoading
                  ? <><div className="profile-btn-spinner" />Updating...</>
                  : <><FiLock />Change Password</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ LOGOUT CONFIRM MODAL ══ */}
      {logoutConfirm && (
        <div className="profile-modal-backdrop" onClick={cancelLogout}>
          <div className="profile-modal profile-logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-logout-modal-inner">
              <div className="profile-logout-icon-wrap">
                <FiLogOut />
              </div>
              <h3 className="profile-logout-title">LOGOUT?</h3>
              <p className="profile-logout-desc">Are you sure you want to log out of your account?</p>
              <div className="profile-logout-actions">
                <button className="profile-modal-cancel-btn" onClick={cancelLogout}>
                  Cancel
                </button>
                <button className="profile-logout-confirm-btn" onClick={confirmLogout}>
                  <FiLogOut /> Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}