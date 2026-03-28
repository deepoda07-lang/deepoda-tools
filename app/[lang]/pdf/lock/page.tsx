"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { lockPDF, downloadBlob } from "@/lib/pdf-utils";
import { Lock } from "lucide-react";

export default function PDFLockPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
  }, []);

  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = !!file && password.length >= 4 && !mismatch;

  const handleLock = async () => {
    if (!canSubmit) return;
    setStatus("processing");
    setProgress(40);
    try {
      const result = await lockPDF(file!, password);
      setProgress(100);
      const name = file!.name.replace(/\.pdf$/i, "") + "-locked.pdf";
      downloadBlob(result, name);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Lock PDF</h1>
      <p className="text-gray-500 mb-2">Password-protect your PDF file with encryption.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your files are never sent to a server.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label="Drag PDF file here"
      />

      {file && (
        <div className="mt-4 p-3 bg-white border rounded-lg text-sm text-gray-700">
          Selected: <span className="font-medium">{file.name}</span>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-gray-400 font-normal">(min. 4 characters)</span>
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
          <input
            type={showPass ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
              mismatch
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {mismatch && (
            <p className="text-red-500 text-xs mt-1">Passwords do not match.</p>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
        <Lock className="inline w-4 h-4 mr-1 mb-0.5" />
        The PDF will require this password to open. Keep it safe — it cannot be recovered.
      </div>

      {status === "processing" && (
        <div className="mt-4">
          <ProgressBar value={progress} label="Encrypting..." />
        </div>
      )}

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          PDF locked and downloaded!
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          An error occurred. Please try again.
        </div>
      )}

      <button
        onClick={handleLock}
        disabled={!canSubmit || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "Encrypting..." : "Lock PDF"}
      </button>
    </div>
  );
}
