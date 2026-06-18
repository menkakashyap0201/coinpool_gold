"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiClock, FiRefreshCw, FiZap, FiCheckCircle } from "react-icons/fi";
import { TbCurrencyDollar, TbHourglass, TbCalendarTime, TbHash } from "react-icons/tb";
import "./allrounds.css";

const BASE = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => {
  if (typeof window === "undefined") return "";
  const type = localStorage.getItem("cpx_token_type") || "Bearer";
  const token = localStorage.getItem("cpx_token") || "";
  return `${type} ${token}`;
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const mon = d.toLocaleString("en", { month: "short" });
  const h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = String(h % 12 || 12).padStart(2, "0");
  return `${day} ${mon}, ${h12}:${min} ${ampm}`;
};

const calcDuration = (start, end) => {
  if (!start || !end) return null;
  const diffMs = new Date(end) - new Date(start);
  if (diffMs <= 0) return null;
  const totalSec = Math.floor(diffMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const formatCountdown = (seconds) => {
  if (!seconds || seconds <= 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// ID + 24000, zero-padded to 5 digits — only for display
const displayId = (id) => String((id ?? 0) + 24000).padStart(5, "0");

const SkeletonCard = () => (
  <div className="rnd-skeleton">
    <div className="rnd-sk-row">
      <div className="rnd-sk-bar w40 h16" />
      <div className="rnd-sk-bar w25 h20" />
    </div>
    <div className="rnd-sk-time-row">
      <div className="rnd-sk-bar w45 h28" />
      <div className="rnd-sk-bar w10 h8" style={{ alignSelf: "center" }} />
      <div className="rnd-sk-bar w45 h28" />
    </div>
    <div className="rnd-sk-row" style={{ marginTop: 10 }}>
      <div className="rnd-sk-bar w45 h22" />
      <div className="rnd-sk-bar w45 h22" />
    </div>
  </div>
);

const ActiveRoundCard = ({ round, onExpire }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= new Date(round.end_time).getTime()) {
        clearInterval(t);
        onExpire(round.id);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [round.end_time, round.id, onExpire]);

  const endMs      = new Date(round.end_time).getTime();
  const startMs    = new Date(round.start_time).getTime();
  const countdown  = Math.max(0, Math.floor((endMs - now) / 1000));
  const totalSec   = Math.max(1, Math.floor((endMs - startMs) / 1000));
  const elapsedSec = Math.max(0, Math.floor((now - startMs) / 1000));
  const pct        = Math.min(100, Math.floor((elapsedSec / totalSec) * 100));
  const betAmt     = parseFloat(round.amount ?? 5).toFixed(2);
  const duration   = calcDuration(round.start_time, round.end_time);

  return (
    <div className="rnd-card rnd-card-live">
      <div className="rnd-card-top">
        <div className="rnd-id-block">
          <span className="rnd-id-eyebrow"><TbHash size={9} /> Round ID</span>
          <span className="rnd-id-num">#{displayId(round.id)}</span>
        </div>
        <div className="rnd-top-right">
          {duration && (
            <span className="rnd-duration-chip">
              <FiClock size={10} style={{ marginRight: 3 }} />{duration}
            </span>
          )}
          <span className="rnd-badge rnd-badge-live">
            <span className="rnd-live-dot" /> LIVE
          </span>
        </div>
      </div>

      <div className="rnd-time-rail">
        <div className="rnd-time-col">
          <span className="rnd-time-eyebrow">Started</span>
          <span className="rnd-time-val rnd-time-dim">{formatDateTime(round.start_time)}</span>
        </div>
        <div className="rnd-time-arrow">
          <div className="rnd-arrow-line" />
          <div className="rnd-arrow-head" />
        </div>
        <div className="rnd-time-col rnd-time-col-end">
          <span className="rnd-time-eyebrow">Ends</span>
          <span className="rnd-time-val rnd-time-gold">{formatDateTime(round.end_time)}</span>
        </div>
      </div>

      <div className="rnd-progress-wrap">
        <div className="rnd-progress-track">
          <div className="rnd-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="rnd-progress-label">{pct}% elapsed</span>
      </div>

      <div className="rnd-bottom-row">
        <div className="rnd-entry-block">
          <TbCurrencyDollar size={13} className="rnd-stat-ico" />
          <div>
            <div className="rnd-stat-lbl">Entry</div>
            <div className="rnd-stat-val">${betAmt} <span className="rnd-usdt">USDT</span></div>
          </div>
        </div>
        <div className="rnd-countdown-block">
          <span className="rnd-countdown-label rnd-label-live">Closes in</span>
          <span className="rnd-countdown-val rnd-countdown-live">{formatCountdown(countdown)}</span>
        </div>
      </div>

      <div className="rnd-card-footer">
        <button className="rnd-cta-btn rnd-cta-live">
          <FiZap size={12} /> Enter Now
        </button>
      </div>
    </div>
  );
};

const UpcomingRoundCard = ({ round }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const startMs   = new Date(round.start_time).getTime();
  const countdown = Math.max(0, Math.floor((startMs - now) / 1000));
  const isHot     = countdown > 0 && countdown <= 3600;
  const betAmt    = parseFloat(round.amount ?? 5).toFixed(2);
  const duration  = calcDuration(round.start_time, round.end_time);

  return (
    <div className={`rnd-card${isHot ? " rnd-card-soon" : ""}`}>
      <div className="rnd-card-top">
        <div className="rnd-id-block">
          <span className="rnd-id-eyebrow"><TbHash size={9} /> Round ID</span>
          <span className="rnd-id-num">#{displayId(round.id)}</span>
        </div>
        <div className="rnd-top-right">
          {duration && (
            <span className="rnd-duration-chip">
              <FiClock size={10} style={{ marginRight: 3 }} />{duration}
            </span>
          )}
          <span className="rnd-badge rnd-badge-upcoming">
            <TbHourglass size={11} /> UPCOMING
          </span>
        </div>
      </div>

      <div className="rnd-time-rail">
        <div className="rnd-time-col">
          <span className="rnd-time-eyebrow">Starts</span>
          <span className="rnd-time-val">{formatDateTime(round.start_time)}</span>
        </div>
        <div className="rnd-time-arrow">
          <div className="rnd-arrow-line" />
          <div className="rnd-arrow-head" />
        </div>
        <div className="rnd-time-col rnd-time-col-end">
          <span className="rnd-time-eyebrow">Ends</span>
          <span className="rnd-time-val">{formatDateTime(round.end_time)}</span>
        </div>
      </div>

      <div className="rnd-bottom-row">
        <div className="rnd-entry-block">
          <TbCurrencyDollar size={13} className="rnd-stat-ico" />
          <div>
            <div className="rnd-stat-lbl">Entry</div>
            <div className="rnd-stat-val">${betAmt} <span className="rnd-usdt">USDT</span></div>
          </div>
        </div>
        <div className="rnd-countdown-block">
          <span className="rnd-countdown-label">Opens in</span>
          <span className={`rnd-countdown-val ${isHot ? "rnd-countdown-hot" : "rnd-countdown-gold"}`}>
            {formatCountdown(countdown)}
          </span>
        </div>
      </div>

      <div className="rnd-card-footer">
        <button className="rnd-cta-btn">
          <FiZap size={12} /> Coming Soon
        </button>
      </div>
    </div>
  );
};

export default function AllRoundsPage() {
  const router = useRouter();
  const [activeRounds,   setActiveRounds]   = useState([]);
  const [upcomingRounds, setUpcomingRounds] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [lastUpdated,    setLastUpdated]    = useState(null);

  const fetchRounds = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch(`${BASE}/all-rounds`, {
        headers: { Accept: "application/json", Authorization: getToken() },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status && Array.isArray(json.data)) {
          const now = Date.now();
          const active = json.data
            .filter((r) => r.status === "active" && new Date(r.end_time).getTime() > now)
            .sort((a, b) => new Date(a.end_time) - new Date(b.end_time));
          const upcoming = json.data
            .filter((r) => r.status === "upcoming")
            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
          setActiveRounds(active);
          setUpcomingRounds(upcoming);
        }
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("[AllRounds] Fetch failed:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("cpx_token");
    if (!token) { router.replace("/login"); return; }
    fetchRounds();
    const poll = setInterval(() => fetchRounds(), 15000);
    return () => clearInterval(poll);
  }, [fetchRounds, router]);

  const handleExpire = useCallback((id) => {
    setActiveRounds((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const totalVisible = activeRounds.length + upcomingRounds.length;

  return (
    <div className="ar-page">

      <div className="ar-header">
        <button className="ar-back-btn" onClick={() => router.back()}>
          <FiArrowLeft size={18} />
        </button>
        <div className="ar-header-center">
          <span className="ar-header-title">All Rounds</span>
          {lastUpdated && (
            <span className="ar-header-sub">
              <TbCalendarTime size={10} style={{ marginRight: 3 }} />
              {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
        <button
          className={`ar-refresh-btn${refreshing ? " ar-refreshing" : ""}`}
          onClick={() => fetchRounds(true)}
          disabled={refreshing}
        >
          <FiRefreshCw size={16} />
        </button>
      </div>

      <div className="ar-count-banner">
        <TbHourglass size={18} className="ar-banner-icon" />
        <div>
          <div className="ar-banner-title">Live & Upcoming</div>
          <div className="ar-banner-sub">
            {loading ? "Loading…" : `${activeRounds.length} live · ${upcomingRounds.length} upcoming`}
          </div>
        </div>
        <div className="ar-banner-count">{loading ? "—" : totalVisible}</div>
      </div>

      <div className="ar-content">
        {loading && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

        {!loading && totalVisible === 0 && (
          <div className="ar-empty">
            <TbHourglass size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
            <div className="ar-empty-title">No rounds right now</div>
            <div className="ar-empty-sub">Check back soon or refresh</div>
          </div>
        )}

        {!loading && activeRounds.length > 0 && (
          <>
            <div className="ar-section-label">
              <span className="ar-section-dot live" />
              <span>LIVE NOW</span>
              <div className="ar-section-line" />
            </div>
            {activeRounds.map((r) => (
              <ActiveRoundCard key={r.id} round={r} onExpire={handleExpire} />
            ))}
          </>
        )}

        {!loading && upcomingRounds.length > 0 && (
          <>
            <div className="ar-section-label" style={{ marginTop: activeRounds.length > 0 ? 14 : 0 }}>
              <span className="ar-section-dot upcoming" />
              <span>UPCOMING</span>
              <div className="ar-section-line" />
            </div>
            {upcomingRounds.map((r) => (
              <UpcomingRoundCard key={r.id} round={r} />
            ))}
          </>
        )}
      </div>

      <div style={{ height: 48 }} />
    </div>
  );
}