"use client";
import { FiUser } from "react-icons/fi";
import { FaChartBar, FaWallet } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TbHomeDollar } from "react-icons/tb";
import { FaCircleDollarToSlot } from "react-icons/fa6";
import "./BottomNav.css";

const NAV_ITEMS = [
  { id: "/home",      label: "HOME",      Icon: TbHomeDollar         },
  { id: "/myincome",  label: "MY INCOME", Icon: FaChartBar           },
  { id: "/deposit",   label: "DEPOSIT",   Icon: FaCircleDollarToSlot },
  { id: "/withdraw",  label: "WITHDRAW",  Icon: FaWallet             },
  { id: "/profile",   label: "PROFILE",   Icon: FiUser               },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="cpx-bottom-nav">
      {/* top gold shimmer line */}
      <div className="cpx-nav-shine" />

      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive =
          pathname === id ||
          pathname === `${id}/` ||
          pathname.startsWith(`${id}/`);

        return (
          <Link
            key={id}
            href={id}
            className={`cpx-nav-item ${isActive ? "cpx-nav-active" : ""}`}
          >
            {isActive && <div className="cpx-nav-glow" />}
            {isActive && <div className="cpx-nav-top-bar" />}

            <div className="cpx-nav-icon-wrap">
              <Icon
                size={22}
                color={isActive ? "#FFD700" : "rgba(255,255,255,0.28)"}
                style={{ transition: "color 0.2s" }}
              />
            </div>

            <span className="cpx-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}