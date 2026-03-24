import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Deepoda Tools – Ücretsiz Online Araçlar",
    template: "%s | Deepoda Tools",
  },
  description:
    "PDF birleştir, görsel sıkıştır, arka plan sil ve daha fazlası. Tamamen ücretsiz, tarayıcıda çalışır, dosyalar sunucuya gitmez.",
  keywords: ["pdf birleştir", "görsel sıkıştır", "arka plan sil", "online araçlar"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className={`${geist.className} bg-gray-50 min-h-full flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t py-8 text-center text-sm text-gray-400">
          <p>© 2025 Deepoda Tools · Tüm işlemler tarayıcınızda gerçekleşir · Verileriniz sunucuya gitmez</p>
        </footer>
      </body>
    </html>
  );
}
