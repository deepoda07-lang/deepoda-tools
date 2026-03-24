"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { compressImage, downloadBlob, formatBytes } from "@/lib/image-utils";

interface CompressResult {
  name: string;
  original: number;
  compressed: number;
  blob: File;
}

export default function ImageCompressPage() {
  const [results, setResults] = useState<CompressResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [quality, setQuality] = useState(80);

  const handleFiles = useCallback(async (files: File[]) => {
    setStatus("processing");
    setProgress(0);
    const newResults: CompressResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const maxSizeMB = (100 - quality) / 100 * 4 + 0.2;
      const compressed = await compressImage(file, maxSizeMB);
      newResults.push({
        name: file.name,
        original: file.size,
        compressed: compressed.size,
        blob: compressed,
      });
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setResults(newResults);
    setStatus("done");
  }, [quality]);

  const downloadAll = () => {
    results.forEach((r) => downloadBlob(r.blob, `compressed_${r.name}`));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Görsel Sıkıştır</h1>
      <p className="text-gray-500 mb-6">JPG, PNG, WEBP dosyalarını küçült.</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kalite: {quality}%
        </label>
        <input
          type="range"
          min={10}
          max={95}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Küçük dosya</span>
          <span>Yüksek kalite</span>
        </div>
      </div>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
        label="Görselleri buraya sürükle (JPG, PNG, WEBP)"
      />

      {status === "processing" && (
        <div className="mt-4">
          <ProgressBar value={progress} label="Sıkıştırılıyor..." />
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Sonuçlar</h2>
            <button
              onClick={downloadAll}
              className="text-sm text-blue-600 hover:underline"
            >
              Tümünü İndir
            </button>
          </div>
          {results.map((r, i) => (
            <div key={i} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium truncate text-gray-800">{r.name}</span>
                <button
                  onClick={() => downloadBlob(r.blob, `compressed_${r.name}`)}
                  className="text-xs text-blue-600 hover:underline ml-2 shrink-0"
                >
                  İndir
                </button>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Önce: {formatBytes(r.original)}</span>
                <span>→</span>
                <span className="text-green-600 font-medium">Sonra: {formatBytes(r.compressed)}</span>
                <span className="text-green-600">
                  ({Math.round((1 - r.compressed / r.original) * 100)}% küçüldü)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
