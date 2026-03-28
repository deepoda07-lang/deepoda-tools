"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

type ExifData = Record<string, string | number | boolean | object>;

export default function ExifPage() {
  const dict = useDictionary();
  const d = dict.t.imgExif;
  const [preview, setPreview] = useState<string | null>(null);
  const [exif, setExif] = useState<ExifData | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const exifr = (await import("exifr")).default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await (exifr as any).parse(file, { tiff: true, exif: true, gps: true, ifd0: true });
      setExif(data ?? {});
    } catch {
      setExif({});
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [] }, maxFiles: 1,
  });

  function formatValue(v: unknown): string {
    if (v instanceof Array) return v.join(", ");
    if (v instanceof Date) return v.toLocaleString();
    if (typeof v === "object" && v !== null) return JSON.stringify(v);
    return String(v);
  }

  const entries = exif ? Object.entries(exif).filter(([, v]) => v !== undefined && v !== null) : [];

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
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPG, PNG, HEIC, WebP</p>
        </div>
      )}

      {preview && (
        <div className="grid md:grid-cols-[200px_1fr] gap-6">
          <div className="space-y-3">
            <img src={preview} alt="Preview" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 object-cover aspect-square" />
            <button
              onClick={() => { setPreview(null); setExif(null); }}
              className="w-full py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors"
            >
              Choose another
            </button>
          </div>

          <div>
            {loading && <p className="text-sm text-gray-400 animate-pulse">Reading EXIF data…</p>}
            {!loading && entries.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">{d.noExif}</p>
            )}
            {!loading && entries.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
                {entries.map(([key, val], i) => (
                  <div key={key} className={`flex items-start gap-4 px-4 py-2.5 ${i % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-900"}`}>
                    <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[140px] flex-shrink-0">{key}</span>
                    <span className="text-gray-800 dark:text-gray-200 break-all">{formatValue(val)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
