import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import Breadcrumb from "@/components/Breadcrumb";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Video Tools – Free Online Video Operations",
  description: "Compress, trim, convert video, extract MP3, create GIFs and more. 8 free tools, runs in your browser.",
};

const tools = [
  { title: "Compress Video", description: "Shrink video files without losing quality.",           href: "/video/compress", icon: "🗜️", badge: "Popular" },
  { title: "Trim Video",     description: "Cut any portion of your video and download it.",       href: "/video/trim",     icon: "✂️" },
  { title: "Video → MP3",   description: "Extract audio from video and download as MP3.",        href: "/video/to-mp3",   icon: "🎵", badge: "Popular" },
  { title: "Convert Video",  description: "Switch format between MP4, WEBM, AVI, MOV.",         href: "/video/convert",  icon: "🔄" },
  { title: "Video → GIF",   description: "Convert a video clip into an animated GIF.",           href: "/video/to-gif",   icon: "🎞️" },
  { title: "Merge Videos",   description: "Join multiple video files into one.",                  href: "/video/merge",    icon: "🔗" },
  { title: "Mute Video",     description: "Remove all audio from a video file.",                  href: "/video/mute",     icon: "🔇" },
  { title: "Rotate Video",   description: "Rotate or flip your video 90°, 180°.",               href: "/video/rotate",   icon: "🔃" },
];

export default function VideoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: "Video Tools" }]} />

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🎬</span>
          <h1 className="text-3xl font-bold text-gray-900">Video Tools</h1>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {tools.length} tools
          </span>
        </div>
        <p className="text-gray-500 max-w-xl">
          Edit, convert, and optimize your video files.
          All processing in your browser — files never leave your device.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {tools.map((t) => <ToolCard key={t.href} {...t} />)}
      </div>

      <div className="border-t pt-8">
        <p className="text-sm text-gray-500 mb-4 font-medium">Other categories</p>
        <div className="flex flex-wrap gap-3">
          <a href="/pdf" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            📄 PDF Tools <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a href="/image" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            🖼️ Image Tools <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a href="/convert" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            🔄 Convert Tools <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
