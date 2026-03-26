"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { downloadBlob } from "@/lib/image-utils";
import { X } from "lucide-react";

export default function HeicToJpgPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [converted, setConverted] = useState(0);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setStatus("idle");
  }, []);

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const handleConvert = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setConverted(0);
    try {
      const heic2any = (await import("heic2any")).default;
      for (let i = 0; i < files.length; i++) {
        const blob = await heic2any({ blob: files[i], toType: "image/jpeg", quality: 0.92 }) as Blob;
        downloadBlob(blob, files[i].name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg"));
        setConverted(i + 1);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setStatus("done");
    } catch { setStatus("error"); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">HEIC → JPG</h1>
      <p className="text-gray-500 mb-2">iPhone fotoğraflarını (HEIC/HEIF) JPG formatına dönüştür.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        Tüm işlemler tarayıcınızda gerçekleşir. Fotoğraflarınız sunucuya gönderilmez.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "image/heic": [".heic", ".heif"] }}
        multiple
        label="HEIC / HEIF dosyalarını buraya sürükle"
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
          <p className="text-xs text-gray-400">{files.length} dosya seçildi</p>
        </div>
      )}

      {status === "processing" && (
        <div className="mt-4">
          <ProgressBar value={progress} label={`Dönüştürülüyor... (${converted}/${files.length})`} />
        </div>
      )}
      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {converted} dosya JPG olarak dönüştürüldü ve indirildi!
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Hata oluştu. Dosyanın gerçekten HEIC/HEIF formatında olduğundan emin olun.
        </div>
      )}

      <button onClick={handleConvert} disabled={files.length === 0 || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors">
        {status === "processing" ? "Dönüştürülüyor..." : "JPG'ye Dönüştür"}
      </button>
    </div>
  );
}
