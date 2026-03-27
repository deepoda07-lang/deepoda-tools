"use client";

interface Props {
  status: "idle" | "loading" | "processing" | "done" | "error";
  progress: number;
  loadingLabel?: string;
  processingLabel?: string;
  doneLabel?: string;
  errorLabel?: string;
}

export default function FfmpegStatus({
  status,
  progress,
  loadingLabel = "Loading ffmpeg...",
  processingLabel = "Processing...",
  doneLabel = "Done! File downloaded.",
  errorLabel = "An error occurred. Please try again.",
}: Props) {
  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center gap-3">
        <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        {loadingLabel}
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{processingLabel}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.max(progress, 3)}%` }}
          />
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
        ✅ {doneLabel}
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      ❌ {errorLabel}
    </div>
  );
}
