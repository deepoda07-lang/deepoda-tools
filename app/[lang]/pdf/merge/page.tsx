"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { mergePDFs, downloadBlob } from "@/lib/pdf-utils";
import { useDictionary } from "@/components/DictionaryProvider";

export default function PDFMergePage() {
  const dict = useDictionary();
  const d = dict.t.pdfMerge;
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});
  const thumbCancelRef = useRef<Record<string, boolean>>({});

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
      setError(d.errMin);
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
      setError(d.errGeneric);
    }
  };

  useEffect(() => {
    const existingKeys = new Set(files.map((f) => f.name + f.size));

    // Clean up thumbs for removed files
    setThumbUrls((prev) => {
      const next: Record<string, string> = {};
      for (const key of Object.keys(prev)) {
        if (existingKeys.has(key)) {
          next[key] = prev[key];
        }
      }
      return next;
    });

    // Render new thumbnails
    for (const f of files) {
      const key = f.name + f.size;
      if (thumbUrls[key]) continue;

      thumbCancelRef.current[key] = false;

      (async () => {
        try {
          const bytes = await f.arrayBuffer();
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            "pdfjs-dist/build/pdf.worker.mjs",
            import.meta.url
          ).toString();
          const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext("2d")!, viewport, canvas }).promise;
          if (!thumbCancelRef.current[key]) {
            setThumbUrls((prev) => ({ ...prev, [key]: canvas.toDataURL("image/png") }));
          }
        } catch {
          // thumbnail generation failed silently
        }
      })();
    }

    return () => {
      // Mark all current renders as cancelled on next effect run
      for (const key of Object.keys(thumbCancelRef.current)) {
        thumbCancelRef.current[key] = true;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{d.heading}</h1>
      <p className="text-gray-500 mb-8">{d.sub}</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        label={d.drop}
      />

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="font-semibold text-gray-700">{d.selFiles} ({files.length})</h2>
          {files.map((f, i) => {
            const key = f.name + f.size;
            const thumb = thumbUrls[key];
            return (
              <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                {thumb ? (
                  <img src={thumb} alt="" className="w-8 h-10 object-cover rounded border border-gray-200 flex-shrink-0" />
                ) : (
                  <div className="w-8 h-10 rounded border border-gray-200 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                    <span className="text-[9px] text-gray-400">PDF</span>
                  </div>
                )}
                <span className="text-sm flex-1 truncate text-gray-700">{f.name}</span>
                <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                <button onClick={() => moveFile(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 px-1">↑</button>
                <button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 px-1">↓</button>
                <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 px-1">✕</button>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

      {status === "processing" && (
        <div className="mt-4">
          <ProgressBar value={progress} label={d.prog} />
        </div>
      )}

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {d.success}
        </div>
      )}

      <button
        onClick={handleMerge}
        disabled={files.length < 2 || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? dict.common.processing : d.btn}
      </button>
    </div>
  );
}
