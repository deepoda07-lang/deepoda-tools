"use client";
import { useState, useRef, useEffect } from "react";
import { Download } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function QrCodePage() {
  const dict = useDictionary();
  const d = dict.t.convQrCode;
  const [text, setText] = useState("https://tools.deepoda.com");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) return;
    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvasRef.current, text, {
        width: 300,
        margin: 2,
        color: { dark: "#1e293b", light: "#ffffff" },
      });
    });
  }, [text]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{d.heading}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{d.sub}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL or text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={d.placeholder}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>

        {/* QR preview */}
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <canvas ref={canvasRef} />
          </div>
          <button
            onClick={download}
            disabled={!text.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            {d.download}
          </button>
        </div>
      </div>
    </div>
  );
}
