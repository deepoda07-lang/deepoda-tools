"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { rotatePDF, downloadBlob } from "@/lib/pdf-utils";
import { RotateCw, RotateCcw } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{d.heading}</h1>
      <p className="text-gray-500 mb-8">{d.sub}</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label={d.drop}
      />

      {file && (
        <div className="mt-4 p-3 bg-white border rounded-lg text-sm text-gray-700">
          Selected: <span className="font-medium">{file.name}</span>
        </div>
      )}

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">{d.angle}</label>
        <div className="grid grid-cols-3 gap-3">
          {ANGLES.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setAngle(value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                angle === value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
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
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {d.success}
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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
  );
}
