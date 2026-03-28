"use client";
import { useCallback } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { useDictionary } from "./DictionaryProvider";

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: Accept;
  multiple?: boolean;
  label?: string;
}

export default function FileDropzone({
  onFiles,
  accept,
  multiple = true,
  label,
}: FileDropzoneProps) {
  const dict = useDictionary();
  const displayLabel = label ?? dict.common.dropDefault;

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length) onFiles(accepted);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <span className="text-4xl">{isDragActive ? "📂" : "📁"}</span>
        <p className="text-gray-600 font-medium">{displayLabel}</p>
        <p className="text-sm text-gray-400">{dict.common.browseFiles}</p>
      </div>
    </div>
  );
}
