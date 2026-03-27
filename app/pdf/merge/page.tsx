"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { mergePDFs, downloadBlob } from "@/lib/pdf-utils";

export default function PDFMergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setStatus("idle");
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const arr = [...prev];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please select at least 2 PDF files.");
      return;
    }
    setError("");
    setStatus("processing");
    setProgress(20);
    try {
      setProgress(50);
      const merged = await mergePDFs(files);
      setProgress(90);
      downloadBlob(merged, "merged.pdf");
      setProgress(100);
      setStatus("done");
    } catch {
      setStatus("error");
      setError("An error occurred during merging.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Merge PDF</h1>
      <p className="text-gray-500 mb-8">
        Select, reorder, and merge PDF files into a single document.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        label="Drag PDF files here"
      />

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="font-semibold text-gray-700">Selected files ({files.length})</h2>
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2">
              <span className="text-sm flex-1 truncate text-gray-700">{f.name}</span>
              <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
              <button onClick={() => moveFile(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 px-1">↑</button>
              <button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 px-1">↓</button>
              <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 px-1">✕</button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

      {status === "processing" && (
        <div className="mt-4">
          <ProgressBar value={progress} label="Merging..." />
        </div>
      )}

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          PDF successfully merged and downloaded!
        </div>
      )}

      <button
        onClick={handleMerge}
        disabled={files.length < 2 || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "Processing..." : "Merge PDFs"}
      </button>
    </div>
  );
}
