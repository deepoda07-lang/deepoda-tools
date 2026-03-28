"use client";
import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Check } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

const N_COLORS = 8;

function extractColors(img: HTMLImageElement): string[] {
  const canvas = document.createElement("canvas");
  const size = 200;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  // Simple median cut: collect all pixels, quantize by dividing color space
  const pixels: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // skip transparent
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  // K-means-lite: partition by reducing resolution
  const buckets: Map<string, [number, number, number][]> = new Map();
  for (const [r, g, b] of pixels) {
    const key = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push([r, g, b]);
  }

  const sorted = [...buckets.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, N_COLORS);
  return sorted.map(([, px]) => {
    const avg = px.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]], [0, 0, 0]);
    const r = Math.round(avg[0] / px.length);
    const g = Math.round(avg[1] / px.length);
    const b = Math.round(avg[2] / px.length);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  });
}

export default function ColorPalettePage() {
  const dict = useDictionary();
  const d = dict.t.imgColorPalette;
  const [preview, setPreview] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.onload = () => setColors(extractColors(img));
    img.src = url;
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [] }, maxFiles: 1,
  });

  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  }

  function luminance(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{d.heading}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{d.sub}</p>
      </div>

      {!preview && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30" : "border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">{d.drop}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, PNG, WebP, GIF</p>
        </div>
      )}

      {preview && (
        <div className="space-y-6">
          <div className="flex gap-6 items-start flex-wrap">
            <img ref={imgRef} src={preview} alt="Uploaded" className="w-48 h-48 object-cover rounded-2xl border border-gray-200 dark:border-gray-700" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{d.clickCopy}</p>
              <div className="flex flex-wrap gap-3">
                {colors.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => copyHex(hex)}
                    title={hex}
                    className="relative w-16 h-16 rounded-xl shadow-md hover:scale-110 transition-transform border border-white/20"
                    style={{ backgroundColor: hex }}
                  >
                    {copied === hex && (
                      <Check className="w-5 h-5 absolute inset-0 m-auto drop-shadow" style={{ color: luminance(hex) > 128 ? "#000" : "#fff" }} />
                    )}
                    <span
                      className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-mono whitespace-nowrap text-gray-600 dark:text-gray-400"
                    >
                      {hex}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setPreview(null); setColors([]); }}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 transition-colors"
          >
            Choose another image
          </button>
        </div>
      )}
    </div>
  );
}
