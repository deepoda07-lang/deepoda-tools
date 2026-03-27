"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { splitPDF, downloadBlob } from "@/lib/pdf-utils";

export default function PDFSplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fromPage, setFromPage] = useState("1");
  const [toPage, setToPage] = useState("1");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
  }, []);

  const handleSplit = async () => {
    if (!file) return;
    const from = parseInt(fromPage);
    const to = parseInt(toPage);
    if (isNaN(from) || isNaN(to) || from < 1 || to < from) {
      setError("Please enter a valid page range.");
      return;
    }
    setError("");
    setStatus("processing");
    setProgress(30);
    try {
      const results = await splitPDF(file, [{ from, to }]);
      setProgress(90);
      results.forEach((r, i) =>
        downloadBlob(r, `section-${i + 1}.pdf`)
      );
      setProgress(100);
      setStatus("done");
    } catch {
      setStatus("error");
      setError("An error occurred during splitting.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Split PDF</h1>
      <p className="text-gray-500 mb-8">Split PDF pages into separate files.</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label="Drag PDF file here"
      />

      {file && (
        <div className="mt-4 p-3 bg-white border rounded-lg text-sm text-gray-700">
          Selected: <span className="font-medium">{file.name}</span>
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start page</label>
          <input
            type="number"
            min={1}
            value={fromPage}
            onChange={(e) => setFromPage(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">End page</label>
          <input
            type="number"
            min={1}
            value={toPage}
            onChange={(e) => setToPage(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

      {status === "processing" && (
        <div className="mt-4">
          <ProgressBar value={progress} label="Splitting..." />
        </div>
      )}

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          PDF successfully split and downloaded!
        </div>
      )}

      <button
        onClick={handleSplit}
        disabled={!file || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "Processing..." : "Split PDF"}
      </button>
    </div>
  );
}
