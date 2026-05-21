"use client";
import { FiHome, FiUser } from "react-icons/fi";
import { FaChartBar, FaTrophy, FaWallet } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./BottomNav.css";

const NAV_ITEMS = [
  { id: "/home",        label: "HOME",    Icon: FiHome     },
  { id: "/myincome",     label: "MY INCOME", Icon: FaChartBar },
  { id: "/rank", label: "RANK",    Icon: FaTrophy   },
  { id: "/withdraw",      label: "WITHDRAW",  Icon: FaWallet   },
  { id: "/profile",     label: "PROFILE", Icon: FiUser     },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lb-bottom-nav">
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = pathname === id;
        return (
          <Link key={id} href={id} className={`lb-nav-item ${isActive ? "lb-nav-active" : ""}`}>
            <Icon
              size={20}
              color={isActive ? "var(--lb-gold)" : "var(--lb-text-muted)"}
            />
            <span className="lb-nav-label">{label}</span>
            {isActive && <div className="lb-nav-dot" />}
          </Link>
        );
      })}
    </nav>
  );
}