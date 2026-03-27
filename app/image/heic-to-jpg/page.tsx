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
      <p className="text-gray-500 mb-2">Convert iPhone photos (HEIC/HEIF) to JPG format.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your photos are never sent to a server.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "image/heic": [".heic", ".heif"] }}
        multiple
        label="Drag HEIC / HEIF files here"
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
          <p className="text-xs text-gray-400">{files.length} file(s) selected</p>
        </div>
      )}

      {status === "processing" && (
        <div className="mt-4">
          <ProgressBar value={progress} label={`Converting... (${converted}/${files.length})`} />
        </div>
      )}
      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {converted} file(s) converted to JPG and downloaded!
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          An error occurred. Make sure your file is actually in HEIC/HEIF format.
        </div>
      )}

      <button onClick={handleConvert} disabled={files.length === 0 || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors">
        {status === "processing" ? "Converting..." : "Convert to JPG"}
      </button>
    </div>
  );
}
