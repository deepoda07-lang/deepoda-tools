"use client";
import { useState, useCallback, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import FfmpegStatus from "@/components/FfmpegStatus";
import { formatBytes } from "@/lib/ffmpeg-utils";
import { X } from "lucide-react";

export default function VideoMutePage() {
  const [file, setFile] = useState<File | null>(null);
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

  const handleMute = async () => {
    if (!file) return;
    setStatus("loading");
    setProgress(0);
    const { getFFmpeg, fetchFile } = await import("@/lib/ffmpeg-utils");
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ".mp4";
    const inputName = "input" + ext;
    const outputName = "output" + ext;
    try {
      const ffmpeg = await getFFmpeg((p) => { setProgress(p); setStatus("processing"); });
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(["-i", inputName, "-an", "-vcodec", "copy", outputName]);
      const data = await ffmpeg.readFile(outputName) as Uint8Array;
      ffmpeg.deleteFile(inputName).catch(() => {});
      ffmpeg.deleteFile(outputName).catch(() => {});

      const blob = new Blob([data], { type: file.type || "video/mp4" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.name.replace(/\.[^.]+$/, "_muted" + ext);
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mute Video</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-2">Completely remove audio from a video file.</p>
      <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your videos are never sent to a server.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "video/*": [".mp4", ".mov", ".webm", ".avi", ".mkv"] }}
        label="Drag video file here"
      />

      {file && (
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
      )}

      {videoUrl && (
        <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-black">
          <video src={videoUrl} controls className="w-full max-h-64 object-contain" preload="metadata" />
        </div>
      )}

      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg text-amber-700 dark:text-amber-400 text-sm">
        🔇 This operation permanently removes the audio track from the video.
      </div>

      <FfmpegStatus
        status={status}
        progress={progress}
        loadingLabel="Loading ffmpeg..."
        processingLabel="Removing audio..."
        doneLabel="Audio removed, video downloaded!"
      />

      <button
        onClick={handleMute}
        disabled={!file || isProcessing}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
      >
        {isProcessing ? "Processing..." : "Remove Audio"}
      </button>
    </div>
  );
}
