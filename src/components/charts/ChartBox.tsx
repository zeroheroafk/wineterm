"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The box a chart draws in, at its final height from the first paint, so
 * nothing moves when the chart lands. Its plot renders once the box comes
 * near the screen: a page of charts draws only those the reader reaches,
 * and loads the chart library only then.
 */
export function ChartBox({ height, children }: { height: number; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} style={{ height }} className="w-full">
      {near ? children : null}
    </div>
  );
}
