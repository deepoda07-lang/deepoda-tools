"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import FfmpegStatus from "@/components/FfmpegStatus";
import { formatTime } from "@/lib/ffmpeg-utils";
import { X } from "lucide-react";

export default function VideoToGifPage() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [gifDuration, setGifDuration] = useState(5);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);

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
      setGifDuration(Math.min(5, video.duration));
      URL.revokeObjectURL(url);
    };
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

      // palette approach for better GIF quality
      await ffmpeg.exec([
        "-ss", String(startSec), "-t", String(gifDuration),
        "-i", inputName,
        "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`,
        "palette.png",
      ]);
      await ffmpeg.exec([
        "-ss", String(startSec), "-t", String(gifDuration),
        "-i", inputName,
        "-i", "palette.png",
        "-lavfi", `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
        "output.gif",
      ]);

      const data = await ffmpeg.readFile("output.gif") as Uint8Array<ArrayBuffer>;
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile("palette.png");
      await ffmpeg.deleteFile("output.gif");

      const blob = new Blob([data], { type: "image/gif" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.[^.]+$/, ".gif");
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Video → GIF</h1>
      <p className="text-gray-500 mb-2">Create an animated GIF from a video.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your videos are never sent to a server.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "video/*": [".mp4", ".mov", ".webm", ".avi"] }}
        label="Drag video file here"
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
                <span>Start time</span>
                <span className="text-blue-600 font-mono">{formatTime(startSec)}</span>
              </label>
              <input type="range" min={0} max={Math.max(0, duration - 1)} step={0.1} value={startSec}
                onChange={(e) => setStartSec(Number(e.target.value))}
                className="w-full mt-1 accent-blue-600" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex justify-between">
                <span>GIF duration</span>
                <span className="text-blue-600 font-mono">{gifDuration}s</span>
              </label>
              <input type="range" min={1} max={Math.min(15, duration)} step={0.5} value={gifDuration}
                onChange={(e) => setGifDuration(Number(e.target.value))}
                className="w-full mt-1 accent-blue-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  <span>FPS</span><span className="text-blue-600">{fps}</span>
                </label>
                <input type="range" min={5} max={20} step={1} value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="w-full mt-1 accent-blue-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  <span>Width</span><span className="text-blue-600">{width}px</span>
                </label>
                <input type="range" min={240} max={720} step={80} value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full mt-1 accent-blue-600" />
              </div>
            </div>
          </div>
        </>
      )}

      <FfmpegStatus status={status} progress={progress} loadingLabel="Loading ffmpeg..." processingLabel="Creating GIF..." doneLabel="GIF created and downloaded!" />

      <button onClick={handleConvert} disabled={!file || status === "loading" || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors">
        {status === "loading" || status === "processing" ? "Processing..." : "Create GIF"}
      </button>
    </div>
  );
}
