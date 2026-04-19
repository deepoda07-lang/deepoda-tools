"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { cropPDF, downloadBlob } from "@/lib/pdf-utils";
import { Link2, Link2Off } from "lucide-react";

const MM_TO_PT = 2.835;
const PREVIEW_SCALE = 1.5;

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
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</label>
      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white dark:bg-gray-800">
        <input
          type="number"
          min={0}
          max={150}
          step={1}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(150, Number(e.target.value))))}
          className="w-16 px-3 py-2 text-sm text-center focus:outline-none bg-transparent text-gray-900 dark:text-white"
        />
        <span className="pr-3 text-xs text-gray-400">mm</span>
      </div>
    </div>
  );
}

/* ── PDF page preview with crop overlay ─────────────── */
function PdfPreview({
  previewUrl,
  pageWidth_pt,
  pageHeight_pt,
  top,
  right,
  bottom,
  left,
}: {
  previewUrl: string;
  pageWidth_pt: number;
  pageHeight_pt: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}) {
  // Convert mm margins to % of page dimensions
  const topPct    = Math.min(45, (top    * MM_TO_PT / pageHeight_pt) * 100);
  const bottomPct = Math.min(45, (bottom * MM_TO_PT / pageHeight_pt) * 100);
  const leftPct   = Math.min(45, (left   * MM_TO_PT / pageWidth_pt)  * 100);
  const rightPct  = Math.min(45, (right  * MM_TO_PT / pageWidth_pt)  * 100);

  return (
    <div className="relative inline-block shadow-lg rounded overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Rendered PDF page */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previewUrl} alt="PDF preview" className="block max-w-full" draggable={false} />

      {/* Crop overlay — semi-transparent red bands */}
      {topPct > 0 && (
        <div
          className="absolute inset-x-0 top-0 bg-red-400/40 border-b-2 border-red-500 pointer-events-none"
          style={{ height: `${topPct}%` }}
        >
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-red-700 bg-white/80 px-1 rounded whitespace-nowrap">
            {top} mm
          </span>
        </div>
      )}
      {bottomPct > 0 && (
        <div
          className="absolute inset-x-0 bottom-0 bg-red-400/40 border-t-2 border-red-500 pointer-events-none"
          style={{ height: `${bottomPct}%` }}
        >
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-red-700 bg-white/80 px-1 rounded whitespace-nowrap">
            {bottom} mm
          </span>
        </div>
      )}
      {leftPct > 0 && (
        <div
          className="absolute inset-y-0 left-0 bg-red-400/40 border-r-2 border-red-500 pointer-events-none"
          style={{ width: `${leftPct}%` }}
        >
          <span className="absolute top-1/2 -translate-y-1/2 right-1 text-[10px] font-bold text-red-700 bg-white/80 px-1 rounded whitespace-nowrap"
            style={{ writingMode: "horizontal-tb" }}>
            {left} mm
          </span>
        </div>
      )}
      {rightPct > 0 && (
        <div
          className="absolute inset-y-0 right-0 bg-red-400/40 border-l-2 border-red-500 pointer-events-none"
          style={{ width: `${rightPct}%` }}
        >
          <span className="absolute top-1/2 -translate-y-1/2 left-1 text-[10px] font-bold text-red-700 bg-white/80 px-1 rounded whitespace-nowrap">
            {right} mm
          </span>
        </div>
      )}

      {/* Keep area highlight */}
      {(topPct > 0 || bottomPct > 0 || leftPct > 0 || rightPct > 0) && (
        <div
          className="absolute border-2 border-blue-500 border-dashed pointer-events-none"
          style={{
            top: `${topPct}%`,
            bottom: `${bottomPct}%`,
            left: `${leftPct}%`,
            right: `${rightPct}%`,
          }}
        />
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────── */
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

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageWidth_pt, setPageWidth_pt] = useState(595);
  const [pageHeight_pt, setPageHeight_pt] = useState(842);

  const setAll = (v: number) => {
    setTop(v); setRight(v); setBottom(v); setLeft(v);
  };

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    const f = files[0];
    setFile(f);
    setStatus("idle");
    setPreviewUrl(null);

    try {
      // Get page count via pdf-lib
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      setPageCount(doc.getPageCount());

      // Get page size in pt
      const firstPage = doc.getPage(0);
      const { width, height } = firstPage.getSize();
      setPageWidth_pt(width);
      setPageHeight_pt(height);

      // Render first page preview via pdfjs
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
      ).toString();

      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: PREVIEW_SCALE });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d")!, viewport, canvas }).promise;
      setPreviewUrl(canvas.toDataURL("image/png"));
    } catch {
      setPageCount(0);
    }
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Crop PDF</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-2">Trim the margins of every page in your PDF.</p>
      <p className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your files are never sent to a server.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label="Drag PDF file here"
      />

      {file && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
          Selected: <span className="font-medium">{file.name}</span>
          {pageCount > 0 && (
            <span className="ml-2 text-gray-400">({pageCount} page{pageCount > 1 ? "s" : ""})</span>
          )}
        </div>
      )}

      {file && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* ── Left: controls ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Crop margins</p>
              <button
                onClick={() => setLinked((v) => !v)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  linked
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                    : "border-gray-300 dark:border-gray-600 text-gray-500 hover:border-gray-400"
                }`}
              >
                {linked ? <Link2 className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
                {linked ? "Linked" : "Unlinked"}
              </button>
            </div>

            {/* Margin input layout */}
            <div className="flex flex-col items-center gap-2">
              <MarginInput label="Top"    value={top}    onChange={(v) => linked ? setAll(v) : setTop(v)} />
              <div className="flex items-center gap-4">
                <MarginInput label="Left"   value={left}   onChange={(v) => linked ? setAll(v) : setLeft(v)} />
                {/* Schematic mini page */}
                <div className="w-20 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  <div
                    className="bg-blue-100 dark:bg-blue-900/40 border border-blue-400 rounded transition-all"
                    style={{
                      width:  `${Math.max(20, 100 - (left + right) * 0.8)}%`,
                      height: `${Math.max(20, 100 - (top + bottom) * 0.6)}%`,
                    }}
                  />
                </div>
                <MarginInput label="Right"  value={right}  onChange={(v) => linked ? setAll(v) : setRight(v)} />
              </div>
              <MarginInput label="Bottom" value={bottom} onChange={(v) => linked ? setAll(v) : setBottom(v)} />
            </div>

            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-500 dark:text-gray-400 text-center">
              Removing {top}mm top · {right}mm right · {bottom}mm bottom · {left}mm left
            </div>

            {status === "processing" && (
              <div className="mt-4">
                <ProgressBar value={progress} label="Cropping..." />
              </div>
            )}
            {status === "done" && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-green-700 dark:text-green-400 text-sm font-medium">
                PDF cropped and downloaded!
              </div>
            )}
            {status === "error" && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm">
                An error occurred. Please try again.
              </div>
            )}

            <button
              onClick={handleCrop}
              disabled={!file || status === "processing" || noMargins}
              className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
            >
              {status === "processing" ? "Cropping..." : noMargins ? "Set margins above" : "Crop PDF"}
            </button>
          </div>

          {/* ── Right: live preview ── */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 self-start">
              Live preview
              <span className="ml-2 text-xs text-gray-400 font-normal">(page 1)</span>
            </p>

            {previewUrl ? (
              <PdfPreview
                previewUrl={previewUrl}
                pageWidth_pt={pageWidth_pt}
                pageHeight_pt={pageHeight_pt}
                top={top}
                right={right}
                bottom={bottom}
                left={left}
              />
            ) : (
              <div className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <p className="text-sm text-gray-400">Loading preview…</p>
              </div>
            )}

            {previewUrl && (
              <p className="text-xs text-gray-400 text-center">
                Red area = cropped · Blue dashed = result page
              </p>
            )}
          </div>
        </div>
      )}

      {/* Show full layout button when no file yet */}
      {!file && null}
    </div>
  );
}
