"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import { ChevronLeft, ChevronRight, Pen, Highlighter, Type, Eraser, Undo2 } from "lucide-react";

type Tool = "pen" | "highlight" | "text" | "eraser";

interface PenPath {
  type: "pen";
  points: { x: number; y: number }[];
  color: string;
  width: number;
}
interface HighlightRect {
  type: "highlight";
  x: number; y: number; w: number; h: number;
  color: string;
}
interface TextAnnot {
  type: "text";
  x: number; y: number;
  text: string;
  color: string;
  size: number;
}
type Annotation = PenPath | HighlightRect | TextAnnot;

const SCALE = 1.2;
const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#000000"];
const HIGHLIGHT_COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff"];

async function loadPDFLib() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();
  return pdfjsLib;
}

function drawAnnotations(ctx: CanvasRenderingContext2D, annotations: Annotation[]) {
  for (const ann of annotations) {
    if (ann.type === "pen") {
      if (ann.points.length < 2) continue;
      ctx.save();
      ctx.strokeStyle = ann.color;
      ctx.lineWidth = ann.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(ann.points[0].x, ann.points[0].y);
      for (let i = 1; i < ann.points.length; i++) {
        ctx.lineTo(ann.points[i].x, ann.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    } else if (ann.type === "highlight") {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = ann.color;
      ctx.fillRect(ann.x, ann.y, ann.w, ann.h);
      ctx.restore();
    } else if (ann.type === "text") {
      ctx.save();
      ctx.font = `bold ${ann.size}px Arial, sans-serif`;
      ctx.fillStyle = ann.color;
      ctx.textBaseline = "top";
      // shadow for readability
      ctx.shadowColor = "rgba(255,255,255,0.9)";
      ctx.shadowBlur = 4;
      ctx.fillText(ann.text, ann.x, ann.y);
      ctx.restore();
    }
  }
}

export default function PDFAnnotatePage() {
  const [file, setFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfRef, setPdfRef] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ef4444");
  const [penWidth, setPenWidth] = useState(3);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  // Per-page annotations
  const [pageAnnotations, setPageAnnotations] = useState<Record<number, Annotation[]>>({});

  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentPath = useRef<{ x: number; y: number }[]>([]);
  const highlightStart = useRef<{ x: number; y: number } | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setFile(files[0]);
    setLoading(true);
    setPageAnnotations({});
    setCurrentPage(1);
    setDone(false);
    try {
      const lib = await loadPDFLib();
      const buffer = await files[0].arrayBuffer();
      const pdf = await lib.getDocument({ data: buffer }).promise;
      setPdfRef(pdf as never);
      setTotalPages(pdf.numPages);
    } finally {
      setLoading(false);
    }
  }, []);

  // Render base canvas
  useEffect(() => {
    if (!pdfRef || !baseCanvasRef.current) return;
    (async () => {
      const page = await pdfRef.getPage(currentPage);
      const viewport = page.getViewport({ scale: SCALE });
      const canvas = baseCanvasRef.current!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const draw = drawCanvasRef.current!;
      draw.width = viewport.width;
      draw.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      // Redraw existing annotations for this page
      const drawCtx = draw.getContext("2d")!;
      drawCtx.clearRect(0, 0, draw.width, draw.height);
      drawAnnotations(drawCtx, pageAnnotations[currentPage] ?? []);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfRef, currentPage]);

  // Redraw draw canvas when annotations change
  useEffect(() => {
    if (!drawCanvasRef.current) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAnnotations(ctx, pageAnnotations[currentPage] ?? []);
  }, [pageAnnotations, currentPage]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = drawCanvasRef.current!.getBoundingClientRect();
    const scaleX = drawCanvasRef.current!.width / rect.width;
    const scaleY = drawCanvasRef.current!.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "text") {
      const pos = getPos(e);
      const text = window.prompt("Enter text:");
      if (!text) return;
      addAnnotation({ type: "text", x: pos.x, y: pos.y, text, color, size: 18 * SCALE });
      return;
    }
    isDrawing.current = true;
    const pos = getPos(e);
    if (tool === "pen" || tool === "eraser") {
      currentPath.current = [pos];
    } else if (tool === "highlight") {
      highlightStart.current = pos;
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const pos = getPos(e);
    const canvas = drawCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    if (tool === "pen") {
      currentPath.current.push(pos);
      // Live draw current stroke
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = penWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const pts = currentPath.current;
      if (pts.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }
      ctx.restore();
    } else if (tool === "eraser") {
      currentPath.current.push(pos);
      ctx.save();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 20;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const pts = currentPath.current;
      if (pts.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }
      ctx.restore();
    } else if (tool === "highlight" && highlightStart.current) {
      // Redraw all + current highlight rect
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAnnotations(ctx, pageAnnotations[currentPage] ?? []);
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = color;
      ctx.fillRect(
        highlightStart.current.x, highlightStart.current.y,
        pos.x - highlightStart.current.x, pos.y - highlightStart.current.y
      );
      ctx.restore();
    }
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const pos = getPos(e);

    if (tool === "pen" && currentPath.current.length > 1) {
      addAnnotation({ type: "pen", points: [...currentPath.current], color, width: penWidth });
    } else if (tool === "eraser" && currentPath.current.length > 1) {
      // Eraser removes pen strokes it intersects — simplistic: add white pen path
      addAnnotation({ type: "pen", points: [...currentPath.current], color: "#ffffff", width: 20 });
    } else if (tool === "highlight" && highlightStart.current) {
      const w = pos.x - highlightStart.current.x;
      const h = pos.y - highlightStart.current.y;
      if (Math.abs(w) > 5 && Math.abs(h) > 5) {
        addAnnotation({ type: "highlight", x: highlightStart.current.x, y: highlightStart.current.y, w, h, color });
      }
      highlightStart.current = null;
    }
    currentPath.current = [];
  };

  const addAnnotation = (ann: Annotation) => {
    setPageAnnotations((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] ?? []), ann],
    }));
    setDone(false);
  };

  const undoLast = () => {
    setPageAnnotations((prev) => {
      const cur = prev[currentPage] ?? [];
      if (cur.length === 0) return prev;
      return { ...prev, [currentPage]: cur.slice(0, -1) };
    });
  };

  const totalAnnotations = Object.values(pageAnnotations).reduce((s, a) => s + a.length, 0);

  const handleSave = async () => {
    if (!file || !pdfRef) return;
    setSaving(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const pages = doc.getPages();

      for (let p = 1; p <= totalPages; p++) {
        const anns = pageAnnotations[p] ?? [];
        if (anns.length === 0) continue;

        const page = await pdfRef.getPage(p);
        const viewport = page.getViewport({ scale: SCALE });
        // Render base + annotations onto offscreen canvas
        const offscreen = document.createElement("canvas");
        offscreen.width = viewport.width;
        offscreen.height = viewport.height;
        const ctx = offscreen.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas: offscreen }).promise;
        drawAnnotations(ctx, anns);

        // Embed as JPEG image over the PDF page
        const pdfPage = pages[p - 1];
        const { width, height } = pdfPage.getSize();
        const imgBytes = await new Promise<ArrayBuffer>((res) =>
          offscreen.toBlob((b) => b!.arrayBuffer().then(res), "image/jpeg", 0.92)
        );
        const img = await doc.embedJpg(imgBytes);
        pdfPage.drawImage(img, { x: 0, y: 0, width, height });
      }

      const out = await doc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + "-annotated.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (e) {
      console.error(e);
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const toolBtnClass = (t: Tool) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
      tool === t
        ? "border-blue-500 bg-blue-50 text-blue-700"
        : "border-gray-200 text-gray-600 hover:border-gray-300"
    }`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Annotate PDF</h1>
      <p className="text-gray-500 mb-2">Draw, highlight, and add text notes to your PDF.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your files are never sent to a server.
      </p>

      {!file && (
        <FileDropzone
          onFiles={handleFiles}
          accept={{ "application/pdf": [".pdf"] }}
          multiple={false}
          label="Drag PDF file here"
        />
      )}

      {loading && (
        <div className="mt-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 mt-3 text-sm">Loading PDF…</p>
        </div>
      )}

      {!loading && file && totalPages > 0 && (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-3 p-3 bg-gray-50 border rounded-xl">
            <button className={toolBtnClass("pen")} onClick={() => setTool("pen")}>
              <Pen className="w-4 h-4" /> Pen
            </button>
            <button className={toolBtnClass("highlight")} onClick={() => setTool("highlight")}>
              <Highlighter className="w-4 h-4" /> Highlight
            </button>
            <button className={toolBtnClass("text")} onClick={() => setTool("text")}>
              <Type className="w-4 h-4" /> Text
            </button>
            <button className={toolBtnClass("eraser")} onClick={() => setTool("eraser")}>
              <Eraser className="w-4 h-4" /> Eraser
            </button>

            <div className="h-6 w-px bg-gray-300 mx-1" />

            {/* Colors */}
            <div className="flex gap-1.5">
              {(tool === "highlight" ? HIGHLIGHT_COLORS : COLORS).map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? "border-blue-500 scale-110" : "border-gray-300"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>

            {tool === "pen" && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span>Size</span>
                <input type="range" min={1} max={12} value={penWidth}
                  onChange={(e) => setPenWidth(Number(e.target.value))}
                  className="w-20 accent-blue-600" />
                <span className="w-4">{penWidth}</span>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2">
              <button onClick={undoLast} disabled={(pageAnnotations[currentPage] ?? []).length === 0}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30">
                <Undo2 className="w-3.5 h-3.5" /> Undo
              </button>
              <button onClick={() => { setFile(null); setPdfRef(null); setPageAnnotations({}); }}
                className="text-xs text-gray-400 hover:text-red-500 underline">
                New file
              </button>
              {done && <span className="text-xs text-green-600 font-medium">✓ Saved</span>}
              <button onClick={handleSave}
                disabled={saving || totalAnnotations === 0}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors">
                {saving ? "Saving…" : "Save PDF"}
              </button>
            </div>
          </div>

          {/* Page nav */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mb-3">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-gray-100">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">Page {currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-gray-100">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Canvas stack */}
          <div className="border rounded-xl overflow-auto bg-gray-200 cursor-crosshair">
            <div className="relative inline-block">
              <canvas ref={baseCanvasRef} className="block" />
              <canvas ref={drawCanvasRef}
                className="absolute inset-0"
                style={{ cursor: tool === "eraser" ? "cell" : tool === "text" ? "text" : "crosshair" }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            {tool === "text" ? "Click anywhere on the PDF to add a text note." :
             tool === "highlight" ? "Click and drag to highlight a region." :
             tool === "eraser" ? "Draw over annotations to erase them." :
             "Draw freely on the PDF."}
            {totalAnnotations > 0 && ` · ${totalAnnotations} annotation${totalAnnotations > 1 ? "s" : ""} across all pages`}
          </p>
        </>
      )}
    </div>
  );
}
