"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail, Lock, Eye, EyeOff, Zap,
  Trophy, Users, TrendingUp, ShieldCheck, ChevronRight,
  KeyRound, RefreshCw, CheckCircle2, X
} from "lucide-react";
import "./login.css";

/* ══════════════════════════════════════════════
   OTP POPUP
══════════════════════════════════════════════ */
const OtpPopup = ({ email, onClose, onSuccess }) => {
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs                 = useRef([]);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setError("");
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft"  && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    const next = ["", "", "", "", "", ""];
    paste.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(paste.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the complete 6-digit OTP"); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setError(data?.message || data?.error || "Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }
      if (data.token) {
        localStorage.setItem("cpx_token",      data.token);
        localStorage.setItem("cpx_token_type", data.token_type || "Bearer");
        localStorage.setItem("cpx_user",       JSON.stringify(data.user));
      }
      onSuccess(data);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError("");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password: "__resend__" }),
      });
    } catch {}
    setResending(false);
    setCountdown(60);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="popup-overlay">
      <div className="popup-scroll">
        <div className="popup-wrap otp-popup-wrap">
          <div className="popup-top-line" />

          <button className="popup-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2} />
          </button>

          <div className="popup-icon-wrap">
            <div className="popup-icon-ring popup-icon-ring-1" />
            <div className="popup-icon-ring popup-icon-ring-2" />
            <div className="popup-icon-inner otp-icon-inner">
              <KeyRound size={28} strokeWidth={1.8} color="var(--cyan)" />
            </div>
          </div>

          <div className="popup-title otp-popup-title">VERIFY OTP</div>

          <p className="popup-msg">
            A 6-digit code was sent to
            <br />
            <span className="popup-email">{email}</span>
          </p>

          <div className="otp-boxes" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                className={`otp-box${digit ? " otp-filled" : ""}${error ? " otp-error" : ""}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                disabled={loading}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {error && (
            <div className="otp-error-msg">
              <ShieldCheck size={13} strokeWidth={2} />
              {error}
            </div>
          )}

          <button
            className={`popup-btn-login otp-verify-btn${loading ? " loading" : ""}`}
            onClick={handleVerify}
            disabled={loading}
          >
            <div className="btn-spinner" />
            <span className="btn-text">
              {loading
                ? "VERIFYING..."
                : <><CheckCircle2 size={14} strokeWidth={2} /> VERIFY & LOGIN</>}
            </span>
          </button>

          <div className="otp-resend-row">
            {canResend ? (
              <button
                className={`otp-resend-btn${resending ? " resending" : ""}`}
                onClick={handleResend}
                disabled={resending}
              >
                <RefreshCw size={12} strokeWidth={2} className={resending ? "spin" : ""} />
                {resending ? "RESENDING..." : "RESEND OTP"}
              </button>
            ) : (
              <span className="otp-countdown">
                Resend available in <span className="otp-timer">{countdown}s</span>
              </span>
            )}
          </div>

          <p className="popup-footer-note">
            Check your spam folder if you don&apos;t see the email.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN LOGIN PAGE
══════════════════════════════════════════════ */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [toast, setToast]       = useState({ show: false, msg: "", type: "" });
  const [otpEmail, setOtpEmail] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setError(data?.message || data?.error || data?.msg || "Invalid credentials. Please try again.");
        return;
      }
      showToast("OTP sent! Check your email.", "success");
      setOtpEmail(data.email || email.trim().toLowerCase());
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    showToast("Login successful! Redirecting...", "success");
    setTimeout(() => router.push("/home"), 1000);
  };

  return (
    <>
      <div className="bg-grid" />
      <div className="bg-orb-1" />
      <div className="bg-orb-2" />

      <div className="outer">
        <div className="phone">

          <div className="topbar">
            <div className="logo">
              <div className="logo-icon">
                <Image src="/coin_logo1.png" alt="CoinPool X" width={36} height={36} className="logo-img" />
              </div>
              <div className="logo-text">
                <span className="logo-main">COINPOOL X</span>
                <span className="logo-sub">PREDICT · PLAY · WIN</span>
                <span className="logo-tag">WHERE STRATEGY MEETS OPPORTUNITY</span>
              </div>
            </div>
          </div>

          <div className="main">

            <div className="login-header">
              <div className="login-tag">
                <ShieldCheck size={12} strokeWidth={2.5} />
                <span>SECURE LOGIN</span>
              </div>
              <p className="login-sub">Sign in to your CoinPool X account and start predicting</p>
            </div>

            <div className="stats-strip">
              <div className="strip-stat">
                <Trophy size={18} className="strip-svg-icon gold" strokeWidth={1.8} />
                <div>
                  <div className="strip-val gold">$84K+</div>
                  <div className="strip-lbl">PRIZE POOL</div>
                </div>
              </div>
              <div className="strip-divider" />
              <div className="strip-stat">
                <Users size={18} className="strip-svg-icon cyan" strokeWidth={1.8} />
                <div>
                  <div className="strip-val cyan">12,480</div>
                  <div className="strip-lbl">PLAYERS</div>
                </div>
              </div>
              <div className="strip-divider" />
              <div className="strip-stat">
                <TrendingUp size={18} className="strip-svg-icon green" strokeWidth={1.8} />
                <div>
                  <div className="strip-val green">$52,284</div>
                  <div className="strip-lbl">BTC PRICE</div>
                </div>
              </div>
            </div>

            {error && (
              <div className="error-msg">
                <ShieldCheck size={14} />
                {error}
              </div>
            )}

            <div className="form-card">
              <form onSubmit={handleLogin} autoComplete="off">

                <div className="form-group">
                  <label className="form-label">EMAIL ADDRESS</label>
                  <div className="input-wrap">
                    <Mail size={16} className="input-icon" strokeWidth={1.8} />
                    <input className="form-input" type="email"
                      placeholder="you@coinpoolx.io"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      disabled={loading} />
                    <div className="input-glow" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">PASSWORD</label>
                  <div className="input-wrap">
                    <Lock size={16} className="input-icon" strokeWidth={1.8} />
                    <input className="form-input"
                      type={showPass ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      disabled={loading} />
                    <button type="button" className="eye-btn"
                      onClick={() => setShowPass(p => !p)} tabIndex={-1}
                      aria-label="Toggle password visibility">
                      {showPass
                        ? <EyeOff size={15} strokeWidth={1.8} />
                        : <Eye size={15} strokeWidth={1.8} />}
                    </button>
                    <div className="input-glow" />
                  </div>
                </div>

                <div className="forgot-row">
                  <Link href="/forgot-password" className="forgot-link">FORGOT PASSWORD?</Link>
                </div>

                <button type="submit"
                  className={`login-btn ${loading ? "loading" : ""}`}
                  disabled={loading}>
                  <div className="btn-glow" />
                  <div className="btn-spinner" />
                  <span className="btn-text">
                    {loading
                      ? "SIGNING IN..."
                      : <><Zap size={14} strokeWidth={2.5} /> SIGN IN</>}
                  </span>
                </button>
              </form>
            </div>

            <div className="register-row">
              <span>Don&apos;t have an account?</span>
              <Link href="/register" className="register-link">
                REGISTER NOW <ChevronRight size={11} strokeWidth={2.5} />
              </Link>
            </div>

            <div className="security-note">
              <ShieldCheck size={13} strokeWidth={1.8} />
              <span>256-bit encrypted · BSC Network · Non-custodial</span>
            </div>
          </div>
        </div>
      </div>

      {otpEmail && (
        <OtpPopup
          email={otpEmail}
          onClose={() => setOtpEmail(null)}
          onSuccess={handleOtpSuccess}
        />
      )}

      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <ShieldCheck size={15} strokeWidth={2} />
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}