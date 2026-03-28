"use client";
import { useState, useCallback, useRef } from "react";
import FileDropzone from "@/components/FileDropzone";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/lib/pdf-utils";
import { useDictionary } from "@/components/DictionaryProvider";

interface PageItem {
  id: string;
  originalIndex: number;
  thumbnail: string;
}

async function renderThumbnails(file: File): Promise<PageItem[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const items: PageItem[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 0.4 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    items.push({
      id: `page-${i}-${Date.now()}`,
      originalIndex: i - 1,
      thumbnail: canvas.toDataURL("image/jpeg", 0.7),
    });
  }
  return items;
}

export default function PDFEditPage() {
  const dict = useDictionary();
  const d = dict.t.pdfEdit;

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const dragIdx = useRef<number | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setDone(false);
    setLoading(true);
    try {
      const items = await renderThumbnails(f);
      setPages(items);
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePage = (idx: number) => {
    setPages((prev) => prev.filter((_, i) => i !== idx));
  };

  const movePage = (idx: number, dir: -1 | 1) => {
    setPages((prev) => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const onDragStart = (idx: number) => { dragIdx.current = idx; };
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    setPages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx.current!, 1);
      arr.splice(idx, 0, moved);
      dragIdx.current = idx;
      return arr;
    });
  };
  const onDragEnd = () => { dragIdx.current = null; };

  const handleSave = async () => {
    if (!file || pages.length === 0) return;
    setSaving(true);
    try {
      const bytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const newDoc = await PDFDocument.create();
      const indices = pages.map((p) => p.originalIndex);
      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach((p) => newDoc.addPage(p));
      const out = await newDoc.save();
      downloadBlob(out, `edited_${file.name}`);
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{d.heading}</h1>
      <p className="text-gray-500 mb-8">
        {d.sub}
      </p>

      {pages.length === 0 && (
        <FileDropzone
          onFiles={handleFiles}
          accept={{ "application/pdf": [".pdf"] }}
          multiple={false}
          label={d.drop}
        />
      )}

      {loading && (
        <div className="mt-8 text-center">
          <div className="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 mt-3 text-sm">{d.loadingPages}</p>
        </div>
      )}

      {pages.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {d.nPages.replace("{n}", String(pages.length))}
              </span>
              <button
                onClick={() => { setPages([]); setFile(null); setDone(false); }}
                className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
              >
                {d.selectNew}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {done && (
                <span className="text-sm text-green-600 font-medium">
                  {d.downloaded}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving || pages.length === 0}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving ? d.saving : d.downloadPdf}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((page, idx) => (
              <div
                key={page.id}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={(e) => onDragOver(e, idx)}
                onDragEnd={onDragEnd}
                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing"
              >
                <div className="bg-gray-50">
                  <img
                    src={page.thumbnail}
                    alt={`Page ${idx + 1}`}
                    className="w-full object-contain"
                    draggable={false}
                  />
                </div>

                <div className="px-2 py-1.5 text-center text-xs font-medium text-gray-600">
                  {d.pageLbl} {idx + 1}
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />

                <button
                  onClick={() => deletePage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow"
                  title={d.deletePage}
                >
                  ✕
                </button>

                <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => movePage(idx, -1)}
                    disabled={idx === 0}
                    className="w-6 h-6 rounded bg-white/90 border text-gray-600 text-xs flex items-center justify-center disabled:opacity-30 hover:bg-white shadow"
                    title={d.moveLeft}
                  >
                    ←
                  </button>
                  <button
                    onClick={() => movePage(idx, 1)}
                    disabled={idx === pages.length - 1}
                    className="w-6 h-6 rounded bg-white/90 border text-gray-600 text-xs flex items-center justify-center disabled:opacity-30 hover:bg-white shadow"
                    title={d.moveRight}
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pages.length === 0 && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm text-center">
              {d.allDeleted}
            </div>
          )}
        </>
      )}
    </div>
  );
}
