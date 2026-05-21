"use client";

const baseProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const ShieldIcon = (p) => (
  <svg {...baseProps} {...p}>
    <path d="M12 2 L4 5 V11 C4 16 7.5 20.5 12 22 C16.5 20.5 20 16 20 11 V5 Z" />
    <path d="M9 12 L11 14 L15 10" />
  </svg>
);

export const UserIcon = (p) => (
  <svg {...baseProps} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 21" />
  </svg>
);

export const LockIcon = (p) => (
  <svg {...baseProps} {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11 V7 A4 4 0 0 1 16 7 V11" />
    <circle cx="12" cy="16" r="1.2" fill="currentColor" />
  </svg>
);

export const BoltIcon = (p) => (
  <svg {...baseProps} {...p}>
    <path d="M13 2 L4 14 H11 L10 22 L20 10 H13 Z" />
  </svg>
);

export const BanIcon = (p) => (
  <svg {...baseProps} {...p}>
    <circle cx="12" cy="12" r="9" />
    <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
  </svg>
);

export const GlobeIcon = (p) => (
  <svg {...baseProps} {...p}>
    <circle cx="12" cy="12" r="9" />
    <ellipse cx="12" cy="12" rx="4" ry="9" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...baseProps} {...p}>
    <path d="M5 12 L10 17 L19 7" />
  </svg>
);

export const XIcon = (p) => (
  <svg {...baseProps} {...p}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

export const TwitterIcon = (p) => (
  <svg {...baseProps} {...p} strokeWidth={2}>
    <path d="M21 5 C20 5.5 19 5.8 18 6 C17.3 5 16 4.5 15 4.5 C13 4.5 11.5 6 11.5 8 V9 C8 9 5 7.5 3 5 C2.5 6 2.5 7 3 8 C3.5 9 4.5 9.5 5.5 10 C4.8 10 4 9.8 3.5 9.5 C3.5 11 4.5 12.5 6.5 13 C6 13 5.5 13 5 13 C5.5 14.5 7 15.5 8.5 15.5 C7 16.5 5 17 3 17 C5 18.2 7.5 19 10 19 C16 19 19.5 14 19.5 9.5 V9 C20.5 8.3 21 7.5 21 5 Z" />
  </svg>
);

export const TelegramIcon = (p) => (
  <svg {...baseProps} {...p}>
    <path d="M21 4 L2 11 L9 13.5 L11 20 L14 16 L19 21 Z" />
    <line x1="9" y1="13.5" x2="17" y2="7" />
  </svg>
);

export const DiscordIcon = (p) => (
  <svg {...baseProps} {...p}>
    <path d="M7 7 C9 6 11 5.5 12 5.5 C13 5.5 15 6 17 7" />
    <path d="M5 18 C7 19 9 19.5 12 19.5 C15 19.5 17 19 19 18" />
    <ellipse cx="9.5" cy="13" rx="1.3" ry="1.6" fill="currentColor" />
    <ellipse cx="14.5" cy="13" rx="1.3" ry="1.6" fill="currentColor" />
    <path d="M7 7 C5.5 10 4.5 14 5 18 M17 7 C18.5 10 19.5 14 19 18" />
  </svg>
);

export const InstagramIcon = (p) => (
  <svg {...baseProps} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="0.8" fill="currentColor" />
  </svg>
);