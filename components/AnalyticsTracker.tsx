'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const visitorIdRef = useRef<string | null>(null);
  const lastPathRef = useRef<string | null>(null);

  // Track visitor on mount
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'visitor',
            data: {
              userAgent: navigator.userAgent,
            },
          }),
        });
        const result = await response.json();
        if (result.visitorId) {
          visitorIdRef.current = result.visitorId;
          // Track initial page view
          trackPageView(pathname);
        }
      } catch (error) {
        console.error('Failed to track visitor:', error);
      }
    };

    trackVisitor();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (pathname && pathname !== lastPathRef.current) {
      lastPathRef.current = pathname;
      if (visitorIdRef.current) {
        trackPageView(pathname);
      }
    }
  }, [pathname]);

  const trackPageView = async (path: string) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'page_view',
          data: {
            path,
            referrer: document.referrer || undefined,
            visitorId: visitorIdRef.current,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  };

  return null;
}
