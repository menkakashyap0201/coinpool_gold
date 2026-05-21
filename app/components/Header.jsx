"use client";

import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#pools", label: "Pools" },
    { href: "#how", label: "How it Works" },
    { href: "#rewards", label: "Rewards" },
    { href: "#leaderboard", label: "Leaderboard" },
    { href: "#referral", label: "Referral" },
    { href: "#wallet", label: "Wallet" },
  ];

  return (
    <header className="cpx-header">
      <div className="cpx-container cpx-header-inner">
        {/* ========== LOGO — public/logo.png se aa raha hai ========== */}
        {/* Agar aapke logo ka name alag hai, sirf src="/yourname.png" change karo */}
        <a href="/" className="cpx-logo">
          <Image
            src="/coin_logo1.png"
            alt="CoinPool X"
            width={160}
            height={50}
            priority
            className="cpx-logo-img"
          />
        </a>

        <nav className={`cpx-nav ${open ? "cpx-nav-open" : ""}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="cpx-nav-cta">
            <button className="cpx-btn cpx-btn-ghost cpx-btn-sm">Sign In</button>
            <button className="cpx-btn cpx-btn-primary cpx-btn-sm">Join Now</button>
          </div>
        </nav>

        <button
          className={`cpx-hamburger ${open ? "active" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}