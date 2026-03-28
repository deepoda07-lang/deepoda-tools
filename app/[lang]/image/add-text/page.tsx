"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import { X, Undo2, MousePointerClick } from "lucide-react";

type TextItem = {
  id: number;
  text: string;
  xRatio: number;
  yRatio: number;
  fontSize: number;
  color: string;
  bold: boolean;
  shadow: boolean;
};

const COLORS = [
  { label: "White",  value: "#ffffff" },
  { label: "Black",  value: "#000000" },
  { label: "Yellow", value: "#facc15" },
  { label: "Red",    value: "#ef4444" },
  { label: "Blue",   value: "#3b82f6" },
];

function redrawCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  items: TextItem[]
) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  for (const item of items) {
    const x = item.xRatio * canvas.width;
    const y = item.yRatio * canvas.height;
    const fs = item.fontSize;

    ctx.font = `${item.bold ? "bold" : "normal"} ${fs}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (item.shadow) {
      ctx.shadowColor = "rgba(0,0,0,0.75)";
      ctx.shadowBlur = fs * 0.25;
      ctx.shadowOffsetX = Math.max(2, fs * 0.04);
      ctx.shadowOffsetY = Math.max(2, fs * 0.04);
    } else {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = item.color;
    ctx.fillText(item.text, x, y);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }
}

export default function ImageAddTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<TextItem[]>([]);
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(60);
  const [color, setColor] = useState("#ffffff");
  const [bold, setBold] = useState(true);
  const [shadow, setShadow] = useState(true);
  const [imgKey, setImgKey] = useState(0);
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imgRef.current || !canvasRef.current) return;
    redrawCanvas(canvasRef.current, imgRef.current, items);
  }, [imgKey, items]);

  const handleFiles = useCallback((files: File[]) => {
    if (!files[0]) return;
    setFile(files[0]);
    setItems([]);
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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imgRef.current || !text.trim()) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: text.trim(),
        xRatio: x / canvas.width,
        yRatio: y / canvas.height,
        fontSize,
        color,
        bold,
        shadow,
      },
    ]);
    setStatus("idle");
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUndo = () => {
    setItems((prev) => prev.slice(0, -1));
  };

  const handleDownload = () => {
    if (!canvasRef.current || !file) return;
    try {
      const isPng = /\.png$/i.test(file.name);
      const mime = isPng ? "image/png" : "image/jpeg";
      const suffix = isPng ? "-text.png" : "-text.jpg";
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Text to Image</h1>
      <p className="text-gray-500 mb-2">Type your text, then click anywhere on the image to place it.</p>
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
              onClick={() => { setFile(null); setItems([]); setStatus("idle"); imgRef.current = null; }}
              className="ml-2 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Text + style options */}
          <div className="mt-4 p-4 bg-gray-50 border rounded-xl space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text to add</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your text..."
                maxLength={80}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-32">
                <label className="text-sm font-medium text-gray-700 flex justify-between mb-1">
                  <span>Font size</span>
                  <span className="text-blue-600">{fontSize}px</span>
                </label>
                <input type="range" min={20} max={200} step={4} value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-blue-600" />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setBold((v) => !v)}
                  className={`w-9 h-9 rounded-lg border text-sm font-bold transition-all ${bold ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-500"}`}
                >
                  B
                </button>
                <button
                  onClick={() => setShadow((v) => !v)}
                  title="Text shadow"
                  className={`w-9 h-9 rounded-lg border text-xs transition-all ${shadow ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-500"}`}
                >
                  S
                </button>
              </div>

              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    title={c.label}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${color === c.value ? "border-blue-500 scale-110" : "border-gray-300"}`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            {text.trim() ? (
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <MousePointerClick className="w-3.5 h-3.5" />
                Click on the image below to place the text
              </p>
            ) : (
              <p className="text-xs text-gray-400">Enter text above, then click the image to place it</p>
            )}
          </div>

          {/* Canvas */}
          <div
            className={`mt-3 rounded-xl overflow-hidden border bg-gray-100 flex items-center justify-center ${text.trim() ? "cursor-crosshair" : "cursor-default"}`}
            style={{ maxHeight: 420 }}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              style={{ maxWidth: "100%", maxHeight: 420 }}
            />
          </div>

          {/* Text items list */}
          {items.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">{items.length} text layer(s)</p>
                <button onClick={handleUndo} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                  <Undo2 className="w-3.5 h-3.5" /> Undo last
                </button>
              </div>
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 bg-white border rounded-lg text-sm">
                  <span className="truncate text-gray-700">
                    <span className="inline-block w-3 h-3 rounded-full mr-2 border border-gray-200" style={{ backgroundColor: item.color }} />
                    {item.text}
                  </span>
                  <button onClick={() => removeItem(item.id)} className="ml-2 text-gray-400 hover:text-red-500 flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          Image downloaded successfully!
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          An error occurred. Please try again.
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={!file || items.length === 0}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {items.length === 0 ? "Add text to the image first" : `Download Image (${items.length} text layer${items.length > 1 ? "s" : ""})`}
      </button>
    </div>
  );
}
