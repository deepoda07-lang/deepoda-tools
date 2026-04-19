"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import FfmpegStatus from "@/components/FfmpegStatus";
import { formatBytes } from "@/lib/ffmpeg-utils";
import { X, GripVertical, Film } from "lucide-react";

export default function VideoMergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setStatus("idle");
  }, []);

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const moveUp = (i: number) => {
    if (i === 0) return;
    setFiles((prev) => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setStatus("loading");
    setProgress(0);
    try {
      const { getFFmpeg, fetchFile } = await import("@/lib/ffmpeg-utils");
      const ffmpeg = await getFFmpeg((p) => { setProgress(p); setStatus("processing"); });

      // Write all input files
      const inputNames: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const name = `input${i}.mp4`;
        await ffmpeg.writeFile(name, await fetchFile(files[i]));
        inputNames.push(name);
      }

      // Create concat list
      const concatContent = inputNames.map((n) => `file '${n}'`).join("\n");
      await ffmpeg.writeFile("concat.txt", new TextEncoder().encode(concatContent));

      await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "concat.txt", "-c", "copy", "output.mp4"]);
      const data = await ffmpeg.readFile("output.mp4") as Uint8Array<ArrayBuffer>;

      for (const n of inputNames) await ffmpeg.deleteFile(n);
      await ffmpeg.deleteFile("concat.txt");
      await ffmpeg.deleteFile("output.mp4");

      const blob = new Blob([data], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged_video.mp4";
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Merge Videos</h1>
      <p className="text-gray-500 mb-2">Combine multiple videos in sequence.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your videos are never sent to a server.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "video/*": [".mp4", ".mov", ".webm"] }}
        multiple
        label="Drag video files here (at least 2)"
      />

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-white border rounded-lg text-sm">
              <span className="text-gray-300 cursor-pointer hover:text-gray-500" onClick={() => moveUp(i)}>
                <GripVertical className="w-4 h-4" />
              </span>
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <div className="w-10 h-10 rounded-md bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0">
                <Film className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 truncate font-medium">{f.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatBytes(f.size)}</p>
              </div>
              <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 shrink-0"><X className="w-4 h-4" /></button>
            </div>
          ))}
          <p className="text-xs text-gray-400">{files.length} file(s) — click the grip icon to reorder</p>
        </div>
      )}

      <FfmpegStatus status={status} progress={progress} loadingLabel="Loading ffmpeg..." processingLabel="Merging videos..." doneLabel="Videos merged and downloaded!" />

      <button onClick={handleMerge} disabled={files.length < 2 || status === "loading" || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors">
        {status === "loading" || status === "processing" ? "Processing..." : `Merge ${files.length} Video${files.length > 1 ? "s" : ""}`}
      </button>
    </div>
  );
}
