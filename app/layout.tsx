import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
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
      <body className={`${geist.className} bg-gray-50 min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
