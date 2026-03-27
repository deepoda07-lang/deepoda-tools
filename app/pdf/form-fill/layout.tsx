import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Fill PDF Form – Free Online PDF Form Filler",
  description: "Fill in PDF form fields online. Type into text fields, check boxes, select options. Free, runs in your browser.",
  keywords: ["fill pdf form online free", "pdf form filler", "fill in pdf", "pdf form fields"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Tools", href: "/pdf" }, { label: "Fill PDF Form" }]} />
      {children}
    </div>
  );
}
