"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";

export default function WordToPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(20);
    setError("");

    try {
      const mammoth = await import("mammoth");
      const jspdf = await import("jspdf");

      setProgress(40);
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setProgress(60);

      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, "text/html");
      const text = doc.body.innerText;

      setProgress(75);
      const pdf = new jspdf.jsPDF({ unit: "mm", format: "a4" });
      const lines = pdf.splitTextToSize(text, 180);
      pdf.text(lines, 15, 15);

      setProgress(95);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      pdf.save(`${baseName}.pdf`);

      setProgress(100);
      setStatus("done");
    } catch {
      setStatus("error");
      setError("An error occurred during conversion.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Word → PDF</h1>
      <p className="text-gray-500 mb-8">
        Convert Word (.docx) documents to PDF format. Runs in your browser.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        }}
        multiple={false}
        label="Drag DOCX file here"
      />

      {file && (
        <div className="mt-4 p-3 bg-white border rounded-lg text-sm text-gray-700">
          Selected: <span className="font-medium">{file.name}</span>
        </div>
      )}

      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

      {status === "processing" && (
        <div className="mt-4">
          <ProgressBar value={progress} label="Converting..." />
        </div>
      )}

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          PDF successfully created and downloaded!
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!file || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "Converting..." : "Convert to PDF"}
      </button>
    </div>
  );
}
