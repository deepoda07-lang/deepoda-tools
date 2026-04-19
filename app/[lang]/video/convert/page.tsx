"use client";
import { useState, useCallback, useEffect } from "react";
import FileDropzone from "@/components/FileDropzone";
import FfmpegStatus from "@/components/FfmpegStatus";
import { formatBytes } from "@/lib/ffmpeg-utils";
import { X } from "lucide-react";

const FORMATS = [
  { label: "MP4",  ext: ".mp4",  mime: "video/mp4",  args: ["-vcodec", "libx264", "-acodec", "aac"] },
  { label: "WEBM", ext: ".webm", mime: "video/webm", args: ["-vcodec", "libvpx-vp9", "-acodec", "libopus"] },
  { label: "AVI",  ext: ".avi",  mime: "video/x-msvideo", args: ["-vcodec", "mpeg4", "-acodec", "mp3"] },
  { label: "MOV",  ext: ".mov",  mime: "video/quicktime", args: ["-vcodec", "libx264", "-acodec", "aac"] },
  { label: "MKV",  ext: ".mkv",  mime: "video/x-matroska", args: ["-vcodec", "libx264", "-acodec", "aac"] },
];

export default function VideoConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState(0);
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

      const inputExt = file.name.slice(file.name.lastIndexOf(".")) || ".mp4";
      const fmt = FORMATS[targetFormat];
      const inputName = "input" + inputExt;
      const outputName = "output" + fmt.ext;

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(["-i", inputName, ...fmt.args, outputName]);
      const data = await ffmpeg.readFile(outputName) as Uint8Array<ArrayBuffer>;
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      const blob = new Blob([data], { type: fmt.mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.[^.]+$/, fmt.ext);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Convert Video</h1>
      <p className="text-gray-500 mb-2">Convert between video formats.</p>
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
          <div className="mt-4 flex items-center justify-between p-3 bg-white border rounded-lg text-sm">
            <span className="text-gray-700 truncate">🎬 {file.name} <span className="text-gray-400 ml-1">({formatBytes(file.size)})</span></span>
            <button onClick={() => { setFile(null); setStatus("idle"); }} className="ml-2 text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
          </div>

          {videoUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-black">
              <video
                src={videoUrl}
                controls
                className="w-full max-h-64 object-contain"
                preload="metadata"
              />
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Target Format</p>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f, i) => (
                <button key={i} onClick={() => setTargetFormat(i)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${targetFormat === i ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <FfmpegStatus status={status} progress={progress} loadingLabel="Loading ffmpeg..." processingLabel="Converting video..." doneLabel="Video converted and downloaded!" />

      <button onClick={handleConvert} disabled={!file || status === "loading" || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors">
        {status === "loading" || status === "processing" ? "Processing..." : `Convert to ${FORMATS[targetFormat].label}`}
      </button>
    </div>
  );
}
