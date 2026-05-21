"use client";
import { useState, useEffect } from "react";
import { FaBitcoin } from "react-icons/fa";
import { FiBell, FiPlus } from "react-icons/fi";
// import SparkChart from "./TradingView/SparkChart";
import "./TopHeader.css";

// ── Logo image import — apni image ka path yahan dalo ──
// import LogoImg from "@/assets/logo.png";   ← uncomment & path set karo
// Abhi fallback icon use ho raha hai jab tak image nahi doge

export default function Header({ btcPrice = 52284.13, balance = "1,250.00", tab, setTab, logo }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [timeLeft, setTimeLeft]   = useState(42);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(t => (t <= 1 ? 180 : t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  return (
    <header style={{ flexShrink: 0 }}>

      {/* ── Main Topbar ── */}
      <div className="topbar">

        {/* ── Logo ── */}
        <div className="logo">
          <div className="logo-icon">
            {/* logoSrc prop doge toh image aayegi, warna fallback icon */}
            <img src="/coin_logo1.png" alt="Logo" className="logo-img" height={47} width={47} />
          </div>
          <div className="logo-text">
            <span className="logo-main">COINPOOL X</span>
            <span className="logo-sub">PREDICT · PLAY · WIN</span>
            <span className="logo-tag">WHERE STRATEGY MEETS OPPORTUNITY</span>
          </div>
        </div>

        {/* ── Right Cluster ── */}
        <div className="top-right">

        

          {/* Balance Pill */}
          <div className="balance-pill">
            <span className="t-icon">$</span>
            <span className="bal-amt">{balance}</span>
            <span className="bal-cur hide-xs">USDT</span>
            
          </div>

          

        </div>
      </div>

   
    </header>
  );
}