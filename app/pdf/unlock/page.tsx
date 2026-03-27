"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";
import ProgressBar from "@/components/ProgressBar";
import { unlockPDF, downloadBlob } from "@/lib/pdf-utils";
import { LockOpen } from "lucide-react";

export default function PDFUnlockPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error" | "wrong-password">("idle");
  const [progress, setProgress] = useState(0);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setStatus("idle");
  }, []);

  const handleUnlock = async () => {
    if (!file || !password) return;
    setStatus("processing");
    setProgress(40);
    try {
      const result = await unlockPDF(file, password);
      setProgress(100);
      const name = file.name.replace(/\.pdf$/i, "") + "-unlocked.pdf";
      downloadBlob(result, name);
      setStatus("done");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("decrypt")) {
        setStatus("wrong-password");
      } else {
        setStatus("error");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Unlock PDF</h1>
      <p className="text-gray-500 mb-2">Remove password protection from a PDF file.</p>
      <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-6">
        All processing happens in your browser. Your files are never sent to a server.
      </p>

      <FileDropzone
        onFiles={handleFiles}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label="Drag password-protected PDF here"
      />

      {file && (
        <div className="mt-4 p-3 bg-white border rounded-lg text-sm text-gray-700">
          Selected: <span className="font-medium">{file.name}</span>
        </div>
      )}

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PDF Password
        </label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (status === "wrong-password") setStatus("idle"); }}
            placeholder="Enter PDF password"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16"
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
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

      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm">
        <LockOpen className="inline w-4 h-4 mr-1 mb-0.5" />
        You must know the current password to unlock the PDF. This tool does not bypass passwords.
      </div>

      {status === "processing" && (
        <div className="mt-4">
          <ProgressBar value={progress} label="Unlocking..." />
        </div>
      )}

      {status === "done" && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          PDF unlocked and downloaded!
        </div>
      )}

      {status === "wrong-password" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Incorrect password. Please try again.
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          An error occurred. Make sure the file is a valid password-protected PDF.
        </div>
      )}

      <button
        onClick={handleUnlock}
        disabled={!file || !password || status === "processing"}
        className="mt-6 w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors"
      >
        {status === "processing" ? "Unlocking..." : "Unlock PDF"}
      </button>
    </div>
  );
}
