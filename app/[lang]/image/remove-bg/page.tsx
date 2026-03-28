"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { useDictionary } from "@/components/DictionaryProvider";

export default function RemoveBgPage() {
  const dict = useDictionary();
  const d = dict.t.imgRemoveBg;
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setResultUrl(null);
    setStatus("processing");
    setProgress(10);
    setError("");

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      setProgress(40);
      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          const pct = Math.round((current / total) * 50) + 40;
          setProgress(Math.min(90, pct));
        },
      });
      setProgress(100);
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch {
      setStatus("error");
      setError(d.failed);
    }
  }, [d.failed]);

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `${fileName}_no_bg.png`;
    a.click();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{d.heading}</h1>
      <p className="text-gray-500 mb-2">{d.sub}</p>
      <div className="mb-8 inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
        {d.aiBadge}
      </div>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
        multiple={false}
        label={d.drop}
      />

      {status === "processing" && (
        <div className="mt-6">
          <ProgressBar value={progress} label={d.prog} />
          <p className="text-xs text-gray-400 mt-2">{d.modelNote}</p>
        </div>
      )}

      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

      {originalUrl && resultUrl && (
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{d.original}</p>
            <img src={originalUrl} alt={d.original} className="w-full rounded-lg border" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">{d.removed}</p>
            <img
              src={resultUrl}
              alt={d.removed}
              className="w-full rounded-lg border"
              style={{ backgroundImage: "repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 16px 16px" }}
            />
          </div>
        </div>
      )}

      {status === "done" && (
        <button
          onClick={handleDownload}
          className="mt-6 w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
        >
          {d.downloadPng}
        </button>
      )}
    </div>
  );
}
