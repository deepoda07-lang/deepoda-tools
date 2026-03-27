import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Annotate PDF – Draw, Highlight and Add Text Online Free",
  description: "Annotate PDF files with freehand drawing, text notes and highlighting. Free, runs in your browser.",
  keywords: ["annotate pdf online free", "draw on pdf", "pdf highlighter", "pdf markup tool"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Tools", href: "/pdf" }, { label: "Annotate PDF" }]} />
      {children}
    </div>
  );
}
