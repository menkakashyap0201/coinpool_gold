"use client";
import { useEffect, useRef, useState, memo, useCallback } from "react";
import "./TickerTape.css";

const SYMBOLS = ["btcusdt", "ethusdt", "bnbusdt", "solusdt", "xrpusdt"];

function TickerTape() {
  const wsRef = useRef(null);

  const [coins, setCoins] = useState([
    { symbol: "BTC/USDT", price: 0, change: 0 },
    { symbol: "ETH/USDT", price: 0, change: 0 },
    { symbol: "BNB/USDT", price: 0, change: 0 },
    { symbol: "SOL/USDT", price: 0, change: 0 },
    { symbol: "XRP/USDT", price: 0, change: 0 },
  ]);

  const connectWS = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    const streams = SYMBOLS.map(s => `${s}@ticker`).join("/");
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const data = parsed?.data;
        if (!data) return;

        const symbol = data.s.replace("USDT", "/USDT");
        const price = parseFloat(data.c);
        const change = parseFloat(data.P);

        setCoins(prev =>
          prev.map(c => c.symbol === symbol ? { ...c, price, change } : c)
        );
      } catch (_) {}
    };

    ws.onerror = () => ws.close();

    // ✅ window.location.reload() NAHI — sirf reconnect
    ws.onclose = () => {
      setTimeout(() => {
        if (wsRef.current === ws) connectWS();
      }, 3000);
    };
  }, []);

  useEffect(() => {
    connectWS();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // unmount pe reconnect band
        wsRef.current.close();
      }
    };
  }, [connectWS]);

  return (
    <>
      {/* <style>{`
        .ticker-bar { width:100%; overflow:hidden; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:12px 0; position:relative; }
        .ticker-track { display:flex; width:max-content; animation:tickerMove 28s linear infinite; }
        .ticker-item { display:flex; align-items:center; gap:10px; margin-right:34px; padding:0 12px; white-space:nowrap; }
        .ticker-symbol { color:white; font-weight:700; font-size:13px; }
        .ticker-price  { color:#FFD700; font-weight:800; font-size:13px; }
        .ticker-up     { color:#00FFB2; font-weight:700; font-size:12px; }
        .ticker-down   { color:#FF4D6D; font-weight:700; font-size:12px; }
        @keyframes tickerMove { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style> */}

      <div className="ticker-bar">
        <div className="ticker-track">
          {[...coins, ...coins].map((coin, i) => {
            const up = coin.change >= 0;
            return (
              <div className="ticker-item" key={i}>
                <span className="ticker-symbol">{coin.symbol}</span>
                <span className="ticker-price">
                  ${coin.price ? coin.price.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "--"}
                </span>
                <span className={up ? "ticker-up" : "ticker-down"}>
                  {up ? "▲" : "▼"} {coin.change.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default memo(TickerTape);