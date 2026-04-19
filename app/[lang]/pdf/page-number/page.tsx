"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { addPageNumbers, downloadBlob } from "@/lib/pdf-utils";
import { usePdfPreview } from "@/lib/usePdfPreview";

const POSITIONS = [
  { label: "Bottom Center", value: "bottom-center" as const },
  { label: "Bottom Right",  value: "bottom-right"  as const },
  { label: "Bottom Left",   value: "bottom-left"   as const },
];

export default function PDFPageNumberPage() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<"bottom-center" | "bottom-right" | "bottom-left">("bottom-center");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");

  const { previewUrl, pageCount, loading } = usePdfPreview(file);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
  }, []);

  const handleAdd = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(40);
    try {
      const result = await addPageNumbers(file, position);
      setProgress(100);
      downloadBlob(result, file.name.replace(".pdf", "") + "-numbered.pdf");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Page Numbers to PDF</h1>
      <p className="text-gray-500 mb-8">Automatically stamp page numbers on every page. Choose position.</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label="Drag PDF file here"
      />

      {file ? (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              Selected: <span className="font-medium">{file.name}</span>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Number position</label>
              <div className="grid grid-cols-3 gap-3">
                {POSITIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setPosition(value)}
                    className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      position === value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {status === "processing" && (
              <div className="mt-4"><ProgressBar value={progress} label="Adding numbers..." /></div>
            )}
            {status === "done" && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
                Page numbers added and downloaded!
              </div>
            )}
            {status === "error" && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                An error occurred. Please try again.
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={!file || status === "processing"}
              className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
            >
              {status === "processing" ? "Processing..." : "Add Numbers"}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preview <span className="text-xs text-gray-400 font-normal">(page 1{pageCount > 1 ? ` of ${pageCount}` : ""})</span>
            </p>
            {previewUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
                <img src={previewUrl} alt="PDF preview" className="block w-full" draggable={false} />
                {/* page number position indicator */}
                <div className={`absolute text-xs font-bold bg-blue-600 text-white px-2 py-0.5 rounded shadow ${
                  position === "bottom-center" ? "bottom-2 left-1/2 -translate-x-1/2" :
                  position === "bottom-right"  ? "bottom-2 right-2" :
                                                  "bottom-2 left-2"
                }`}>1</div>
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
