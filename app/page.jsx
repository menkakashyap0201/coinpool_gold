"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

/* ─── BTC Live Price Hook (CoinGecko API) ─── */
function useBTCPrice() {
  const [data, setData] = useState({
    price: null,
    change: null,
    high: null,
    low: null,
    vol: null,
    history: [],
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchPrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false",
      );
      const json = await res.json();
      const market = json.market_data;
      setData((prev) => {
        const newHistory = [
          ...(prev.history || []),
          market.current_price.usd,
        ].slice(-20);
        return {
          price: market.current_price.usd,
          change: market.price_change_percentage_24h,
          high: market.high_24h.usd,
          low: market.low_24h.usd,
          vol: market.total_volume.usd,
          history: newHistory,
        };
      });
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      setLoading(false);
    } catch {
      // Fallback mock data if API is unavailable
      setData((prev) => {
        const mockPrice = 67420 + Math.random() * 800 - 400;
        const newHistory = [...(prev.history || []), mockPrice].slice(-20);
        return {
          price: mockPrice,
          change: 2.34 + (Math.random() - 0.5),
          high: 68900,
          low: 65800,
          vol: 42_300_000_000,
          history: newHistory,
        };
      });
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const timer = setInterval(fetchPrice, 30000);
    return () => clearInterval(timer);
  }, []);

  return { ...data, loading, lastUpdated };
}

/* ─── Sparkline SVG ─── */
function Sparkline({ data, change }) {
  if (!data || data.length < 2) return <div style={{ height: 52 }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 300,
    h = 48;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  const color = (change || 0) >= 0 ? "#4ade80" : "#f87171";
  const fillColor =
    (change || 0) >= 0 ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)";
  const fillPath = `M0,${h} L${pts.split(" ").join(" L")} L${w},${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="btc-sparkline"
      preserveAspectRatio="none"
    >
      <path d={fillPath} fill={fillColor} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Countdown Hook ─── */
function useCountdown(targetDate) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) {
        setTime({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return time;
}

/* ─── PredCard component ─── */
/* logoSrc: replace dummy paths with your real images */
function PredCard({ variant, label, logoSrc, logoAlt }) {
  return (
    <div className={`pred-card card-${variant}`}>
      <div className="card-coin">
        <div className="coin-outer">
          <div className="coin-inner">
            {/* Replace src with your actual logo — e.g. /bitcoin-logo.png */}
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={variant === "center" ? 52 : 42}
              height={variant === "center" ? 52 : 42}
              style={{ objectFit: "contain", borderRadius: "50%" }}
            />
          </div>
        </div>
      </div>
      <span className="card-label">{label}</span>
    </div>
  );
}

/* ─── Main Welcome Page ─── */
export default function Coinpoolx() {
  const btc = useBTCPrice();

  const countdown = useCountdown("2025-09-01T00:00:00");

  const fmt = (n) =>
    n ? "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";
  const fmtVol = (n) => (n ? "$" + (n / 1e9).toFixed(2) + "B" : "—");

  return (
    <main className="welcome-page">
      {/* Backgrounds */}
      <div className="bg-rays" aria-hidden="true" />
      <div className="bg-vignette" aria-hidden="true" />
      <div className="bg-grain" aria-hidden="true" />

      {/* ── Navbar ── */}
      <nav className="navbar">
        <Link href="/" className="navbar-logo">
          <div className="logo-icon-wrap">
            <Image
              src="/millioniare_logo.png"
              alt="MillionairePoolX Logo"
              width={38}
              height={38}
            />
          </div>
          <div className="logo-brand">
            <div className="logo-brand-main">
              Millionaire<span>PoolX</span>
            </div>
            <div className="logo-brand-sub">Prediction Hub</div>
          </div>
        </Link>
        <div className="navbar-right">

          <Link href="/login" className="navbar-cta">
            Sign In
          </Link>
        </div>
      </nav>

     {/* ── Hero + Stats Two-Column Layout ── */}
<section className="hero hero-split-layout">
  {/* LEFT: Hero Text */}
  <div className="hero-left">
    <div className="hero-badge">
      <span className="hero-badge-dot" />
      <span className="hero-badge-text">Premium Prediction Pool</span>
    </div>

    <div className="company-label"> · MillionairePoolX · </div>

    <h1 className="hero-headline">Predict Smarter.{"\n"}Win Bigger.</h1>

    <p className="hero-sub">
      Welcome to <strong>MillionairePoolX</strong> — the ultimate prediction platform for Crypto, Cricket, Stocks, and more. Compete, climb leaderboards, and earn rewards with fair and instant settlements.
    </p>

    
      {/* <Link href="/register" className="btn-primary">
        Enter CoinPoolX
        <span className="btn-arrow">→</span>
      </Link>
      <Link href="/coinpoolx" className="btn-secondary">
        Learn More
      </Link> */}
   
  </div>

  {/* RIGHT: Stats Panel */}
  <div className="hero-right">
    <div className="stats-panel">
      <div className="stats-panel-title">Platform Highlights</div>
      <div className="stats-grid-inner">

        <div className="stat-box">
          <div className="stat-value-lg">$2.4M</div>
          <div className="stat-box-label">Total Prizes Paid</div>
          <div className="stat-box-desc">Across all active pools</div>
        </div>

        <div className="stat-box">
          <div className="stat-value-lg">48K+</div>
          <div className="stat-box-label">Active Predictors</div>
          <div className="stat-box-desc">Competing globally</div>
        </div>

        <div className="stat-box stat-box-wide">
          <div className="stat-box-row">
            <div>
              <div className="stat-value-sm">Live</div>
              <div className="stat-box-label">BTC Price Feed</div>
              <div className="stat-box-desc">Real-time updates every 30s</div>
            </div>
            <div className="stat-box-right">
              <div className="live-pill">
                <span className="badge-live-dot" />
                Live Now
              </div>
              <div className="btc-pair-label">BTC / USD</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>

      {/* ── Divider ── */}
      <div className="section-divider">
        <div className="divider-line" />
        <div className="divider-gem" />
        <div className="divider-line" />
      </div>

      {/* ── Products Section ── */}
      <section className="products-section">
        <div className="products-label">Our Platforms</div>
        <h2 className="products-title">
          Choose Your <em>Arena</em>
        </h2>
        <p className="products-subtitle">
          Two prediction pools. One goal — winning. Explore what&apos;s live and
          what&apos;s coming.
        </p>

        <div className="products-grid">
         

          {/* CoinPoolX — LIVE */}
          <div className="product-card product-card-live">
            <div className="card-top-row">
              <div className="card-icon-wrap">
                <Image
                  src="/coinpoolx.png"
                  alt="CoinPoolX Logo"
                  width={38}
                  height={38}
                />
              </div>
              <div className="badge-live">
                <span className="badge-live-dot" />
                Live Now
              </div>
            </div>

            <div className="card-product-name">
              Coin<span>PoolX</span>
            </div>
            <div className="card-parent-label">by MillionairePoolX</div>
            <p className="card-desc">
              Predict the <strong>Bitcoin price</strong> every round and compete
              with thousands of players. The closest prediction wins the pool —
              simple, fair, live.
            </p>

            {/* BTC Live Widget */}
            <div className="btc-widget">
              <div className="btc-header">
                <div className="btc-pair">
                  <div className="btc-icon">₿</div>
                  <span className="btc-label">BTC / USD</span>
                </div>
                <span className="btc-refresh">
                  {btc.loading ? "Loading..." : `Updated ${btc.lastUpdated}`}
                </span>
              </div>
              <div className="btc-price-row">
                <span className="btc-price">
                  {btc.loading ? "Loading..." : fmt(btc.price)}
                </span>
                {!btc.loading && btc.change != null && (
                  <span
                    className={`btc-change ${btc.change >= 0 ? "up" : "down"}`}
                  >
                    {btc.change >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(btc.change).toFixed(2)}%
                  </span>
                )}
              </div>
              <Sparkline data={btc.history} change={btc.change} />
              <div className="btc-meta">
                <div className="btc-meta-item">
                  <div className="btc-meta-label">24h High</div>
                  <div className="btc-meta-val">{fmt(btc.high)}</div>
                </div>
                <div className="btc-meta-item">
                  <div className="btc-meta-label">24h Low</div>
                  <div className="btc-meta-val">{fmt(btc.low)}</div>
                </div>
                <div className="btc-meta-item">
                  <div className="btc-meta-label">Volume</div>
                  <div className="btc-meta-val">{fmtVol(btc.vol)}</div>
                </div>
              </div>
            </div>

            <div className="cta-group">
              <Link href="/register" className="card-cta">
                Enter CoinPoolX
              </Link>
              <Link href="/coinpoolx" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>

          {/* CricketPoolX — COMING SOON */}
          <div className="product-card">
            <div className="card-top-row">
              <div className="card-icon-wrap">
                {" "}
                <Image
                  src="/cricketpoolx.png"
                  alt="CricketPoolX Logo"
                  width={38}
                  height={38}
                />
              </div>
              <div className="badge-coming">Coming Soon</div>
            </div>

            <div className="card-product-name">
              Cricket<span>PoolX</span>
            </div>
            <div className="card-parent-label">by MillionairePoolX</div>
            <p className="card-desc">
              The next frontier — predict{" "}
              <strong>live cricket match outcomes</strong>, player scores,
              wickets &amp; more. A brand new arena where cricket fans win big.
            </p>

            {/* Cricket Widget */}
            <div className="cricket-widget">
              <div className="cricket-coming-title">
                What&apos;s coming in CricketPoolX
              </div>
              <div className="cricket-features">
                {[
                  ["Live Match Score Predictions", "Predict every ball"],
                  [
                    "Player Performance Pools",
                    "Top scorer, wicket-taker & more",
                  ],
                  ["Tournament Prize Pools", "IPL, World Cup, T20 & ODI"],
                  ["Real-time Leaderboards", "Compete globally, win daily"],
                ].map(([title, sub]) => (
                  <div className="cricket-feat" key={title}>
                    <div className="feat-dot" />
                    <div className="feat-text">
                      <strong>{title}</strong> — {sub}
                    </div>
                  </div>
                ))}
              </div>
              <div className="cricket-countdown">
                {[
                  [String(countdown.d).padStart(2, "0"), "Days"],
                  [String(countdown.h).padStart(2, "0"), "Hours"],
                  [String(countdown.m).padStart(2, "0"), "Mins"],
                  [String(countdown.s).padStart(2, "0"), "Secs"],
                ].map(([v, l]) => (
                  <div className="cd-unit" key={l}>
                    <span className="cd-val">{v}</span>
                    <span className="cd-label">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <span className="card-cta-ghost">Notify Me · Coming Soon</span>
          </div>

          {/* PredictX */}

<div className="product-card">
  <div className="card-top-row">
    <div className="card-icon-wrap">
      <Image
        src="/predictionpoolx.png"
        alt="PredictionPoolX Logo"
        width={48}
        height={38}
      />
    </div>
    <div className="badge-coming">Coming Soon</div>
  </div>
  

  <div className="card-product-name">
    PredictionPool<span>X</span>
  </div>

  <div className="card-parent-label">
    Smart Predictions. Real Rewards.
  </div>

  <p className="card-desc">
    PredictionPoolX is an advanced prediction platform where users forecast market
    trends, sports outcomes, and global events. Compete with players worldwide,
    improve your prediction skills, and earn exciting rewards.
  </p>

{/* PredictX Widget */}

  <div className="cricket-widget">
    <div className="cricket-coming-title">
      Why Choose PredictionPoolX
    </div>


<div className="cricket-features">
  {[
    [
      "AI-Powered Predictions",
      "Make smarter decisions with data insights",
    ],
    [
      "Multiple Prediction Categories",
      "Sports, Markets, Entertainment & more",
    ],
    [
      "Reward-Based Competitions",
      "Earn rewards through accurate predictions",
    ],
    [
      "Secure & Transparent",
      "Fast and fair result settlements",
    ],
  ].map(([title, sub]) => (
    <div className="cricket-feat" key={title}>
      <div className="feat-dot" />
      <div className="feat-text">
        <strong>{title}</strong> — {sub}
      </div>
    </div>
  ))}
</div>
 


  </div>
   <span className="card-cta-ghost">Notify Me · Coming Soon</span>
</div>

        </div>
      </section>

      {/* ── Divider ── */}
      <div className="section-divider">
        <div className="divider-line" />
        <div className="divider-gem" />
        <div className="divider-line" />
      </div>

      {/* ── Footer ── */}
      <footer className="welcome-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo-icon-wrap">
              <Image
                src="/millioniare_logo.png"
                alt="MillionairePoolX Logo"
                width={38}
                height={38}
              />
            </div>
            {/* <div className="footer-brand-name">The<span>home of real-time prediction pools. Crypto, cricket &amp; beyond.</span></div> */}
            <p className="footer-brand-sub">
              The home of real-time prediction pools. Crypto, cricket &amp;
              beyond.
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <div className="footer-col-title">Products</div>
              <ul className="footer-col-links">
                <li>
                  <Link href="#">CoinPoolX</Link>
                </li>
                <li>
                  <Link href="#">CricketPoolX</Link>
                </li>
                <li>
                  <Link href="#">Coming Soon</Link>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Company</div>
              <ul className="footer-col-links">
                <li>
                  <Link href="#">About Us</Link>
                </li>
                <li>
                  <Link href="#">Contact</Link>
                </li>
                <li>
                  <Link href="#">Careers</Link>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Legal</div>
              <ul className="footer-col-links">
                <li>
                  <Link href="#">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#">Terms of Use</Link>
                </li>
                <li>
                  <Link href="#">Fair Play Rules</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-note">
            © {new Date().getFullYear()} MillionairePoolX · All rights reserved
          </p>
          <p className="footer-sub-note">
            CoinPoolX &amp; CricketPoolX are products of MillionairePoolX
          </p>
        </div>
      </footer>
    </main>
  );
}
