"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import "./home.css";
import SparkChart from "../../components/TradingView/SparkChart";

// React Icons
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
  TbChartCandle,
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
  IoOddEvenSharp,
} from "react-icons/io5";
import {
  PiCoinVerticalDuotone,
} from "react-icons/pi";

// ─── Constants ──────────────────────────────────────────────────────────────
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
function HeroDeco() {
  return (
    <svg className="pool-hero-deco" viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 80 C15 70 20 60 30 55 C40 50 45 58 55 48 C65 38 68 25 78 20 C88 15 95 22 105 10"
        stroke="#ea9c1e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M5 85 C15 78 22 68 35 63 C48 58 52 66 62 56 C72 46 74 33 84 28 C94 23 100 30 108 18"
        stroke="#ea9c1e" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5" />
      <circle cx="105" cy="10" r="3" fill="#ea9c1e" opacity="0.8" />
      <circle cx="30"  cy="55" r="2" fill="#ea9c1e" opacity="0.5" />
      <circle cx="55"  cy="48" r="2" fill="#ea9c1e" opacity="0.5" />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { toasts, addToast, removeToast } = useToast();

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
      // Primary endpoint failed — try fallback silently (price is non-critical, no toast needed)
      console.warn("[BTC Price] Primary fetch failed:", err.message);
      try {
        const r2 = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const d2 = await r2.json();
        if (d2.price) handlePriceUpdate(parseFloat(d2.price));
      } catch (fallbackErr) {
        // Both price feeds failed — stale price shown, user not disturbed (auto-retries every 5s)
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
      // Winners ticker is decorative — log but don't interrupt the user
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
      // Don't show toast — this runs in background polling, not triggered by user action
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
      // Polled silently — avoid spamming toasts every 5s if network is weak
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
      // Dashboard stats are supplementary — polled every 5s, no toast on transient failures
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
      // Only toast on initial load (profile will be null, UI shows fallback values)
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
      // Current round is critical — but polled every 5s, so one failure is recoverable
      console.error("[Current Round] Fetch failed:", err.message);
      // Only notify if it's a auth/server error (not just a momentary connectivity blip)
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
        <HeroDeco />
        <div className="pool-hero-chart">
          {/* <SparkChart color={change.up ? "#ea9c1e" : "#ef4444"} /> */}
        </div>

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

        {/* ── dual timer block — always visible ── */}
        <div className="hero-timer-block">
          {/* LEFT — current round countdown */}
          <div className="hero-timer-col">
            <span className="hero-timer-label">
              <FiClock size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />
              Closes In
            </span>
            <div
              ref={timerRowRef}
              className={`hero-timer-val${roundClosed ? " round-closed" : ""}`}
            >
              <span ref={minsRef}>00</span>
              <span className="hero-timer-colon">:</span>
              <span ref={secsRef}>00</span>
            </div>
            {roundClosed && (
              <span className="hero-timer-status red">Round Closed</span>
            )}
          </div>

          {/* divider */}
          <div className="hero-timer-divider" />

          {/* RIGHT — next round countdown (always shown; dims when not upcoming) */}
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
            {isUpcoming && (
              <span className="hero-timer-status gold">Get Ready!</span>
            )}
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

      <div className="predictions-wrapper">

      {/* PRED 1 — Exact Last Digit */}
      <div className="pred-card" style={{ "--pc": "rgba(234,156,30,0.18)" }}>
        <div className="pred-card-glow" />
        <div className="pred-header">
          <div className="pred-num" style={{ background: "var(--grad-gold-d)" }}>
            <TbCircleNumber1 size={16} />
          </div>
          <div className="pred-info">
            <span className="pred-title">Choose Your Final Digit</span>
            <span className="pred-sub">Pick the last digit of BTC closing price (0–9)</span>
          </div>
        </div>
        <div className="digit-grid">
          {[0,1,2,3,4,5,6,7,8,9].map((n) => (
            <button
              key={n}
              className={`digit-btn${exactNum === n ? " active" : ""}`}
              onClick={() => setExactNum(n)}
              disabled={roundClosed || betPlaced}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* PRED 2 — Big / Small */}
      <div className="pred-card" style={{ "--pc": "rgba(234,156,30,0.18)" }}>
        <div className="pred-card-glow" />
        <div className="pred-header">
          <div className="pred-num" style={{ background: "var(--grad-gold-d)" }}>
            <TbCircleNumber2 size={16} />
          </div>
          <div className="pred-info">
            <span className="pred-title">Big or Small?</span>
          </div>
        </div>
        <div className="choice-pair">
          <button
            className={`choice-btn${bigSmall === "big" ? " active" : ""}`}
            onClick={() => setBigSmall("big")}
            disabled={roundClosed || betPlaced}
          >
            <span className="choice-icon r-icon r-icon-lg"><FiTrendingUp /></span>
            Big
          </button>
          <button
            className={`choice-btn${bigSmall === "small" ? " active" : ""}`}
            onClick={() => setBigSmall("small")}
            disabled={roundClosed || betPlaced}
          >
            <span className="choice-icon r-icon r-icon-lg"><FiTrendingDown /></span>
            Small
          </button>
        </div>
      </div>

      {/* PRED 3 — Odd / Even */}
      <div className="pred-card" style={{ "--pc": "rgba(234,156,30,0.18)" }}>
        <div className="pred-card-glow" />
        <div className="pred-header">
          <div className="pred-num" style={{ background: "var(--grad-gold-d)" }}>
            <TbCircleNumber3 size={16} />
          </div>
          <div className="pred-info">
            <span className="pred-title">Odd or Even?</span>
          </div>
        </div>
        <div className="choice-pair">
          <button
            className={`choice-btn${oddEven === "odd" ? " active" : ""}`}
            onClick={() => setOddEven("odd")}
            disabled={roundClosed || betPlaced}
          >
            <span className="choice-icon r-icon r-icon-lg"><RiNumbersLine /></span>
            Odd
          </button>
          <button
            className={`choice-btn${oddEven === "even" ? " active" : ""}`}
            onClick={() => setOddEven("even")}
            disabled={roundClosed || betPlaced}
          >
            <span className="choice-icon r-icon r-icon-lg"><RiBarChartGroupedLine /></span>
            Even
          </button>
        </div>
      </div>

      {/* PRED 4 — Rise / Fall */}
      <div className="pred-card" style={{ "--pc": "rgba(234,156,30,0.18)" }}>
        <div className="pred-card-glow" />
        <div className="pred-header">
          <div className="pred-num" style={{ background: "var(--grad-gold-d)" }}>
            <TbCircleNumber4 size={16} />
          </div>
          <div className="pred-info">
            <span className="pred-title">Rise or Fall?</span>
          </div>
        </div>
        <div className="choice-pair">
          <button
            className={`choice-btn${riseFall === "rise" ? " active" : ""}`}
            onClick={() => setRiseFall("rise")}
            disabled={roundClosed || betPlaced}
          >
            <span className="choice-icon r-icon r-icon-lg"><RiRocketLine /></span>
            Rise
          </button>
          <button
            className={`choice-btn${riseFall === "fall" ? " active" : ""}`}
            onClick={() => setRiseFall("fall")}
            disabled={roundClosed || betPlaced}
          >
            <span className="choice-icon r-icon r-icon-lg"><MdOutlineWaterDrop /></span>
            Fall
          </button>
        </div>
      </div>

  

      {/* ── UPCOMING BANNER ──────────────────────────────────────────── */}
      {isUpcoming && (
        <div className="upcoming-banner">
          <FiClock style={{ marginRight: 8, verticalAlign: "middle" }} />
          ROUND STARTS IN {upcomingMins}:{upcomingSecs} — Get ready!
        </div>
      )}

      {/* ── STATUS BANNERS ───────────────────────────────────────────── */}
      <div className="section">
        {betSuccess && (
          <div className="bet-success-banner">
            <FiCheckCircle style={{ marginRight: 8, verticalAlign: "middle" }} />
            Bet placed! Good luck
          </div>
        )}
        {roundClosed && !betSuccess && (
          <div className="round-closed-banner">
            <FiAlertTriangle style={{ marginRight: 8, verticalAlign: "middle" }} />
            Round closed
          </div>
        )}
      </div>

      {/* ── CONFIRM BUTTON ───────────────────────────────────────────── */}
      <button
        onClick={handlePlaceBet}
        className={`confirm-btn${betDisabled ? " confirm-disabled" : ""}${betPlaced && !betLoading ? " confirm-bet-placed" : ""}`}
        disabled={betDisabled}
      >
        <div className="confirm-btn-glow" />
        <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          {betLoading ? (
            <><FiLoader className="spin-icon" /> PLACING BET...</>
          ) : betSuccess ? (
            <><FiCheckCircle /> BET PLACED SUCCESSFULLY!</>
          ) : betPlaced ? (
            <><FiLock /> BET LOCKED — WAITING FOR NEXT ROUND</>
          ) : isUpcoming ? (
            <><FiClock /> OPENS IN {upcomingMins}:{upcomingSecs}</>
          ) : (
            <>CONFIRM PREDICTION · ${amountLoaded ? amount : "—"}</>
          )}
        </span>
        {!betSuccess && !betLoading && !betPlaced && !isUpcoming && (
          <span style={{ position: "relative", zIndex: 1 }}>
            <FiArrowRight size={18} />
          </span>
        )}
      </button>

          </div>

      {/* ── PRIZE DISTRIBUTION ───────────────────────────────────────── */}
      <div className="section-label" style={{ marginTop: 20 }}>
        <div className="section-line" />
        <span className="section-text">Prize Distribution</span>
        <div className="section-line" />
      </div>

      <div className="prize-card">
        <div className="pred-header" style={{ marginBottom: 4 }}>
          <div className="pred-num" style={{ background: "var(--grad-gold-d)" }}>
            <TbCurrencyDollar size={16} />
          </div>
          <div className="pred-info">
            <span className="pred-title">How Winnings Are Split</span>
            <span className="pred-sub">Automated after result confirmation</span>
          </div>
        </div>
        <div className="prize-pool-row">
          <span className="prize-pool-lbl">Total Pool</span>
          <span className="prize-pool-val">${parseFloat(poolTotal).toFixed(2)}</span>
        </div>
        <div className="prize-row">
          <div className="prize-item">
            <div className="prize-pct">80%</div>
            <div className="prize-lbl">Winners</div>
            <div className="prize-sub">Shared by correct predictors</div>
          </div>
          <div className="prize-item">
            <div className="prize-pct" style={{ color: "#4A90D9" }}>15%</div>
            <div className="prize-lbl">Platform</div>
            <div className="prize-sub">Maintenance & ops</div>
          </div>
          <div className="prize-item">
            <div className="prize-pct" style={{ color: "var(--green-up)" }}>5%</div>
            <div className="prize-lbl">Referral</div>
            <div className="prize-sub">Referrer bonus</div>
          </div>
        </div>
        <div className="prize-tip">
          <TbInfoCircle size={16} style={{ flexShrink: 0, color: "var(--gold)", marginTop: 1 }} />
          <span>
            The more predictions you get right, the higher your share of the 80% prize pool.
            All 4 correct = maximum reward!
          </span>
        </div>
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

      {/* ── MY BETS — scrollable fixed height ────────────────────────── */}
      <div className="section-label" style={{ marginTop: 20 }}>
        <div className="section-line" />
        <span className="section-text">My Bets</span>
        <div className="section-line" />
      </div>

      <div className="lb-card lb-card-scroll" style={{ marginBottom: 14 }}>
        <div className="lb-card-header">
          <span className="lb-header-cyan">
            <TbChartCandle size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Your History
          </span>
          <span className="lb-header-gold">{myBetsTotal} Total</span>
        </div>

        {/* ── scrollable body ── */}
        <div className="lb-scroll-body">
          {myBets.length === 0 && (
            <div className="lb-empty">No bets placed yet — make your first prediction above!</div>
          )}

          {myBets.map((bet) => {
            const isWin     = parseFloat(bet.win_amount  ?? 0) > 0;
            const isLoss    = parseFloat(bet.loss_amount ?? 0) > 0;
            const isPending = !isWin && !isLoss;
            return (
              <div key={bet.id} className="lb-row">
                <div className="lb-round-col">
                  <span className="lb-rnd-lbl">RND</span>
                  <span className="lb-rnd-val">#{bet.round_id}</span>
                </div>
                <div className="lb-info">
                  <div className="lb-streak">
                    #{bet.question_1_ans} · {bet.question_2_ans === 0 ? "Big" : "Small"} ·{" "}
                    {bet.question_3_ans === 0 ? "Odd" : "Even"} · {bet.question_4_ans === 0 ? "Rise" : "Fall"}
                  </div>
                  <div className="lb-time">
                    {bet.created_at ? new Date(bet.created_at).toLocaleString() : "—"}
                  </div>
                </div>
                <div className="lb-result-col">
                  <span className="lb-amount">${parseFloat(bet.amount).toFixed(2)}</span>
                  {isWin  && <span className="lb-win">+${parseFloat(bet.win_amount).toFixed(2)}</span>}
                  {isLoss && !isWin && <span className="lb-loss">-${parseFloat(bet.loss_amount).toFixed(2)}</span>}
                  {isPending && <span className="lb-pending">PENDING</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ROUND PARTICIPANTS ───────────────────────────────────────── */}
      <div className="section-label">
        <div className="section-line" />
        <span className="section-text">Round Participants</span>
        <div className="section-line" />
      </div>

      <div className="lb-card" style={{ marginBottom: 14 }}>
        <div className="lb-card-header">
          <span className="lb-header-cyan">
            {currentRoundId ? "Round #" + String(currentRoundId).padStart(5, "0") : "Round #00000"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="lb-header-gold">{roundBets.length} Bets</span>
            <span className="lb-pool-badge">Pool ${parseFloat(roundBetsPool).toFixed(2)}</span>
          </div>
        </div>

        {betsLoading && <div className="lb-empty">Loading…</div>}

        {!betsLoading && roundBets.length === 0 && (
          <div className="lb-empty">No participants yet</div>
        )}

        {!betsLoading && roundBets.map((bet, i) => (
          <div key={bet.id} className="lb-row">
            <span className={`lb-rank${i < 3 ? ` rank-${i+1}` : " rank-n"}`}>
              {i < 3 ? RANK_ICONS_COMP[i] : `#${i+1}`}
            </span>
            <div className="lb-avatar">
              {bet.user?.name ? bet.user.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="lb-info">
              <div className="lb-name">{bet.user?.name || "Anonymous"}</div>
              <div className="lb-streak">
                #{bet.question_1_ans} · {bet.question_2_ans === 0 ? "Big" : "Small"} ·{" "}
                {bet.question_3_ans === 0 ? "Odd" : "Even"} · {bet.question_4_ans === 0 ? "Rise" : "Fall"}
              </div>
            </div>
            <div className="lb-result-col">
              <span className="lb-amount">${parseFloat(bet.amount).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── WARNING ──────────────────────────────────────────────────── */}
      <div className="warning-row">
        <span className="warning-icon r-icon r-icon-sm"><FiAlertTriangle /></span>
        <span>Complete all 4 predictions before confirming</span>
      </div>

      <div style={{ height: 8 }} />
    </div>
  );
}