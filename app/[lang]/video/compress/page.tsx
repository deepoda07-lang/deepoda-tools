"use client";
import { useState, useCallback, useEffect } from "react";
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setVideoUrl(null); return; }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFiles = useCallback((files: File[]) => {
    if (files[0]) { setFile(files[0]); setStatus("idle"); setOutputSize(null); }
  }, []);

  const handleCompress = async () => {
    if (!file) return;
    setStatus("loading");
    setProgress(0);

    const { getFFmpeg, fetchFile } = await import("@/lib/ffmpeg-utils");
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ".mp4";
    const inputName = "input" + ext;
    const outputName = "output.mp4";

    try {
      const ffmpeg = await getFFmpeg((p) => { setProgress(p); setStatus("processing"); });
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec([
        "-i", inputName,
        "-vcodec", "libx264",
        "-crf", String(PRESETS[preset].crf),
        "-preset", "fast",
        "-acodec", "aac",
        outputName,
      ]);
      const data = await ffmpeg.readFile(outputName) as Uint8Array;
      ffmpeg.deleteFile(inputName).catch(() => {});
      ffmpeg.deleteFile(outputName).catch(() => {});

      setOutputSize(data.byteLength);
      const blob = new Blob([data as Uint8Array<ArrayBuffer>], { type: "video/mp4" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.name.replace(/\.[^.]+$/, "_compressed.mp4");
      a.click();
      URL.revokeObjectURL(blobUrl);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const isProcessing = status === "loading" || status === "processing";

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
        <div className="mt-4 flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg text-sm">
          <div className="text-gray-700 truncate">
            🎬 {file.name}
            <span className="text-gray-400 ml-1">({formatBytes(file.size)})</span>
          </div>
          <button
            onClick={() => { setFile(null); setStatus("idle"); setOutputSize(null); }}
            className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {videoUrl && (
        <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-black">
          <video
            src={videoUrl}
            controls
            className="w-full max-h-64 object-contain"
            preload="metadata"
          />
        </div>
      )}

      {file && (
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Quality</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => setPreset(i)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all text-center ${
                  preset === i
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                }`}
              >
                <div>{p.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {outputSize !== null && file && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
          Original: <span className="font-medium text-gray-900">{formatBytes(file.size)}</span>
          {" → "}
          Compressed: <span className="font-medium text-green-600">{formatBytes(outputSize)}</span>
          <span className="ml-2 text-green-600 font-medium">
            ({Math.round((1 - outputSize / file.size) * 100)}% smaller)
          </span>
        </div>
      )}

      <FfmpegStatus
        status={status}
        progress={progress}
        loadingLabel="Loading ffmpeg (first time ~5 seconds)..."
        processingLabel="Compressing video..."
        doneLabel="Video compressed and downloaded!"
      />

      <button
        onClick={handleCompress}
        disabled={!file || isProcessing}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
      >
        {isProcessing ? "Processing..." : "Compress Video"}
      </button>
    </div>
  );
}
