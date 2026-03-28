"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import { X, FileSpreadsheet } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function ExcelToPdfPage() {
  const dict = useDictionary();
  const d = dict.t.convExcelToPdf;
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFiles = useCallback((files: File[]) => {
    if (files[0]) { setFile(files[0]); setStatus("idle"); }
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMsg("");
    try {
      const XLSX = (await import("xlsx")).default;
      const jsPDF = (await import("jspdf")).default;

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as string[][];

      if (!data || data.length === 0) throw new Error("Empty file");

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 30;
      const usableWidth = pageWidth - margin * 2;

      // Header
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(file.name.replace(/\.[^.]+$/, ""), margin, margin);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(`${d.sheet}: ${sheetName}  •  ${data.length - 1} ${d.rows}`, margin, margin + 14);

      const colCount = Math.max(...data.map((r) => r.length));
      const colW = Math.max(usableWidth / Math.max(colCount, 1), 40);
      const rowH = 18;
      const headerH = 22;
      let y = margin + 30;

      const drawRow = (row: string[], rowIndex: number, isHeader: boolean) => {
        if (y + rowH > pageHeight - margin) {
          doc.addPage();
          y = margin + 10;
        }
        const bg = isHeader ? [37, 99, 235] : rowIndex % 2 === 0 ? [248, 250, 252] : [255, 255, 255];
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.rect(margin, y, usableWidth, isHeader ? headerH : rowH, "F");

        doc.setFontSize(isHeader ? 8 : 7.5);
        doc.setFont("helvetica", isHeader ? "bold" : "normal");
        doc.setTextColor(isHeader ? 255 : 30, isHeader ? 255 : 30, isHeader ? 255 : 30);

        row.slice(0, colCount).forEach((cell, ci) => {
          const text = String(cell ?? "");
          const x = margin + ci * colW + 4;
          const maxW = colW - 8;
          const truncated = doc.getStringUnitWidth(text) * (isHeader ? 8 : 7.5) > maxW * 1.5
            ? text.slice(0, Math.floor(maxW / 5)) + "…"
            : text;
          doc.text(truncated, x, y + (isHeader ? headerH : rowH) / 2 + (isHeader ? 3 : 2.5), { baseline: "middle" });
        });

        // border
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.rect(margin, y, usableWidth, isHeader ? headerH : rowH);
        y += isHeader ? headerH : rowH;
      };

      data.forEach((row, i) => drawRow(row as string[], i, i === 0));

      // page numbers
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`${p} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
      }

      doc.save(file.name.replace(/\.(xlsx|xls)$/i, ".pdf"));
      setStatus("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : d.errDefault);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{d.heading}</h1>
      <p className="text-gray-500 mb-2">{d.sub}</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        {d.privacy}
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], "application/vnd.ms-excel": [".xls"] }}
        label={d.drop}
      />

      {file && (
        <div className="mt-4 flex items-center justify-between p-3 bg-white border rounded-lg text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <span className="truncate">{file.name}</span>
            <span className="text-gray-400 text-xs ml-1">({(file.size / 1024).toFixed(0)} KB)</span>
          </div>
          <button onClick={() => { setFile(null); setStatus("idle"); }} className="ml-2 text-gray-400 hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {d.success}
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMsg || d.errDefault}
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!file || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? dict.common.processing : d.btn}
      </button>
    </div>
  );
}
