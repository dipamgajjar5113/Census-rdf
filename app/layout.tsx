import type { Metadata, Viewport } from "next";
import { Lora, Raleway } from "next/font/google";
import "./globals.css";
import { LumenProvider } from "@/components/lumen/LumenProvider";
import { Lumen } from "@/components/lumen/Lumen";
import { SiteChrome } from "@/components/SiteChrome";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-raleway",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Community Census · Anonymous stress check-in",
  description:
    "A short, anonymous stress check-in for the Community Health Nursing health fair. Six questions, about two minutes, fully private.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf5ff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lora.variable} ${raleway.variable}`}>
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
          <Lumen />
          <div id="main">{children}</div>
        </LumenProvider>
      </body>
    </html>
  );
}
