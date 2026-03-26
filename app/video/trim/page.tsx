"use client";
import { useState, useCallback, useRef } from "react";
import FileDropzone from "@/components/FileDropzone";
import FfmpegStatus from "@/components/FfmpegStatus";
import { formatTime } from "@/lib/ffmpeg-utils";
import { X } from "lucide-react";

export default function VideoTrimPage() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFiles = useCallback((files: File[]) => {
    if (!files[0]) return;
    const f = files[0];
    setFile(f);
    setStatus("idle");
    const url = URL.createObjectURL(f);
    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => {
      setDuration(video.duration);
      setStartSec(0);
      setEndSec(video.duration);
      URL.revokeObjectURL(url);
    };
  }, []);

  const handleTrim = async () => {
    if (!file) return;
    setStatus("loading");
    setProgress(0);
    try {
      const { getFFmpeg, fetchFile } = await import("@/lib/ffmpeg-utils");
      const ffmpeg = await getFFmpeg((p) => { setProgress(p); setStatus("processing"); });

      const ext = file.name.slice(file.name.lastIndexOf(".")) || ".mp4";
      const inputName = "input" + ext;
      const outputName = "output" + ext;
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec([
        "-i", inputName,
        "-ss", String(startSec),
        "-to", String(endSec),
        "-c", "copy",
        outputName,
      ]);
      const data = await ffmpeg.readFile(outputName) as Uint8Array<ArrayBuffer>;
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      const blob = new Blob([data], { type: file.type || "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.[^.]+$/, "_trimmed" + ext);
      a.click();
      URL.revokeObjectURL(url);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const trimDuration = endSec - startSec;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Kes</h1>
      <p className="text-gray-500 mb-2">Videonun istediğin bölümünü kes ve indir.</p>
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
            <span className="text-gray-700 truncate">🎬 {file.name}</span>
            <button onClick={() => { setFile(null); setStatus("idle"); }} className="ml-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex justify-between">
                <span>Başlangıç</span>
                <span className="text-blue-600 font-mono">{formatTime(startSec)}</span>
              </label>
              <input type="range" min={0} max={duration} step={0.1} value={startSec}
                onChange={(e) => setStartSec(Math.min(Number(e.target.value), endSec - 0.1))}
                className="w-full mt-1 accent-blue-600" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex justify-between">
                <span>Bitiş</span>
                <span className="text-blue-600 font-mono">{formatTime(endSec)}</span>
              </label>
              <input type="range" min={0} max={duration} step={0.1} value={endSec}
                onChange={(e) => setEndSec(Math.max(Number(e.target.value), startSec + 0.1))}
                className="w-full mt-1 accent-blue-600" />
            </div>
            <p className="text-xs text-gray-500">
              Kesilen süre: <span className="font-medium text-gray-700">{formatTime(trimDuration)}</span>
              {" "}/ Toplam: {formatTime(duration)}
            </p>
          </div>
        </>
      )}

      <FfmpegStatus status={status} progress={progress} loadingLabel="ffmpeg yükleniyor..." processingLabel="Video kesiliyor..." doneLabel="Video kesildi ve indirildi!" />

      <button onClick={handleTrim} disabled={!file || status === "loading" || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors">
        {status === "loading" || status === "processing" ? "İşleniyor..." : "Videoyu Kes"}
      </button>
    </div>
  );
}
