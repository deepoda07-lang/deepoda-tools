"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import { downloadBlob } from "@/lib/image-utils";
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from "lucide-react";

type Action = { type: "rotate"; deg: number } | { type: "flip"; axis: "h" | "v" };

const ACTIONS: { label: string; icon: React.ElementType; action: Action }[] = [
  { label: "90° Sağa",    icon: RotateCw,       action: { type: "rotate", deg: 90 } },
  { label: "90° Sola",    icon: RotateCcw,      action: { type: "rotate", deg: -90 } },
  { label: "180°",        icon: RotateCw,       action: { type: "rotate", deg: 180 } },
  { label: "Yatay Çevir", icon: FlipHorizontal, action: { type: "flip", axis: "h" } },
  { label: "Dikey Çevir", icon: FlipVertical,   action: { type: "flip", axis: "v" } },
];

export default function ImageRotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [selected, setSelected] = useState<Action>(ACTIONS[0].action);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
    setPreview(URL.createObjectURL(files[0]));
  }, []);

  const handleProcess = async () => {
    if (!file) return;
    try {
      const img = new Image();
      await new Promise<void>((res) => { img.onload = () => res(); img.src = preview; });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      if (selected.type === "rotate") {
        const rad = (selected.deg * Math.PI) / 180;
        const absCos = Math.abs(Math.cos(rad));
        const absSin = Math.abs(Math.sin(rad));
        canvas.width = Math.round(img.width * absCos + img.height * absSin);
        canvas.height = Math.round(img.width * absSin + img.height * absCos);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
        if (selected.axis === "h") {
          ctx.translate(img.width, 0);
          ctx.scale(-1, 1);
        } else {
          ctx.translate(0, img.height);
          ctx.scale(1, -1);
        }
        ctx.drawImage(img, 0, 0);
      }

      canvas.toBlob((blob) => {
        if (!blob) { setStatus("error"); return; }
        downloadBlob(blob, file.name.replace(/\.[^.]+$/, "") + "-düzenlendi.jpg");
        setStatus("done");
      }, "image/jpeg", 0.92);
    } catch { setStatus("error"); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Görsel Döndür / Çevir</h1>
      <p className="text-gray-500 mb-8">Görseli döndür veya yatay/dikey olarak çevir.</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "image/jpeg": [".jpg",".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
        multiple={false}
        label="Görsel buraya sürükle (JPG, PNG, WEBP)"
      />

      {preview && (
        <div className="mt-4 rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center max-h-48">
          <img src={preview} alt="önizleme" className="max-h-48 object-contain" />
        </div>
      )}

      <div className="mt-6 grid grid-cols-5 gap-2">
        {ACTIONS.map(({ label, icon: Icon, action }) => {
          const isActive = JSON.stringify(selected) === JSON.stringify(action);
          return (
            <button key={label} onClick={() => setSelected(action)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                isActive ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}>
              <Icon className="w-5 h-5" />
              {label}
            </button>
          );
        })}
      </div>

      {status === "done" && <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">Görsel işlendi ve indirildi!</div>}
      {status === "error" && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">Hata oluştu.</div>}

      <button onClick={handleProcess} disabled={!file}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors">
        Uygula ve İndir
      </button>
    </div>
  );
}
