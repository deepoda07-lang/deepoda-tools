import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Unlock PDF – Remove PDF Password Online Free",
  description: "Remove password protection from a PDF file. Free, runs in your browser, files never leave your device.",
  keywords: ["unlock pdf online free", "remove pdf password", "decrypt pdf", "pdf password remover"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Tools", href: "/pdf" }, { label: "Unlock PDF" }]} />
      {children}
    </div>
  );
}
