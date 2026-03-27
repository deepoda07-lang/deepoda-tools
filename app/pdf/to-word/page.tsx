"use client";
import { useState, useCallback } from "react";
import FileDropzone from "@/components/FileDropzone";

export default function PDFToWordPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF → Word</h1>
      <p className="text-gray-500 mb-8">
        Convert a PDF file to Word (.docx) format.
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

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
        <strong>Note:</strong> PDF → Word conversion requires server-side processing. This feature is coming soon.
      </div>

      <button
        disabled
        className="mt-6 w-full py-3 px-6 bg-gray-300 text-white font-semibold rounded-xl cursor-not-allowed"
      >
        Coming Soon
      </button>
    </div>
  );
}
