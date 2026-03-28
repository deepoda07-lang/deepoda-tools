import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@imgly/background-removal", "onnxruntime-web"],
  async headers() {
    return [
      {
        // ffmpeg.wasm requires SharedArrayBuffer → COOP + COEP headers
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy",  value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;
