"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { downloadDataUrl } from "@/lib/pdf-utils";

async function pdfToJpgs(file: File, quality: number): Promise<string[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const results: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d")!, viewport, canvas }).promise;
    results.push(canvas.toDataURL("image/jpeg", quality / 100));
  }

  return results;
}

export default function PDFToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(90);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
    setPreviews([]);
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(20);
    try {
      const jpgs = await pdfToJpgs(file, quality);
      setProgress(90);
      setPreviews(jpgs);
      jpgs.forEach((dataUrl, i) => {
        const baseName = file.name.replace(".pdf", "");
        downloadDataUrl(dataUrl, `${baseName}-page-${i + 1}.jpg`);
      });
      setProgress(100);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF → JPG</h1>
      <p className="text-gray-500 mb-8">Convert PDF pages to JPG images. Each page is downloaded as a separate file.</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label="Drag PDF file here"
      />

      {file && (
        <div className="mt-4 p-3 bg-white border rounded-lg text-sm text-gray-700">
          Selected: <span className="font-medium">{file.name}</span>
        </div>
      )}

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quality: <span className="text-blue-600 font-bold">{quality}%</span>
        </label>
        <input
          type="range"
          min={50}
          max={100}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Smaller file</span>
          <span>Higher quality</span>
        </div>
      </div>

      {status === "processing" && (
        <div className="mt-4"><ProgressBar value={progress} label="Converting..." /></div>
      )}

      {status === "done" && previews.length > 0 && (
        <div className="mt-4">
          <p className="text-green-700 text-sm font-semibold mb-3">
            {previews.length} page(s) downloaded as JPG!
          </p>
          <div className="grid grid-cols-3 gap-2">
            {previews.slice(0, 6).map((src, i) => (
              <img key={i} src={src} alt={`Page ${i + 1}`} className="rounded-lg border w-full" />
            ))}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          An error occurred. Please try again.
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!file || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "Converting..." : "Convert to JPG"}
      </button>
    </div>
  );
}
