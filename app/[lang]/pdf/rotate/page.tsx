"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { rotatePDF, downloadBlob } from "@/lib/pdf-utils";
import { RotateCw, RotateCcw } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { usePdfPreview } from "@/lib/usePdfPreview";

export default function PDFRotatePage() {
  const dict = useDictionary();
  const d = dict.t.pdfRotate;

  const ANGLES = [
    { label: d.r90, value: 90,  icon: RotateCw },
    { label: d.r180, value: 180, icon: RotateCw },
    { label: d.l90, value: 270, icon: RotateCcw },
  ];

  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState(90);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");

  const { previewUrl, pageCount, loading } = usePdfPreview(file);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
  }, []);

  const handleRotate = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(30);
    try {
      const result = await rotatePDF(file, angle);
      setProgress(100);
      const name = file.name.replace(".pdf", "") + "-rotated.pdf";
      downloadBlob(result, name);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const cssAngle = angle === 270 ? -90 : angle;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{d.heading}</h1>
      <p className="text-gray-500 mb-8">{d.sub}</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label={d.drop}
      />

      {file ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              Selected: <span className="font-medium">{file.name}</span>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{d.angle}</label>
              <div className="grid grid-cols-3 gap-3">
                {ANGLES.map(({ label, value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setAngle(value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      angle === value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {status === "processing" && (
              <div className="mt-4">
                <ProgressBar value={progress} label={d.prog} />
              </div>
            )}
            {status === "done" && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
                {d.success}
              </div>
            )}
            {status === "error" && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {dict.common.error}
              </div>
            )}

            <button
              onClick={handleRotate}
              disabled={!file || status === "processing"}
              className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
            >
              {status === "processing" ? dict.common.processing : d.btn}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preview <span className="text-xs text-gray-400 font-normal">(page 1{pageCount > 1 ? ` of ${pageCount}` : ""})</span>
            </p>
            {previewUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[200px]">
                <div
                  className="overflow-hidden flex items-center justify-center w-full"
                  style={{ aspectRatio: Math.abs(cssAngle) === 90 ? "3/4" : "4/3" }}
                >
                  <img
                    src={previewUrl}
                    alt="PDF preview"
                    className="block max-w-full max-h-full transition-transform duration-300"
                    style={{ transform: `rotate(${cssAngle}deg)` }}
                    draggable={false}
                  />
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <p className="text-sm text-gray-400">{loading ? "Loading preview…" : ""}</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
