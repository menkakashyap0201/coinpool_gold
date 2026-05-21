import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

// Premium display font for headings
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Clean body font
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// ============ BROWSER TAB / SEO METADATA ============
export const metadata: Metadata = {
  title: {
    default: "CoinPool X — Where Strategy Meets Opportunity",
    template: "%s | CoinPool X",
  },
  description:
    "Join elite crypto prediction pools and compete for real rewards. CoinPool X is a skill-based, strategy-driven prediction platform — built for competitors, not gamblers.",
  keywords: [
    "crypto prediction",
    "CoinPool X",
    "BTC prediction",
    "USDT pools",
    "skill-based crypto",
    "crypto rewards",
    "prediction platform",
  ],
  authors: [{ name: "CoinPool X" }],
  creator: "CoinPool X",
  publisher: "CoinPool X",

  // ===== Browser tab icon (favicon) — public folder se =====
  icons: {
    icon: [
      { url: "/coin_logo1.png", type: "image/png" },
      { url: "/coin_logo1.png", sizes: "any" },
    ],
    shortcut: "/coin_logo1.png",
    apple: "/coin_logo1.png",
  },

  // Social media preview (Open Graph)
  openGraph: {
    type: "website",
    title: "CoinPool X",
    description:
      "Join elite crypto prediction pools and compete for real rewards. Skill-based, strategy-driven crypto predictions.",
    siteName: "CoinPool X",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "CoinPool X",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CoinPool X — Where Strategy Meets Opportunity",
    description:
      "Join elite crypto prediction pools and compete for real rewards.",
    images: ["/hero.png"],
  },
};

// ============ THEME COLOR (mobile browser address bar) ============
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
    { media: "(prefers-color-scheme: light)", color: "#0a0a0c" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body className="cpx-body">{children}</body>
    </html>
  );
}