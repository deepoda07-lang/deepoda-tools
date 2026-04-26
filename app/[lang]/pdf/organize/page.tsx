"use client";
import { useState, useCallback, useRef } from "react";
import FileDropzone from "@/components/FileDropzone";
import { downloadBlob } from "@/lib/pdf-utils";
import { useDictionary } from "@/components/DictionaryProvider";
import { RotateCw, Trash2, Download, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageItem {
  id: string;
  originalIndex: number;
  thumbnail: string;
  rotation: number; // additional rotation: 0, 90, 180, 270
  selected: boolean;
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
      rotation: 0,
      selected: false,
    });
  }
  return items;
}

export default function PDFOrganizePage() {
  const dict = useDictionary();
  const d = dict.t.pdfOrganize;

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [done, setDone] = useState(false);
  const dragIdx = useRef<number | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
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

  const reset = () => {
    setPages([]);
    setFile(null);
    setDone(false);
  };

  // ── Selection ──
  const toggleSelect = (idx: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, selected: !p.selected } : p))
    );
  };

  const selectAll = () =>
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })));

  const deselectAll = () =>
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));

  const selectedCount = pages.filter((p) => p.selected).length;
  const allSelected = pages.length > 0 && selectedCount === pages.length;

  // ── Rotation ──
  const rotatePage = (idx: number) => {
    setPages((prev) =>
      prev.map((p, i) =>
        i === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  };

  // ── Delete selected ──
  const deleteSelected = () => {
    setPages((prev) => prev.filter((p) => !p.selected));
  };

  // ── Drag-and-drop reorder ──
  const onDragStart = (idx: number) => {
    dragIdx.current = idx;
  };
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
  const onDragEnd = () => {
    dragIdx.current = null;
  };

  // ── Move left / right ──
  const movePage = (idx: number, dir: -1 | 1) => {
    setPages((prev) => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  // ── Save reordered + rotated PDF ──
  const handleSave = async () => {
    if (!file || pages.length === 0) return;
    setSaving(true);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const newDoc = await PDFDocument.create();
      const indices = pages.map((p) => p.originalIndex);
      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach((p, i) => {
        const existing = p.getRotation().angle;
        p.setRotation(degrees((existing + pages[i].rotation) % 360));
        newDoc.addPage(p);
      });
      const out = await newDoc.save();
      downloadBlob(out, `organized_${file.name}`);
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  // ── Extract selected pages ──
  const handleExtract = async () => {
    if (!file) return;
    const selected = pages.filter((p) => p.selected);
    if (selected.length === 0) return;
    setExtracting(true);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(bytes);
      const newDoc = await PDFDocument.create();
      const indices = selected.map((p) => p.originalIndex);
      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach((p, i) => {
        const existing = p.getRotation().angle;
        p.setRotation(degrees((existing + selected[i].rotation) % 360));
        newDoc.addPage(p);
      });
      const out = await newDoc.save();
      downloadBlob(out, `extracted_${file.name}`);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{d.heading}</h1>
      <p className="text-gray-500 mb-6">{d.sub}</p>

      {pages.length === 0 && !loading && (
        <FileDropzone
          onFiles={handleFiles}
          accept={{ "application/pdf": [".pdf"] }}
          multiple={false}
          label={d.drop}
        />
      )}

      {loading && (
        <div className="mt-10 text-center">
          <div className="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 mt-3 text-sm">{d.loadingPages}</p>
        </div>
      )}

      {pages.length > 0 && (
        <>
          {/* ── Toolbar ── */}
          <div className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            {/* File info */}
            <span className="text-sm text-gray-500">
              {d.nPages.replace("{n}", String(pages.length))}
            </span>
            <button
              onClick={reset}
              className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
            >
              {d.selectNew}
            </button>

            <div className="h-5 w-px bg-gray-300 mx-1" />

            {/* Select all / deselect */}
            <button
              onClick={allSelected ? deselectAll : selectAll}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              {allSelected ? d.deselectAll : d.selectAll}
            </button>

            {selectedCount > 0 && (
              <span className="text-xs text-gray-500">
                {d.selected.replace("{n}", String(selectedCount))}
              </span>
            )}

            {selectedCount > 0 && (
              <>
                <button
                  onClick={deleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {d.deleteSelected}
                </button>
                <button
                  onClick={handleExtract}
                  disabled={extracting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-600 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  {extracting ? d.saving : d.extractSelected}
                </button>
              </>
            )}

            <div className="ml-auto flex items-center gap-2">
              {done && (
                <span className="text-sm text-green-600 font-medium">
                  {d.downloaded}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving || pages.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                {saving ? d.saving : d.downloadPdf}
              </button>
            </div>
          </div>

          {/* ── Page grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((page, idx) => (
              <div
                key={page.id}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={(e) => onDragOver(e, idx)}
                onDragEnd={onDragEnd}
                className={cn(
                  "group relative bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                  page.selected
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-blue-300"
                )}
              >
                {/* Thumbnail */}
                <div className="bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={page.thumbnail}
                    alt={`Page ${idx + 1}`}
                    draggable={false}
                    className="w-full object-contain transition-transform duration-200"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  />
                </div>

                {/* Page label */}
                <div className="px-2 py-1.5 text-center text-xs font-medium text-gray-600">
                  {d.pageLbl} {idx + 1}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl pointer-events-none" />

                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(idx)}
                  className={cn(
                    "absolute top-1.5 left-1.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all shadow-sm",
                    page.selected
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100"
                  )}
                  title={page.selected ? "Deselect" : "Select"}
                >
                  {page.selected && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Rotate button */}
                <button
                  onClick={() => rotatePage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/80 border border-gray-200 text-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                  title={d.rotatePage}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Move arrows */}
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
