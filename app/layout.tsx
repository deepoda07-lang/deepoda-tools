import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Deepoda Tools – Free Online Tools",
    template: "%s | Deepoda Tools",
  },
  description:
    "Merge PDFs, compress images, remove backgrounds and more. Completely free, runs in your browser, files never leave your device.",
  keywords: ["merge pdf", "compress image", "remove background", "online tools"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${geist.className} bg-gray-50 min-h-full flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t py-8 text-center text-sm text-gray-400">
          <p>© 2025 Deepoda Tools · All processing happens in your browser · Your data never leaves your device</p>
        </footer>
      </body>
    </html>
  );
}
