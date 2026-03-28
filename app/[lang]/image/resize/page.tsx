"use client";
import { useState, useCallback, useRef } from "react";
import FileDropzone from "@/components/FileDropzone";
import { downloadBlob, formatBytes } from "@/lib/image-utils";
import { Lock, Unlock } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function ImageResizePage() {
  const dict = useDictionary();
  const d = dict.t.imgResize;
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [locked, setLocked] = useState(true);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");

  const handleFiles = useCallback((files: File[]) => {
    const f = files[0];
    setFile(f);
    setStatus("idle");
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
      URL.revokeObjectURL(url);
    };
    img.src = url;
    setPreview(URL.createObjectURL(f));
  }, []);

  const onWidthChange = (val: string) => {
    setWidth(val);
    if (locked && origW && val) {
      const ratio = origH / origW;
      setHeight(String(Math.round(Number(val) * ratio)));
    }
  };

  const onHeightChange = (val: string) => {
    setHeight(val);
    if (locked && origH && val) {
      const ratio = origW / origH;
      setWidth(String(Math.round(Number(val) * ratio)));
    }
  };

  const handleResize = async () => {
    if (!file || !width || !height) return;
    setStatus("processing");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = Number(width);
      canvas.height = Number(height);
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise<void>((res) => { img.onload = () => res(); img.src = url; });
      ctx.drawImage(img, 0, 0, Number(width), Number(height));
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) { setStatus("error"); return; }
        const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg";
        downloadBlob(blob, file.name.replace(/\.[^.]+$/, "") + `-${width}x${height}${ext}`);
        setStatus("done");
      }, file.type, 0.92);
    } catch { setStatus("error"); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{d.heading}</h1>
      <p className="text-gray-500 mb-8">{d.sub}</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "image/jpeg": [".jpg",".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
        multiple={false}
        label={d.drop}
      />

      {preview && (
        <div className="mt-4 rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center max-h-48">
          <img src={preview} alt="preview" className="max-h-48 object-contain" />
        </div>
      )}

      {origW > 0 && (
        <>
          <p className="mt-3 text-xs text-gray-400">{d.original}: {origW} × {origH} px — {formatBytes(file!.size)}</p>
          <div className="mt-4 flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{d.width} (px)</label>
              <input type="number" min={1} value={width} onChange={(e) => onWidthChange(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => setLocked(!locked)}
              className="mb-0.5 p-2.5 rounded-xl border hover:bg-gray-50 transition-colors"
              title={locked ? d.locked : d.unlocked}>
              {locked ? <Lock className="w-4 h-4 text-blue-600" /> : <Unlock className="w-4 h-4 text-gray-400" />}
            </button>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{d.height} (px)</label>
              <input type="number" min={1} value={height} onChange={(e) => onHeightChange(e.target.value)}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </>
      )}

      {status === "done" && <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{d.success}</div>}
      {status === "error" && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{dict.common.error}</div>}

      <button onClick={handleResize} disabled={!file || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors">
        {status === "processing" ? dict.common.processing : d.btn}
      </button>
    </div>
  );
}
