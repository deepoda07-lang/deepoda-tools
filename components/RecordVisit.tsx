"use client";
import { useEffect } from "react";

interface Props {
  href: string;
  title: string;
  icon: string;
}

const STORAGE_KEY = "deepoda_recent";
const MAX_ITEMS = 5;

export default function RecordVisit({ href, title, icon }: Props) {
  useEffect(() => {
    try {
      const existing: { href: string; title: string; icon: string }[] =
        JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      const filtered = existing.filter((item) => item.href !== href);
      const updated = [{ href, title, icon }, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage may be unavailable
    }
  }, [href, title, icon]);

  return null;
}
