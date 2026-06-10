"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail, ShieldCheck, ArrowLeft, Send,
  KeyRound, RefreshCw, CheckCircle2, Lock, Eye, EyeOff,
  X, XCircle
} from "lucide-react";
import "./forgot-password.css";

/* ══════════════════════════════════════════════
   OTP POPUP
══════════════════════════════════════════════ */
const OtpPopup = ({ email, onClose, onVerified }) => {
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs                 = useRef([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

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

  const handleNext = () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the complete 6-digit OTP"); return; }
    onVerified(code);
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError("");
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
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
          <div className="popup-top-line popup-top-line-cyan" />

          <button className="popup-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2} />
          </button>

          <div className="popup-icon-wrap">
            <div className="popup-icon-ring popup-icon-ring-cyan-1" />
            <div className="popup-icon-ring popup-icon-ring-cyan-2" />
            <div className="popup-icon-inner otp-icon-inner">
              <KeyRound size={28} strokeWidth={1.8} color="var(--cyan)" />
            </div>
          </div>

          <div className="popup-title otp-popup-title">VERIFY OTP</div>
          <p className="popup-msg">
            A 6-digit code was sent to<br />
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
              />
            ))}
          </div>

          {error && (
            <div className="popup-error-msg">
              <XCircle size={13} strokeWidth={2} />
              {error}
            </div>
          )}

          <button
            className={`popup-action-btn popup-btn-cyan${loading ? " loading" : ""}`}
            onClick={handleNext}
            disabled={loading}
          >
            <div className="btn-spinner" />
            <span className="btn-text">
              <CheckCircle2 size={14} strokeWidth={2} /> CONTINUE
            </span>
          </button>

          <div className="popup-resend-row">
            {canResend ? (
              <button
                className={`popup-resend-btn${resending ? " resending" : ""}`}
                onClick={handleResend}
                disabled={resending}
              >
                <RefreshCw size={12} strokeWidth={2} className={resending ? "icon-spin" : ""} />
                {resending ? "RESENDING..." : "RESEND OTP"}
              </button>
            ) : (
              <span className="popup-countdown">
                Resend available in <span className="popup-timer">{countdown}s</span>
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
   RESET PASSWORD POPUP
══════════════════════════════════════════════ */
const ResetPasswordPopup = ({ email, otp, onClose, onSuccess }) => {
  const [newPass, setNewPass]     = useState("");
  const [confirmPass, setConfirm] = useState("");
  const [showNew, setShowNew]     = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "" };
    let score = 0;
    if (pwd.length >= 8)          score++;
    if (/[A-Z]/.test(pwd))        score++;
    if (/[0-9]/.test(pwd))        score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return { level: score, label: ["", "Weak", "Fair", "Good", "Strong"][score] };
  };

  const strength       = getStrength(newPass);
  const strengthColors = { Weak: "var(--red)", Fair: "var(--gold3)", Good: "var(--gold)", Strong: "var(--green)" };

  const seg = (idx) => {
    if (strength.level === 0) return "";
    if (strength.level === 1 && idx === 0) return "weak";
    if (strength.level === 2 && idx <= 1)  return "fair";
    if (strength.level === 3 && idx <= 2)  return "good";
    if (strength.level === 4)              return "strong";
    return "";
  };

  const validate = () => {
    if (!newPass)                         return "New password is required";
    if (newPass.length < 8)              return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(newPass))          return "Must contain at least one uppercase letter";
    if (!/[0-9]/.test(newPass))          return "Must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(newPass))  return "Must contain at least one special character";
    if (!confirmPass)                    return "Please confirm your password";
    if (newPass !== confirmPass)         return "Passwords do not match";
    return null;
  };

  const handleReset = async () => {
    setError("");
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          email,
          otp,
          password:              newPass,
          password_confirmation: confirmPass,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setError(data?.message || data?.error || "Reset failed. Please try again.");
        return;
      }
      onSuccess();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-scroll">
        <div className="popup-wrap reset-popup-wrap">
          <div className="popup-top-line popup-top-line-gold" />

          <button className="popup-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2} />
          </button>

          <div className="popup-icon-wrap">
            <div className="popup-icon-ring popup-icon-ring-gold-1" />
            <div className="popup-icon-ring popup-icon-ring-gold-2" />
            <div className="popup-icon-inner reset-icon-inner">
              <Lock size={26} strokeWidth={1.8} color="var(--gold)" />
            </div>
          </div>

          <div className="popup-title reset-popup-title">NEW PASSWORD</div>
          <p className="popup-msg">
            Create a strong password for<br />
            <span className="popup-email">{email}</span>
          </p>

          {error && (
            <div className="popup-error-msg">
              <XCircle size={13} strokeWidth={2} />
              {error}
            </div>
          )}

          <div className="popup-form-group">
            <label className="popup-form-label">NEW PASSWORD</label>
            <div className="popup-input-wrap">
              <Lock size={15} className="popup-input-icon" strokeWidth={1.8} />
              <input
                className="popup-form-input"
                type={showNew ? "text" : "password"}
                placeholder="Min 8 · A-Z · 0-9 · @#$"
                value={newPass}
                onChange={e => { setNewPass(e.target.value); setError(""); }}
                disabled={loading}
              />
              <button type="button" className="eye-btn" onClick={() => setShowNew(p => !p)} tabIndex={-1}>
                {showNew ? <EyeOff size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}
              </button>
            </div>
            {newPass && (
              <>
                <div className="popup-strength-bar">
                  {[0, 1, 2, 3].map(i => <div key={i} className={`popup-strength-seg ${seg(i)}`} />)}
                </div>
                <div className="popup-strength-row">
                  <span style={{ color: strengthColors[strength.label] || "var(--text-muted)", fontSize: "9px", fontWeight: 700 }}>
                    {strength.label}
                  </span>
                  <span className="popup-strength-hint">Uppercase · Number · Special char</span>
                </div>
              </>
            )}
          </div>

          <div className="popup-form-group">
            <label className="popup-form-label">CONFIRM PASSWORD</label>
            <div className="popup-input-wrap">
              <Lock size={15} className="popup-input-icon" strokeWidth={1.8} />
              <input
                className="popup-form-input"
                type={showConf ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPass}
                onChange={e => { setConfirm(e.target.value); setError(""); }}
                disabled={loading}
              />
              <button type="button" className="eye-btn" onClick={() => setShowConf(p => !p)} tabIndex={-1}>
                {showConf ? <EyeOff size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}
              </button>
            </div>
            {confirmPass && (
              <div className={`popup-match-hint ${newPass === confirmPass ? "match" : "no-match"}`}>
                {newPass === confirmPass
                  ? <><CheckCircle2 size={11} strokeWidth={2.5} /> Passwords match</>
                  : <><XCircle size={11} strokeWidth={2.5} /> Passwords do not match</>}
              </div>
            )}
          </div>

          <button
            className={`popup-action-btn popup-btn-gold${loading ? " loading" : ""}`}
            onClick={handleReset}
            disabled={loading}
          >
            <div className="btn-spinner btn-spinner-dark" />
            <span className="btn-text">
              {loading ? "RESETTING..." : <><KeyRound size={14} strokeWidth={2} /> RESET PASSWORD</>}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   SUCCESS POPUP
══════════════════════════════════════════════ */
const SuccessPopup = ({ onLogin }) => (
  <div className="popup-overlay">
    <div className="popup-scroll">
      <div className="popup-wrap">
        <div className="popup-top-line popup-top-line-green" />

        <div className="popup-icon-wrap">
          <div className="popup-icon-ring popup-icon-ring-green-1" />
          <div className="popup-icon-ring popup-icon-ring-green-2" />
          <div className="popup-icon-inner success-icon-inner">
            <CheckCircle2 size={30} strokeWidth={2} color="var(--green)" />
          </div>
        </div>

        <div className="popup-title success-popup-title">PASSWORD RESET!</div>
        <p className="popup-msg">
          Your password has been updated successfully.<br />
          <span style={{ color: "var(--green)", fontSize: "11px" }}>
            You can now login with your new password
          </span>
        </p>

        <button className="popup-action-btn popup-btn-gold" onClick={onLogin}>
          <span className="btn-text">
            <Send size={14} strokeWidth={2} /> GO TO LOGIN
          </span>
        </button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep]         = useState(1);
  const [email, setEmail]       = useState("");
  const [savedOtp, setSavedOtp] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [toast, setToast]       = useState({ show: false, msg: "", type: "" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3200);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address"); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forgot-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setError(data?.message || data?.error || "Failed to send OTP. Please try again.");
        return;
      }
      showToast("OTP sent! Check your email.", "success");
      setStep(2);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels    = ["EMAIL", "VERIFY", "RESET"];
  const effectiveStep = step === 1 ? 1 : step === 2 ? 2 : step === 3 ? 3 : 4;

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

            <Link href="/login" className="back-link">
              <ArrowLeft size={14} strokeWidth={2} />
              {/* Back to Login */}
            </Link>

            <div className="fp-header">
              <div className="fp-icon-wrap">
                <Mail size={28} strokeWidth={1.6} className="fp-main-icon" />
                <div className="fp-icon-ring" />
              </div>
              <div className="fp-title">
                <span className="t1">Forgot</span> <span className="t2">Password?</span>
              </div>
              <p className="fp-sub">
                Enter your registered email to receive a one-time password
              </p>
            </div>

            <div className="progress-bar">
              {stepLabels.map((label, i) => {
                const stepNum  = i + 1;
                const isDone   = effectiveStep > stepNum;
                const isActive = effectiveStep === stepNum;
                return (
                  <div key={i} className="prog-item">
                    <div className={`prog-circle ${isDone ? "done" : isActive ? "active" : ""}`}>
                      {isDone
                        ? <CheckCircle2 size={14} strokeWidth={2.5} />
                        : <span>{stepNum}</span>}
                    </div>
                    <span className={`prog-label ${isActive ? "active" : isDone ? "done" : ""}`}>
                      {label}
                    </span>
                    {i < 2 && <div className={`prog-line ${isDone ? "done" : ""}`} />}
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="error-msg">
                <XCircle size={14} />
                {error}
              </div>
            )}

            <div className="form-card">
              <div className="card-shine" />
              <form onSubmit={handleSendOtp} autoComplete="off">
                <div className="form-group">
                  <label className="form-label">REGISTERED EMAIL</label>
                  <div className="input-wrap">
                    <Mail size={15} className="input-icon" strokeWidth={1.8} />
                    <input
                      className="form-input"
                      type="email"
                      placeholder="you@coinpoolx.io"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      disabled={loading || step > 1}
                    />
                    {step > 1 && (
                      <CheckCircle2 size={15} className="input-valid-check" strokeWidth={2} />
                    )}
                    <div className="input-glow" />
                  </div>
                </div>

                <div className="info-box">
                  <ShieldCheck size={13} strokeWidth={2} className="info-icon" />
                  <span>We&apos;ll send a 6-digit OTP to your email. Valid for 10 minutes.</span>
                </div>

                {step === 1 ? (
                  <button
                    type="submit"
                    className={`action-btn gold-btn${loading ? " loading" : ""}`}
                    disabled={loading}
                  >
                    <div className="btn-glow" />
                    <div className="btn-spinner" />
                    <span className="btn-text">
                      {loading ? "SENDING OTP..." : <><Send size={13} strokeWidth={2.5} /> SEND OTP</>}
                    </span>
                  </button>
                ) : (
                  <div className="sent-status">
                    <CheckCircle2 size={14} strokeWidth={2.5} className="sent-icon" />
                    <span>OTP sent successfully</span>
                    <button
                      type="button"
                      className="change-email-btn"
                      onClick={() => { setStep(1); setError(""); setSavedOtp(""); }}
                    >
                      Change
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="security-note">
              <ShieldCheck size={13} strokeWidth={1.8} />
              <span>256-bit encrypted · BSC Network · Non-custodial</span>
            </div>
          </div>
        </div>
      </div>

      {step === 2 && (
        <OtpPopup
          email={email.trim().toLowerCase()}
          onClose={() => setStep(1)}
          onVerified={(code) => { setSavedOtp(code); setStep(3); }}
        />
      )}

      {step === 3 && (
        <ResetPasswordPopup
          email={email.trim().toLowerCase()}
          otp={savedOtp}
          onClose={() => setStep(2)}
          onSuccess={() => { showToast("Password reset successful!", "success"); setStep(4); }}
        />
      )}

      {step === 4 && (
        <SuccessPopup onLogin={() => router.push("/login")} />
      )}

      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success"
            ? <CheckCircle2 size={15} strokeWidth={2} />
            : <XCircle size={15} strokeWidth={2} />}
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}