import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Crop PDF – Trim PDF Margins Online Free",
  description: "Crop or trim the margins of a PDF file. Set top, right, bottom and left margins in mm. Free, runs in your browser.",
  keywords: ["crop pdf online free", "trim pdf margins", "pdf crop tool", "remove pdf margins"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Tools", href: "/pdf" }, { label: "Crop PDF" }]} />
      {children}
    </div>
  );
}
