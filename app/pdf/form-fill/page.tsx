"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FieldInfo {
  id: string;
  name: string;
  type: "text" | "checkbox" | "radio" | "select";
  page: number;
  rect: { top: number; left: number; width: number; height: number };
  options?: string[];
  radioValue?: string;
}

const SCALE = 1.2;

async function loadPDF(data: ArrayBuffer) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();
  return pdfjsLib.getDocument({ data }).promise;
}

async function collectFields(pdf: Awaited<ReturnType<typeof loadPDF>>): Promise<FieldInfo[]> {
  const fields: FieldInfo[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: SCALE });
    const annotations = await page.getAnnotations();
    for (const ann of annotations) {
      if (ann.subtype !== "Widget") continue;
      const [x1, y1, x2, y2] = ann.rect;
      const left = x1 * SCALE;
      const top = viewport.height - y2 * SCALE;
      const width = (x2 - x1) * SCALE;
      const height = (y2 - y1) * SCALE;

      let type: FieldInfo["type"] = "text";
      if (ann.fieldType === "Btn") {
        type = ann.radioButton ? "radio" : "checkbox";
      } else if (ann.fieldType === "Ch") {
        type = "select";
      }

      fields.push({
        id: `${ann.fieldName ?? "field"}-${p}-${left}-${top}`,
        name: ann.fieldName ?? "",
        type,
        page: p,
        rect: { top, left, width, height },
        options: ann.options?.map((o: { displayValue: string }) => o.displayValue) ?? [],
        radioValue: ann.buttonValue,
      });
    }
  }
  return fields;
}

export default function PDFFormFillPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfRef, setPdfRef] = useState<Awaited<ReturnType<typeof loadPDF>> | null>(null);
  const [fields, setFields] = useState<FieldInfo[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [noFields, setNoFields] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setFile(files[0]);
    setLoading(true);
    setDone(false);
    setNoFields(false);
    setValues({});
    setCurrentPage(1);
    try {
      const buffer = await files[0].arrayBuffer();
      const pdf = await loadPDF(buffer);
      setPdfRef(pdf);
      setTotalPages(pdf.numPages);
      const detected = await collectFields(pdf);
      setFields(detected);
      if (detected.length === 0) setNoFields(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Render current page to canvas
  useEffect(() => {
    if (!pdfRef || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      const page = await pdfRef.getPage(currentPage);
      const viewport = page.getViewport({ scale: SCALE });
      const canvas = canvasRef.current!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    })();
    return () => { cancelled = true; };
  }, [pdfRef, currentPage]);

  const pageFields = fields.filter((f) => f.page === currentPage);

  const setValue = (fieldName: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    setDone(false);
  };

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const form = doc.getForm();

      for (const [name, value] of Object.entries(values)) {
        try {
          const field = form.getField(name);
          const typeName = field.constructor.name;
          if (typeName === "PDFTextField") {
            form.getTextField(name).setText(value);
          } else if (typeName === "PDFCheckBox") {
            if (value === "true") form.getCheckBox(name).check();
            else form.getCheckBox(name).uncheck();
          } else if (typeName === "PDFDropdown") {
            form.getDropdown(name).select(value);
          } else if (typeName === "PDFRadioGroup") {
            form.getRadioGroup(name).select(value);
          }
        } catch {
          // skip unknown fields
        }
      }

      form.flatten();
      const out = await doc.save();
      const blob = new Blob([out.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + "-filled.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch {
      alert("An error occurred while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Fill PDF Form</h1>
      <p className="text-gray-500 mb-2">Fill in text fields, checkboxes, and dropdowns in a PDF form.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your files are never sent to a server.
      </p>

      {!file && (
        <FileDropzone
          onFiles={handleFiles}
          accept={{ "application/pdf": [".pdf"] }}
          multiple={false}
          label="Drag PDF form here"
        />
      )}

      {loading && (
        <div className="mt-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 mt-3 text-sm">Detecting form fields…</p>
        </div>
      )}

      {noFields && !loading && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          No fillable form fields found in this PDF. Try a PDF that contains form fields.
          <button onClick={() => { setFile(null); setNoFields(false); }} className="ml-3 underline text-amber-600">Try another file</button>
        </div>
      )}

      {!loading && file && fields.length > 0 && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{file.name}</span>
              <span className="text-gray-400">·</span>
              <span>{fields.length} field{fields.length > 1 ? "s" : ""}</span>
              <button onClick={() => { setFile(null); setFields([]); setPdfRef(null); }} className="text-xs text-gray-400 hover:text-red-500 underline ml-1">Change file</button>
            </div>
            <div className="flex items-center gap-2">
              {done && <span className="text-sm text-green-600 font-medium">✓ Saved</span>}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving ? "Saving…" : "Save Filled PDF"}
              </button>
            </div>
          </div>

          {/* Page navigation */}
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

          {/* Canvas + overlaid form inputs */}
          <div className="border rounded-xl overflow-auto bg-gray-100">
            <div className="relative inline-block">
              <canvas ref={canvasRef} className="block" />
              {pageFields.map((field) => {
                const { top, left, width, height } = field.rect;
                const style: React.CSSProperties = {
                  position: "absolute",
                  top, left, width, height,
                  fontSize: Math.max(10, height * 0.55),
                };
                if (field.type === "checkbox") {
                  return (
                    <input key={field.id} type="checkbox"
                      checked={values[field.name] === "true"}
                      onChange={(e) => setValue(field.name, e.target.checked ? "true" : "false")}
                      style={{ ...style, cursor: "pointer", accentColor: "#2563eb" }}
                    />
                  );
                }
                if (field.type === "select" && field.options?.length) {
                  return (
                    <select key={field.id} value={values[field.name] ?? ""}
                      onChange={(e) => setValue(field.name, e.target.value)}
                      style={{ ...style, padding: "0 4px", border: "1.5px solid #93c5fd", borderRadius: 4, background: "rgba(255,255,255,0.92)" }}>
                      <option value="" />
                      {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  );
                }
                if (field.type === "radio") {
                  return (
                    <input key={field.id} type="radio"
                      name={field.name}
                      value={field.radioValue ?? ""}
                      checked={values[field.name] === field.radioValue}
                      onChange={() => setValue(field.name, field.radioValue ?? "")}
                      style={{ ...style, cursor: "pointer", accentColor: "#2563eb" }}
                    />
                  );
                }
                // text
                return (
                  <input key={field.id} type="text"
                    value={values[field.name] ?? ""}
                    onChange={(e) => setValue(field.name, e.target.value)}
                    style={{
                      ...style,
                      padding: "0 4px",
                      border: "1.5px solid #93c5fd",
                      borderRadius: 3,
                      background: "rgba(239,246,255,0.85)",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                    onBlur={(e) => (e.target.style.borderColor = "#93c5fd")}
                  />
                );
              })}
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            Click on highlighted fields above to type. Use the navigation buttons to switch pages.
          </p>
        </>
      )}
    </div>
  );
}
