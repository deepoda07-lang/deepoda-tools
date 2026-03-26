"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import { downloadBlob } from "@/lib/image-utils";

export default function ImageCropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState("");
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 }); // yüzde
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFiles = useCallback((files: File[]) => {
    const f = files[0];
    setFile(f);
    setStatus("idle");
    setCrop({ x: 0, y: 0, w: 100, h: 100 });
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => { setNaturalW(img.naturalWidth); setNaturalH(img.naturalHeight); };
    img.src = url;
    setImgSrc(url);
  }, []);

  const previewStyle = {
    left: `${crop.x}%`, top: `${crop.y}%`,
    width: `${crop.w}%`, height: `${crop.h}%`,
  };

  // Piksel cinsinden hesapla
  const px = {
    x: Math.round(naturalW * crop.x / 100),
    y: Math.round(naturalH * crop.y / 100),
    w: Math.round(naturalW * crop.w / 100),
    h: Math.round(naturalH * crop.h / 100),
  };

  const handleCrop = async () => {
    if (!file || !imgSrc) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = px.w;
      canvas.height = px.h;
      const img = new Image();
      await new Promise<void>((res) => { img.onload = () => res(); img.src = imgSrc; });
      canvas.getContext("2d")!.drawImage(img, px.x, px.y, px.w, px.h, 0, 0, px.w, px.h);
      canvas.toBlob((blob) => {
        if (!blob) { setStatus("error"); return; }
        downloadBlob(blob, file.name.replace(/\.[^.]+$/, "") + "-kırpıldı.jpg");
        setStatus("done");
      }, "image/jpeg", 0.92);
    } catch { setStatus("error"); }
  };

  const Field = ({ label, key2, max }: { label: string; key2: keyof typeof crop; max: number }) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input type="range" min={0} max={max} value={crop[key2]}
          onChange={(e) => setCrop((c) => ({ ...c, [key2]: Number(e.target.value) }))}
          className="flex-1 accent-blue-600" />
        <span className="text-xs w-8 text-right text-gray-600">{crop[key2]}%</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Görsel Kırp</h1>
      <p className="text-gray-500 mb-8">Görselinden istediğin bölümü kırp ve indir.</p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "image/jpeg": [".jpg",".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
        multiple={false}
        label="Görsel buraya sürükle (JPG, PNG, WEBP)"
      />

      {imgSrc && (
        <>
          {/* Önizleme + kırpma çerçevesi */}
          <div className="mt-4 relative rounded-xl overflow-hidden border bg-gray-100" style={{ maxHeight: 320 }}>
            <img ref={imgRef} src={imgSrc} alt="görsel" className="w-full object-contain max-h-80" />
            <div className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none" style={previewStyle} />
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Kırpma alanı: {px.x}, {px.y} — {px.w}×{px.h} px
          </p>

          {/* Slider kontrolleri */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            <Field label="Soldan başla (X)" key2="x" max={90} />
            <Field label="Üstten başla (Y)" key2="y" max={90} />
            <Field label="Genişlik" key2="w" max={100} />
            <Field label="Yükseklik" key2="h" max={100} />
          </div>

          {status === "done" && <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">Görsel kırpıldı ve indirildi!</div>}
          {status === "error" && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">Hata oluştu. Lütfen tekrar deneyin.</div>}

          <button onClick={handleCrop}
            className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
            Kırp ve İndir
          </button>
        </>
      )}
    </div>
  );
}
