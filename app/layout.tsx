import type { Metadata, Viewport } from "next";
import { Lora, DM_Sans } from "next/font/google";
import "./globals.css";
import "./viewport.css";
import { LumenProvider } from "@/components/lumen/LumenProvider";
import { SiteChrome } from "@/components/SiteChrome";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stress Management · A moment for you",
  description:
    "A short, anonymous stress check-in for the Community Health Nursing health fair. Six questions, about two minutes, fully private.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f2eb",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <div className="app-ambient" aria-hidden="true" />
        <LumenProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
          >
            Skip to content
          </a>
          <SiteChrome />
          <div id="main" tabIndex={-1}>
            {children}
          </div>
        </LumenProvider>
      </body>
    </html>
  );
}
