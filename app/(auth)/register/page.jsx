"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User, Mail, Lock, Eye, EyeOff,
  Users, ShieldCheck, Rocket,
  ArrowRight, CheckCircle2, XCircle,
  Copy, Check, Download, LogIn
} from "lucide-react";
import "./register.css";

/* ══════════════════════════════════════════════
   MAIN PAGE — sab kuch yahin andar
══════════════════════════════════════════════ */
export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    confirmPassword: "", sponsorId: "",
  });
  const [touched, setTouched]         = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [apiError, setApiError]       = useState("");
  const [successData, setSuccessData] = useState(null);

  /* ── PASSWORD STRENGTH ── */
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "" };
    let score = 0;
    if (pwd.length >= 8)           score++;
    if (/[A-Z]/.test(pwd))         score++;
    if (/[0-9]/.test(pwd))         score++;
    if (/[^A-Za-z0-9]/.test(pwd))  score++;
    return { level: score, label: ["", "Weak", "Fair", "Good", "Strong"][score] };
  };

  /* ── VALIDATION ── */
  const validate = (f) => {
    const errs = {};
    if (!f.name.trim()) {
      errs.name = "Full name is required";
    } else if (f.name.trim().length < 3) {
      errs.name = "Name must be at least 3 characters";
    }
    if (!f.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!f.password) {
      errs.password = "Password is required";
    } else if (f.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(f.password)) {
      errs.password = "Must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(f.password)) {
      errs.password = "Must contain at least one number";
    } else if (!/[^A-Za-z0-9]/.test(f.password)) {
      errs.password = "Must contain at least one special character";
    }
    if (!f.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (f.password !== f.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  /* ── SUCCESS POPUP COMPONENT (inside RegisterPage) ── */
  const SuccessPopup = ({ data, password, onLogin }) => {
    const cardRef = useRef(null);
    const [copied, setCopied] = useState({ code: false, pass: false, all: false });

    const copyText = async (text, key) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(c => ({ ...c, [key]: true }));
        setTimeout(() => setCopied(c => ({ ...c, [key]: false })), 2000);
      } catch {}
    };

    const copyAll = () => {
      const text =
        `CoinPool X — Account Details\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Name:          ${data.name}\n` +
        `Email:         ${data.email}\n` +
        `Password:      ${password}\n` +
        `Referral Code: ${data.referal_code}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Keep this safe. Do not share your password.`;
      copyText(text, "all");
    };

    const takeScreenshot = async () => {
      try {
        const h2c = window.html2canvas;
        if (h2c) {
          const canvas = await h2c(cardRef.current, { backgroundColor: "#030C20", scale: 2 });
          const link = document.createElement("a");
          link.download = `coinpoolx-${data.referal_code}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        } else {
          alert("Tip: Press  Ctrl+Shift+S  (Windows) or  Cmd+Shift+4  (Mac) to screenshot this card.");
        }
      } catch {
        alert("Please manually screenshot this card to save your details.");
      }
    };

    return (
      <div className="popup-overlay">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" />

        <div className="popup-scroll">
          <div className="popup-wrap" ref={cardRef}>
            <div className="popup-top-line" />

            {/* Success Icon */}
            <div className="popup-icon-wrap">
              <div className="popup-icon-ring popup-icon-ring-1" />
              <div className="popup-icon-ring popup-icon-ring-2" />
              <div className="popup-icon-inner">
                <CheckCircle2 size={30} strokeWidth={2} color="#00FFB2" />
              </div>
            </div>

            <div className="popup-title">ACCOUNT CREATED!</div>
            <p className="popup-msg">
              Account details sent to <br />
              <span className="popup-email">{data.email}</span>
            </p>

            <div className="popup-warn-box">
              <span className="popup-warn-icon">⚠️</span>
              <span>Save your credentials now. Screenshot or copy before closing this page.</span>
            </div>

            {/* Credentials Card */}
            <div className="cred-card">
              <div className="cred-card-header">
                <ShieldCheck size={12} strokeWidth={2} />
                ACCOUNT CREDENTIALS
              </div>

              {/* Name */}
              <div className="cred-row">
                <span className="cred-key">NAME</span>
                <span className="cred-val">{data.name}</span>
              </div>

              {/* Email */}
              <div className="cred-row">
                <span className="cred-key">EMAIL</span>
                <span className="cred-val cred-truncate">{data.email}</span>
              </div>

              {/* Password */}
              <div className="cred-row cred-row-cyan">
                <span className="cred-key">PASSWORD</span>
                <span className="cred-val cred-mono cred-cyan">{password}</span>
                <button
                  className={`cred-copy${copied.pass ? " copied" : ""}`}
                  onClick={() => copyText(password, "pass")}
                  title="Copy password"
                >
                  {copied.pass ? <Check size={11} strokeWidth={2.5} /> : <Copy size={11} strokeWidth={2} />}
                  {copied.pass ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Referral Code */}
              <div className="cred-row cred-row-gold">
                <span className="cred-key">REFERRAL CODE</span>
                <span className="cred-val cred-mono cred-gold">{data.referal_code}</span>
                <button
                  className={`cred-copy cred-copy-gold${copied.code ? " copied" : ""}`}
                  onClick={() => copyText(data.referal_code, "code")}
                  title="Copy referral code"
                >
                  {copied.code ? <Check size={11} strokeWidth={2.5} /> : <Copy size={11} strokeWidth={2} />}
                  {copied.code ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="popup-actions">
              <button className="popup-btn-copy" onClick={copyAll}>
                {copied.all
                  ? <><Check size={13} strokeWidth={2.5} /> All Copied!</>
                  : <><Copy size={13} strokeWidth={2} /> Copy All</>}
              </button>
              <button className="popup-btn-ss" onClick={takeScreenshot}>
                <Download size={13} strokeWidth={2} />
                Screenshot
              </button>
            </div>

            {/* Login */}
            <button className="popup-btn-login" onClick={onLogin}>
              <LogIn size={14} strokeWidth={2} />
              PROCEED TO LOGIN
            </button>

            <p className="popup-footer-note">
              A copy of your credentials has been emailed to you.
            </p>
          </div>
        </div>
      </div>
    );
  };

  /* ── DERIVED VALUES ── */
  const strength = getStrength(form.password);

  const strengthColors = {
    Weak:   "var(--red)",
    Fair:   "var(--gold3)",
    Good:   "var(--gold)",
    Strong: "var(--green)"
  };

  /* ── HANDLERS ── */
  const handleBlur = (key) => {
    setTouched(t => ({ ...t, [key]: true }));
    setFieldErrors(validate(form));
  };

  const handleChange = (key) => (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, [key]: val }));
    if (touched[key]) setFieldErrors(validate({ ...form, [key]: val }));
  };

  const hasErr = (key) => touched[key] && fieldErrors[key];

  const seg = (idx) => {
    if (strength.level === 0) return "";
    if (strength.level === 1 && idx === 0) return "weak";
    if (strength.level === 2 && idx <= 1)  return "fair";
    if (strength.level === 3 && idx <= 2)  return "good";
    if (strength.level === 4)              return "strong";
    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setApiError("");
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    const errs = validate(form);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (!agreed) { setApiError("Please accept the Terms & Conditions"); return; }

    setLoading(true);
    try {
      const payload = {
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        ...(form.sponsorId.trim() && { referal_by: form.sponsorId.trim().toUpperCase() }),
      };

      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || data.status === false) {
        setApiError(data?.message || data?.error || data?.msg || "Registration failed. Please try again.");
        return;
      }

      setSuccessData({ ...data.user, _password: form.password });

    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
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
                <Image src="/coin_logo1.png" alt="CoinPool X" width={46} height={46} className="logo-img" />
              </div>
              <div className="logo-text">
                <span className="logo-main">COINPOOL X</span>
                <span className="logo-sub">PREDICT · PLAY · WIN</span>
                <span className="logo-tag">WHERE STRATEGY MEETS OPPORTUNITY</span>
              </div>
            </div>
          </div>

          <div className="main">
            <div className="reg-header">
              <div className="reg-tag">
                <Rocket size={12} strokeWidth={2.5} />
                <span>CREATE ACCOUNT</span>
              </div>
              <p className="reg-sub">Start predicting on the BSC Network today</p>
            </div>

            {apiError && (
              <div className="error-msg">
                <XCircle size={14} />
                {apiError}
              </div>
            )}

            <div className="form-card">
              <form onSubmit={handleRegister} autoComplete="off" noValidate>

                {/* Name */}
                <div className={`form-group${hasErr("name") ? " has-error" : ""}`}>
                  <label className="form-label">FULL NAME</label>
                  <div className="input-wrap">
                    <User size={15} className="input-icon" strokeWidth={1.8} />
                    <input className={`form-input${hasErr("name") ? " input-err" : ""}`}
                      type="text" placeholder="Min 3 characters"
                      value={form.name} onChange={handleChange("name")}
                      onBlur={() => handleBlur("name")} disabled={loading} maxLength={60} />
                    {touched.name && !fieldErrors.name && form.name.trim().length >= 3 && (
                      <CheckCircle2 size={14} className="input-valid-icon" strokeWidth={2} />
                    )}
                    <div className={`input-glow${hasErr("name") ? " glow-err" : ""}`} />
                  </div>
                  {hasErr("name") && <div className="field-error"><XCircle size={11} strokeWidth={2} />{fieldErrors.name}</div>}
                </div>

                {/* Email */}
                <div className={`form-group${hasErr("email") ? " has-error" : ""}`}>
                  <label className="form-label">EMAIL ADDRESS</label>
                  <div className="input-wrap">
                    <Mail size={14} className="input-icon" strokeWidth={1.8} />
                    <input className={`form-input${hasErr("email") ? " input-err" : ""}`}
                      type="email" placeholder="you@example.com"
                      value={form.email} onChange={handleChange("email")}
                      onBlur={() => handleBlur("email")} disabled={loading} />
                    {touched.email && !fieldErrors.email && form.email && (
                      <CheckCircle2 size={14} className="input-valid-icon" strokeWidth={2} />
                    )}
                    <div className={`input-glow${hasErr("email") ? " glow-err" : ""}`} />
                  </div>
                  {hasErr("email") && <div className="field-error"><XCircle size={11} strokeWidth={2} />{fieldErrors.email}</div>}
                </div>

                {/* Password */}
                <div className={`form-group${hasErr("password") ? " has-error" : ""}`}>
                  <label className="form-label">PASSWORD</label>
                  <div className="input-wrap">
                    <Lock size={15} className="input-icon" strokeWidth={1.8} />
                    <input className={`form-input${hasErr("password") ? " input-err" : ""}`}
                      type={showPass ? "text" : "password"} placeholder="Min 8 · A-Z · 0-9 · @#$"
                      value={form.password} onChange={handleChange("password")}
                      onBlur={() => handleBlur("password")} disabled={loading} />
                    <button type="button" className="eye-btn" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                      {showPass ? <EyeOff size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}
                    </button>
                    <div className={`input-glow${hasErr("password") ? " glow-err" : ""}`} />
                  </div>
                  {form.password && (
                    <>
                      <div className="strength-bar">
                        {[0,1,2,3].map(i => <div key={i} className={`strength-seg ${seg(i)}`} />)}
                      </div>
                      <div className="strength-row">
                        <span className="strength-label" style={{ color: strengthColors[strength.label] || "var(--text-muted)" }}>{strength.label}</span>
                        <span className="strength-hint">Uppercase · Number · Special char</span>
                      </div>
                    </>
                  )}
                  {hasErr("password") && <div className="field-error"><XCircle size={11} strokeWidth={2} />{fieldErrors.password}</div>}
                </div>

                {/* Confirm Password */}
                <div className={`form-group${hasErr("confirmPassword") ? " has-error" : ""}`}>
                  <label className="form-label">CONFIRM PASSWORD</label>
                  <div className="input-wrap">
                    <Lock size={15} className="input-icon" strokeWidth={1.8} />
                    <input className={`form-input${hasErr("confirmPassword") ? " input-err" : ""}`}
                      type={showConfirm ? "text" : "password"} placeholder="Re-enter password"
                      value={form.confirmPassword} onChange={handleChange("confirmPassword")}
                      onBlur={() => handleBlur("confirmPassword")} disabled={loading} />
                    <button type="button" className="eye-btn" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                      {showConfirm ? <EyeOff size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}
                    </button>
                    {touched.confirmPassword && !fieldErrors.confirmPassword && form.confirmPassword && (
                      <CheckCircle2 size={14} className="input-valid-icon" strokeWidth={2} />
                    )}
                    <div className={`input-glow${hasErr("confirmPassword") ? " glow-err" : ""}`} />
                  </div>
                  {hasErr("confirmPassword") && <div className="field-error"><XCircle size={11} strokeWidth={2} />{fieldErrors.confirmPassword}</div>}
                </div>

                {/* Referral */}
                <div className="form-group">
                  <label className="form-label">REFERRAL ID <span className="label-opt">(OPTIONAL)</span></label>
                  <div className="input-wrap">
                    <Users size={15} className="input-icon" strokeWidth={1.8} />
                    <input className="form-input" type="text" placeholder="e.g. DEMO123"
                      value={form.sponsorId} onChange={handleChange("sponsorId")}
                      disabled={loading} style={{ textTransform: "uppercase" }} />
                    <div className="input-glow" />
                  </div>
                </div>

                {/* Terms */}
                <div className="terms-row">
                  <input type="checkbox" className="terms-checkbox" id="terms"
                    checked={agreed} onChange={e => setAgreed(e.target.checked)} disabled={loading} />
                  <label htmlFor="terms" className="terms-text">
                    I agree to the <Link href="/terms" className="terms-link">Terms &amp; Conditions</Link>
                    {" "}and <Link href="/privacy" className="terms-link">Privacy Policy</Link>
                  </label>
                </div>

                <button type="submit" className={`reg-btn${loading ? " loading" : ""}`} disabled={loading}>
                  <div className="btn-glow" />
                  <div className="btn-spinner" />
                  <span className="btn-text">
                    {loading ? "CREATING ACCOUNT..." : <><Rocket size={13} strokeWidth={2.5} /> CREATE ACCOUNT</>}
                  </span>
                </button>
              </form>
            </div>

            <div className="login-row">
              <span>Already have an account?</span>
              <Link href="/login" className="login-link">LOGIN <ArrowRight size={11} strokeWidth={2.5} /></Link>
            </div>

            <div className="security-note">
              <ShieldCheck size={13} strokeWidth={1.8} />
              <span>256-bit encrypted · BSC Network · Non-custodial</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS POPUP */}
      {successData && (
        <SuccessPopup
          data={successData}
          password={successData._password}
          onLogin={() => router.push("/login")}
        />
      )}
    </>
  );
}