"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { imagesToPDF, downloadBlob } from "@/lib/pdf-utils";
import { X } from "lucide-react";

export default function JPGToPDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setStatus("idle");
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setProgress(30);
    try {
      const result = await imagesToPDF(files);
      setProgress(100);
      downloadBlob(result, "görseller.pdf");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">JPG → PDF</h1>
      <p className="text-gray-500 mb-8">Görselleri tek bir PDF dosyasına dönüştür. Birden fazla görsel ekleyebilirsin.</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
        multiple
        label="Görsel dosyalarını buraya sürükle (JPG, PNG, WEBP)"
      />

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-lg text-sm">
              <span className="text-gray-700 truncate">{f.name}</span>
              <button onClick={() => removeFile(i)} className="ml-2 text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-1">{files.length} görsel seçildi</p>
        </div>
      )}

      {status === "processing" && (
        <div className="mt-4"><ProgressBar value={progress} label="PDF oluşturuluyor..." /></div>
      )}
      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          PDF oluşturuldu ve indirildi!
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Hata oluştu. Lütfen tekrar deneyin.
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={files.length === 0 || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "Oluşturuluyor..." : "PDF Oluştur"}
      </button>
    </div>
  );
}
