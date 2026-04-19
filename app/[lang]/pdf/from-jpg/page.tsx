"use client";
import { useState, useCallback, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { imagesToPDF, downloadBlob } from "@/lib/pdf-utils";
import { X } from "lucide-react";

export default function JPGToPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setStatus("idle");
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setProgress(30);
    try {
      const result = await imagesToPDF(files);
      setProgress(100);
      downloadBlob(result, "images.pdf");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">JPG → PDF</h1>
      <p className="text-gray-500 mb-8">Convert images into a single PDF file. You can add multiple images.</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
        multiple
        label="Drag image files here (JPG, PNG, WEBP)"
      />

      {files.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {previewUrls[i] && (
                  <img src={previewUrls[i]} alt={f.name} className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 truncate">
                  {f.name}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">{files.length} image(s) selected</p>
        </div>
      )}

      {status === "processing" && (
        <div className="mt-4"><ProgressBar value={progress} label="Creating PDF..." /></div>
      )}
      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
          PDF created and downloaded!
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          An error occurred. Please try again.
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={files.length === 0 || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "Creating..." : "Create PDF"}
      </button>
    </div>
  );
}
