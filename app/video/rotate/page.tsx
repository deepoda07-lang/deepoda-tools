"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import FfmpegStatus from "@/components/FfmpegStatus";
import { formatBytes } from "@/lib/ffmpeg-utils";
import { X } from "lucide-react";

const ROTATIONS = [
  { label: "90° Sağ",     icon: "↻", vf: "transpose=1" },
  { label: "90° Sol",     icon: "↺", vf: "transpose=2" },
  { label: "180°",        icon: "⤸", vf: "transpose=1,transpose=1" },
  { label: "Yatay Çevir", icon: "↔", vf: "hflip" },
  { label: "Dikey Çevir", icon: "↕", vf: "vflip" },
];

export default function VideoRotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);

  const handleFiles = useCallback((files: File[]) => {
    if (files[0]) { setFile(files[0]); setStatus("idle"); }
  }, []);

  const handleRotate = async () => {
    if (!file) return;
    setStatus("loading");
    setProgress(0);
    try {
      const { getFFmpeg, fetchFile } = await import("@/lib/ffmpeg-utils");
      const ffmpeg = await getFFmpeg((p) => { setProgress(p); setStatus("processing"); });

      const ext = file.name.slice(file.name.lastIndexOf(".")) || ".mp4";
      const inputName = "input" + ext;
      const outputName = "output.mp4";
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(["-i", inputName, "-vf", ROTATIONS[rotation].vf, "-metadata:s:v", "rotate=0", "-acodec", "copy", outputName]);
      const data = await ffmpeg.readFile(outputName) as Uint8Array<ArrayBuffer>;
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      const blob = new Blob([data], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.[^.]+$/, "_rotated.mp4");
      a.click();
      URL.revokeObjectURL(url);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Döndür</h1>
      <p className="text-gray-500 mb-2">Videoyu döndür veya yatay/dikey çevir.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        Tüm işlemler tarayıcınızda gerçekleşir. Videolarınız sunucuya gönderilmez.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "video/*": [".mp4", ".mov", ".webm", ".avi", ".mkv"] }}
        label="Video dosyasını buraya sürükle"
      />

      {file && (
        <>
          <div className="mt-4 flex items-center justify-between p-3 bg-white border rounded-lg text-sm">
            <span className="text-gray-700 truncate">🎬 {file.name} <span className="text-gray-400 ml-1">({formatBytes(file.size)})</span></span>
            <button onClick={() => { setFile(null); setStatus("idle"); }} className="ml-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Döndürme Seçeneği</p>
            <div className="grid grid-cols-5 gap-2">
              {ROTATIONS.map((r, i) => (
                <button key={i} onClick={() => setRotation(i)}
                  className={`p-3 rounded-xl border text-center transition-all ${rotation === i ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  <div className="text-xl mb-1">{r.icon}</div>
                  <div className="text-xs font-medium">{r.label}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <FfmpegStatus status={status} progress={progress} loadingLabel="ffmpeg yükleniyor..." processingLabel="Video döndürülüyor..." doneLabel="Video döndürüldü ve indirildi!" />

      <button onClick={handleRotate} disabled={!file || status === "loading" || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors">
        {status === "loading" || status === "processing" ? "İşleniyor..." : "Videoyu Döndür"}
      </button>
    </div>
  );
}
