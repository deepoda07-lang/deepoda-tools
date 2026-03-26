"use client";
import { useState, useRef, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";

export default function HtmlToPdfPage() {
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [htmlCode, setHtmlCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFiles = useCallback((files: File[]) => {
    if (files[0]) { setFile(files[0]); setStatus("idle"); }
  }, []);

  const getHtml = async (): Promise<string> => {
    if (mode === "paste") return htmlCode;
    if (!file) return "";
    return await file.text();
  };

  const handleConvert = async () => {
    const html = await getHtml();
    if (!html.trim()) return;
    setStatus("processing");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      // Render HTML into hidden iframe
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;height:1123px;border:none;";
      document.body.appendChild(iframe);

      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
          body { margin: 20px; font-family: Arial, sans-serif; font-size: 14px; color: #111; }
          * { box-sizing: border-box; }
        </style></head><body>${html}</body></html>`;
      });

      await new Promise((r) => setTimeout(r, 300));

      const iframeDoc = iframe.contentDocument!;
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fff",
        width: 794,
      });
      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pdfW = doc.internal.pageSize.getWidth();
      const pdfH = doc.internal.pageSize.getHeight();
      const margin = 20;
      const imgW = pdfW - margin * 2;
      const imgH = (canvas.height / canvas.width) * imgW;

      let yPos = margin;
      let remaining = imgH;
      let srcY = 0;

      while (remaining > 0) {
        const sliceH = Math.min(pdfH - margin * 2, remaining);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceH / imgW) * canvas.width;
        const ctx = sliceCanvas.getContext("2d")!;
        ctx.drawImage(canvas, 0, srcY * (canvas.width / imgW), canvas.width, sliceCanvas.height, 0, 0, sliceCanvas.width, sliceCanvas.height);
        doc.addImage(sliceCanvas.toDataURL("image/jpeg", 0.92), "JPEG", margin, yPos, imgW, sliceH);
        remaining -= sliceH;
        srcY += sliceH;
        if (remaining > 0) { doc.addPage(); yPos = margin; }
      }

      const filename = file ? file.name.replace(/\.html?$/i, ".pdf") : "document.pdf";
      doc.save(filename);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">HTML → PDF</h1>
      <p className="text-gray-500 mb-2">HTML kodunu veya dosyasını PDF'e dönüştür.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        Tüm işlemler tarayıcınızda gerçekleşir. Dosyalarınız sunucuya gönderilmez.
      </p>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6">
        {(["paste", "upload"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setStatus("idle"); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {m === "paste" ? "Kod Yapıştır" : "Dosya Yükle"}
          </button>
        ))}
      </div>

      {mode === "paste" ? (
        <textarea
          value={htmlCode}
          onChange={(e) => { setHtmlCode(e.target.value); setStatus("idle"); }}
          placeholder="<h1>Merhaba!</h1><p>HTML kodunu buraya yapıştır...</p>"
          className="w-full h-52 p-3 border border-gray-200 rounded-xl text-sm font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
      ) : (
        <FileDropzone
          onFiles={handleFiles}
          accept={{ "text/html": [".html", ".htm"] }}
          label="HTML dosyasını buraya sürükle (.html, .htm)"
        />
      )}

      {mode === "upload" && file && (
        <div className="mt-3 p-3 bg-white border rounded-lg text-sm text-gray-700 flex items-center gap-2">
          <span>📄</span>
          <span className="truncate">{file.name}</span>
          <button onClick={() => { setFile(null); setStatus("idle"); }} className="ml-auto text-gray-400 hover:text-red-500 text-xs">✕</button>
        </div>
      )}

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          PDF oluşturuldu ve indirildi!
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Dönüştürme sırasında hata oluştu. Lütfen tekrar deneyin.
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={(mode === "paste" ? !htmlCode.trim() : !file) || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "Dönüştürülüyor..." : "PDF'e Dönüştür"}
      </button>
    </div>
  );
}
