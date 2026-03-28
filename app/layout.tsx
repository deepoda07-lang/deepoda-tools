import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { GoogleAnalytics } from "@next/third-parties/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Deepoda Tools – Free Online Tools",
    template: "%s | Deepoda Tools",
  },
  description:
    "Merge PDFs, compress images, remove backgrounds and more. Completely free, runs in your browser, files never leave your device.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const locale = h.get("x-locale") ?? "en";

  return (
    <html lang={locale} className="h-full antialiased">
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}})()` }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#2563eb" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1d4ed8" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Deepoda Tools" />
      </head>
      <body className={`${geist.className} bg-gray-50 dark:bg-gray-950 min-h-full flex flex-col transition-colors`}>
        <ServiceWorkerRegister />
        {children}
      </body>
      <GoogleAnalytics gaId="G-V09GJVW7ZF" />
    </html>
  );
}
