"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { imagesToPDF, downloadBlob } from "@/lib/pdf-utils";
import { X } from "lucide-react";

export default function ImageToPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
    setStatus("idle");
  }, []);

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setProgress(40);
    try {
      const result = await imagesToPDF(files);
      setProgress(100);
      downloadBlob(result, "images.pdf");
      setStatus("done");
    } catch { setStatus("error"); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Image → PDF</h1>
      <p className="text-gray-500 mb-8">Convert JPG, PNG, and WEBP images into a single PDF file.</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "image/jpeg": [".jpg",".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
        multiple
        label="Drag image files here"
      />

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden border bg-gray-50">
              <img src={src} alt="" className="w-full h-24 object-cover" />
              <button onClick={() => removeFile(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow text-gray-500 hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
              <p className="text-xs text-center text-gray-400 py-1 truncate px-1">{files[i]?.name}</p>
            </div>
          ))}
        </div>
      )}

      {status === "processing" && <div className="mt-4"><ProgressBar value={progress} label="Creating PDF..." /></div>}
      {status === "done" && <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">PDF created and downloaded!</div>}
      {status === "error" && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">An error occurred. Please try again.</div>}

      <button onClick={handleConvert} disabled={files.length === 0 || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors">
        {status === "processing" ? "Creating..." : `Create PDF${files.length > 0 ? ` (${files.length} image${files.length > 1 ? "s" : ""})` : ""}`}
      </button>
    </div>
  );
}
