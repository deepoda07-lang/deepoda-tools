"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import { X } from "lucide-react";

const POSITIONS = [
  { label: "Center",       value: "center" },
  { label: "Tiled",        value: "tiled" },
  { label: "Top Left",     value: "top-left" },
  { label: "Top Right",    value: "top-right" },
  { label: "Bottom Left",  value: "bottom-left" },
  { label: "Bottom Right", value: "bottom-right" },
];

const COLORS = [
  { label: "White",  value: "#ffffff" },
  { label: "Black",  value: "#000000" },
  { label: "Gray",   value: "#888888" },
  { label: "Red",    value: "#ef4444" },
  { label: "Yellow", value: "#facc15" },
];

function drawWatermark(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  text: string,
  position: string,
  sizePct: number,
  opacity: number,
  color: string
) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  const fontSize = Math.round((sizePct / 100) * Math.max(canvas.width, canvas.height));
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity / 100;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textWidth = ctx.measureText(text).width;
  const pad = fontSize * 1.2;

  if (position === "tiled") {
    const stepX = textWidth + fontSize * 2;
    const stepY = fontSize * 3;
    for (let row = -2; row * stepY < canvas.height + stepY * 3; row++) {
      for (let col = -2; col * stepX < canvas.width + stepX * 3; col++) {
        ctx.save();
        ctx.translate(
          col * stepX + (row % 2 === 0 ? 0 : stepX / 2),
          row * stepY
        );
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
  } else if (position === "center") {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 8);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  } else {
    let x: number, y: number;
    switch (position) {
      case "top-left":     x = pad + textWidth / 2; y = pad; break;
      case "top-right":    x = canvas.width - pad - textWidth / 2; y = pad; break;
      case "bottom-left":  x = pad + textWidth / 2; y = canvas.height - pad; break;
      case "bottom-right": x = canvas.width - pad - textWidth / 2; y = canvas.height - pad; break;
      default:             x = canvas.width / 2; y = canvas.height / 2;
    }
    ctx.fillText(text, x, y);
  }
  ctx.globalAlpha = 1;
}

export default function ImageWatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("WATERMARK");
  const [position, setPosition] = useState("center");
  const [sizePct, setSizePct] = useState(8);
  const [opacity, setOpacity] = useState(40);
  const [color, setColor] = useState("#ffffff");
  const [imgKey, setImgKey] = useState(0);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imgRef.current || !canvasRef.current) return;
    drawWatermark(canvasRef.current, imgRef.current, text, position, sizePct, opacity, color);
  }, [imgKey, text, position, sizePct, opacity, color]);

  const handleFiles = useCallback((files: File[]) => {
    if (!files[0]) return;
    setFile(files[0]);
    setStatus("idle");
    const url = URL.createObjectURL(files[0]);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      URL.revokeObjectURL(url);
      setImgKey((k) => k + 1);
    };
    img.src = url;
  }, []);

  const handleDownload = () => {
    if (!canvasRef.current || !file) return;
    try {
      const isPng = /\.png$/i.test(file.name);
      const mime = isPng ? "image/png" : "image/jpeg";
      const suffix = isPng ? "-watermarked.png" : "-watermarked.jpg";
      canvasRef.current.toBlob(
        (blob) => {
          if (!blob) { setStatus("error"); return; }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name.replace(/\.[^.]+$/, "") + suffix;
          a.click();
          URL.revokeObjectURL(url);
          setStatus("done");
        },
        mime,
        isPng ? undefined : 0.92
      );
    } catch { setStatus("error"); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Watermark</h1>
      <p className="text-gray-500 mb-2">Add a custom text watermark to your image.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your images are never sent to a server.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
        multiple={false}
        label="Drag image here (JPG, PNG, WEBP)"
      />

      {file && (
        <>
          <div className="mt-4 flex items-center justify-between p-3 bg-white border rounded-lg text-sm">
            <span className="text-gray-700 truncate">🖼️ {file.name}</span>
            <button
              onClick={() => { setFile(null); setStatus("idle"); imgRef.current = null; }}
              className="ml-2 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 rounded-xl overflow-hidden border bg-gray-100 flex items-center justify-center" style={{ maxHeight: 320 }}>
            <canvas ref={canvasRef} style={{ maxWidth: "100%", maxHeight: 320 }} />
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Watermark text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={50}
                placeholder="Enter watermark text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Position</p>
              <div className="grid grid-cols-3 gap-2">
                {POSITIONS.map((p) => (
                  <button key={p.value} onClick={() => setPosition(p.value)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      position === p.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between mb-1">
                  <span>Font size</span>
                  <span className="text-blue-600">{sizePct}%</span>
                </label>
                <input type="range" min={3} max={20} step={1} value={sizePct}
                  onChange={(e) => setSizePct(Number(e.target.value))}
                  className="w-full accent-blue-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between mb-1">
                  <span>Opacity</span>
                  <span className="text-blue-600">{opacity}%</span>
                </label>
                <input type="range" min={10} max={90} step={5} value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-blue-600" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Color</p>
              <div className="flex gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    title={c.label}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color === c.value ? "border-blue-500 scale-110" : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          Image watermarked and downloaded!
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          An error occurred. Please try again.
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={!file}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        Apply & Download
      </button>
    </div>
  );
}
