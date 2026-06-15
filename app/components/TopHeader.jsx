"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { FiBell } from "react-icons/fi";
import { GiCash } from "react-icons/gi";
import { FaSackDollar } from "react-icons/fa6";
import "./TopHeader.css";

const API            = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY      = "cpx_token";
const TOKEN_TYPE_KEY = "cpx_token_type";
const POLL_MS        = 30000;

export default function TopHeader({ tab, setTab, logo }) {
  const [balance,   setBalance]   = useState("—");
  const [deposit,   setDeposit]   = useState("—");
  const [finLoaded, setFinLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(42);
  const pollRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(t => (t <= 1 ? 180 : t - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchFinancials = useCallback(async (showSpinner = false) => {
    try {
      const token     = localStorage.getItem(TOKEN_KEY);
      const tokenType = localStorage.getItem(TOKEN_TYPE_KEY) || "Bearer";
      if (!token || !API) return;
      if (showSpinner) setRefreshing(true);
      const res = await fetch(`${API}/profile`, {
        method: "GET",
        headers: { Authorization: `${tokenType} ${token}`, Accept: "application/json" },
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (!data?.status || !data?.data?.financial) return;
      const fin = data.data.financial;
      const fmt = (v) => Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      setBalance(fmt(fin.total_wallet_balance));
      setDeposit(fmt(fin.total_deposit));
      setFinLoaded(true);
    } catch (_) {}
    finally { setRefreshing(false); }
  }, []);

  useEffect(() => { fetchFinancials(); }, [fetchFinancials]);
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") fetchFinancials(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchFinancials]);
  useEffect(() => {
    pollRef.current = setInterval(() => fetchFinancials(), POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchFinancials]);
  useEffect(() => { fetchFinancials(); }, [tab, fetchFinancials]);

  return (
    <header className="cpx-header" style={{ flexShrink: 0 }}>
      <div className="cpx-topbar">

        {/* Logo */}
        <div className="cpx-logo">
          <div className="cpx-logo-ring">
            <img src="/coinpoolx.png" alt="CoinPool X" className="cpx-logo-img" height={30} width={30} />
          </div>
          <div className="cpx-logo-text">
            {/* <span className="cpx-logo-main">COINPOOL X</span> */}
            {/* <span className="cpx-logo-sub">PREDICT · PLAY · WIN</span> */}
          </div>
        </div>

        {/* Balance cluster */}
        <div
          className={`cpx-balance-card ${refreshing ? "cpx-refreshing" : ""}`}
          onClick={() => fetchFinancials(true)}
          title="Tap to refresh"
          role="button"
        >
          {/* shimmer line on top */}
          <div className="cpx-card-shine" />

          {/* Deposit row */}
          <div className="cpx-bal-row">
            <GiCash className="cpx-bal-icon cpx-icon-gold" />
            <span className="cpx-bal-amount cpx-gold">{finLoaded ? deposit : "—"}</span>
            <span className="cpx-bal-label">DEPOSIT</span>
          </div>

          <div className="cpx-bal-divider" />

          {/* Wallet row */}
          <div className="cpx-bal-row">
            <FaSackDollar className="cpx-bal-icon cpx-icon-white" />
            <span className="cpx-bal-amount">{finLoaded ? balance : "—"}</span>
            <span className="cpx-bal-label">INCOME</span>
          </div>
        </div>

      </div>
    </header>
  );
}