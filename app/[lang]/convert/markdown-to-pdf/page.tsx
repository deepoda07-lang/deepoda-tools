"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import { useDictionary } from "@/components/DictionaryProvider";

const SAMPLE = `# Title

This is a **Markdown** document.

## Subtitle

- Item 1
- Item 2
- Item 3

> Quote text goes here.

\`\`\`
code block
\`\`\`
`;

export default function MarkdownToPdfPage() {
  const dict = useDictionary();
  const d = dict.t.convMdToPdf;
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [mdText, setMdText] = useState(SAMPLE);
  const [file, setFile] = useState<File | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      const text = await files[0].text();
      setMdText(text);
      setStatus("idle");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { marked } = await import("marked");
      const html = await marked(mdText || "");
      if (!cancelled) setPreviewHtml(html as string);
    })();
    return () => { cancelled = true; };
  }, [mdText]);

  const handleConvert = async () => {
    const text = mdText.trim();
    if (!text) return;
    setStatus("processing");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      if (!previewRef.current) throw new Error("Preview yok");

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pdfW = doc.internal.pageSize.getWidth();
      const pdfH = doc.internal.pageSize.getHeight();
      const margin = 25;
      const imgW = pdfW - margin * 2;
      const imgH = (canvas.height / canvas.width) * imgW;
      const pageImgH = pdfH - margin * 2;

      let srcYPx = 0;
      let first = true;

      while (srcYPx < canvas.height) {
        if (!first) doc.addPage();
        first = false;

        const slicePx = Math.min((pageImgH / imgW) * canvas.width, canvas.height - srcYPx);
        const sliceH = (slicePx / canvas.width) * imgW;

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = slicePx;
        const ctx = sliceCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, srcYPx, canvas.width, slicePx, 0, 0, canvas.width, slicePx);
        doc.addImage(sliceCanvas.toDataURL("image/jpeg", 0.92), "JPEG", margin, margin, imgW, sliceH);
        srcYPx += slicePx;
      }

      const filename = file ? file.name.replace(/\.md$/i, ".pdf") : "document.pdf";
      doc.save(filename);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{d.heading}</h1>
      <p className="text-gray-500 mb-2">{d.sub}</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        {d.privacy}
      </p>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-4">
        {(["paste", "upload"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setStatus("idle"); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {m === "paste" ? d.enterText : d.uploadFile}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Editor */}
        <div>
          <p className="text-xs text-gray-400 mb-1 font-medium">{d.markdown}</p>
          {mode === "upload" && !file ? (
            <FileDropzone
              onFiles={handleFiles}
              accept={{ "text/markdown": [".md", ".markdown"], "text/plain": [".txt"] }}
              label={d.dropMd}
            />
          ) : (
            <textarea
              value={mdText}
              onChange={(e) => { setMdText(e.target.value); setStatus("idle"); }}
              className="w-full h-80 p-3 border border-gray-200 rounded-xl text-sm font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          )}
          {mode === "upload" && file && (
            <p className="text-xs text-gray-500 mt-1">📄 {file.name}
              <button onClick={() => { setFile(null); setStatus("idle"); }} className="ml-2 text-red-400 hover:text-red-600">✕ {d.remove}</button>
            </p>
          )}
        </div>

        {/* Preview */}
        <div>
          <p className="text-xs text-gray-400 mb-1 font-medium">{d.previewLabel}</p>
          <div className="border border-gray-200 rounded-xl bg-white overflow-auto h-80">
            <div
              ref={previewRef}
              className="p-4 prose prose-sm max-w-none text-gray-800"
              style={{ fontFamily: "Arial, sans-serif", fontSize: "14px", lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {d.success}
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {d.errGeneric}
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!mdText.trim() || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? dict.common.processing : d.btn}
      </button>
    </div>
  );
}
