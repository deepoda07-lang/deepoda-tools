"use client";
import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useId,
} from "react";
import {
  MousePointer,
  Type,
  Square,
  Highlighter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Download,
} from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { downloadBlob } from "@/lib/pdf-utils";
import { useDictionary } from "@/components/DictionaryProvider";
import { cn } from "@/lib/utils";

const SCALE = 1.5;

type Tool = "select" | "text" | "whiteout" | "highlight";

interface TextAnnot {
  id: string;
  type: "text";
  page: number;
  x: number;
  y: number;
  fontSize: number;
  content: string;
  color: string;
  editing: boolean;
}

interface BoxAnnot {
  id: string;
  type: "whiteout" | "highlight";
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

type Annot = TextAnnot | BoxAnnot;

interface PageDim {
  pdfW: number;
  pdfH: number;
  cW: number;
  cH: number;
}

interface DrawingState {
  startX: number;
  startY: number;
  type: "whiteout" | "highlight";
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  };
}

export default function PDFEditPage() {
  const dict = useDictionary();
  const d = dict.t.pdfEdit;
  const uid = useId();

  const [file, setFile] = useState<File | null>(null);
  const [fileBytes, setFileBytes] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDims, setPageDims] = useState<PageDim | null>(null);

  const [tool, setTool] = useState<Tool>("select");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(14);

  const [annots, setAnnots] = useState<Annot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingBox, setDrawingBox] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef<DrawingState | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setDone(false);
    setLoading(true);
    setAnnots([]);
    setSelectedId(null);
    setCurrentPage(1);
    try {
      const bytes = await f.arrayBuffer();
      setFileBytes(bytes);
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
      ).toString();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
    } finally {
      setLoading(false);
    }
  }, []);

  // Render canvas when page changes
  useEffect(() => {
    if (!pdfDocRef.current || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      const page = await pdfDocRef.current.getPage(currentPage);
      const viewport = page.getViewport({ scale: SCALE });
      if (cancelled) return;
      const canvas = canvasRef.current!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      if (cancelled) return;
      setPageDims({
        pdfW: viewport.width / SCALE,
        pdfH: viewport.height / SCALE,
        cW: viewport.width,
        cH: viewport.height,
      });
    })();
    return () => { cancelled = true; };
  }, [currentPage, fileBytes]);

  // Delete key handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedId &&
        !(e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        setAnnots((prev) => prev.filter((a) => a.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const getOverlayPos = (e: React.MouseEvent) => {
    const rect = overlayRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool === "text") return;
    if (tool === "select") {
      // deselect if clicking empty space
      if ((e.target as HTMLElement) === overlayRef.current) {
        setSelectedId(null);
      }
      return;
    }
    // whiteout / highlight — start drag
    const pos = getOverlayPos(e);
    drawingRef.current = { startX: pos.x, startY: pos.y, type: tool };
    setDrawingBox({ x: pos.x, y: pos.y, w: 0, h: 0 });
    e.preventDefault();
  };

  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawingRef.current) return;
    const pos = getOverlayPos(e);
    const { startX, startY } = drawingRef.current;
    setDrawingBox({
      x: Math.min(startX, pos.x),
      y: Math.min(startY, pos.y),
      w: Math.abs(pos.x - startX),
      h: Math.abs(pos.y - startY),
    });
  };

  const handleOverlayMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawingRef.current) return;
    const pos = getOverlayPos(e);
    const { startX, startY, type } = drawingRef.current;
    drawingRef.current = null;

    const x = Math.min(startX, pos.x);
    const y = Math.min(startY, pos.y);
    const w = Math.abs(pos.x - startX);
    const h = Math.abs(pos.y - startY);

    if (w > 5 && h > 5) {
      const id = `${uid}-${Date.now()}-${Math.random()}`;
      setAnnots((prev) => [
        ...prev,
        { id, type, page: currentPage, x, y, w, h } as BoxAnnot,
      ]);
    }
    setDrawingBox(null);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool !== "text") return;
    // Don't create on top of existing annotation
    if ((e.target as HTMLElement) !== overlayRef.current) return;
    const pos = getOverlayPos(e);
    const id = `${uid}-${Date.now()}-${Math.random()}`;
    const newAnnot: TextAnnot = {
      id,
      type: "text",
      page: currentPage,
      x: pos.x,
      y: pos.y,
      fontSize,
      content: "",
      color: textColor,
      editing: true,
    };
    setAnnots((prev) => [
      ...prev,
      newAnnot,
    ]);
    setSelectedId(id);
  };

  const updateAnnot = (id: string, patch: Record<string, unknown>) => {
    setAnnots((prev) =>
      prev.map((a) => (a.id === id ? ({ ...a, ...patch } as Annot) : a))
    );
  };

  const deleteAnnot = (id: string) => {
    setAnnots((prev) => prev.filter((a) => a.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const currentAnnots = annots.filter((a) => a.page === currentPage);

  const handleSave = async () => {
    if (!file || !fileBytes) return;
    setSaving(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const srcDoc = await PDFDocument.load(fileBytes);
      const font = await srcDoc.embedFont(StandardFonts.Helvetica);

      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const pageNum = pageIdx + 1;
        const pageAnnots = annots.filter((a) => a.page === pageNum);
        if (pageAnnots.length === 0) continue;

        const pdfPage = srcDoc.getPage(pageIdx);
        const { height: pdfH } = pdfPage.getSize();

        // Apply in order: whiteout first, highlight second, text last
        const whiteouts = pageAnnots.filter((a) => a.type === "whiteout") as BoxAnnot[];
        const highlights = pageAnnots.filter((a) => a.type === "highlight") as BoxAnnot[];
        const texts = pageAnnots.filter((a) => a.type === "text") as TextAnnot[];

        for (const ann of whiteouts) {
          const x = ann.x / SCALE;
          const h = ann.h / SCALE;
          const w = ann.w / SCALE;
          const y = pdfH - (ann.y + ann.h) / SCALE;
          pdfPage.drawRectangle({ x, y, width: w, height: h, color: rgb(1, 1, 1) });
        }

        for (const ann of highlights) {
          const x = ann.x / SCALE;
          const h = ann.h / SCALE;
          const w = ann.w / SCALE;
          const y = pdfH - (ann.y + ann.h) / SCALE;
          pdfPage.drawRectangle({
            x, y, width: w, height: h,
            color: rgb(1, 0.92, 0),
            opacity: 0.4,
          });
        }

        for (const ann of texts) {
          const content = ann.content.trim();
          if (!content) continue;
          const x = ann.x / SCALE;
          const y = pdfH - ann.y / SCALE - ann.fontSize;
          const { r, g, b } = hexToRgb(ann.color);
          pdfPage.drawText(content, {
            x,
            y,
            size: ann.fontSize,
            font,
            color: rgb(r, g, b),
          });
        }
      }

      const out = await srcDoc.save();
      downloadBlob(out, `edited_${file.name}`);
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the PDF.");
    } finally {
      setSaving(false);
    }
  };

  const toolBtn = (t: Tool, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setTool(t)}
      title={label}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
        tool === t
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const toolHint =
    tool === "text"
      ? "Click on the PDF to place a text box"
      : tool === "whiteout"
      ? "Drag to cover content with white"
      : tool === "highlight"
      ? "Drag to highlight in yellow"
      : "Click annotation to select · Delete key or trash icon to remove";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{d.heading}</h1>
      <p className="text-gray-500 mb-6">{d.sub}</p>

      {!file && (
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

      {!loading && file && totalPages > 0 && (
        <>
          {/* ── Sticky toolbar ── */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 -mx-4 px-4 py-2 mb-4 flex flex-wrap items-center gap-2 shadow-sm">
            {/* Tool buttons */}
            {toolBtn("select", <MousePointer className="w-4 h-4" />, "Select")}
            {toolBtn("text", <Type className="w-4 h-4" />, "Add Text")}
            {toolBtn("whiteout", <Square className="w-4 h-4" />, "Whiteout")}
            {toolBtn("highlight", <Highlighter className="w-4 h-4" />, "Highlight")}

            {/* Text options */}
            {tool === "text" && (
              <>
                <div className="h-6 w-px bg-gray-200 mx-1" />
                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  Color:
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-7 h-7 rounded border cursor-pointer"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600">
                  Size:
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="border rounded px-1 py-0.5 text-xs"
                  >
                    {[10, 12, 14, 18, 24].map((s) => (
                      <option key={s} value={s}>{s}pt</option>
                    ))}
                  </select>
                </label>
              </>
            )}

            <div className="h-6 w-px bg-gray-200 mx-1" />

            {/* Page nav */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-gray-200 mx-1" />

            <button
              onClick={() => { setFile(null); setFileBytes(null); setAnnots([]); setTotalPages(0); pdfDocRef.current = null; setDone(false); }}
              className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
            >
              {d.selectNew}
            </button>

            <div className="ml-auto flex items-center gap-2">
              {done && (
                <span className="text-sm text-green-600 font-medium">
                  {d.downloaded}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                {saving ? d.saving : d.downloadPdf}
              </button>
            </div>
          </div>

          {/* ── Canvas + Overlay ── */}
          <div className="flex justify-center bg-gray-100 rounded-xl p-4 overflow-auto">
            {pageDims ? (
              <div
                style={{
                  position: "relative",
                  width: pageDims.cW,
                  height: pageDims.cH,
                }}
              >
                {/* PDF canvas */}
                <canvas
                  ref={canvasRef}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />

                {/* Overlay */}
                <div
                  ref={overlayRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    cursor:
                      tool === "text"
                        ? "text"
                        : tool === "select"
                        ? "default"
                        : "crosshair",
                  }}
                  onMouseDown={handleOverlayMouseDown}
                  onMouseMove={handleOverlayMouseMove}
                  onMouseUp={handleOverlayMouseUp}
                  onClick={handleOverlayClick}
                >
                  {/* Existing annotations */}
                  {currentAnnots.map((ann) => {
                    const isSelected = selectedId === ann.id;

                    if (ann.type === "text") {
                      return (
                        <div
                          key={ann.id}
                          style={{
                            position: "absolute",
                            left: ann.x,
                            top: ann.y,
                            minWidth: 100,
                            fontSize: ann.fontSize * SCALE,
                            color: ann.color,
                            lineHeight: 1.2,
                            border: isSelected || ann.editing
                              ? "1.5px solid #3b82f6"
                              : "1px dashed transparent",
                            padding: "1px 3px",
                            background:
                              isSelected || ann.editing
                                ? "rgba(239,246,255,0.7)"
                                : "transparent",
                            borderRadius: 2,
                            cursor: tool === "select" ? "move" : "text",
                            userSelect: ann.editing ? "text" : "none",
                            zIndex: 10,
                            whiteSpace: "pre",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (tool === "select") setSelectedId(ann.id);
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            updateAnnot(ann.id, { editing: true });
                            setSelectedId(ann.id);
                          }}
                        >
                          <div
                            contentEditable={ann.editing}
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              updateAnnot(ann.id, {
                                content: e.currentTarget.innerText,
                                editing: false,
                              });
                            }}
                            ref={(el) => {
                              if (el && ann.editing) {
                                el.focus();
                                // Place cursor at end
                                const range = document.createRange();
                                range.selectNodeContents(el);
                                range.collapse(false);
                                const sel = window.getSelection();
                                sel?.removeAllRanges();
                                sel?.addRange(range);
                              }
                            }}
                            style={{ outline: "none", minWidth: 100 }}
                          >
                            {ann.content || (ann.editing ? "" : "")}
                          </div>
                          {isSelected && !ann.editing && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteAnnot(ann.id); }}
                              style={{
                                position: "absolute",
                                top: -10,
                                right: -10,
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                zIndex: 20,
                              }}
                              title="Delete"
                            >
                              <Trash2 style={{ width: 11, height: 11 }} />
                            </button>
                          )}
                        </div>
                      );
                    }

                    // Box annotations
                    return (
                      <div
                        key={ann.id}
                        style={{
                          position: "absolute",
                          left: ann.x,
                          top: ann.y,
                          width: ann.w,
                          height: ann.h,
                          backgroundColor:
                            ann.type === "whiteout"
                              ? "white"
                              : "rgba(255,235,0,0.4)",
                          border: isSelected
                            ? "2px solid #3b82f6"
                            : ann.type === "whiteout"
                            ? "1px dashed #ccc"
                            : "1px dashed rgba(180,150,0,0.4)",
                          cursor: tool === "select" ? "pointer" : "default",
                          zIndex: 10,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (tool === "select") setSelectedId(ann.id);
                        }}
                      >
                        {isSelected && (
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteAnnot(ann.id); }}
                            style={{
                              position: "absolute",
                              top: -10,
                              right: -10,
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 20,
                            }}
                            title="Delete"
                          >
                            <Trash2 style={{ width: 11, height: 11 }} />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* In-progress drawing box */}
                  {drawingBox && drawingBox.w > 2 && drawingBox.h > 2 && (
                    <div
                      style={{
                        position: "absolute",
                        left: drawingBox.x,
                        top: drawingBox.y,
                        width: drawingBox.w,
                        height: drawingBox.h,
                        backgroundColor:
                          (drawingRef.current?.type ?? tool) === "whiteout"
                            ? "rgba(255,255,255,0.85)"
                            : "rgba(255,235,0,0.35)",
                        border:
                          (drawingRef.current?.type ?? tool) === "whiteout"
                            ? "1.5px dashed #999"
                            : "1.5px dashed rgba(180,150,0,0.7)",
                        pointerEvents: "none",
                        zIndex: 15,
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <canvas ref={canvasRef} />
            )}
          </div>

          {/* ── Bottom hint bar ── */}
          <div className="mt-2 text-center text-xs text-gray-400">{toolHint}</div>
        </>
      )}
    </div>
  );
}
