"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { cropPDF, downloadBlob } from "@/lib/pdf-utils";
import { Link2, Link2Off } from "lucide-react";

const MM_TO_PT = 2.835;

function MarginInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
        <input
          type="number"
          min={0}
          max={150}
          step={1}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(150, Number(e.target.value))))}
          className="w-16 px-3 py-2 text-sm text-center focus:outline-none"
        />
        <span className="pr-3 text-xs text-gray-400">mm</span>
      </div>
    </div>
  );
}

export default function PDFCropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [top, setTop] = useState(10);
  const [right, setRight] = useState(10);
  const [bottom, setBottom] = useState(10);
  const [left, setLeft] = useState(10);
  const [linked, setLinked] = useState(true);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);

  const setAll = (v: number) => {
    setTop(v); setRight(v); setBottom(v); setLeft(v);
  };

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setFile(files[0]);
    setStatus("idle");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await files[0].arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      setPageCount(doc.getPageCount());
    } catch { setPageCount(0); }
  }, []);

  const handleCrop = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(40);
    try {
      const result = await cropPDF(file, {
        top: top * MM_TO_PT,
        right: right * MM_TO_PT,
        bottom: bottom * MM_TO_PT,
        left: left * MM_TO_PT,
      });
      setProgress(100);
      downloadBlob(result, file.name.replace(/\.pdf$/i, "") + "-cropped.pdf");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const noMargins = top === 0 && right === 0 && bottom === 0 && left === 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Crop PDF</h1>
      <p className="text-gray-500 mb-2">Trim the margins of every page in your PDF.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your files are never sent to a server.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label="Drag PDF file here"
      />

      {file && (
        <div className="mt-4 p-3 bg-white border rounded-lg text-sm text-gray-700">
          Selected: <span className="font-medium">{file.name}</span>
          {pageCount > 0 && (
            <span className="ml-2 text-gray-400">({pageCount} page{pageCount > 1 ? "s" : ""})</span>
          )}
        </div>
      )}

      {/* Margin controls */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-700">Crop margins</p>
          <button
            onClick={() => setLinked((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              linked
                ? "border-blue-400 bg-blue-50 text-blue-600"
                : "border-gray-300 text-gray-500 hover:border-gray-400"
            }`}
          >
            {linked ? <Link2 className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
            {linked ? "Linked" : "Unlinked"}
          </button>
        </div>

        {/* Visual margin layout */}
        <div className="flex flex-col items-center gap-2">
          {/* Top */}
          <MarginInput
            label="Top"
            value={top}
            onChange={(v) => { linked ? setAll(v) : setTop(v); }}
          />

          {/* Left + visual page + Right */}
          <div className="flex items-center gap-4">
            <MarginInput
              label="Left"
              value={left}
              onChange={(v) => { linked ? setAll(v) : setLeft(v); }}
            />
            {/* Page preview box */}
            <div className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
              <div
                className="bg-white border border-gray-400 rounded transition-all flex items-center justify-center"
                style={{
                  width: `${Math.max(20, 100 - (left + right) * 0.8)}%`,
                  height: `${Math.max(20, 100 - (top + bottom) * 0.6)}%`,
                }}
              >
                <span className="text-[8px] text-gray-400">page</span>
              </div>
            </div>
            <MarginInput
              label="Right"
              value={right}
              onChange={(v) => { linked ? setAll(v) : setRight(v); }}
            />
          </div>

          {/* Bottom */}
          <MarginInput
            label="Bottom"
            value={bottom}
            onChange={(v) => { linked ? setAll(v) : setBottom(v); }}
          />
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-gray-50 border rounded-lg text-xs text-gray-500 text-center">
          Removing {top}mm top · {right}mm right · {bottom}mm bottom · {left}mm left from each page
        </div>
      </div>

      {status === "processing" && (
        <div className="mt-4">
          <ProgressBar value={progress} label="Cropping..." />
        </div>
      )}
      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          PDF cropped and downloaded!
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          An error occurred. Please try again.
        </div>
      )}

      <button
        onClick={handleCrop}
        disabled={!file || status === "processing" || noMargins}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "Cropping..." : noMargins ? "Set margins above" : "Crop PDF"}
      </button>
    </div>
  );
}
