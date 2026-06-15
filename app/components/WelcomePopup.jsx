"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show popup on every page load (remove localStorage check if you want repeat)
    const timer = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.78)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          backdropFilter: "blur(6px)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setVisible(false);
        }}
      >
        {/* Popup Card */}
        <div
          style={{
            background: "linear-gradient(160deg, #1a1a20 0%, #0e0e12 100%)",
            border: "1px solid rgba(212,175,55,0.35)",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "480px",
            position: "relative",
            overflow: "hidden",
            padding: "44px 40px 40px",
            textAlign: "center",
            boxShadow:
              "0 0 60px rgba(212,175,55,0.15), 0 20px 60px rgba(0,0,0,0.7)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Top gold line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, #D4AF37, #F4D47C, #D4AF37, transparent)",
            }}
          />

          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "300px",
              height: "300px",
              background:
                "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />

          {/* Close Button */}
          <button
            onClick={() => setVisible(false)}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              width: "32px",
              height: "32px",
              background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#D4AF37",
              fontSize: "15px",
              zIndex: 10,
              lineHeight: 1,
              transition: "all 0.2s",
            }}
          >
            ✕
          </button>

          {/* Logo */}
          <div
            style={{ marginBottom: "20px", position: "relative", zIndex: 1 }}
          >
            <span
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(212,175,55,0.45)",
                marginBottom: "4px",
              }}
            >
              Welcome to
            </span>

            {/* Replace below with your <Image> logo if available */}
            <div
              style={{
                fontSize: "22px",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                background:
                  "linear-gradient(135deg, #8a7128, #D4AF37, #F4D47C, #D4AF37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline-block",
              }}
            >
              <Image
                src="/millioniareX_Logo.png"
                alt="Millioniare X"
                width={200}
                height={200}
                priority
                className="cpx-logo-img"
              />
            </div>
          </div>

          {/* Live Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              background: "rgba(212,175,55,0.07)",
              border: "1px solid rgba(212,175,55,0.2)",
              padding: "6px 14px",
              borderRadius: "100px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#D4AF37",
              marginBottom: "24px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                background: "#4ade80",
                borderRadius: "50%",
                boxShadow: "0 0 6px rgba(74,222,128,0.7)",
                animation: "blink 1.5s infinite",
                display: "inline-block",
              }}
            />
            Live · 2,847 Players Online
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(26px, 7vw, 34px)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              color: "#f0f0f0",
              margin: "0 0 14px",
              position: "relative",
              zIndex: 1,
            }}
          >
            Predict Smarter.
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #8a7128, #D4AF37, #F4D47C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Win Bigger.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: 1.75,
              color: "#8a8a9a",
              margin: "0 auto 32px",
              maxWidth: "360px",
              position: "relative",
              zIndex: 1,
            }}
          >
            Welcome to CoinPoolX, the first prediction pool where everyone sees
            the same Bitcoin price — but only a few predict correctly.
          </p>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "11px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Link
              href="/register"
              onClick={() => {
                setVisible(false);
                window.location.href = "/register";
              }}
              style={{
                padding: "15px 28px",
                background:
                  "linear-gradient(135deg, #c9a227 0%, #F4D47C 50%, #D4AF37 100%)",
                color: "#0a0a0c",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(212,175,55,0.35)",
                transition: "all 0.25s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 32px rgba(212,175,55,0.55)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow =
                  "0 4px 20px rgba(212,175,55,0.35)";
              }}
            >
              ⚡ Enter CoinPoolX
            </Link>

            <button
              onClick={() => {
                setVisible(false);
                document
                  .getElementById("how")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                padding: "15px 28px",
                background: "rgba(212,175,55,0.04)",
                color: "#D4AF37",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                border: "1px solid rgba(212,175,55,0.25)",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.25s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(212,175,55,0.1)";
                e.currentTarget.style.borderColor = "#D4AF37";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(212,175,55,0.04)";
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.25)";
              }}
            >
              Learn More
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "28px 0 20px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(212,175,55,0.15)",
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(212,175,55,0.35)",
              }}
            >
              Trusted by thousands
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(212,175,55,0.15)",
              }}
            />
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "32px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {[
              { val: "$2.4M+", lbl: "Rewards Paid" },
              { val: "48K+", lbl: "Players" },
              { val: "80%", lbl: "To Winners" },
            ].map((s) => (
              <div key={s.lbl} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    background: "linear-gradient(135deg, #D4AF37, #F4D47C)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#555566",
                    marginTop: "5px",
                  }}
                >
                  {s.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blink animation */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 420px) {
          .mpx-popup-inner { padding: 36px 20px 32px !important; }
        }
      `}</style>
    </>
  );
}
