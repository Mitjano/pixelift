"use client";

import { useEffect, useRef } from "react";

interface BlogViewTrackerProps {
  slug: string;
}

export default function BlogViewTracker({ slug }: BlogViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (tracked.current) return;
    tracked.current = true;

    // Track view after a short delay to filter out bounces
    const timer = setTimeout(() => {
      fetch("/api/blog/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      }).catch(console.error);
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [slug]);

  return null;
}
