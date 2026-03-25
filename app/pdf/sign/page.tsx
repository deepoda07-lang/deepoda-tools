"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/lib/pdf-utils";

/* ── PDF thumbnail yardımcısı ─────────────────────── */
async function getPDFThumbnails(file: File): Promise<{ url: string; count: number }[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const thumbs: { url: string; count: number }[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const vp = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    thumbs.push({ url: canvas.toDataURL("image/jpeg", 0.7), count: i });
  }
  return thumbs;
}

/* ── İmza canvas bileşeni ─────────────────────────── */
function SignatureCanvas({
  onSave,
  penColor,
  penSize,
}: {
  onSave: (dataUrl: string) => void;
  penColor: string;
  penSize: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [hasStroke, setHasStroke] = useState(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing.current || !lastPos.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasStroke(true);
  };

  const endDraw = () => { drawing.current = false; lastPos.current = null; };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  };

  const save = () => {
    const canvas = canvasRef.current!;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="w-full border-2 border-dashed border-gray-300 rounded-xl bg-white touch-none cursor-crosshair"
        style={{ maxHeight: 200 }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <div className="flex items-center gap-3">
        <button
          onClick={clear}
          className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          Temizle
        </button>
        <button
          onClick={save}
          disabled={!hasStroke}
          className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
        >
          İmzayı Kullan →
        </button>
        <span className="text-xs text-gray-400">veya fareyle ya da parmağınla çizin</span>
      </div>
    </div>
  );
}

/* ── Ana sayfa ────────────────────────────────────── */
export default function SignPage() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<{ url: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [penColor, setPenColor] = useState("#1a1a1a");
  const [penSize, setPenSize] = useState(3);
  const [sigScale, setSigScale] = useState(30); // PDF genişliğinin % kaçı
  const [posX, setPosX] = useState(70);   // % sol
  const [posY, setPosY] = useState(10);   // % alt (pdf-lib y=0 alttan)
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setSignatureUrl(null);
    setDone(false);
    setLoading(true);
    try {
      const t = await getPDFThumbnails(f);
      setThumbs(t);
      setSelectedPage(1);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async () => {
    if (!file || !signatureUrl) return;
    setSaving(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);

      // data URL → Uint8Array
      const base64 = signatureUrl.split(",")[1];
      const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const pngImg = await doc.embedPng(imgBytes);

      const page = doc.getPages()[selectedPage - 1];
      const { width, height } = page.getSize();
      const imgW = (width * sigScale) / 100;
      const imgH = (imgW * pngImg.height) / pngImg.width;
      const x = (width * posX) / 100;
      const y = (height * posY) / 100;

      page.drawImage(pngImg, { x, y, width: imgW, height: imgH });

      const out = await doc.save();
      downloadBlob(out, `imzali_${file.name}`);
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF İmzala</h1>
      <p className="text-gray-500 mb-8">
        İmzanı çiz, sayfayı seç, konumlandır ve PDF'e göm.
      </p>

      {/* ADIM 1 — PDF */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          1 · PDF Seç
        </h2>
        {!file ? (
          <FileDropzone
            onFiles={handleFiles}
            accept={{ "application/pdf": [".pdf"] }}
            multiple={false}
            label="PDF dosyasını buraya sürükle"
          />
        ) : (
          <div className="flex items-center gap-3 p-3 bg-white border rounded-xl">
            <span className="text-2xl">📄</span>
            <span className="text-sm font-medium text-gray-700 flex-1 truncate">{file.name}</span>
            <button
              onClick={() => { setFile(null); setThumbs([]); setSignatureUrl(null); setDone(false); }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Değiştir
            </button>
          </div>
        )}
        {loading && (
          <p className="mt-3 text-sm text-gray-500 flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Sayfalar yükleniyor…
          </p>
        )}
      </div>

      {/* ADIM 2 — İmza çiz */}
      {file && !loading && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            2 · İmzanı Çiz
          </h2>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Renk</label>
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Kalınlık: {penSize}px</label>
              <input
                type="range" min={1} max={8} value={penSize}
                onChange={(e) => setPenSize(Number(e.target.value))}
                className="w-24 accent-blue-600"
              />
            </div>
          </div>

          {!signatureUrl ? (
            <SignatureCanvas
              onSave={setSignatureUrl}
              penColor={penColor}
              penSize={penSize}
            />
          ) : (
            <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <img src={signatureUrl} alt="İmza" className="h-12 border rounded bg-white px-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700">İmza hazır</p>
              </div>
              <button
                onClick={() => setSignatureUrl(null)}
                className="text-xs text-gray-500 hover:text-red-500 underline transition-colors"
              >
                Yeniden Çiz
              </button>
            </div>
          )}
        </div>
      )}

      {/* ADIM 3 — Sayfa ve konum */}
      {signatureUrl && thumbs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            3 · Sayfa Seç ve Konumlandır
          </h2>

          {/* Sayfa thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2 mb-5">
            {thumbs.map((t) => (
              <button
                key={t.count}
                onClick={() => setSelectedPage(t.count)}
                className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedPage === t.count
                    ? "border-blue-500 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img src={t.url} alt={`Sayfa ${t.count}`} className="w-20 object-contain" />
                <div className="text-center text-xs py-1 text-gray-500">{t.count}</div>
              </button>
            ))}
          </div>

          {/* Konum ayarları */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Yatay konum: {posX}%
              </label>
              <input
                type="range" min={0} max={90} value={posX}
                onChange={(e) => setPosX(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Dikey konum: {posY}% (alttan)
              </label>
              <input
                type="range" min={0} max={90} value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                İmza boyutu: {sigScale}%
              </label>
              <input
                type="range" min={10} max={70} value={sigScale}
                onChange={(e) => setSigScale(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          {/* Anlık önizleme */}
          <div className="mt-4 relative inline-block border rounded-xl overflow-hidden shadow">
            <img
              src={thumbs[selectedPage - 1]?.url}
              alt="Sayfa"
              className="block max-w-xs"
            />
            <img
              src={signatureUrl}
              alt="İmza konumu"
              className="absolute pointer-events-none"
              style={{
                left: `${posX}%`,
                bottom: `${posY}%`,
                width: `${sigScale}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">* Konum tahminidir, PDF'te piksel hassasiyeti uygulanır.</p>
        </div>
      )}

      {/* KAYDET */}
      {signatureUrl && file && (
        <>
          {done && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              İmzalı PDF indirildi!
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
          >
            {saving ? "Kaydediliyor…" : "PDF'e İmza Ekle ve İndir"}
          </button>
        </>
      )}
    </div>
  );
}
