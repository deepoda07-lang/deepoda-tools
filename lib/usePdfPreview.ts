"use client";
import { useState, useEffect } from "react";

const PREVIEW_SCALE = 1.5;

export interface PdfPreviewState {
  previewUrl: string | null;
  pageWidth_pt: number;
  pageHeight_pt: number;
  pageCount: number;
  loading: boolean;
}

export function usePdfPreview(file: File | null): PdfPreviewState {
  const [state, setState] = useState<PdfPreviewState>({
    previewUrl: null,
    pageWidth_pt: 595,
    pageHeight_pt: 842,
    pageCount: 0,
    loading: false,
  });

  useEffect(() => {
    if (!file) {
      setState({ previewUrl: null, pageWidth_pt: 595, pageHeight_pt: 842, pageCount: 0, loading: false });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, previewUrl: null, loading: true }));

    (async () => {
      try {
        const bytes = await file.arrayBuffer();

        const { PDFDocument } = await import("pdf-lib");
        const doc = await PDFDocument.load(bytes);
        const count = doc.getPageCount();
        const { width, height } = doc.getPage(0).getSize();

        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.mjs",
          import.meta.url
        ).toString();

        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: PREVIEW_SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport, canvas }).promise;

        if (!cancelled) {
          setState({
            previewUrl: canvas.toDataURL("image/png"),
            pageWidth_pt: width,
            pageHeight_pt: height,
            pageCount: count,
            loading: false,
          });
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    })();

    return () => { cancelled = true; };
  }, [file]);

  return state;
}
