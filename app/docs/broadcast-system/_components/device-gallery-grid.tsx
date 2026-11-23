"use client";

import * as React from "react";

import type { ViewKey } from "../_lib/device-figure";
import type { FigureSvgs } from "../_lib/device-figure-files";
import { OPEN_DEVICE_FIGURE } from "../_lib/device-figure-ids";

export interface GalleryItem {
  id: string;
  /** 같은 그림을 쓰는 다른 장비 id */
  also: string[];
  model: string;
  src: string;
  view: { key: ViewKey; width: number; height: number; label: string };
}

/** 카드 하나. 화면에 들어오면 그림 파일을 받아 앞모습을 그린다 */
function GalleryCard({ item }: { item: GalleryItem }) {
  const ref = React.useRef<HTMLButtonElement | null>(null);
  const [svg, setSvg] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let cancelled = false;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      fetch(item.src)
        .then((response) => {
          if (!response.ok) throw new Error(`${response.status} ${item.src}`);
          return response.json() as Promise<FigureSvgs>;
        })
        .then((svgs) => !cancelled && setSvg(svgs[item.view.key] ?? null))
        .catch(() => !cancelled && setFailed(true));
    }, { rootMargin: "200px" });
    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [item.src, item.view.key]);

  return (
    <li>
      <button ref={ref} type="button" className="gallery-card" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_DEVICE_FIGURE, { detail: item.id }))}>
        <span className="gallery-art" aria-busy={svg === null && !failed}>
          {svg !== null ? (
            <svg className="iso-svg" viewBox={`0 0 ${item.view.width} ${item.view.height}`} role="img" aria-label={item.view.label} focusable="false">
              <g dangerouslySetInnerHTML={{ __html: svg }} />
            </svg>
          ) : (
            <span className="gallery-wait">{failed ? "그림을 받지 못했다" : "그림을 받는 중"}</span>
          )}
        </span>
        <span className="gallery-name">{item.id}</span>
        <span className="gallery-model">{item.model}</span>
        {item.also.length > 0 ? <span className="gallery-also">같은 모델: {item.also.join(", ")}</span> : null}
      </button>
    </li>
  );
}

export function DeviceGalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <ul className="iso gallery-grid">
      {items.map((item) => (
        <GalleryCard key={item.id} item={item} />
      ))}
    </ul>
  );
}
