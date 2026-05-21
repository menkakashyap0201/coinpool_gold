"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import "./home.css";
// import SparkChart from "../components/TradingView/SparkChart";
import TickerTape from "../../components/TradingView/TickerTape";

const BTC_IMAGE_URL = "/hero1.png";

const getToken = () => {
  if (typeof window === "undefined") return "";
  const type  = localStorage.getItem("cpx_token_type") || "Bearer";
  const token = localStorage.getItem("cpx_token") || "";
  return `${type} ${token}`;
};
const BASE  = process.env.NEXT_PUBLIC_API_URL || "https://anant.cryptodiary.us/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const ROOMS = [
  { id: "standard", label: "STANDARD ROOM", icon: "👥", fee: 5,  playing: 2568, color: "#4A90D9", badge: null },
  { id: "premium",  label: "PREMIUM ROOM",  icon: "👑", fee: 25, playing: 856,  color: "#FFD700", badge: "EVERY 3H" },
];

const WINNERS = [
  { name: "Rahul K.",  amt: "+420 USDT", icon: "🏆" },
  { name: "Priya S.",  amt: "+210 USDT", icon: "🥈" },
  { name: "Arjun M.",  amt: "+180 USDT", icon: "🎯" },
  { name: "Sneha T.",  amt: "+95 USDT",  icon: "⭐" },
  { name: "Vikram R.", amt: "+340 USDT", icon: "🔥" },
  { name: "Deepa N.",  amt: "+125 USDT", icon: "💎" },
];

// ── Hard-coded round participants ─────────────────────────────────────────────
const HARD_ROUND_BETS = [
  { id: 1, user: { name: "Rahul K." }, question_1_ans: 8, question_2_ans: 1, question_3_ans: 1, question_4_ans: 1, amount: "25.00", win_amount: "0.00" },
  { id: 2, user: { name: "Priya S." }, question_1_ans: 3, question_2_ans: 0, question_3_ans: 1, question_4_ans: 0, amount: "10.00", win_amount: "0.00" },
  { id: 3, user: { name: "Arjun M." }, question_1_ans: 6, question_2_ans: 1, question_3_ans: 0, question_4_ans: 1, amount: "50.00", win_amount: "0.00" },
];

// ── Hard-coded my bets history ────────────────────────────────────────────────
const HARD_MY_BETS = [
  { id: 101, round_id: 5, question_1_ans: 8, question_2_ans: 1, question_3_ans: 1, question_4_ans: 1, amount: "25.00", win_amount: "48.00", loss_amount: "0.00",  created_at: "2026-05-19T10:24:29.000000Z" },
  { id: 100, round_id: 4, question_1_ans: 3, question_2_ans: 0, question_3_ans: 0, question_4_ans: 0, amount: "10.00", win_amount: "0.00",  loss_amount: "10.00", created_at: "2026-05-19T09:10:00.000000Z" },
  { id: 99,  round_id: 3, question_1_ans: 7, question_2_ans: 1, question_3_ans: 1, question_4_ans: 0, amount: "5.00",  win_amount: "0.60",  loss_amount: "4.40",  created_at: "2026-05-18T14:33:00.000000Z" },
];

const AMOUNT_STEP = 5;
const AMOUNT_MIN  = 5;
const AMOUNT_MAX  = 500;

const RANK_ICONS = ["🥇", "🥈", "🥉"];

export default function Home() {
  // ── UI State ──────────────────────────────────────────────────────────────
  const [selectedRoom, setRoom]     = useState("standard");
  const [exactNum,     setExactNum] = useState(null);
  const [bigSmall,     setBigSmall] = useState(null);
  const [oddEven,      setOddEven]  = useState(null);
  const [riseFall,     setRiseFall] = useState(null);
  const [amount,       setAmount]   = useState(5);
  const [change,       setChange]   = useState({ val: 110.65, pct: 0.21, up: true });
  const [betSuccess,   setBetSuccess] = useState(false);
  
   const [roundClosed, setRoundClosed] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const ROUND_DURATION = 180; // seconds — change as needed
  const [currentRoundId, setCurrentRoundId] = useState(null);
  const [roundEndTime,   setRoundEndTime]   = useState(null);
  const [poolTotal, setPoolTotal] = useState("0.00");
  const [liveBtcPrice, setLiveBtcPrice] = useState(103284);
  const [myBets,       setMyBets]       = useState([]);
const [myBetsTotal,  setMyBetsTotal]  = useState(0);
const [roundBets,    setRoundBets]    = useState([]);
const [roundBetsPool, setRoundBetsPool] = useState("0.00");
const [betsLoading,  setBetsLoading]  = useState(false);

  const timerRef   = useRef(null);
  const minsRef    = useRef(null);  // direct DOM update — no re-render
  const secsRef    = useRef(null);
  const timerRowRef = useRef(null);
   const timeLeftRef = useRef(0); // starts at 0 — timer off
  const [betLoading, setBetLoading] = useState(false);
  const handlePriceUpdate = useCallback((p) => {
  setLiveBtcPrice(p);
}, []);

const handleRoundBets = useCallback(async (roundId) => {
  if (!roundId) return;
  setBetsLoading(true);
  try {
    const tokenType  = localStorage.getItem("cpx_token_type") || "Bearer";
    const tokenValue = localStorage.getItem("cpx_token") || "";
    const authToken  = `${tokenType} ${tokenValue}`;

    const res = await fetch(`${BASE}/round-bets/${roundId}`, {
      headers: { Accept: "application/json", Authorization: authToken },
    });
    if (!res.ok) return;
    const json = await res.json();
    if (json.status && json.round) {
      setRoundBets(json.round.bets || []);
      setRoundBetsPool(json.round.total_pool_amount || "0.00");
    }
  } catch (err) {
    console.error("Round bets error:", err);
  } finally {
    setBetsLoading(false);
  }
}, []);

const handleMyBets = useCallback(async () => {
  try {
    const tokenType  = localStorage.getItem("cpx_token_type") || "Bearer";
    const tokenValue = localStorage.getItem("cpx_token") || "";
    const authToken  = `${tokenType} ${tokenValue}`;

    const res = await fetch(`${BASE}/my-bets`, {
      headers: { Accept: "application/json", Authorization: authToken },
    });
    if (!res.ok) return;
    const json = await res.json();
    if (json.status) {
      setMyBets(json.bets || []);
      setMyBetsTotal(json.total_bets || 0);
    }
  } catch (err) {
    console.error("My bets error:", err);
  }
}, []);
// ── Fetch current round ───────────────────────────────────────────────────────
const handleCurrentRound = useCallback(async () => {
  try {
    const tokenType  = localStorage.getItem("cpx_token_type") || "Bearer";
    const tokenValue = localStorage.getItem("cpx_token") || "";
    const authToken  = `${tokenType} ${tokenValue}`;

    const res = await fetch(`${BASE}/current-round`, {
      headers: { Accept: "application/json", Authorization: authToken },
    });
    if (!res.ok) return;
    const json = await res.json();
    if (json.status && json.data) {
  setCurrentRoundId(json.data.id);
  setPoolTotal(json.data.amount || "0.00");
  const secs = Math.max(0, Math.floor(json.data.remaining_seconds || 0));
  timeLeftRef.current = secs;
  if (json.data.end_time) setRoundEndTime(json.data.end_time);

  // ✅ YEH ADD KARO — backend time milte hi timer start
  if (secs > 0) {
    setTimerStarted(true);
  }

  handleRoundBets(json.data.id);
}
  } catch (err) {
    console.error("Fetch error:", err);
  }
}, [handleRoundBets]);


useEffect(() => {
  handleCurrentRound().then(() => {
  });
  handleMyBets();
}, [handleCurrentRound, handleMyBets]);

  // ── Countdown timer — updates DOM directly, zero re-renders ─────────────────
useEffect(() => {
    if (!timerStarted) return; // don't run until bet placed
    const tick = () => {
      const t = timeLeftRef.current;
      if (t <= 1) {
        timeLeftRef.current = 0;
        if (minsRef.current) minsRef.current.textContent = "00";
        if (secsRef.current) secsRef.current.textContent = "00";
        setRoundClosed(true);     // lock UI
        clearInterval(timerRef.current); // stop ticking
        return;
      }
      timeLeftRef.current = t - 1;
      const m = String(Math.floor(timeLeftRef.current / 60)).padStart(2, "0");
      const s = String(timeLeftRef.current % 60).padStart(2, "0");
      if (minsRef.current) minsRef.current.textContent = m;
      if (secsRef.current) secsRef.current.textContent = s;
      if (timerRowRef.current) {
        timerRowRef.current.classList.add("timer-pulse");
        setTimeout(() => timerRowRef.current?.classList.remove("timer-pulse"), 300);
      }
    };
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [timerStarted]); // re-runs only when timer is kicked off

  // ── Amount helpers ────────────────────────────────────────────────────────
  const increaseAmount = () => setAmount((prev) => Math.min(prev + AMOUNT_STEP, AMOUNT_MAX));
  const decreaseAmount = () => setAmount((prev) => Math.max(prev - AMOUNT_STEP, AMOUNT_MIN));

  // ── Derived ───────────────────────────────────────────────────────────────
  const allSelected = exactNum !== null && bigSmall && oddEven && riseFall;
  const initMins = "00";
  const initSecs = "00";

  // ── Fake place bet ────────────────────────────────────────────────────────
 const handlePlaceBet = useCallback(async () => {
  if (!allSelected || !currentRoundId) return;

  setBetLoading(true);
  setBetSuccess(false);

  try {
    const tokenType  = localStorage.getItem("cpx_token_type") || "Bearer";
    const tokenValue = localStorage.getItem("cpx_token") || "";
    const authToken  = `${tokenType} ${tokenValue}`;

    // question_2_ans: big=0(High), small=1(Low) — DB schema: 0=Big,1=Small
    // question_3_ans: odd=0, even=1 — DB schema: 0=Odd,1=Even
    // question_4_ans: rise=0, fall=1 — DB schema: 0=Rise,1=Fall
    const body = {
      round_id:       currentRoundId,
      amount:         amount,
      question_1_ans: exactNum,
      question_2_ans: bigSmall === "big" ? 0 : 1,
      question_3_ans: oddEven  === "odd" ? 0 : 1,
      question_4_ans: riseFall === "rise" ? 0 : 1,
    };

    const res = await fetch(`${BASE}/place-bet`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Accept:         "application/json",
        Authorization:  authToken,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (json.status) {
       
      setBetSuccess(true);
      handleMyBets();
handleRoundBets(currentRoundId);
      // 3 sec baad reset
      setTimeout(() => {
        setBetSuccess(false);
        // selections reset
        setExactNum(null);
        setBigSmall(null);
        setOddEven(null);
        setRiseFall(null);
        setAmount(5);
      }, 3000);
    } else {
      alert(json.message || "Bet failed. Please try again.");
    }

  } catch (err) {
    console.error("Place bet error:", err);
    alert("Network error. Please try again.");
  } finally {
    setBetLoading(false);
  }
}, [allSelected, currentRoundId, amount, exactNum, bigSmall, oddEven, riseFall]);

  return (
    <div className="outer">
      <div className="bg-grid" />
      <div className="bg-orb-1" />
      <div className="bg-orb-2" />
      <div className="bg-orb-3" />

      <div className="phone">
        <main className="main">

          {/* ── HERO BANNER ── */}
          <div className="hero-banner">
            <div className="hero-left">
              <div className="hero-tag">
                <span>⚡</span>
                <span>SKILL-BASED PREDICTION</span>
              </div>
              <h1 className="hero-h1">
                <span className="g1">Where Strategy</span><br />
                <span className="g2">Meets Opportunity.</span>
              </h1>
              <p className="hero-sub">
                Join elite crypto prediction pools and compete for real rewards.
              </p>
              <div className="hero-btns">
                <button className="btn-gold">🚀 JOIN POOL</button>
                <button className="btn-outline">🏆 LEADERBOARD</button>
              </div>
            </div>
            <div className="hero-center">
              <div className="hero-img-wrap">
                <div className="hero-ring-1" />
                <div className="hero-ring-2" />
                <div className="hero-ring-3" />
                <div className="hero-glow-blob" />
                <span className="pdot pdot-1" />
                <span className="pdot pdot-2" />
                <span className="pdot pdot-3" />
                <span className="pdot pdot-4" />
                <img src={BTC_IMAGE_URL} alt="CoinPool X" className="hero-img" draggable={false} />
              </div>
              <div className="hero-price-badge">
                <span className="pv">
                  ${liveBtcPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </span>
                <span className="pc">USDT</span>
              </div>
              {/* <SparkChart onPriceUpdate={handlePriceUpdate} /> */}
            </div>
          </div>

          {/* ── LIVE TICKER ── */}
          <div className="ticker-bar">
            <span className="ticker-label">LIVE</span>
            <div className="ticker-track">
              <TickerTape />
            </div>
          </div>

          {/* ── STATS ROW ── */}
          <div className="stats-row">
            <div className="stat-card" style={{ "--stat-color": "#FFD700" }}>
              <span className="stat-icon">💰</span>
              <span className="stat-val">$84K+</span>
              <span className="stat-lbl">PRIZE POOL</span>
            </div>
            <div className="stat-card" style={{ "--stat-color": "#00D4FF" }}>
              <span className="stat-icon">👥</span>
              <span className="stat-val">3,424</span>
              <span className="stat-lbl">ACTIVE PLAYERS</span>
            </div>
            <div className="stat-card" style={{ "--stat-color": "#00FFB2" }}>
              <span className="stat-icon">🏆</span>
              <span className="stat-val">80%</span>
              <span className="stat-lbl">POOL SHARE</span>
            </div>
          </div>

          {/* ── RECENT WINNERS ── */}
          <div className="winners-ticker">
            <span className="winners-label">🎉 WINNERS</span>
            <div className="winners-track">
              {[...WINNERS, ...WINNERS].map((w, i) => (
                <div key={i} className="winner-item">
                  <span className="winner-icon">{w.icon}</span>
                  <span className="winner-name">{w.name}</span>
                  <span className="winner-amt">{w.amt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── ROOM SELECTOR ── */}
          <div className="section-label">
            <div className="section-line" />
            <span className="section-text">SELECT ROOM</span>
            <div className="section-line" />
          </div>
          <div className="room-row">
            {ROOMS.map((r) => (
              <button
                key={r.id}
                className={`room-card ${selectedRoom === r.id ? "room-active" : ""}`}
                style={{ "--rc": r.color }}
                onClick={() => setRoom(r.id)}
              >
                <div className="room-glow" />
                {r.badge && <span className="room-badge">{r.badge}</span>}
                <span className="room-icon">{r.icon}</span>
                <span className="room-label">{r.label}</span>
                <span className="room-fee-label">ENTRY FEE</span>
                <span className="room-fee">{r.fee} USDT</span>
                <span className="room-playing">👥 {r.playing.toLocaleString()} PLAYING</span>
              </button>
            ))}
          </div>

          {/* ── ROUND CARD ── */}
          <div className="round-card" style={{ marginBottom: 14 }}>
            <div className="round-inner">
              <div className="round-left">
                <div className="round-num-row">
                  <span className="round-lbl">ROUND</span>
                  <span className="round-num">{currentRoundId ? "#" + String(currentRoundId).padStart(5, "0") : "#------"}</span>
                  <button className="copy-btn">⧉</button>
                </div>

                <div className="closes-label">ROUND CLOSES IN</div>
                <div className="timer-row" ref={timerRowRef}>
                  <div className="timer-block">
                    <span className="timer-digit" ref={minsRef}>{initMins}</span>
                    <span className="timer-unit">MIN</span>
                  </div>
                  <span className="timer-colon">:</span>
                  <div className="timer-block">
                    <span className="timer-digit" ref={secsRef}>{initSecs}</span>
                    <span className="timer-unit">SEC</span>
                  </div>
                </div>

                <div className="price-section">
                  <div className="price-lbl">BTC CLOSE PRICE</div>
                  <div className="price-val">
                    {liveBtcPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    <span className="price-cur"> USDT</span>
                  </div>
                  <div className="change-row">
                    <span className="change-lbl">24H</span>
                    <span className={change.up ? "change-up" : "change-dn"}>
                      {change.up ? "+" : "-"}{change.val} ({change.pct}%) {change.up ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <div className="price-lbl">POOL TOTAL</div>
                  <div style={{ fontFamily: "var(--font-m)", fontSize: 13, color: "var(--gold)", fontWeight: 700 }}>
                    ${parseFloat(poolTotal).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="round-right">
                <button className="how-btn">▶ How it works?</button>
                <div className="btc-img-wrap">
                  <div className="btc-ring-o" />
                  <div className="btc-ring-m" />
                  <div className="btc-ring-i" />
                  <div className="btc-glow" />
                  <img src={BTC_IMAGE_URL} alt="Bitcoin" className="btc-real-img" draggable={false} />
                </div>
                <div className="btc-price-badge">
                  <span className="btc-badge-val">
                    ${liveBtcPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                  <span className="btc-badge-cur">USDT</span>
                </div>
                <div style={{ marginTop: 8, textAlign: "right", fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-d)", letterSpacing: ".06em" }}>
                  {roundEndTime ? new Date(roundEndTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                </div>
              </div>
            </div>
          </div>

          {/* ── BET AMOUNT CARD ── */}
          <div className="section-label" style={{ marginTop: 6 }}>
            <div className="section-line" />
            <span className="section-text">BET AMOUNT</span>
            <div className="section-line" />
          </div>

          <div className="amount-card">
            <div className="amount-header">
              <span className="amount-label">CHOOSE YOUR BET</span>
              <span style={{ fontFamily: "var(--font-m)", fontSize: 10, color: "var(--text-muted)" }}>
                MIN ${AMOUNT_MIN} · MAX ${AMOUNT_MAX}
              </span>
            </div>

            <div className="amount-stepper-row">
              <button className="stepper-btn stepper-minus" onClick={decreaseAmount} disabled={amount <= AMOUNT_MIN}>−</button>
              <div className="amount-display-box">
                <span className="t-icon-lg">$</span>
                <span className="amount-val-lg">{amount}</span>
                <span className="amount-cur-lbl">USDT</span>
              </div>
              <button className="stepper-btn stepper-plus" onClick={increaseAmount} disabled={amount >= AMOUNT_MAX}>+</button>
            </div>

            <div className="amount-quick-row">
              {[5, 10, 25, 50, 100].map((a) => (
                <button
                  key={a}
                  className={`amount-quick-btn ${amount === a ? "amount-quick-active" : ""}`}
                  onClick={() => setAmount(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* ── MAKE YOUR PREDICTION ── */}
          <div className="section-label">
            <div className="section-line" />
            <span className="section-text">MAKE YOUR PREDICTION</span>
            <div className="section-line" />
          </div>

          {/* PRED 1 — EXACT NUMBER */}
          <div className="pred-card" style={{ "--pc": "#FFD700" }}>
            <div className="pred-card-glow" />
            <div className="pred-header">
              <div className="pred-num" style={{ background: "linear-gradient(135deg,#FFD700,#FF8C00)" }}>1</div>
              <div className="pred-info">
                <span className="pred-title">EXACT LAST DIGIT</span>
                <span className="pred-sub">Pick the last digit of BTC closing price (0–9)</span>
              </div>
            </div>
            <div className="num-grid">
              {[0,1,2,3,4,5,6,7,8,9].map((n) => (
                <button
                  key={n}
                  className={`num-btn ${exactNum === n ? "num-btn-active" : ""}`}
                  onClick={() => setExactNum(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* PRED 2 — HIGH / LOW */}
          <div className="pred-card" style={{ "--pc": "#4A90D9" }}>
            <div className="pred-card-glow" />
            <div className="pred-header">
              <div className="pred-num" style={{ background: "linear-gradient(135deg,#4A90D9,#0062FF)" }}>2</div>
              <div className="pred-info">
                <span className="pred-title">HIGH / LOW</span>
                <span className="pred-sub">Last digit 5–9 = High · 1–4 = Low</span>
              </div>
            </div>
            <div className="toggle-row">
              {[
                { id: "big",   label: "HIGH 📈", tc: "rgba(74,144,217,0.75)" },
                { id: "small", label: "LOW  📉", tc: "rgba(255,77,109,0.75)" },
              ].map((o) => (
                <button
                  key={o.id}
                  className={`toggle-btn ${bigSmall === o.id ? "toggle-btn-active" : ""}`}
                  style={{ "--tc": o.tc }}
                  onClick={() => setBigSmall(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* PRED 3 — ODD / EVEN */}
          <div className="pred-card" style={{ "--pc": "#00D4FF" }}>
            <div className="pred-card-glow" />
            <div className="pred-header">
              <div className="pred-num" style={{ background: "linear-gradient(135deg,#00D4FF,#0062FF)" }}>3</div>
              <div className="pred-info">
                <span className="pred-title">ODD / EVEN</span>
                <span className="pred-sub">Last digit — odd or even?</span>
              </div>
            </div>
            <div className="toggle-row">
              {[
                { id: "odd",  label: "ODD 🎯",  tc: "rgba(0,212,255,0.75)" },
                { id: "even", label: "EVEN 🎰", tc: "rgba(255,215,0,0.75)" },
              ].map((o) => (
                <button
                  key={o.id}
                  className={`toggle-btn ${oddEven === o.id ? "toggle-btn-active" : ""}`}
                  style={{ "--tc": o.tc }}
                  onClick={() => setOddEven(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* PRED 4 — RISE / FALL */}
          <div className="pred-card" style={{ "--pc": "#00FFB2" }}>
            <div className="pred-card-glow" />
            <div className="pred-header">
              <div className="pred-num" style={{ background: "linear-gradient(135deg,#00FFB2,#00A060)" }}>4</div>
              <div className="pred-info">
                <span className="pred-title">RISE / FALL</span>
                <span className="pred-sub">Will BTC close higher or lower than prev slot?</span>
              </div>
            </div>
            <div className="toggle-row">
              {[
                { id: "rise", label: "🚀 RISE", tc: "rgba(0,255,178,0.75)" },
                { id: "fall", label: "💥 FALL", tc: "rgba(255,77,109,0.75)" },
              ].map((o) => (
                <button
                  key={o.id}
                  className={`toggle-btn ${riseFall === o.id ? "toggle-btn-active" : ""}`}
                  style={{ "--tc": o.tc }}
                  onClick={() => setRiseFall(o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
            {roundClosed && (
    <div style={{background:"rgba(255,77,109,0.1)",border:"1px solid rgba(255,77,109,0.3)",
      borderRadius:60,padding:"12px 16px",textAlign:"center",fontSize:13,
      color:"#FF4D6D",fontWeight:700,letterSpacing:0.5}}>
      🔒 ROUND CLOSED — Awaiting results
    </div>
  )}

          {/* ── CONFIRM BUTTON ── */}
         <button
  onClick={handlePlaceBet}
  className={`confirm-btn ${(!allSelected || betLoading || roundClosed) ? "confirm-disabled" : ""}`}
  disabled={!allSelected || betLoading || roundClosed}
>
  <div className="confirm-btn-glow" />
  <span style={{ position: "relative", zIndex: 1 }}>
    {betLoading
      ? "PLACING BET..."
      : betSuccess
      ? "✓ BET PLACED SUCCESSFULLY!"
      : `CONFIRM PREDICTION · $${amount}`}
  </span>
  {!betSuccess && !betLoading && (
    <span style={{ position: "relative", zIndex: 1, fontSize: 18, fontWeight: 900 }}>→</span>
  )}
</button>

          {/* ── PRIZE DISTRIBUTION ── */}
          <div className="section-label" style={{ marginTop: 6 }}>
            <div className="section-line" />
            <span className="section-text">PRIZE DISTRIBUTION</span>
            <div className="section-line" />
          </div>

          <div className="prize-card">
            <div className="pred-header" style={{ marginBottom: 4 }}>
              <div className="pred-num" style={{ background: "linear-gradient(135deg,#FFD700,#FF8C00)" }}>💰</div>
              <div className="pred-info">
                <span className="pred-title">HOW WINNINGS ARE SPLIT</span>
                <span className="pred-sub">Automated after result confirmation</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.1)", borderRadius: 10, padding: "8px 14px", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>TOTAL POOL</span>
              <span style={{ fontFamily: "var(--font-d)", fontSize: 14, color: "var(--gold)", fontWeight: 700 }}>$85.00</span>
            </div>

            <div className="prize-row">
              <div className="prize-item">
                <div className="prize-pct">80%</div>
                <div className="prize-lbl">WINNERS</div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4, letterSpacing: 0.3 }}>Shared by correct predictors</div>
              </div>
              <div className="prize-item">
                <div className="prize-pct" style={{ color: "var(--cyan)", textShadow: "0 0 12px rgba(0,212,255,0.4)" }}>15%</div>
                <div className="prize-lbl">PLATFORM</div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4, letterSpacing: 0.3 }}>Maintenance & ops</div>
              </div>
              <div className="prize-item">
                <div className="prize-pct" style={{ color: "var(--green)", textShadow: "0 0 12px rgba(0,255,178,0.4)" }}>5%</div>
                <div className="prize-lbl">REFERRAL</div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 4, letterSpacing: 0.3 }}>Referrer bonus</div>
              </div>
            </div>

            <div style={{ marginTop: 12, background: "rgba(0,255,178,0.04)", border: "1px solid rgba(0,255,178,0.12)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
                The more predictions you get right, the higher your share of the 80% prize pool. All 4 correct = maximum reward!
              </span>
            </div>
          </div>

                    {/* ── MY BETS (hard-coded) ── */}
         {/* ── MY BETS ── */}
<div className="section-label" style={{ marginTop: 6 }}>
  <div className="section-line" />
  <span className="section-text">MY BETS</span>
  <div className="section-line" />
</div>

<div className="lb-card" style={{ marginBottom: 14 }}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
    <span style={{ fontFamily: "var(--font-d)", fontSize: 10, color: "var(--cyan)", letterSpacing: 1 }}>YOUR HISTORY</span>
    <span style={{ fontFamily: "var(--font-m)", fontSize: 11, color: "var(--gold)" }}>{myBetsTotal} TOTAL</span>
  </div>

  {myBets.length === 0 && (
    <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 12 }}>
      No bets placed yet
    </div>
  )}

  {myBets.map((bet) => {
    const isWin  = parseFloat(bet.win_amount) > 0;
    const isLoss = parseFloat(bet.loss_amount) > 0;
    const isPending = !isWin && !isLoss;
    return (
      <div key={bet.id} className="lb-row">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 36 }}>
          <span style={{ fontFamily: "var(--font-d)", fontSize: 8, color: "var(--text-muted)", letterSpacing: 0.5 }}>RND</span>
          <span style={{ fontFamily: "var(--font-m)", fontSize: 12, color: "var(--cyan)", fontWeight: 700 }}>#{bet.round_id}</span>
        </div>
        <div className="lb-info">
          <div className="lb-streak">
            Digit: {bet.question_1_ans} &middot;{" "}
            {bet.question_2_ans === 0 ? "HIGH" : "LOW"} &middot;{" "}
            {bet.question_3_ans === 0 ? "ODD" : "EVEN"} &middot;{" "}
            {bet.question_4_ans === 0 ? "RISE" : "FALL"}
          </div>
          <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>
            {new Date(bet.created_at).toLocaleString()}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-m)", fontSize: 12, color: "var(--gold)" }}>
            ${parseFloat(bet.amount).toFixed(2)}
          </div>
          {isWin && (
            <div style={{ fontFamily: "var(--font-m)", fontSize: 11, color: "var(--green)", fontWeight: 700 }}>
              +${parseFloat(bet.win_amount).toFixed(2)}
            </div>
          )}
          {isLoss && !isWin && (
            <div style={{ fontFamily: "var(--font-m)", fontSize: 11, color: "var(--red)" }}>
              -${parseFloat(bet.loss_amount).toFixed(2)}
            </div>
          )}
          {isPending && (
            <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>PENDING</div>
          )}
        </div>
      </div>
    );
  })}
</div>

         
                  {/* ── ROUND PARTICIPANTS ── */}
          <div className="section-label" style={{ marginTop: 6 }}>
            <div className="section-line" />
            <span className="section-text">ROUND PARTICIPANTS</span>
            <div className="section-line" />
          </div>

          <div className="lb-card" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontFamily: "var(--font-d)", fontSize: 10, color: "var(--cyan)", letterSpacing: 1 }}>
                {currentRoundId ? "ROUND #" + String(currentRoundId).padStart(6, "0") : "ROUND 00000"}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-m)", fontSize: 11, color: "var(--gold)" }}>
                  {roundBets.length} BETS
                </span>
                <span style={{ fontFamily: "var(--font-m)", fontSize: 10, color: "var(--green)", background: "rgba(0,255,178,0.07)", border: "1px solid rgba(0,255,178,0.15)", borderRadius: 6, padding: "2px 8px" }}>
                  Pool ${parseFloat(roundBetsPool).toFixed(2)}
                </span>
              </div>
            </div>

            {betsLoading && (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 12 }}>
                Loading...
              </div>
            )}

            {!betsLoading && roundBets.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 12 }}>
                No participants yet
              </div>
            )}

            {!betsLoading && roundBets.map((bet, i) => (
              <div key={bet.id} className="lb-row">
                <span className={`lb-rank ${i < 3 ? `rank-${i + 1}` : "rank-n"}`}>
                  {i < 3 ? RANK_ICONS[i] : `#${i + 1}`}
                </span>
                <div className="lb-avatar">
                  {bet.user?.name ? bet.user.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="lb-info">
                  <div className="lb-name">{bet.user?.name || "Anonymous"}</div>
                  <div className="lb-streak">
                    Digit: {bet.question_1_ans} &middot;{" "}
                    {bet.question_2_ans === 0 ? "HIGH" : "LOW"} &middot;{" "}
                    {bet.question_3_ans === 0 ? "ODD" : "EVEN"} &middot;{" "}
                    {bet.question_4_ans === 0 ? "RISE" : "FALL"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-m)", fontSize: 12, color: "var(--gold)" }}>
                    ${parseFloat(bet.amount).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>


          <div className="warning-row">
            <span className="warning-icon">⚠</span>
            <span className="warning-text">Complete all 4 predictions before confirming</span>
          </div>

          <div style={{ height: 8 }} />
        </main>
      </div>
    </div>
  );
}