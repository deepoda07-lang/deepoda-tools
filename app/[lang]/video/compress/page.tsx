"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import FfmpegStatus from "@/components/FfmpegStatus";
import { formatBytes } from "@/lib/ffmpeg-utils";
import { X } from "lucide-react";

const PRESETS = [
  { label: "High Quality", crf: 23, desc: "Minimal loss" },
  { label: "Balanced",     crf: 28, desc: "Recommended" },
  { label: "Small Size",   crf: 33, desc: "Smaller file" },
];

export default function VideoCompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [outputSize, setOutputSize] = useState<number | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    if (files[0]) { setFile(files[0]); setStatus("idle"); setOutputSize(null); }
  }, []);

  const handleCompress = async () => {
    if (!file) return;
    setStatus("loading");
    setProgress(0);
    try {
      const { getFFmpeg, fetchFile } = await import("@/lib/ffmpeg-utils");
      const ffmpeg = await getFFmpeg((p) => { setProgress(p); setStatus("processing"); });
      const { writeFile, readFile, deleteFile } = await import("@ffmpeg/ffmpeg") as never as {
        writeFile: never; readFile: never; deleteFile: never;
      };

      const inputName = "input" + file.name.slice(file.name.lastIndexOf("."));
      const outputName = "output.mp4";
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(["-i", inputName, "-vcodec", "libx264", "-crf", String(PRESETS[preset].crf), "-preset", "fast", "-acodec", "aac", outputName]);
      const data = await ffmpeg.readFile(outputName) as Uint8Array<ArrayBuffer>;
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      setOutputSize(data.byteLength);
      const blob = new Blob([data], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.[^.]+$/, "_compressed.mp4");
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Compress Video</h1>
      <p className="text-gray-500 mb-2">Reduce the size of MP4, MOV, and WEBM videos.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your videos are never sent to a server.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "video/*": [".mp4", ".mov", ".webm", ".avi", ".mkv"] }}
        label="Drag video file here"
      />

      {file && (
        <div className="mt-4 flex items-center justify-between p-3 bg-white border rounded-lg text-sm">
          <div className="text-gray-700 truncate">🎬 {file.name} <span className="text-gray-400 ml-1">({formatBytes(file.size)})</span></div>
          <button onClick={() => { setFile(null); setStatus("idle"); }} className="ml-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
        </div>
      )}

      {file && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Quality</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => setPreset(i)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all text-center ${preset === i ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                <div>{p.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {outputSize !== null && (
        <div className="mt-3 text-sm text-gray-600">
          Original: <span className="font-medium">{formatBytes(file!.size)}</span> → Compressed: <span className="font-medium text-green-600">{formatBytes(outputSize)}</span>
          <span className="ml-2 text-green-600">({Math.round((1 - outputSize / file!.size) * 100)}% smaller)</span>
        </div>
      )}

      <FfmpegStatus status={status} progress={progress} loadingLabel="Loading ffmpeg (first time ~5 seconds)..." processingLabel="Compressing video..." doneLabel="Video compressed and downloaded!" />

      <button onClick={handleCompress} disabled={!file || status === "loading" || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors">
        {status === "loading" || status === "processing" ? "Processing..." : "Compress Video"}
      </button>
    </div>
  );
}
