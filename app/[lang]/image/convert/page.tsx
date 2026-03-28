"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import { convertImageFormat, downloadBlob } from "@/lib/image-utils";
import { useDictionary } from "@/components/DictionaryProvider";

type Format = "image/jpeg" | "image/png" | "image/webp";
const EXT: Record<Format, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export default function ImageConvertPage() {
  const dict = useDictionary();
  const d = dict.t.imgConvert;
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<Format>("image/webp");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");

  const handleFiles = useCallback((f: File[]) => {
    setFiles(f);
    setStatus("idle");
  }, []);

  const handleConvert = async () => {
    setStatus("processing");
    for (const file of files) {
      const blob = await convertImageFormat(file, targetFormat);
      const baseName = file.name.replace(/\.[^.]+$/, "");
      downloadBlob(blob, `${baseName}.${EXT[targetFormat]}`);
    }
    setStatus("done");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{d.heading}</h1>
      <p className="text-gray-500 mb-8">{d.sub}</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">{d.target}</label>
        <div className="flex gap-3">
          {(["image/jpeg", "image/png", "image/webp"] as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setTargetFormat(f)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                targetFormat === f
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:border-blue-400"
              }`}
            >
              {EXT[f].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
        label={d.drop}
      />

      {files.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          {files.length} file(s) selected
        </div>
      )}

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {d.done}
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={files.length === 0 || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? d.prog : `${d.btn} ${EXT[targetFormat].toUpperCase()}`}
      </button>
    </div>
  );
}
