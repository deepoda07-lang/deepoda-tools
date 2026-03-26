"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { compressPDF, downloadBlob } from "@/lib/pdf-utils";

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function PDFCompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [result, setResult] = useState<{ original: number; compressed: number } | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
    setResult(null);
  }, []);

  const handleCompress = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(40);
    try {
      const compressed = await compressPDF(file);
      setProgress(100);
      setResult({ original: file.size, compressed: compressed.byteLength });
      const name = file.name.replace(".pdf", "") + "-sıkıştırıldı.pdf";
      downloadBlob(compressed, name);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const savings = result
    ? Math.round((1 - result.compressed / result.original) * 100)
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Sıkıştır</h1>
      <p className="text-gray-500 mb-8">PDF boyutunu küçült. Tarayıcıda çalışır, dosyan sunucuya gitmez.</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label="PDF dosyasını buraya sürükle"
      />

      {file && (
        <div className="mt-4 p-3 bg-white border rounded-lg text-sm text-gray-700">
          Seçilen: <span className="font-medium">{file.name}</span>
          <span className="ml-2 text-gray-400">({formatSize(file.size)})</span>
        </div>
      )}

      {status === "processing" && (
        <div className="mt-4">
          <ProgressBar value={progress} label="Sıkıştırılıyor..." />
        </div>
      )}

      {status === "done" && result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-700 font-semibold text-sm mb-3">Sıkıştırma tamamlandı!</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-gray-500 mb-1">Önceki</p>
              <p className="font-bold text-gray-900">{formatSize(result.original)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-gray-500 mb-1">Sonraki</p>
              <p className="font-bold text-gray-900">{formatSize(result.compressed)}</p>
            </div>
            <div className="bg-blue-600 rounded-lg p-3">
              <p className="text-xs text-blue-200 mb-1">Tasarruf</p>
              <p className="font-bold text-white">{savings > 0 ? `-${savings}%` : "—"}</p>
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Hata oluştu. Lütfen tekrar deneyin.
        </div>
      )}

      <button
        onClick={handleCompress}
        disabled={!file || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "Sıkıştırılıyor..." : "PDF'i Sıkıştır"}
      </button>
    </div>
  );
}
