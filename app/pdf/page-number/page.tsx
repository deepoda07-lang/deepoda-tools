"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { addPageNumbers, downloadBlob } from "@/lib/pdf-utils";

const POSITIONS = [
  { label: "Alt Orta",  value: "bottom-center" as const },
  { label: "Alt Sağ",   value: "bottom-right"  as const },
  { label: "Alt Sol",   value: "bottom-left"   as const },
];

export default function PDFPageNumberPage() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<"bottom-center" | "bottom-right" | "bottom-left">("bottom-center");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
  }, []);

  const handleAdd = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(40);
    try {
      const result = await addPageNumbers(file, position);
      setProgress(100);
      downloadBlob(result, file.name.replace(".pdf", "") + "-numaralı.pdf");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Sayfa Numarası Ekle</h1>
      <p className="text-gray-500 mb-8">Her sayfaya otomatik numara bas. Konum seçebilirsin.</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label="PDF dosyasını buraya sürükle"
      />

      {file && (
        <div className="mt-4 p-3 bg-white border rounded-lg text-sm text-gray-700">
          Seçilen: <span className="font-medium">{file.name}</span>
        </div>
      )}

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Numara konumu</label>
        <div className="grid grid-cols-3 gap-3">
          {POSITIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPosition(value)}
              className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                position === value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {status === "processing" && (
        <div className="mt-4"><ProgressBar value={progress} label="Numaralar ekleniyor..." /></div>
      )}
      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Sayfa numaraları eklendi ve indirildi!
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Hata oluştu. Lütfen tekrar deneyin.
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={!file || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "İşleniyor..." : "Numara Ekle"}
      </button>
    </div>
  );
}
