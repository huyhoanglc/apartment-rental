"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Link } from "@/i18n/navigation";

interface DistrictSliderItem {
  district: string;
  statLabel: string;
}

interface DistrictSliderProps {
  items: DistrictSliderItem[];
}

const AUTO_SCROLL_SPEED = 0.6;

export default function DistrictSlider({ items }: DistrictSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const hoveringRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frameId: number;
    function step() {
      if (track && !draggingRef.current && !hoveringRef.current) {
        const halfWidth = track.scrollWidth / 2;
        track.scrollLeft += AUTO_SCROLL_SPEED;
        if (track.scrollLeft >= halfWidth) track.scrollLeft -= halfWidth;
      }
      frameId = requestAnimationFrame(step);
    }
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, []);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track) return;
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startScrollLeftRef.current = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !draggingRef.current) return;
    track.scrollLeft = startScrollLeftRef.current - (e.clientX - startXRef.current);
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    trackRef.current?.releasePointerCapture(e.pointerId);
  }

  // Nhân đôi danh sách để cuộn vô tận: khi chạy hết nửa đầu (scrollWidth / 2)
  // thì lùi lại đúng bằng đó, nửa sau giống hệt nửa đầu nên liền mạch không giật.
  const loopItems = [...items, ...items];

  return (
    <div
      ref={trackRef}
      className="no-scrollbar flex cursor-grab gap-3 overflow-x-auto select-none active:cursor-grabbing"
      style={{ touchAction: "pan-y" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onMouseEnter={() => (hoveringRef.current = true)}
      onMouseLeave={() => (hoveringRef.current = false)}
    >
      {loopItems.map(({ district, statLabel }, i) => (
        <Link
          key={`${district}-${i}`}
          href={{ pathname: "/", query: { district }, hash: "listings" }}
          draggable={false}
          className="flex w-36 shrink-0 flex-col items-center justify-center gap-1 rounded-xl2 border border-border bg-background px-4 py-4 text-center transition hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/40"
        >
          <span className="text-sm font-medium text-foreground hover:text-primary-700 dark:hover:text-primary-300">
            {district}
          </span>
          <span className="text-xs text-muted-foreground">{statLabel}</span>
        </Link>
      ))}
    </div>
  );
}
