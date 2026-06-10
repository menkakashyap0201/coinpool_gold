"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import "./layout.css";
import BottomNav from "../components/BottomNav";
import TopHeader from "../components/TopHeader";
import Providers from "../components/provider";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const [btcPrice, setBtcPrice] = useState(52284.13);

  useEffect(() => {
    const t = setInterval(() => {
      setBtcPrice((p) =>
        parseFloat((p + (Math.random() - 0.5) * 50).toFixed(2))
      );
    }, 3000);

    return () => clearInterval(t);
  }, []);

  return (
    <Providers>
      <div className="outer">
        <div className="bg-grid" />
        <div className="bg-orb-1" />
        <div className="bg-orb-2" />
        <div className="bg-orb-3" />

        <div className="phone">
          <TopHeader btcPrice={btcPrice} />

          <main className="main">{children}</main>

          <BottomNav activeTab={pathname} />
        </div>
      </div>
    </Providers>
  );
}