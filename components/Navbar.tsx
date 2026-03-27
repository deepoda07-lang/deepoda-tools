"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg text-blue-600">
          tools.deepoda
        </Link>
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span className="block w-5 h-0.5 bg-gray-600 mb-1" />
          <span className="block w-5 h-0.5 bg-gray-600 mb-1" />
          <span className="block w-5 h-0.5 bg-gray-600" />
        </button>
        <div
          className={`${
            open ? "flex" : "hidden"
          } md:flex absolute md:static top-14 left-0 w-full md:w-auto bg-white md:bg-transparent flex-col md:flex-row gap-1 md:gap-4 px-4 md:px-0 pb-4 md:pb-0 border-b md:border-0`}
        >
          <Link href="/pdf"     className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">PDF</Link>
          <Link href="/image"   className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">Image</Link>
          <Link href="/convert" className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">Convert</Link>
          <Link href="/video"   className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">Video</Link>
        </div>
      </div>
    </nav>
  );
}
