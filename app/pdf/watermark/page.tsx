"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { downloadBlob } from "@/lib/pdf-utils";

type Position = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

const POSITIONS: { value: Position; label: string }[] = [
  { value: "center",       label: "Center (diagonal)" },
  { value: "top-left",     label: "Top Left" },
  { value: "top-right",    label: "Top Right" },
  { value: "bottom-left",  label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

const PRESETS = ["CONFIDENTIAL", "DRAFT", "IMPORTANT", "APPROVED", "CANCELLED"];

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(60);
  const [opacity, setOpacity] = useState(25);
  const [color, setColor] = useState("#cc0000");
  const [position, setPosition] = useState<Position>("center");
  const [allPages, setAllPages] = useState(true);
  const [targetPage, setTargetPage] = useState("1");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
  }, []);

  const handleApply = async () => {
    if (!file || !text.trim()) return;
    setError("");
    setStatus("processing");
    setProgress(20);

    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const pages = doc.getPages();
      setProgress(50);

      const pageIndices = allPages
        ? pages.map((_, i) => i)
        : [Math.max(0, parseInt(targetPage) - 1)];

      const { r, g, b } = hexToRgb(color);
      const alpha = opacity / 100;

      for (const idx of pageIndices) {
        const page = pages[idx];
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        let x = 0;
        let y = 0;
        let rotate = 0;

        if (position === "center") {
          x = width / 2 - textWidth / 2;
          y = height / 2 - textHeight / 2;
          rotate = -35;
        } else if (position === "top-left") {
          x = 30;
          y = height - textHeight - 30;
        } else if (position === "top-right") {
          x = width - textWidth - 30;
          y = height - textHeight - 30;
        } else if (position === "bottom-left") {
          x = 30;
          y = 30;
        } else {
          x = width - textWidth - 30;
          y = 30;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity: alpha,
          rotate: degrees(position === "center" ? rotate : 0),
        });
      }

      setProgress(90);
      const out = await doc.save();
      downloadBlob(out, `watermarked_${file.name}`);
      setProgress(100);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setError("An error occurred while adding the watermark.");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Watermark</h1>
      <p className="text-gray-500 mb-8">
        Add text watermarks to PDF pages. Runs in your browser.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label="Drag PDF file here"
      />

      {file && (
        <div className="mt-3 p-3 bg-white border rounded-lg text-sm text-gray-700">
          Selected: <span className="font-medium">{file.name}</span>
        </div>
      )}

      <div className="mt-6 space-y-5">
        {/* Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Watermark text
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setText(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  text === p
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 hover:border-blue-400"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter custom text…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border cursor-pointer"
              />
              <span className="text-sm text-gray-500 uppercase">{color}</span>
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as Position)}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Font size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Font size: {fontSize}pt
          </label>
          <input
            type="range" min={20} max={120} value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Opacity: {opacity}%
          </label>
          <input
            type="range" min={5} max={80} value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        {/* Page selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Which pages?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio" checked={allPages}
                onChange={() => setAllPages(true)}
                className="accent-blue-600"
              />
              All pages
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio" checked={!allPages}
                onChange={() => setAllPages(false)}
                className="accent-blue-600"
              />
              Only page:
              <input
                type="number" min={1} value={targetPage}
                onChange={(e) => { setAllPages(false); setTargetPage(e.target.value); }}
                className="w-16 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="w-full h-28 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden bg-white">
          <span className="text-xs text-gray-300 absolute top-2 left-3">Preview</span>
          <span
            style={{
              fontSize: Math.min(fontSize * 0.4, 48),
              color,
              opacity: opacity / 100,
              transform: position === "center" ? "rotate(-35deg)" : "none",
              fontWeight: 700,
              letterSpacing: 2,
              userSelect: "none",
            }}
          >
            {text || "WATERMARK"}
          </span>
        </div>
      </div>

      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

      {status === "processing" && (
        <div className="mt-4">
          <ProgressBar value={progress} label="Adding watermark…" />
        </div>
      )}

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          Watermark added and PDF downloaded!
        </div>
      )}

      <button
        onClick={handleApply}
        disabled={!file || !text.trim() || status === "processing"}
        className="mt-6 w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "Adding…" : "Add Watermark & Download"}
      </button>
    </div>
  );
}
