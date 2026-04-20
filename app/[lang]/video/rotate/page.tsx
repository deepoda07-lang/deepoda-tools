"use client";
import { useState, useCallback, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import FfmpegStatus from "@/components/FfmpegStatus";
import { formatBytes } from "@/lib/ffmpeg-utils";
import { X } from "lucide-react";

const ROTATIONS = [
  { label: "90° Right",       icon: "↻", vf: "transpose=1" },
  { label: "90° Left",        icon: "↺", vf: "transpose=2" },
  { label: "180°",            icon: "⤸", vf: "transpose=1,transpose=1" },
  { label: "Flip Horizontal", icon: "↔", vf: "hflip" },
  { label: "Flip Vertical",   icon: "↕", vf: "vflip" },
];

export default function VideoRotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setVideoUrl(null); return; }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFiles = useCallback((files: File[]) => {
    if (files[0]) { setFile(files[0]); setStatus("idle"); }
  }, []);

  const handleRotate = async () => {
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
      await ffmpeg.exec(["-i", inputName, "-vf", ROTATIONS[rotation].vf, "-metadata:s:v", "rotate=0", "-acodec", "copy", outputName]);
      const data = await ffmpeg.readFile(outputName) as Uint8Array;
      ffmpeg.deleteFile(inputName).catch(() => {});
      ffmpeg.deleteFile(outputName).catch(() => {});

      const blob = new Blob([data], { type: "video/mp4" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.name.replace(/\.[^.]+$/, "_rotated.mp4");
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Rotate Video</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-2">Rotate or flip a video horizontally or vertically.</p>
      <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your videos are never sent to a server.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "video/*": [".mp4", ".mov", ".webm", ".avi", ".mkv"] }}
        label="Drag video file here"
      />

      {file && (
        <>
          <div className="mt-4 flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <span className="text-gray-700 dark:text-gray-300 truncate">
              🎬 {file.name} <span className="text-gray-400 ml-1">({formatBytes(file.size)})</span>
            </span>
            <button
              onClick={() => { setFile(null); setStatus("idle"); }}
              className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {videoUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-black">
              <video src={videoUrl} controls className="w-full max-h-64 object-contain" preload="metadata" />
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rotation Option</p>
            <div className="grid grid-cols-5 gap-2">
              {ROTATIONS.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setRotation(i)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    rotation === i
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="text-xl mb-1">{r.icon}</div>
                  <div className="text-xs font-medium">{r.label}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <FfmpegStatus
        status={status}
        progress={progress}
        loadingLabel="Loading ffmpeg..."
        processingLabel="Rotating video..."
        doneLabel="Video rotated and downloaded!"
      />

      <button
        onClick={handleRotate}
        disabled={!file || isProcessing}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
      >
        {isProcessing ? "Processing..." : "Rotate Video"}
      </button>
    </div>
  );
}
