"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import "./home.css";
import SparkChart from "../../components/TradingView/SparkChart";
import { useRouter } from "next/navigation";
import {
  BiBitcoin,
} from "react-icons/bi";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiArrowRight,
  FiAlertTriangle,
  FiCheckCircle,
  FiLock,
  FiClock,
  FiLoader,
  FiTarget,
  FiZap,
  FiAward,
  FiX,
  FiUsers,
} from "react-icons/fi";
import {
  MdOutlineWaterDrop,
} from "react-icons/md";
import {
  RiRocketLine,
  RiNumbersLine,
  RiBarChartGroupedLine,
} from "react-icons/ri";
import {
  TbTrophy,
  TbMedal,
  TbCurrencyDollar,
  TbCircleNumber1,
  TbCircleNumber2,
  TbCircleNumber3,
  TbCircleNumber4,
  TbUsers,
  TbPercentage,
  TbInfoCircle,
  TbRefresh,
} from "react-icons/tb";
import {
  PiCoinVerticalDuotone,
} from "react-icons/pi";
import { FaHistory } from "react-icons/fa";
import Link from "next/link";


const BASE = process.env.NEXT_PUBLIC_API_URL;
const POLL_INTERVAL = 5000;

const WINNER_ICONS_COMP = [
  <TbTrophy  key="0" />,
  <TbMedal   key="1" />,
  <FiTarget  key="2" />,
  <TbTrophy  key="3" />,
  <FiZap     key="4" />,
  <FiAward   key="5" />,
];

const RANK_ICONS_COMP = ["🥇", "🥈", "🥉"];

const getToken = () => {
  if (typeof window === "undefined") return "";
  const type  = localStorage.getItem("cpx_token_type") || "Bearer";
  const token = localStorage.getItem("cpx_token")      || "";
  return `${type} ${token}`;
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );
  return { toasts, addToast, removeToast };
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon r-icon r-icon-sm">
            {t.type === "error"   ? <FiAlertTriangle /> :
             t.type === "success" ? <FiCheckCircle  /> :
                                    <TbInfoCircle   />}
          </span>
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => onRemove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Static deco SVG lines ────────────────────────────────────────────────────


// ─── Pool Hero Logo (right side) ─────────────────────────────────────────────
function HeroLogo() {
  return (
    <div className="pool-hero-logo">
      <Link href="/bethistory">
       <div className="pool-hero-logo-icon">
        <FaHistory style={{ color:"gold" }}/>
      </div>
      </Link>
    </div>
  );
}

// ─── Round Participants Modal ─────────────────────────────────────────────────
function RoundParticipantsModal({ open, onClose, roundBets, roundBetsPool, currentRoundId, betsLoading }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="rp-overlay" onClick={onClose}>
      <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rp-modal-header">
          <div className="rp-modal-title">
             <div className="action-btn-icon">
            <TbUsers size={20} />
          </div>
            ROUND PARTICIPANTS
          </div>
          <div className="rp-modal-meta">
            <span className="rp-round-badge">
              {currentRoundId ? "Round #" + String(currentRoundId + 24000).padStart(5, "0") : "Round #00000"}
            </span>
            <button className="rp-close-btn" onClick={onClose}>
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="rp-stats-bar">
          <div className="rp-stat">
            <span className="rp-stat-label">Total Bets</span>
            <span className="rp-stat-val">{roundBets.length}</span>
          </div>
          <div className="rp-stat-divider" />
          <div className="rp-stat">
            <span className="rp-stat-label">Prize Pool</span>
            <span className="rp-stat-val gold">${parseFloat(roundBetsPool).toFixed(2)}</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="rp-scroll-body">
          {betsLoading && (
            <div className="rp-empty">
              <FiLoader size={24} style={{ marginBottom: 10, opacity: 0.4, animation: "spin 1s linear infinite" }} />
              <div>Loading participants…</div>
            </div>
          )}

          {!betsLoading && roundBets.length === 0 && (
            <div className="rp-empty">
              <TbUsers size={32} style={{ marginBottom: 10, opacity: 0.3 }} />
              <div>No participants yet</div>
              <div style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>Be the first to place a bet!</div>
            </div>
          )}

          {!betsLoading && roundBets.map((bet, i) => (
            <div key={bet.id} className="rp-row">
              <span className={`rp-rank${i < 3 ? ` rp-rank-${i+1}` : " rp-rank-n"}`}>
                {i < 3 ? RANK_ICONS_COMP[i] : `#${i+1}`}
              </span>
              <div className="rp-avatar">
                {bet.user?.name ? bet.user.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="rp-info">
                <div className="rp-name">{bet.user?.name || "Anonymous"}</div>
                <div className="rp-preds">
                  <span className="rp-pred-tag">#{bet.question_1_ans}</span>
                  <span className="rp-pred-tag">{bet.question_2_ans === 0 ? "Big" : "Small"}</span>
                  <span className="rp-pred-tag">{bet.question_3_ans === 0 ? "Odd" : "Even"}</span>
                  <span className="rp-pred-tag">{bet.question_4_ans === 0 ? "Rise" : "Fall"}</span>
                </div>
              </div>
              <div className="rp-amount-col">
                <span className="rp-amount">${parseFloat(bet.amount).toFixed(2)}</span>
                {parseFloat(bet.win_amount ?? 0) > 0 && (
                  <span className="rp-win">+${parseFloat(bet.win_amount).toFixed(2)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("cpx_token");
    if (!token) router.replace("/login");
  }, [router]);

  const { toasts, addToast, removeToast } = useToast();

  // ── Modal state ──────────────────────────────────────────────────────────
  const [rpModalOpen, setRpModalOpen] = useState(false);
  const [pdModalOpen, setPdModalOpen] = useState(false);

  const [exactNum, setExactNum] = useState(null);
  const [bigSmall, setBigSmall] = useState(null);
  const [oddEven,  setOddEven]  = useState(null);
  const [riseFall, setRiseFall] = useState(null);

  const [baseAmount, setBaseAmount] = useState(null);
  const [amount,     setAmount]     = useState(null);

  const [liveBtcPrice, setLiveBtcPrice] = useState(103284.0);
  const [change, setChange] = useState({ val: 0, pct: 0, up: true });
  const liveBtcPriceRef = useRef(103284.0);

  const [currentRoundId,  setCurrentRoundId]  = useState(null);
  const [poolTotal,       setPoolTotal]        = useState("0.00");
  const [timerStarted,    setTimerStarted]     = useState(false);
  const [roundClosed,     setRoundClosed]      = useState(false);
  const [betLoading,      setBetLoading]       = useState(false);
  const [betPlaced,       setBetPlaced]        = useState(false);
  const [betSuccess,      setBetSuccess]       = useState(false);

  const [isUpcoming,       setIsUpcoming]      = useState(false);
  const [upcomingStartsIn, setUpcomingStartsIn]= useState(0);

  const [checkResultLoading, setCheckResultLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const [profile,      setProfile]       = useState(null);

  const [myBets,       setMyBets]        = useState([]);
  const [myBetsTotal,  setMyBetsTotal]   = useState(0);
  const [roundBets,    setRoundBets]     = useState([]);
  const [roundBetsPool,setRoundBetsPool] = useState("0.00");
  const [betsLoading,  setBetsLoading]   = useState(false);

  const [winners, setWinners] = useState([]);

  const minsRef               = useRef(null);
  const secsRef               = useRef(null);
  const timerRowRef           = useRef(null);
  const timerRef              = useRef(null);
  const upcomingTimerRef      = useRef(null);
  const timeLeftRef           = useRef(0);
  const currentRoundIdRef     = useRef(null);
  const handleCurrentRoundRef = useRef(null);

  const allSelected  = exactNum !== null && bigSmall && oddEven && riseFall;
  const amountLoaded = baseAmount !== null && amount !== null;
  const betDisabled  = !allSelected || betLoading || roundClosed || !amountLoaded || betPlaced || isUpcoming;

  const upcomingMins = String(Math.floor(upcomingStartsIn / 60)).padStart(2, "0");
  const upcomingSecs = String(upcomingStartsIn % 60).padStart(2, "0");

  const lastDigit = Math.floor((liveBtcPrice * 100) % 10);

  const formattedPrice = Number(liveBtcPrice).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // ── API helpers ────────────────────────────────────────────────────────────
  const handlePriceUpdate = useCallback((p) => {
    setLiveBtcPrice(p);
    liveBtcPriceRef.current = p;
  }, []);

  const fetchBinancePrice = useCallback(async () => {
    try {
      const res  = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const price  = parseFloat(data.lastPrice          ?? 0);
      const absChg = parseFloat(data.priceChange        ?? 0);
      const pctChg = parseFloat(data.priceChangePercent ?? 0);
      if (price > 0) {
        handlePriceUpdate(price);
        setChange({ val: Math.abs(absChg).toFixed(2), pct: Math.abs(pctChg).toFixed(2), up: pctChg >= 0 });
      }
    } catch (err) {
      console.warn("[BTC Price] Primary fetch failed:", err.message);
      try {
        const r2 = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const d2 = await r2.json();
        if (d2.price) handlePriceUpdate(parseFloat(d2.price));
      } catch (fallbackErr) {
        console.error("[BTC Price] Fallback also failed:", fallbackErr.message);
      }
    }
  }, [handlePriceUpdate]);

  const fetchWinners = useCallback(async (roundId) => {
    if (!roundId) return;
    try {
      const res  = await fetch(`${BASE}/round-bets/${roundId}`, {
        headers: { Accept: "application/json", Authorization: getToken() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status && json.round?.bets) {
        const list = json.round.bets
          .filter((b) => parseFloat(b.win_amount ?? 0) > 0)
          .sort((a, b) => parseFloat(b.win_amount) - parseFloat(a.win_amount))
          .map((b, i) => ({
            name: b.user?.name || "Anonymous",
            amt:  `+${parseFloat(b.win_amount).toFixed(2)} USDT`,
            iconComp: WINNER_ICONS_COMP[i % WINNER_ICONS_COMP.length],
          }));
        if (list.length > 0) setWinners(list);
      }
    } catch (err) {
      console.warn("[Winners] Failed to fetch:", err.message);
    }
  }, []);

  const handleRoundBets = useCallback(async (roundId) => {
    if (!roundId) return;
    setBetsLoading(true);
    try {
      const res  = await fetch(`${BASE}/round-bets/${roundId}`, {
        headers: { Accept: "application/json", Authorization: getToken() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status && json.round) {
        setRoundBets(json.round.bets                ?? []);
        setRoundBetsPool(json.round.total_pool_amount ?? "0.00");
        const list = (json.round.bets ?? [])
          .filter((b) => parseFloat(b.win_amount ?? 0) > 0)
          .sort((a, b) => parseFloat(b.win_amount) - parseFloat(a.win_amount))
          .map((b, i) => ({ name: b.user?.name || "Anonymous", amt: `+${parseFloat(b.win_amount).toFixed(2)} USDT`, iconComp: WINNER_ICONS_COMP[i % WINNER_ICONS_COMP.length] }));
        if (list.length > 0) setWinners(list);
      }
    } catch (err) {
      console.error("[Round Bets] Fetch failed:", err.message);
    } finally {
      setBetsLoading(false);
    }
  }, []);

  const handleMyBets = useCallback(async () => {
    try {
      const res  = await fetch(`${BASE}/my-bets`, {
        headers: { Accept: "application/json", Authorization: getToken() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status) {
        setMyBets(json.bets       ?? []);
        setMyBetsTotal(json.total_bets ?? 0);
      }
    } catch (err) {
      console.warn("[My Bets] Fetch failed:", err.message);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const res  = await fetch(`${BASE}/dashboard`, {
        headers: { Accept: "application/json", Authorization: getToken() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) setDashboardData(json.data ?? null);
    } catch (err) {
      console.warn("[Dashboard] Fetch failed:", err.message);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res  = await fetch(`${BASE}/profile`, {
        headers: { Accept: "application/json", Authorization: getToken() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status) setProfile(json.data ?? null);
    } catch (err) {
      console.error("[Profile] Fetch failed:", err.message);
      addToast("Could not load profile. Please refresh.", "error");
    }
  }, [addToast]);

  // ── Timer helpers ──────────────────────────────────────────────────────────
  const startTimer = useCallback((secs) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timeLeftRef.current = secs;
    if (minsRef.current) minsRef.current.textContent = String(Math.floor(secs/60)).padStart(2,"0");
    if (secsRef.current) secsRef.current.textContent = String(secs % 60).padStart(2,"0");
    if (secs <= 0) { setRoundClosed(true); return; }
    setRoundClosed(false);
    setTimerStarted(true);
  }, []);

  const startUpcomingTimer = useCallback((secs) => {
    if (upcomingTimerRef.current) clearInterval(upcomingTimerRef.current);
    let left = Math.max(0, Math.floor(secs));
    setUpcomingStartsIn(left);
    if (left <= 0) return;
    upcomingTimerRef.current = setInterval(() => {
      left -= 1;
      setUpcomingStartsIn(left);
      if (left <= 0) { clearInterval(upcomingTimerRef.current); handleCurrentRoundRef.current?.(); }
    }, 1000);
  }, []);

  // ── Current round ──────────────────────────────────────────────────────────
  const handleCurrentRound = useCallback(async () => {
    try {
      const res  = await fetch(`${BASE}/current-round`, {
        headers: { Accept: "application/json", Authorization: getToken() },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (!json.status && json.upcoming) {
        const upcoming = json.upcoming;
        setIsUpcoming(true);
        setCurrentRoundId(upcoming.id);
        startUpcomingTimer(upcoming.starts_in_seconds ?? 0);
        if (timerRef.current) clearInterval(timerRef.current);
        setTimerStarted(false);
        setRoundClosed(false);
        if (minsRef.current) minsRef.current.textContent = "00";
        if (secsRef.current) secsRef.current.textContent = "00";
        return;
      }

      if (json.status && json.data) {
        setIsUpcoming(false);
        if (upcomingTimerRef.current) clearInterval(upcomingTimerRef.current);

        const newRoundId = json.data.id;
        const isNewRound = currentRoundIdRef.current !== newRoundId;
        currentRoundIdRef.current = newRoundId;
        setCurrentRoundId(newRoundId);

        const rawAmt = json.data.amount ?? "0.00";
        setPoolTotal(rawAmt);

        const parsed = parseFloat(rawAmt || "5");
        const base   = Math.max(1, Number.isInteger(parsed) ? parsed : Math.round(parsed));

        setBaseAmount((prev) => (prev === null || isNewRound ? base : prev));
        setAmount((prev) => {
          if (prev === null || isNewRound) return base;
          if (prev % base !== 0) return base;
          return prev;
        });

        const secs = Math.max(0, Math.floor(json.data.remaining_seconds ?? 0));

        if (isNewRound) {
          startTimer(secs);
          handleRoundBets(newRoundId);
          fetchWinners(newRoundId);
          setExactNum(null); setBigSmall(null); setOddEven(null); setRiseFall(null);
          setBetPlaced(false);
        } else {
          if (Math.abs(timeLeftRef.current - secs) > 3) startTimer(secs);
        }
      }
    } catch (err) {
      console.error("[Current Round] Fetch failed:", err.message);
      if (err.message.includes("401") || err.message.includes("403")) {
        addToast("Session expired. Please log in again.", "error");
      }
    }
  }, [handleRoundBets, fetchWinners, startTimer, startUpcomingTimer, addToast]);

  const handleCheckResult = useCallback(async () => {
    if (!currentRoundId) return;
    setCheckResultLoading(true);
    try {
      const res  = await fetch(`${BASE}/auto-declare-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: getToken() },
        body: JSON.stringify({ round_id: currentRoundId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.already_declared) {
        addToast("Result already declared for this round.", "info");
      } else if (json.success) {
        const price = Number(json.winning_number).toLocaleString("en-US", { minimumFractionDigits: 2 });
        addToast(`Result declared! Winning price: $${price} · Digit: ${json.winning_digit}`, "success");
        handleRoundBets(currentRoundId);
        fetchWinners(currentRoundId);
        handleMyBets();
      } else {
        addToast(json.message || "Failed to declare result.", "error");
      }
    } catch (err) {
      console.error("[Check Result] Failed:", err.message);
      addToast("Network error. Please try again.", "error");
    } finally {
      setCheckResultLoading(false);
    }
  }, [currentRoundId, addToast, handleRoundBets, fetchWinners, handleMyBets]);

  const handlePlaceBet = useCallback(async () => {
    if (!allSelected || !currentRoundId || amount === null) return;
    setBetLoading(true);
    setBetSuccess(false);
    try {
      const body = {
        round_id:       currentRoundId,
        amount:         amount,
        question_1_ans: exactNum,
        question_2_ans: bigSmall  === "big"  ? 0 : 1,
        question_3_ans: oddEven   === "odd"  ? 0 : 1,
        question_4_ans: riseFall  === "rise" ? 0 : 1,
      };
      const res  = await fetch(`${BASE}/place-bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: getToken() },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.status) {
        setBetSuccess(true);
        setBetPlaced(true);
        addToast("Bet placed successfully!", "success");
        handleMyBets();
        handleRoundBets(currentRoundId);
        setTimeout(() => {
          setBetSuccess(false);
          setExactNum(null); setBigSmall(null); setOddEven(null); setRiseFall(null);
          setAmount(baseAmount ?? 5);
        }, 3000);
      } else {
        addToast(json.message || "Bet failed. Please try again.", "error");
      }
    } catch (err) {
      console.error("[Place Bet] Failed:", err.message);
      addToast("Network error. Please try again.", "error");
    } finally {
      setBetLoading(false);
    }
  }, [allSelected, currentRoundId, amount, exactNum, bigSmall, oddEven, riseFall, baseAmount, addToast, handleMyBets, handleRoundBets]);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => { handleCurrentRoundRef.current = handleCurrentRound; }, [handleCurrentRound]);

  useEffect(() => {
    if (!timerStarted) return;
    const tick = () => {
      const t = timeLeftRef.current;
      if (t <= 1) {
        timeLeftRef.current = 0;
        if (minsRef.current) minsRef.current.textContent = "00";
        if (secsRef.current) secsRef.current.textContent = "00";
        setRoundClosed(true);
        setTimerStarted(false);
        clearInterval(timerRef.current);
        return;
      }
      timeLeftRef.current = t - 1;
      if (minsRef.current) minsRef.current.textContent = String(Math.floor(timeLeftRef.current/60)).padStart(2,"0");
      if (secsRef.current) secsRef.current.textContent = String(timeLeftRef.current % 60).padStart(2,"0");
      if (timerRowRef.current) {
        timerRowRef.current.classList.add("timer-pulse");
        setTimeout(() => timerRowRef.current?.classList.remove("timer-pulse"), 300);
      }
    };
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerStarted]);

  useEffect(() => {
    if (!roundClosed) return;
    const t = setTimeout(() => {
      setBetPlaced(false);
      if (currentRoundId) fetchWinners(currentRoundId);
      handleCurrentRound();
      handleMyBets();
    }, 5000);
    return () => clearTimeout(t);
  }, [roundClosed, currentRoundId, fetchWinners, handleCurrentRound, handleMyBets]);

  useEffect(() => {
    if (currentRoundId) fetchWinners(currentRoundId);
  }, [currentRoundId, fetchWinners]);

  useEffect(() => {
    handleCurrentRound();
    handleMyBets();
    fetchBinancePrice();
    fetchDashboard();
    fetchProfile();
    const poll      = setInterval(() => { handleCurrentRound(); handleMyBets(); fetchDashboard(); }, POLL_INTERVAL);
    const pricePoll = setInterval(fetchBinancePrice, 5000);
    return () => {
      clearInterval(poll);
      clearInterval(pricePoll);
      if (upcomingTimerRef.current) clearInterval(upcomingTimerRef.current);
    };
  }, [handleCurrentRound, handleMyBets, fetchBinancePrice, fetchDashboard, fetchProfile]);

  // ── Winners display ────────────────────────────────────────────────────────
  const defaultWinners = [
    { name: "Be the first winner!", amt: "", iconComp: <TbTrophy /> },
    { name: "Place your prediction", amt: "", iconComp: <FiZap /> },
    { name: "Win big rewards", amt: "", iconComp: <PiCoinVerticalDuotone /> },
  ];
  const winnersDisplay =
    winners.length > 0
      ? [...winners, ...winners]
      : [...defaultWinners, ...defaultWinners];

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="home-page">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── ROUND PARTICIPANTS MODAL ─────────────────────────────────── */}
      <RoundParticipantsModal
        open={rpModalOpen}
        onClose={() => setRpModalOpen(false)}
        roundBets={roundBets}
        roundBetsPool={roundBetsPool}
        currentRoundId={currentRoundId}
        betsLoading={betsLoading}
      />

      {/* ── PRIZE DISTRIBUTION MODAL — Bottom Sheet ─────────────────── */}
      {pdModalOpen && (
        <div className="pd-overlay" onClick={() => setPdModalOpen(false)}>
          <div className="pd-modal" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="pd-modal-header">
              <div className="pd-modal-title">
                <div className="action-btn-icon">
            <TbCurrencyDollar size={20} />
          </div>
                PRIZE DISTRIBUTION
              </div>
              <div className="pd-modal-meta">
                <span className="pd-winners-badge">80% to Winners</span>
                <button className="pd-close-btn" onClick={() => setPdModalOpen(false)}>
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Stats bar */}
            <div className="pd-stats-bar">
              <div className="pd-stat">
                <span className="pd-stat-label">Total Pool</span>
                <span className="pd-stat-val gold">${parseFloat(poolTotal).toFixed(2)}</span>
              </div>
              <div className="pd-stat-divider" />
              <div className="pd-stat">
                <span className="pd-stat-label">Winner Share</span>
                <span className="pd-stat-val gold">80%</span>
              </div>
              <div className="pd-stat-divider" />
              <div className="pd-stat">
                <span className="pd-stat-label">Settlement</span>
                <span className="pd-stat-val" style={{ fontSize: 13, color: "var(--green-up)" }}>Auto</span>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="pd-scroll-body">
              {/* Distribution cards */}
              <div className="pd-dist-grid">
                <div className="pd-dist-card gold-card">
                  <span className="pd-dist-icon">🏆</span>
                  <div className="pd-dist-pct">80%</div>
                  <div className="pd-dist-lbl">Winners</div>
                  <div className="pd-dist-sub">Shared by correct predictors</div>
                </div>
                <div className="pd-dist-card blue-card">
                  <span className="pd-dist-icon">⚙️</span>
                  <div className="pd-dist-pct">15%</div>
                  <div className="pd-dist-lbl">Platform</div>
                  <div className="pd-dist-sub">Maintenance & ops</div>
                </div>
                <div className="pd-dist-card green-card">
                  <span className="pd-dist-icon">🤝</span>
                  <div className="pd-dist-pct">5%</div>
                  <div className="pd-dist-lbl">Referral</div>
                  <div className="pd-dist-sub">Referrer bonus</div>
                </div>
              </div>

              {/* Tip */}
              <div className="pd-tip">
                <TbInfoCircle size={16} className="pd-tip-icon" />
                <span>
                  The more predictions you get right, the higher your share of the 80% prize pool.
                  All 4 correct = maximum reward!
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── GREETING HEADER ─────────────────────────────────────────── */}
      <div className="home-header">
        <div className="home-header-left">
          <span className="home-header-hi">Hi,</span>
          <span className="home-header-name">
            {profile?.basic_info?.name
              ? profile.basic_info.name.split(" ")[0]
              : "Name"}
          </span>
        </div>
        <div className="home-header-right">
          <span className="home-header-bal-label">Wallet Balance</span>
          <span className="home-header-bal-val">
            ₹{profile?.financial?.total_wallet_balance != null
              ? Number(profile.financial.total_wallet_balance).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : "0.00"}
          </span>
          <span className="home-header-bal-dot" />
        </div>
      </div>

      {/* ── POOL HERO CARD ──────────────────────────────────────────── */}
      <div className="pool-hero">
        {/* <HeroDeco /> */}
        <HeroLogo />
        <div className="pool-hero-chart" />

        <div className="pool-hero-label">
          <span className="live-dot" style={{ display: "inline-block", marginRight: 6, verticalAlign: "middle", background: "#ef4444" }} />
          Live Bitcoin Pool
        </div>

        <div className="pool-prize-label">Prize Pool</div>
        <div className="pool-prize-amount">
          ${parseFloat(dashboardData?.latest_round_pool_amount ?? roundBetsPool).toFixed(2)}
        </div>

        <div className="pool-meta-row">
          <span>Entry: <strong>${amountLoaded ? amount : "0.00"} USDT</strong></span>
          <span>Players: <strong>{dashboardData?.total_active_users ?? "2,450"}</strong></span>
        </div>

        {/* ── dual timer block ── */}
        <div className="hero-timer-block">
          <div className="hero-timer-col">
            <span className="hero-timer-label">
              <FiClock size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
              Closes In
            </span>
            <div ref={timerRowRef} className={`hero-timer-val${roundClosed ? " round-closed" : ""}`}>
              <span ref={minsRef}>00</span>
              <span className="hero-timer-colon">:</span>
              <span ref={secsRef}>00</span>
            </div>
            {roundClosed && <span className="hero-timer-status red">Round Closed</span>}
          </div>

          <div className="hero-timer-divider" />

          <div className="hero-timer-col">
            <span className="hero-timer-label">
              <FiArrowRight size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
              Next Round In
            </span>
            <div className={`hero-timer-val${isUpcoming ? "" : " hero-timer-dim"}`}>
              {isUpcoming ? upcomingMins : "00:00"}
              <span className="hero-timer-colon">{isUpcoming ? ":" : ""}</span>
              {isUpcoming ? upcomingSecs : ""}
            </div>
            {isUpcoming && <span className="hero-timer-status gold">Get Ready!</span>}
          </div>
        </div>

        <button className="btn-enter-pool" disabled={betDisabled} onClick={handlePlaceBet}>
          {betLoading
            ? <><FiLoader className="r-icon r-icon-sm spin-icon" style={{ marginRight: 8 }} /> Placing Bet…</>
            : betSuccess
            ? <><FiCheckCircle style={{ marginRight: 8 }} /> Bet Placed!</>
            : isUpcoming
            ? <>Opens in {upcomingMins}:{upcomingSecs}</>
            : <>Enter Pool</>}
        </button>
      </div>

      {/* ── CHECK RESULT ────────────────────────────────────────────── */}
      {roundClosed && !isUpcoming && (
        <button
          className="check-result-btn"
          onClick={handleCheckResult}
          disabled={checkResultLoading || !currentRoundId}
        >
          <span className="r-icon r-icon-sm" style={{ marginRight: 8 }}>
            {checkResultLoading ? <FiLoader /> : <TbRefresh />}
          </span>
          {checkResultLoading ? "CHECKING..." : "CHECK RESULT"}
        </button>
      )}

      {/* ── BTC PRICE + LAST DIGIT ──────────────────────────────────── */}
      <div className="price-row">
        <div className="price-card">
          <span className="price-card-label">
            <BiBitcoin style={{ marginRight: 4, verticalAlign: "middle", fontSize: 14 }} />
            BTC / USD
          </span>
          <span className="price-card-value">${formattedPrice}</span>
          <span className={`price-change ${change.up ? "up" : "down"}`}>
            <span className="r-icon r-icon-sm" style={{ marginRight: 4 }}>
              {change.up ? <FiTrendingUp /> : <FiTrendingDown />}
            </span>
            {change.up ? "+" : "-"}{change.val} ({change.pct}%)
          </span>
          <div className="price-chart-area">
            <SparkChart color={change.up ? "#ea9c1e" : "#ef4444"} />
          </div>
        </div>

        <div className="last-digit-card">
          <span className="last-digit-label">Last Digit</span>
          <span className="last-digit-value">{lastDigit}</span>
          <div className="live-badge">
            <span className="live-dot" />
            Live Price Feed
          </div>
        </div>
      </div>

      {/* ── DASHBOARD STATS ─────────────────────────────────────────── */}
      <div className="stats-strip">
        <div className="stat-card">
          <div className="stat-label">
            <TbCurrencyDollar style={{ marginRight: 3, verticalAlign: "middle", fontSize: 11 }} />
            Prize Pool
          </div>
          <div className="stat-value gold">
            ${parseFloat(dashboardData?.latest_round_pool_amount ?? roundBetsPool).toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <TbUsers style={{ marginRight: 3, verticalAlign: "middle", fontSize: 11 }} />
            Active Players
          </div>
          <div className="stat-value cyan">{dashboardData?.total_active_users ?? "—"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            <TbPercentage style={{ marginRight: 3, verticalAlign: "middle", fontSize: 11 }} />
            Pool Share
          </div>
          <div className="stat-value green">80%</div>
        </div>
      </div>

      

      {/* ── BET AMOUNT ───────────────────────────────────────────────── */}
      <div className="section-label" style={{ marginTop: 20 }}>
        <div className="section-line" />
        {/* <span className="section-text">Bet Amount</span> */}
        <div className="section-line" />
         <div className="section-line" />
         
      </div>
      <div className="cpx-pred-wrapper">
         <div className="section-label" style={{ marginTop: 20 }}>
        <div className="section-line" />
        <span className="section-text">Bet Amount</span>
        <div className="section-line" />
      </div>
        
      <div className="amount-card">
        <div className="amount-header">
          <span className="amount-label">Bet Amount</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 1 }}>
            FIXED PER ROUND
          </span>
        </div>
        <div className="amount-fixed-display">
          <div className="amount-fixed-left">
            <span className="amount-fixed-icon">$</span>
            <span className="amount-fixed-val">{amountLoaded ? amount : "0.00"}</span>
            <span className="amount-fixed-cur">USDT</span>
          </div>
          <div className="amount-fixed-badge">{amountLoaded ? "SET BY ROUND" : "ROUND"}</div>
        </div>
        <div className="amount-fixed-note">
          <FiZap style={{ marginRight: 6, verticalAlign: "middle", color: "var(--gold)" }} />
          This round's bet amount is fixed at{" "}
          <strong style={{ color: "var(--gold)" }}>
            ${amountLoaded ? amount : "0.00"} USDT
          </strong>{" "}
          per prediction
        </div>
      </div>

      {/* ── MAKE YOUR PREDICTION ─────────────────────────────────────── */}
      <div className="section-label">
        <div className="section-line" />
        <span className="section-text">Make Your Prediction</span>
        <div className="section-line" />
      </div>

      {/* <div className="cpx-pred-wrapper"> */}
        {/* ── PRED 1 — Final Digit ── */}
        <div className="cpx-pred-card">
          <div className="cpx-pred-hdr">
            <div className="cpx-pred-badge"><TbCircleNumber1 size={19} /></div>
            <div>
              <div className="cpx-pred-title">Choose Your Final Digit</div>
              <div className="cpx-pred-sub">Pick the last digit of BTC closing price (0–9)</div>
            </div>
          </div>
          <div className="cpx-digit-grid">
            {[0,1,2,3,4,5,6,7,8,9].map((n) => (
              <button
                key={n}
                className={`cpx-digit-btn${exactNum === n ? " cpx-active" : ""}`}
                onClick={() => setExactNum(n)}
                disabled={roundClosed || betPlaced}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* ── PRED 2 — Big / Small ── */}
        <div className="cpx-pred-card">
          <div className="cpx-pred-hdr">
            <div className="cpx-pred-badge"><TbCircleNumber2 size={19} /></div>
            <div><div className="cpx-pred-title">Big or Small?</div></div>
          </div>
          <div className="cpx-choice-pair">
            <button className={`cpx-choice-btn${bigSmall === "big" ? " cpx-active" : ""}`} onClick={() => setBigSmall("big")} disabled={roundClosed || betPlaced}>
              <span className="cpx-choice-icon"><FiTrendingUp /></span>
              <span className="cpx-choice-lbl">Big</span>
            </button>
            <button className={`cpx-choice-btn${bigSmall === "small" ? " cpx-active" : ""}`} onClick={() => setBigSmall("small")} disabled={roundClosed || betPlaced}>
              <span className="cpx-choice-icon"><FiTrendingDown /></span>
              <span className="cpx-choice-lbl">Small</span>
            </button>
          </div>
        </div>

        {/* ── PRED 3 — Odd / Even ── */}
        <div className="cpx-pred-card">
          <div className="cpx-pred-hdr">
            <div className="cpx-pred-badge"><TbCircleNumber3 size={19} /></div>
            <div><div className="cpx-pred-title">Odd or Even?</div></div>
          </div>
          <div className="cpx-choice-pair">
            <button className={`cpx-choice-btn${oddEven === "odd" ? " cpx-active" : ""}`} onClick={() => setOddEven("odd")} disabled={roundClosed || betPlaced}>
              <span className="cpx-choice-icon"><RiNumbersLine /></span>
              <span className="cpx-choice-lbl">Odd</span>
            </button>
            <button className={`cpx-choice-btn${oddEven === "even" ? " cpx-active" : ""}`} onClick={() => setOddEven("even")} disabled={roundClosed || betPlaced}>
              <span className="cpx-choice-icon"><RiBarChartGroupedLine /></span>
              <span className="cpx-choice-lbl">Even</span>
            </button>
          </div>
        </div>

        {/* ── PRED 4 — Rise / Fall ── */}
        <div className="cpx-pred-card">
          <div className="cpx-pred-hdr">
            <div className="cpx-pred-badge"><TbCircleNumber4 size={19} /></div>
            <div><div className="cpx-pred-title">Rise or Fall?</div></div>
          </div>
          <div className="cpx-choice-pair">
            <button className={`cpx-choice-btn${riseFall === "rise" ? " cpx-active" : ""}`} onClick={() => setRiseFall("rise")} disabled={roundClosed || betPlaced}>
              <span className="cpx-choice-icon"><RiRocketLine /></span>
              <span className="cpx-choice-lbl">Rise</span>
            </button>
            <button className={`cpx-choice-btn${riseFall === "fall" ? " cpx-active" : ""}`} onClick={() => setRiseFall("fall")} disabled={roundClosed || betPlaced}>
              <span className="cpx-choice-icon"><MdOutlineWaterDrop /></span>
              <span className="cpx-choice-lbl">Fall</span>
            </button>
          </div>
        </div>

        {/* ── Banners ── */}
        {isUpcoming && (
          <div className="cpx-upcoming-banner">
            <FiClock style={{ marginRight: 7, verticalAlign: "middle" }} />
            ROUND STARTS IN {upcomingMins}:{upcomingSecs} — Get ready!
          </div>
        )}
        {betSuccess && (
          <div className="cpx-success-banner">
            <FiCheckCircle style={{ marginRight: 7, verticalAlign: "middle" }} />
            Bet placed! Good luck
          </div>
        )}
        {roundClosed && !betSuccess && (
          <div className="cpx-closed-banner">
            <FiAlertTriangle style={{ marginRight: 7, verticalAlign: "middle" }} />
            Round closed — waiting for next round
          </div>
        )}

        {/* ── Confirm button ── */}
        <button
          onClick={handlePlaceBet}
          className={`cpx-confirm-btn${betPlaced && !betLoading && !betSuccess ? " cpx-confirm-locked" : ""}`}
          disabled={betDisabled}
        >
          {betLoading ? (
            <><FiLoader className="spin-icon" style={{ marginRight: 6 }} />PLACING BET...</>
          ) : betSuccess ? (
            <><FiCheckCircle style={{ marginRight: 6 }} />BET PLACED SUCCESSFULLY!</>
          ) : betPlaced ? (
            <><FiLock style={{ marginRight: 6 }} />BET LOCKED — NEXT ROUND</>
          ) : isUpcoming ? (
            <><FiClock style={{ marginRight: 6 }} />OPENS IN {upcomingMins}:{upcomingSecs}</>
          ) : (
            <>
              <span>CONFIRM PREDICTION · ${amountLoaded ? amount : "0.00"}</span>
              <FiArrowRight size={17} />
            </>
          )}
        </button>
      </div>

       {/* ── WINNERS TICKER ───────────────────────────────────────────── */}
      <div className="winners-strip">
        <div className="winners-strip-title">
          <TbTrophy size={12} style={{ marginRight: 6, verticalAlign: "middle" }} />
          Recent Winners
        </div>
        <div className="winners-marquee">
          {winnersDisplay.map((w, i) => (
            <div key={i} className="winner-item">
              <span className="winner-icon r-icon r-icon-md" style={{ color: "var(--gold)" }}>
                {w.iconComp}
              </span>
              <span className="winner-name">{w.name}</span>
              {w.amt && <span className="winner-amt">{w.amt}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── PRIZE DISTRIBUTION + ROUND PARTICIPANTS — side by side ───── */}
      <div className="section-label" style={{ marginTop: 20 }}>
        <div className="section-line" />
        <span className="section-text">Quick Actions</span>
        <div className="section-line" />
      </div>

      <div className="action-row">
        {/* Prize Distribution */}
        <button className="action-btn" onClick={() => setPdModalOpen(true)}>
          <div className="action-btn-icon">
            <TbCurrencyDollar size={20} />
          </div>
          <div className="action-btn-body">
            <div className="action-btn-title">Prize Split</div>
            <div className="action-btn-sub">How winnings are distributed</div>
          </div>
          <div className="action-btn-bottom">
            <span className="action-btn-val">80%</span>
            <span className="action-btn-arrow"><FiArrowRight size={12} /></span>
          </div>
        </button>

        {/* Round Participants */}
        <button className="action-btn" onClick={() => setRpModalOpen(true)}>
          <div className="action-btn-icon">
            <TbUsers size={20} />
          </div>
          <div className="action-btn-body">
            <div className="action-btn-title"> Round Participants</div>
            <div className="action-btn-sub">
              {currentRoundId ? "Round #" + String(currentRoundId + 24000).padStart(5, "0") : "Current Round"}
            </div>
          </div>
          <div className="action-btn-bottom">
            <span className="action-btn-count">{roundBets.length} Bets</span>
            <span className="action-btn-arrow"><FiArrowRight size={12} /></span>
          </div>
        </button>
      </div>

     

      {/* ── WARNING ──────────────────────────────────────────────────── */}
      {/* <div className="warning-row">
        <span className="warning-icon r-icon r-icon-sm"><FiAlertTriangle /></span>
        <span>Complete all 4 predictions before confirming</span>
      </div> */}

      <div style={{ height: 8 }} />
    </div>
  );
}