import { useEffect, useRef, useState, useCallback, memo } from "react";

function SparkChart({ onPriceUpdate }) {
  const canvasRef             = useRef(null);
  const pricesRef             = useRef([]);
  const wsRef                 = useRef(null);
  const animFrameRef          = useRef(null);
  const [loading, setLoading] = useState(true);

  const draw = useCallback((prices) => {
    const canvas = canvasRef.current;
    if (!canvas || !prices || prices.length < 2) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    animFrameRef.current = requestAnimationFrame(() => {
      const ctx   = canvas.getContext("2d");
      const W     = canvas.width;
      const H     = canvas.height;
      const pad   = 4;
      const min   = Math.min(...prices);
      const max   = Math.max(...prices);
      const range = max - min || 1;
      const xStep = (W - pad * 2) / (prices.length - 1);
      const yFor  = (v) => H - pad - ((v - min) / range) * (H - pad * 2);
      const pts   = prices.map((v, i) => ({ x: pad + i * xStep, y: yFor(v) }));

      const up    = prices[prices.length - 1] >= prices[0];

      /* Gold theme colors */
      const lineColor   = up ? "#FFD700" : "#FF4D6D";
      const glowColor   = up ? "#FFD700" : "#FF4D6D";
      const gradTop     = up ? "rgba(255,215,0,0.32)"  : "rgba(255,77,109,0.28)";
      const gradBottom  = "rgba(0,0,0,0)";

      ctx.clearRect(0, 0, W, H);

      /* filled area */
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, gradTop);
      grad.addColorStop(1, gradBottom);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, H);
      ctx.lineTo(pts[0].x, H);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      /* line */
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = lineColor;
      ctx.lineWidth   = 2;
      ctx.lineJoin    = "round";
      ctx.lineCap     = "round";
      ctx.shadowColor = glowColor;
      ctx.shadowBlur  = 10;
      ctx.stroke();

      /* reset shadow for dot */
      ctx.shadowBlur = 0;

      /* live dot at tip — gold ring + filled center */
      const last = pts[pts.length - 1];

      /* outer pulse ring */
      ctx.beginPath();
      ctx.arc(last.x, last.y, 5.5, 0, Math.PI * 2);
      ctx.strokeStyle = up ? "rgba(255,215,0,0.35)" : "rgba(255,77,109,0.35)";
      ctx.lineWidth   = 1.5;
      ctx.shadowBlur  = 0;
      ctx.stroke();

      /* inner solid dot */
      ctx.beginPath();
      ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
      ctx.fillStyle  = lineColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur  = 16;
      ctx.fill();
    });
  }, []);

  const fetchChart = useCallback(async () => {
    try {
      const res  = await fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart" +
        "?vs_currency=usd&days=1&interval=hourly",
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error();
      const data   = await res.json();
      const prices = data.prices.map(([, p]) => p);
      pricesRef.current = prices;
      setLoading(false);
      onPriceUpdate?.(prices[prices.length - 1]);
      draw(prices);
    } catch {
      if (pricesRef.current.length > 0) { draw(pricesRef.current); return; }
      setLoading(false);
      const fake = Array.from({ length: 24 }, (_, i) =>
        52000 + Math.sin(i * 0.45) * 600 + Math.random() * 150
      );
      pricesRef.current = fake;
      draw(fake);
    }
  }, [draw, onPriceUpdate]);

  const connectWS = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker");
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const msg   = JSON.parse(e.data);
        const price = parseFloat(msg.c);
        if (!price || isNaN(price)) return;
        onPriceUpdate?.(price);
        if (pricesRef.current.length > 0) {
          const updated = [...pricesRef.current.slice(-59), price];
          pricesRef.current = updated;
          draw(updated);
        }
      } catch {}
    };

    ws.onerror = () => ws.close();
    ws.onclose = () => {
      setTimeout(() => { if (wsRef.current === ws) connectWS(); }, 3000);
    };
  }, [draw, onPriceUpdate]);

  useEffect(() => {
    fetchChart();
    connectWS();
    const fullId = setInterval(fetchChart, 5 * 60 * 1000);
    return () => {
      clearInterval(fullId);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
    };
  }, [fetchChart, connectWS]);

  return (
    <>
      <style>{`
        .spark-wrap {
          width: 100%;
          height: 44px;
          margin-top: 6px;
          position: relative;
          border-radius: 6px;
          overflow: hidden;
          
        }
        .spark-canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
        .spark-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spark-dots-row {
          display: flex;
          gap: 5px;
          align-items: center;
        }
        .spark-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          animation: sparkPulse 1.1s ease-in-out infinite;
        }
        .spark-dot:nth-child(1) {
          background: #FFD700;
          animation-delay: 0s;
        }
        .spark-dot:nth-child(2) {
          background: #d4800a;
          animation-delay: 0.22s;
        }
        .spark-dot:nth-child(3) {
          background: #FFD700;
          animation-delay: 0.44s;
        }
        @keyframes sparkPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.75); }
          50%       { opacity: 1;   transform: scale(1.3);  }
        }
      `}</style>

      <div className="spark-wrap">
        {loading && (
          <div className="spark-loading">
            <div className="spark-dots-row">
              <div className="spark-dot" />
              <div className="spark-dot" />
              <div className="spark-dot" />
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="spark-canvas"
          width={120}
          height={44}
          style={{ opacity: loading ? 0 : 1, transition: "opacity 0.5s" }}
        />
      </div>
    </>
  );
}

export default memo(SparkChart);