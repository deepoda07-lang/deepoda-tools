"use client";
import { useState, useCallback, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import FfmpegStatus from "@/components/FfmpegStatus";
import { formatBytes } from "@/lib/ffmpeg-utils";
import { X } from "lucide-react";

const QUALITY_OPTIONS = [
  { label: "320 kbps", bitrate: "320k", desc: "Highest quality" },
  { label: "192 kbps", bitrate: "192k", desc: "Recommended" },
  { label: "128 kbps", bitrate: "128k", desc: "Smaller size" },
];

export default function VideoToMp3Page() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setVideoUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFiles = useCallback((files: File[]) => {
    if (files[0]) { setFile(files[0]); setStatus("idle"); }
  }, []);

  const handleConvert = async () => {
    if (!file) return;
    setStatus("loading");
    setProgress(0);
    try {
      const { getFFmpeg, fetchFile } = await import("@/lib/ffmpeg-utils");
      const ffmpeg = await getFFmpeg((p) => { setProgress(p); setStatus("processing"); });

      const ext = file.name.slice(file.name.lastIndexOf(".")) || ".mp4";
      const inputName = "input" + ext;
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(["-i", inputName, "-vn", "-acodec", "libmp3lame", "-b:a", QUALITY_OPTIONS[quality].bitrate, "output.mp3"]);
      const data = await ffmpeg.readFile("output.mp3") as Uint8Array<ArrayBuffer>;
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile("output.mp3");

      const blob = new Blob([data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.[^.]+$/, ".mp3");
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Video → MP3</h1>
      <p className="text-gray-500 mb-2">Extract audio from a video and download it as MP3.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your videos are never sent to a server.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "video/*": [".mp4", ".mov", ".webm", ".avi", ".mkv"] }}
        label="Drag video file here"
      />

      {file && (
        <>
          <div className="mt-4 flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg text-sm">
            <span className="text-gray-700 truncate">🎬 {file.name} <span className="text-gray-400 ml-1">({formatBytes(file.size)})</span></span>
            <button onClick={() => { setFile(null); setStatus("idle"); }} className="ml-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
          </div>

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

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">MP3 Quality</p>
            <div className="grid grid-cols-3 gap-2">
              {QUALITY_OPTIONS.map((q, i) => (
                <button key={i} onClick={() => setQuality(i)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all text-center ${quality === i ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  <div>{q.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{q.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <FfmpegStatus status={status} progress={progress} loadingLabel="Loading ffmpeg..." processingLabel="Extracting audio..." doneLabel="MP3 created and downloaded!" />

      <button onClick={handleConvert} disabled={!file || status === "loading" || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
        {status === "loading" || status === "processing" ? "Processing..." : "Convert to MP3"}
      </button>
    </div>
  );
}
