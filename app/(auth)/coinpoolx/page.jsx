
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./welcome.css";
import Link from "next/link";
import WelcomePopup from "../../components/WelcomePopup";

/* ═══════════════════════════════════════════
   INLINE SVG ICONS — no external dependency
   ═══════════════════════════════════════════ */
const ico = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

const CheckIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" {...ico}>
    <path d="M5 12 L10 17 L19 7" />
  </svg>
);

const XIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" {...ico}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

const ShieldIcon = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" {...ico}>
    <path d="M12 2 L4 5 V11 C4 16 7.5 20.5 12 22 C16.5 20.5 20 16 20 11 V5 Z" />
    <path d="M9 12 L11 14 L15 10" />
  </svg>
);

const UserIcon = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" {...ico}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 21" />
  </svg>
);

const LockIcon = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" {...ico}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11 V7 A4 4 0 0 1 16 7 V11" />
    <circle cx="12" cy="16" r="1.2" fill="currentColor" />
  </svg>
);

const BoltIcon = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" {...ico}>
    <path d="M13 2 L4 14 H11 L10 22 L20 10 H13 Z" />
  </svg>
);

const BanIcon = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" {...ico}>
    <circle cx="12" cy="12" r="9" />
    <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
  </svg>
);

const GlobeIcon = () => (
  <svg width={28} height={28} viewBox="0 0 24 24" {...ico}>
    <circle cx="12" cy="12" r="9" />
    <ellipse cx="12" cy="12" rx="4" ry="9" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
);

/* ═══════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════ */
export default function HomePage() {
  const [btcPrice, setBtcPrice] = useState(67432.18);
  const [activePlayers, setActivePlayers] = useState(2847);
  const [countdown, setCountdown] = useState({ h: 2, m: 47, s: 12 });

  useEffect(() => {
    const id = setInterval(() => {
      setBtcPrice((p) => +(p + (Math.random() - 0.5) * 80).toFixed(2));
      setActivePlayers((p) => p + Math.floor((Math.random() - 0.3) * 6));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => {
        let { h, m, s } = c;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 2; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  const trustItems = [
    { icon: <ShieldIcon />, t: "Anti-Bot Defense",       d: "Bots and automation tools are permanently banned." },
    { icon: <UserIcon />,   t: "One Account Rule",        d: "One user, one account. Violations forfeit funds." },
    { icon: <LockIcon />,   t: "KYC Verification",        d: "Identity verification may be required for withdrawals." },
    { icon: <BoltIcon />,   t: "Wallet Security",         d: "Security review applies for large withdrawals." },
    { icon: <BanIcon />,    t: "No Insider Manipulation", d: "Coordinated cheating leads to permanent bans." },
    { icon: <GlobeIcon />,  t: "Region Restrictions",     d: "Restricted jurisdictions are auto-blocked per local laws." },
  ];

  const leaderboard = [
    { r: 1, n: "CryptoOracle_77",    t: "DIAMOND",  w: "84.2%", e: "$12,480" },
    { r: 2, n: "Satoshi_Strategist", t: "PLATINUM", w: "79.8%", e: "$9,210"  },
    { r: 3, n: "BlockSniper",        t: "PLATINUM", w: "77.5%", e: "$7,840"  },
    { r: 4, n: "NeoTrader",          t: "GOLD",     w: "73.1%", e: "$5,620"  },
    { r: 5, n: "ChainKing_X",        t: "GOLD",     w: "71.9%", e: "$4,950"  },
  ];

  return (
    <>
    {/* <WelcomePopup /> */}
      <Header />

      <main className="cpx-main">

        {/* ══════════════════════════════ HERO ══════════════════════════════ */}
        <section className="cpx-hero">
          <div className="cpx-hero-bg">
            <div className="cpx-grid-overlay" />
            <div className="cpx-glow cpx-glow-1" />
            <div className="cpx-glow cpx-glow-2" />
          </div>

          <div className="cpx-container cpx-hero-inner">
            {/* LEFT */}
            <div className="cpx-hero-left">
              <span className="cpx-badge">
                <span className="cpx-dot" />
                LIVE · {activePlayers.toLocaleString()} Players Online
              </span>

              <h1 className="cpx-hero-title">
                Where <span className="cpx-gold">Strategy</span><br />
                Meets <span className="cpx-gold">Opportunity.</span>
              </h1>

              <p className="cpx-hero-sub">
                Join elite crypto prediction pools and compete for real rewards.
                Skill-based, strategy-driven — not gambling.
              </p>

              <div className="cpx-hero-cta">
                <Link href="/register" className="cpx-btn cpx-btn-primary cpx-btn-lg">
                  Join Pool
                </Link>
                <Link href="#pools" className="cpx-btn cpx-btn-outline cpx-btn-lg">
                  Enter Premium Arena
                </Link>
              </div>

              <div className="cpx-hero-stats">
                <div className="cpx-stat">
                  <div className="cpx-stat-value">$2.4M+</div>
                  <div className="cpx-stat-label">Rewards Paid</div>
                </div>
                <div className="cpx-stat">
                  <div className="cpx-stat-value">48K+</div>
                  <div className="cpx-stat-label">Players</div>
                </div>
                <div className="cpx-stat">
                  <div className="cpx-stat-value">15%</div>
                  <div className="cpx-stat-label">Platform Fee</div>
                </div>
              </div>
            </div>

            {/* RIGHT — image + live card */}
            <div className="cpx-hero-right">
              <div className="cpx-hero-image-wrap">
                <Image
                  src="/hero2.png"
                  alt="CoinPool X Prediction Arena"
                  width={300}
                  height={300}
                  priority
                  className="cpx-hero-image"
                />
                <div className="cpx-hero-image-glow" />
              </div>

              <div className="cpx-live-card cpx-floating-card">
                <div className="cpx-live-head">
                  <div>
                    <div className="cpx-live-label">BTC / USDT · LIVE</div>
                    <div className="cpx-live-price">
                      ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <span className="cpx-pulse" />
                </div>

                <div className="cpx-candles">
                  {[42, 68, 35, 80, 55, 72, 48, 90, 62, 78, 45, 88].map((h, i) => (
                    <div
                      key={i}
                      className={`cpx-candle ${i % 3 === 0 ? "down" : "up"}`}
                      style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
                    />
                  ))}
                </div>

                <div className="cpx-next-slot">
                  <div className="cpx-next-label">Next Premium Slot</div>
                  <div className="cpx-next-timer">
                    <span>{pad(countdown.h)}</span>:<span>{pad(countdown.m)}</span>:<span>{pad(countdown.s)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════ POOLS ══════════════════════════════ */}
        <section className="cpx-section" id="pools">
          <div className="cpx-container">
            <div className="cpx-section-head">
              <span className="cpx-eyebrow">— THE ARENA</span>
              <h2 className="cpx-section-title">Choose Your Pool</h2>
              <p className="cpx-section-sub">
                Two tiers. Endless strategy. Pick the battlefield that matches your skill.
              </p>
            </div>

            <div className="cpx-pool-grid">
              {/* Standard */}
              <div className="cpx-pool-card">
                <div className="cpx-pool-tag">STANDARD</div>
                <h3 className="cpx-pool-name">Standard Pool</h3>
                <p className="cpx-pool-desc">Low entry. High volume. Perfect for sharpening your edge.</p>

                <div className="cpx-pool-price">
                  <span className="cpx-price-currency">$</span>
                  <span className="cpx-price-value">5</span>
                  <span className="cpx-price-unit">USDT</span>
                </div>

                <ul className="cpx-pool-list">
                  <li><CheckIcon /> Unlimited Players</li>
                  <li><CheckIcon /> Dynamic Prize Pool</li>
                  <li><CheckIcon /> 15% Platform Fee</li>
                  <li><CheckIcon /> 24/7 Active Slots</li>
                </ul>

                <button className="cpx-btn cpx-btn-outline cpx-btn-full">Enter Standard</button>
              </div>

              {/* Premium */}
              <div className="cpx-pool-card cpx-pool-featured">
                <div className="cpx-pool-tag cpx-tag-gold">PREMIUM · ELITE</div>
                <h3 className="cpx-pool-name">Premium Pool</h3>
                <p className="cpx-pool-desc">High stakes. New slot every 3 hours from 12 PM.</p>

                <div className="cpx-pool-price">
                  <span className="cpx-price-currency">$</span>
                  <span className="cpx-price-value">25</span>
                  <span className="cpx-price-unit">USDT</span>
                </div>

                <ul className="cpx-pool-list">
                  <li><CheckIcon /> Unlimited Players</li>
                  <li><CheckIcon /> Larger Prize Pool</li>
                  <li><CheckIcon /> 15% Platform Fee</li>
                  <li><CheckIcon /> Slot every 3 hours</li>
                </ul>

                <button className="cpx-btn cpx-btn-primary cpx-btn-full">Enter Premium Arena</button>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════ PREDICTION MECHANICS ══════════════════════════ */}
        <section className="cpx-section cpx-section-alt" id="how">
          <div className="cpx-container">
            <div className="cpx-section-head">
              <span className="cpx-eyebrow">— PREDICTION FORMATS</span>
              <h2 className="cpx-section-title">Four Ways to Predict</h2>
              <p className="cpx-section-sub">Skill-based formats. Strategy decides the winner — not luck.</p>
            </div>

            <div className="cpx-mech-grid">
              <div className="cpx-mech-card">
                <div className="cpx-mech-num">01</div>
                <h4>Exact Number</h4>
                <p>Predict the exact digit from <strong>0 to 9</strong>. Highest reward multiplier.</p>
              </div>
              <div className="cpx-mech-card">
                <div className="cpx-mech-num">02</div>
                <h4>High / Low</h4>
                <p>Call it: <strong>High (5–9)</strong> or <strong>Low (1–4)</strong>. Read the chart.</p>
              </div>
              <div className="cpx-mech-card">
                <div className="cpx-mech-num">03</div>
                <h4>Odd / Even</h4>
                <p>The binary classic. Pure pattern recognition wins this one.</p>
              </div>
              <div className="cpx-mech-card">
                <div className="cpx-mech-num">04</div>
                <h4>Rise or Fall</h4>
                <p>Will the market rise or fall from the previous slot's close?</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════ PRIZE DISTRIBUTION ══════════════════════════ */}
        <section className="cpx-section" id="rewards">
          <div className="cpx-container cpx-prize-wrap">
            <div className="cpx-prize-left">
              <span className="cpx-eyebrow">— PRIZE DISTRIBUTION</span>
              <h2 className="cpx-section-title">Transparent. Automated. Instant.</h2>
              <p className="cpx-prize-text">
                Rewards are credited automatically the moment results are confirmed.
                No delays, no manual review — pure on-chain efficiency.
              </p>

              <div className="cpx-prize-bars">
                <div className="cpx-bar-row">
                  <div className="cpx-bar-label">Pool Winners</div>
                  <div className="cpx-bar-track">
                    <div className="cpx-bar-fill" style={{ width: "80%" }} />
                  </div>
                  <div className="cpx-bar-pct">80%</div>
                </div>
                <div className="cpx-bar-row">
                  <div className="cpx-bar-label">Platform Service Fee</div>
                  <div className="cpx-bar-track">
                    <div className="cpx-bar-fill cpx-bar-grey" style={{ width: "15%" }} />
                  </div>
                  <div className="cpx-bar-pct">15%</div>
                </div>
                <div className="cpx-bar-row">
                  <div className="cpx-bar-label">Referral Commissions</div>
                  <div className="cpx-bar-track">
                    <div className="cpx-bar-fill cpx-bar-grey" style={{ width: "5%" }} />
                  </div>
                  <div className="cpx-bar-pct">5%</div>
                </div>
              </div>
            </div>

            <div className="cpx-prize-right">
              <div className="cpx-coin">
                <div className="cpx-coin-inner">
                  <div className="cpx-coin-text">80%</div>
                  <div className="cpx-coin-label">TO WINNERS</div>
                </div>
                <div className="cpx-coin-ring" />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════ LEADERBOARD ══════════════════════════ */}
        <section className="cpx-section cpx-section-alt" id="leaderboard">
          <div className="cpx-container">
            <div className="cpx-section-head">
              <span className="cpx-eyebrow">— TOP WINNERS TODAY</span>
              <h2 className="cpx-section-title">Leaderboard</h2>
              <p className="cpx-section-sub">The sharpest minds in crypto prediction. Earn your spot.</p>
            </div>

            <div className="cpx-board">
              <div className="cpx-board-head">
                <div>Rank</div>
                <div>Player</div>
                <div>Tier</div>
                <div>Win Rate</div>
                <div className="cpx-board-r">Earnings</div>
              </div>

              {leaderboard.map((p) => (
                <div
                  key={p.r}
                  className={`cpx-board-row ${p.r <= 3 ? "cpx-board-top" : ""}`}
                >
                  <div className="cpx-board-rank">#{p.r}</div>
                  <div className="cpx-board-name">{p.n}</div>
                  <div>
                    <span className={`cpx-tier cpx-tier-${p.t.toLowerCase()}`}>{p.t}</span>
                  </div>
                  <div>{p.w}</div>
                  <div className="cpx-board-r cpx-gold">{p.e}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════ REFERRAL ══════════════════════════ */}
        <section className="cpx-section" id="referral">
          <div className="cpx-container">
            <div className="cpx-ref-card">
              <div className="cpx-ref-left">
                <span className="cpx-eyebrow">— REFERRAL PROGRAM</span>
                <h2 className="cpx-section-title">Earn 5% On Every Deposit</h2>
                <p className="cpx-ref-text">
                  Refer a friend, and earn{" "}
                  <strong className="cpx-gold">5%</strong> on every deposit they make —
                  for every slot you both play together. Build your network, build your edge.
                </p>

                <ul className="cpx-ref-list">
                  <li><CheckIcon /> 5% per-slot commission</li>
                  <li><CheckIcon /> XP rewards &amp; bonuses</li>
                  <li><CheckIcon /> You must be in the same slot to earn</li>
                  <li className="cpx-ref-no"><XIcon /> Fake or self-referrals prohibited</li>
                </ul>

                <button className="cpx-btn cpx-btn-primary">Get Referral Link</button>
              </div>

              <div className="cpx-ref-right">
                <div className="cpx-ref-visual">
                  <div className="cpx-ref-node cpx-ref-you">YOU</div>
                  <div className="cpx-ref-lines">
                    <span /><span /><span />
                  </div>
                  <div className="cpx-ref-tree">
                    <div className="cpx-ref-node">+5%</div>
                    <div className="cpx-ref-node">+5%</div>
                    <div className="cpx-ref-node">+5%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════ TRUST / FAIR PLAY ══════════════════════════ */}
        <section className="cpx-section cpx-section-alt" id="fair">
          <div className="cpx-container">
            <div className="cpx-section-head">
              <span className="cpx-eyebrow">— FAIR PLAY POLICY</span>
              <h2 className="cpx-section-title">Built On Integrity</h2>
              <p className="cpx-section-sub">
                CoinPool X strictly enforces fair play. Skill should win — never exploits.
              </p>
            </div>

            <div className="cpx-trust-grid">
              {trustItems.map((x, i) => (
                <div className="cpx-trust-card" key={i}>
                  <div className="cpx-trust-icon">{x.icon}</div>
                  <h4>{x.t}</h4>
                  <p>{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════ WALLET ══════════════════════════ */}
        <section className="cpx-section" id="wallet">
          <div className="cpx-container cpx-wallet-wrap">
            <div className="cpx-wallet-left">
              <span className="cpx-eyebrow">— WALLET &amp; PAYMENTS</span>
              <h2 className="cpx-section-title">USDT. Fast. Borderless.</h2>
              <p className="cpx-wallet-text">
                Deposits supported on{" "}
                <strong className="cpx-gold">TRC20</strong> and{" "}
                <strong className="cpx-gold">BEP20</strong>.
                All withdrawals are processed on{" "}
                <strong className="cpx-gold">BEP20</strong> for security and speed.
              </p>

              <div className="cpx-wallet-chips">
                <div className="cpx-chip">
                  USDT · TRC20 <small>Deposits</small>
                </div>
                <div className="cpx-chip">
                  USDT · BEP20 <small>Deposits + Withdrawals</small>
                </div>
              </div>

              <div className="cpx-wallet-notes">
                <div>— Minimum deposit limits apply</div>
                <div>— KYC may be required for withdrawals</div>
                <div>— Large withdrawals undergo security review</div>
                <div>— Standard processing within stated timeframes</div>
              </div>
            </div>

            <div className="cpx-wallet-right">
              <div className="cpx-wallet-card">
                <div className="cpx-wallet-card-top">
                  <span>CoinPool X · Wallet</span>
                  <span className="cpx-gold">●●●●</span>
                </div>
                <div className="cpx-wallet-balance">
                  <div className="cpx-wallet-label">Available Balance</div>
                  <div className="cpx-wallet-amount">
                    1,248.50 <small>USDT</small>
                  </div>
                </div>
                <div className="cpx-wallet-actions">
                  <button className="cpx-btn cpx-btn-primary cpx-btn-sm">Deposit</button>
                  <button className="cpx-btn cpx-btn-outline cpx-btn-sm">Withdraw</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════ FINAL CTA ══════════════════════════ */}
        <section className="cpx-cta">
          <div className="cpx-container cpx-cta-inner">
            <h2 className="cpx-cta-title">Ready to test your edge?</h2>
            <p className="cpx-cta-sub">Join the next slot. Outsmart the market. Claim your reward.</p>
            <div className="cpx-cta-buttons">
              <Link href="/register" className="cpx-btn cpx-btn-primary cpx-btn-lg">
                Join Pool Now
              </Link>
              <Link href="#pools" className="cpx-btn cpx-btn-outline cpx-btn-lg">
                Enter Premium Arena
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}


