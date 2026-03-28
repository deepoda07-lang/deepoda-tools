"use client";
import { useState } from "react";
import { Copy, Check, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function JsonFormatPage() {
  const dict = useDictionary();
  const d = dict.t.convJsonFormat;
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "valid" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  function format() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setStatus("valid");
      setErrorMsg("");
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : d.errorInvalid);
      setOutput("");
    }
  }

  function minify() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setStatus("valid");
      setErrorMsg("");
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : d.errorInvalid);
      setOutput("");
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function clear() {
    setInput("");
    setOutput("");
    setStatus("idle");
    setErrorMsg("");
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{d.heading}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{d.sub}</p>
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Input</label>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setStatus("idle"); }}
            placeholder={d.inputPlaceholder}
            rows={8}
            spellCheck={false}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={format} disabled={!input.trim()} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
            {d.btnFormat}
          </button>
          <button onClick={minify} disabled={!input.trim()} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
            {d.btnMinify}
          </button>
          <button onClick={clear} className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" /> {d.btnClear}
          </button>
          {status === "valid" && (
            <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" /> {d.valid}
            </span>
          )}
          {status === "error" && (
            <span className="inline-flex items-center gap-1.5 text-sm text-red-500">
              <XCircle className="w-4 h-4" /> {errorMsg}
            </span>
          )}
        </div>

        {/* Output */}
        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Output</label>
              <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? d.copied : d.btnCopy}
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              rows={10}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono resize-none select-all"
            />
          </div>
        )}
      </div>
    </div>
  );
}
