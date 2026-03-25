import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF İmzala – Online Elektronik İmza Ekle | Ücretsiz",
  description:
    "PDF dosyasına elektronik imza ekle. İmzanı çiz, sayfayı seç, konumu ayarla ve PDF'e göm. Tamamen ücretsiz, tarayıcıda çalışır.",
  keywords: [
    "pdf imzala online ücretsiz",
    "pdf e imza ekle",
    "elektronik imza pdf",
    "pdf sign türkçe",
    "online pdf imza",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
