import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { GoogleAnalytics } from "@next/third-parties/google";
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
      </head>
      <body className={`${geist.className} bg-gray-50 dark:bg-gray-950 min-h-full flex flex-col transition-colors`}>
        {children}
      </body>
      <GoogleAnalytics gaId="G-V09GJVW7ZF" />
    </html>
  );
}
