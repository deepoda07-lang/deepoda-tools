import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Düzenle – Sayfa Sil ve Sırala | Ücretsiz",
  description:
    "PDF sayfalarını sil, yeniden sırala, sürükle-bırak ile düzenle. Thumbnail önizleme ile kolay kullanım. Ücretsiz, tarayıcıda çalışır.",
  keywords: [
    "pdf sayfa sil online",
    "pdf düzenle ücretsiz",
    "pdf sayfa sırala",
    "pdf sayfa düzenleme",
    "online pdf editor türkçe",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
