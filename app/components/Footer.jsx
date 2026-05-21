"use client";

import Image from "next/image";
import {
  TwitterIcon, TelegramIcon, DiscordIcon, InstagramIcon,
} from "./Icons";

export default function Footer() {
  return (
    <footer className="cpx-footer">
      <div className="cpx-container">
        <div className="cpx-footer-grid">
          <div className="cpx-footer-brand">
            {/* Logo from public folder */}
            <Image
              src="/coin_logo1.png"
              alt="CoinPool X"
              width={150}
              height={65}
              className="cpx-logo-img"
            />
            <p className="cpx-footer-tag">
              Where strategy meets opportunity. A skill-based crypto prediction platform —
              built for competitors, not gamblers.
            </p>
            <div className="cpx-socials">
              <a href="#" aria-label="Twitter"><TwitterIcon width={18} height={18} /></a>
              <a href="#" aria-label="Telegram"><TelegramIcon width={18} height={18} /></a>
              <a href="#" aria-label="Discord"><DiscordIcon width={18} height={18} /></a>
              <a href="#" aria-label="Instagram"><InstagramIcon width={18} height={18} /></a>
            </div>
          </div>

          <div className="cpx-footer-col">
            <h5>Platform</h5>
            <a href="#pools">Standard Pool</a>
            <a href="#pools">Premium Pool</a>
            <a href="#leaderboard">Leaderboard</a>
            <a href="#referral">Referral</a>
          </div>

          <div className="cpx-footer-col">
            <h5>Resources</h5>
            <a href="#how">How it Works</a>
            <a href="#fair">Fair Play</a>
            <a href="#wallet">Wallet Guide</a>
            <a href="#">FAQ</a>
          </div>

          <div className="cpx-footer-col">
            <h5>Legal</h5>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Responsible Play</a>
            <a href="#">Restricted Regions</a>
          </div>
        </div>

        <div className="cpx-footer-divider" />

        <div className="cpx-footer-disclaimer">
          <p>
            <strong className="cpx-gold">Disclaimer:</strong> CoinPool X is a skill-based prediction
            platform. Participation involves market volatility and financial risk. Users should play
            responsibly and avoid financial overexposure. The platform reserves the right to block
            regions based on local regulations. Withdrawals processed on BEP20 only.
          </p>
        </div>

        <div className="cpx-footer-bottom">
          <span>© {new Date().getFullYear()} CoinPool X. All rights reserved.</span>
          <span>Built for strategists, not gamblers.</span>
        </div>
      </div>
    </footer>
  );
}