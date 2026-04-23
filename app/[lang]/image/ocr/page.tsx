"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Copy, Check, Trash2 } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function OcrPage() {
  const dict = useDictionary();
  const d = dict.t.imgOcr;
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [copied, setCopied] = useState(false);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setText("");
    setStatus("processing");
    setProgress(0);

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();
      setText(data.text.trim());
      setStatus("done");
    } catch {
      setText("OCR failed. Please try another image.");
      setStatus("done");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [] }, maxFiles: 1, disabled: status === "processing",
  });

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setPreview(null);
    setText("");
    setStatus("idle");
    setProgress(0);
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{d.heading}</h1>
        <p className="text-gray-500 text-sm">{d.sub}</p>
      </div>

      {status === "idle" && !preview && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{d.drop}</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, BMP, TIFF</p>
        </div>
      )}

      {status === "processing" && (
        <div className="space-y-4">
          {preview && <img src={preview} alt="Preview" className="max-h-48 rounded-xl border border-gray-200 object-contain" />}
          <div className="space-y-2">
            <p className="text-sm text-gray-500 animate-pulse">{d.processing}</p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400">{progress}%</p>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="space-y-4">
          <div className="flex gap-4 items-start flex-wrap">
            {preview && <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-xl border border-gray-200 flex-shrink-0" />}
            <div className="flex-1 min-w-[200px] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Extracted Text</label>
                <div className="flex gap-2">
                  {text && (
                    <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? d.copied : d.btnCopy}
                    </button>
                  )}
                  <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> {d.btnClear}
                  </button>
                </div>
              </div>
              {text ? (
                <textarea
                  readOnly
                  value={text}
                  rows={10}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm resize-none"
                />
              ) : (
                <p className="text-sm text-gray-400 italic">{d.noText}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
