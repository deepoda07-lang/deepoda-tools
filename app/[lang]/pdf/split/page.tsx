"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { splitPDF, downloadBlob } from "@/lib/pdf-utils";
import { useDictionary } from "@/components/DictionaryProvider";
import { usePdfPreview } from "@/lib/usePdfPreview";

export default function PDFSplitPage() {
  const dict = useDictionary();
  const d = dict.t.pdfSplit;

  const [file, setFile] = useState<File | null>(null);
  const [fromPage, setFromPage] = useState("1");
  const [toPage, setToPage] = useState("1");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const { previewUrl, pageCount, loading } = usePdfPreview(file);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
  }, []);

  const handleSplit = async () => {
    if (!file) return;
    const from = parseInt(fromPage);
    const to = parseInt(toPage);
    if (isNaN(from) || isNaN(to) || from < 1 || to < from) {
      setError(d.errRange);
      return;
    }
    setError("");
    setStatus("processing");
    setProgress(30);
    try {
      const results = await splitPDF(file, [{ from, to }]);
      setProgress(90);
      results.forEach((r, i) =>
        downloadBlob(r, `section-${i + 1}.pdf`)
      );
      setProgress(100);
      setStatus("done");
    } catch {
      setStatus("error");
      setError(d.errGeneric);
    }
  };

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
            <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700">
              Selected: <span className="font-medium">{file.name}</span>
            </div>

            <div className="mt-6 flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{d.startPage}</label>
                <input
                  type="number"
                  min={1}
                  value={fromPage}
                  onChange={(e) => setFromPage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{d.endPage}</label>
                <input
                  type="number"
                  min={1}
                  value={toPage}
                  onChange={(e) => setToPage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

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
              onClick={handleSplit}
              disabled={!file || status === "processing"}
              className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
            >
              {status === "processing" ? dict.common.processing : d.btn}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-700">
              Preview <span className="text-xs text-gray-400 font-normal">(page 1{pageCount > 1 ? ` of ${pageCount}` : ""})</span>
            </p>
            {previewUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-md">
                <img src={previewUrl} alt="PDF preview" className="block w-full" draggable={false} />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow">
                  Pages {fromPage}–{toPage}{pageCount > 0 ? ` of ${pageCount}` : ""}
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                <p className="text-sm text-gray-400">{loading ? "Loading preview…" : ""}</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
