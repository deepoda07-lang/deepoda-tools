import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Lock PDF – Password Protect PDF Online Free",
  description: "Add a password to your PDF file. Protect PDF with encryption. Free, runs in your browser, files never leave your device.",
  keywords: ["lock pdf online free", "password protect pdf", "encrypt pdf", "pdf password"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Tools", href: "/pdf" }, { label: "Lock PDF" }]} />
      {children}
    </div>
  );
}
