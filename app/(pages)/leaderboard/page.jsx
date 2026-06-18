"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { TbTrophy } from "react-icons/tb";
import { RiVipCrownLine } from "react-icons/ri";
import "./leaderboard.css";

const BASE = process.env.NEXT_PUBLIC_API_URL;

const getToken = () => {
  if (typeof window === "undefined") return "";
  const type  = localStorage.getItem("cpx_token_type") || "Bearer";
  const token = localStorage.getItem("cpx_token")      || "";
  return `${type} ${token}`;
};

const toDate = (d) => d.toISOString().split("T")[0];
const TODAY  = toDate(new Date());

const getDateRange = (tab) => {
  const now = new Date();
  if (tab === "today") return { start: TODAY, end: TODAY };
  if (tab === "week") {
    const s = new Date(now); s.setDate(now.getDate() - 6);
    return { start: toDate(s), end: TODAY };
  }
  if (tab === "month") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: toDate(s), end: TODAY };
  }
  return null; // alltime → global endpoint
};

const TABS = [
  { key: "today",   label: "Today"    },
  { key: "week",    label: "Week"     },
  { key: "month",   label: "Month"    },
  { key: "alltime", label: "All Time" },
];

// ── Avatar circle — first letter ──
const Avatar = ({ name, size = "md" }) => (
  <div className={`lb-avatar-circle lb-avatar-${size}`}>
    {(name ?? "?").charAt(0).toUpperCase()}
  </div>
);

// ── Empty podium slot ──
const EmptySlot = ({ pos }) => {
  const rankNum = pos === "center" ? 1 : pos === "left" ? 2 : 3;
  const ring    = pos === "center" ? "gold" : pos === "left" ? "silver" : "bronze";
  return (
    <div className={`lb-podium-player lb-podium-${pos}`}>
      {pos === "center" && <div className="lb-crown lb-crown-dim"><RiVipCrownLine size={22} /></div>}
      <div className={`lb-podium-avatar-wrap lb-avatar-${ring} lb-slot-empty`}>
        <div className="lb-podium-avatar lb-podium-avatar-empty">
          <span className="lb-empty-slot-num">{rankNum}</span>
        </div>
        <div className="lb-podium-rank-badge">{rankNum}</div>
      </div>
      <div className="lb-podium-name lb-name-empty">—</div>
      <div className="lb-podium-amt lb-amt-empty">Empty</div>
    </div>
  );
};

// ── Podium Player ──
const PodiumPlayer = ({ player, pos }) => {
  // null → empty slot
  if (!player) return <EmptySlot pos={pos} />;

  const isCenter = pos === "center";
  const rankNum  = isCenter ? 1 : pos === "left" ? 2 : 3;
  const ring     = isCenter ? "gold" : pos === "left" ? "silver" : "bronze";
  const amtCls   = isCenter ? "lb-amt-gold" : pos === "left" ? "lb-amt-silver" : "lb-amt-bronze";
  const amt      = parseFloat(player.total_win_amount ?? 0).toFixed(2);

  return (
    <div className={`lb-podium-player lb-podium-${pos}`}>
      {isCenter && <div className="lb-crown"><RiVipCrownLine size={22} /></div>}
      <div className={`lb-podium-avatar-wrap lb-avatar-${ring}`}>
        <div className="lb-podium-avatar">
          <Avatar name={player.user?.name} size={isCenter ? "lg" : "md"} />
        </div>
        <div className="lb-podium-rank-badge">{rankNum}</div>
      </div>
      <div className="lb-podium-name">{player.user?.name ?? "—"}</div>
      <div className={`lb-podium-amt ${amtCls}`}>${amt} USDT</div>
    </div>
  );
};

// ── List Row rank 4+ ──
const ListRow = ({ player }) => {
  const amt = parseFloat(player.total_win_amount ?? 0).toFixed(2);
  return (
    <div className="lb-list-row">
      <span className="lb-list-rank">#{player.rank}</span>
      <div className="lb-list-avatar-sm">
        <Avatar name={player.user?.name} size="sm" />
      </div>
      <div className="lb-list-name">{player.user?.name ?? "—"}</div>
      <div className="lb-list-right">
        <span className="lb-list-amt">${amt} USDT</span>
      </div>
    </div>
  );
};

// ── Skeleton ──
const Skeleton = () => (
  <div className="lb-skeleton">
    <div className="lb-sk-podium">
      <div className="lb-sk-pod-item s" />
      <div className="lb-sk-pod-item g" />
      <div className="lb-sk-pod-item b" />
    </div>
    <div className="lb-sk-list">
      {[0,1,2,3].map(i => <div key={i} className="lb-sk-row" style={{ animationDelay: `${i*0.08}s` }} />)}
    </div>
  </div>
);

// ── Main Page ──
export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("today");
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [total,     setTotal]     = useState(0);
  const [range,     setRange]     = useState(null);

  const fetchLeaderboard = useCallback(async (tab) => {
    setLoading(true);
    setData([]);
    try {
      const dr = getDateRange(tab);
      setRange(dr);
      const url = dr === null
        ? `${BASE}/global-leaderboard`
        : `${BASE}/date-leaderboard?start_date=${dr.start}&end_date=${dr.end}`;
      const res  = await fetch(url, {
        headers: { Accept: "application/json", Authorization: getToken() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setData(json.data);
        setTotal(json.total_participants ?? json.data.length);
      } else {
        setData([]); setTotal(0);
      }
    } catch (err) {
      console.error("[Leaderboard]", err.message);
      setData([]); setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaderboard(activeTab); }, [activeTab, fetchLeaderboard]);

  // FIXED: always fixed slots — rank1 → center, rank2 → left, rank3 → right
  // null if that rank doesn't exist in data
  const byRank = (r) => data.find((p) => p.rank === r) ?? null;
  const rank1 = byRank(1);
  const rank2 = byRank(2);
  const rank3 = byRank(3);
  const listRows = data.filter((p) => p.rank >= 4);

  const metaRange = range
    ? range.start === range.end
      ? range.start
      : `${range.start} → ${range.end}`
    : "All time";

  return (
    <div className="lb-page">

      {/* ── HEADER ── */}
      <div className="lb-header">
        <button className="lb-back-btn" onClick={() => router.back()}>
          <FiArrowLeft size={18} />
        </button>
        <span className="lb-header-title">LEADERBOARD</span>
        <div className="lb-header-icon"><TbTrophy size={20} /></div>
      </div>

      {/* ── TABS ── */}
      <div className="lb-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`lb-tab${activeTab === t.key ? " lb-tab-active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── META ── */}
      {!loading && (
        <div className="lb-meta-row">
          <span className="lb-meta-text">{total} participant{total !== 1 ? "s" : ""}</span>
          <span className="lb-meta-range">{metaRange}</span>
        </div>
      )}

      {loading && <Skeleton />}

      {!loading && (
        <>
          {/* ── PODIUM — always 3 fixed slots ── */}
          <div className="lb-podium-section">
            <div className="lb-podium-glow" />
            <div className="lb-podium-row">
              {/* LEFT = rank 2 */}
              <PodiumPlayer player={rank2} pos="left" />
              {/* CENTER = rank 1 */}
              <PodiumPlayer player={rank1} pos="center" />
              {/* RIGHT = rank 3 */}
              <PodiumPlayer player={rank3} pos="right" />
            </div>
            <div className="lb-stage-row">
              <div className="lb-stage lb-stage-silver"><span>2</span></div>
              <div className="lb-stage lb-stage-gold"><span>1</span></div>
              <div className="lb-stage lb-stage-bronze"><span>3</span></div>
            </div>
          </div>

          {/* ── LIST rank 4+ ── */}
          {listRows.length > 0 && (
            <div className="lb-list-card">
              {listRows.map((p) => (
                <ListRow key={p.user_id ?? p.rank} player={p} />
              ))}
            </div>
          )}

          {/* ── ALL EMPTY ── */}
          {data.length === 0 && (
            <div className="lb-empty">
              <TbTrophy size={40} style={{ opacity: 0.15, marginBottom: 12 }} />
              <div className="lb-empty-title">No winners yet</div>
              <div className="lb-empty-sub">Be the first to place a winning bet!</div>
            </div>
          )}
        </>
      )}

      <div style={{ height: 48 }} />
    </div>
  );
}