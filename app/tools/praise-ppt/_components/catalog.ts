import { useEffect, useState } from "react";

import { CATALOG_URL, parseCatalog, type CatalogEntry } from "../_lib/song";

/** 곡 목록 불러오기 상태. 성공하면 곡 목록 순서 그대로의 곡이 있다. */
export type Catalog =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; songs: CatalogEntry[] };

/**
 * 페이지가 열린 뒤 곡 목록 JSON을 받는다. JS 번들에 넣지 않는다. 파일이 없거나(404) 모양이
 * 틀려도 "실패"일 뿐 페이지는 그대로 돈다.
 */
export function useCatalog(): Catalog {
  const [catalog, setCatalog] = useState<Catalog>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    (async () => {
      let next: Catalog = { status: "error" };
      try {
        const response = await fetch(CATALOG_URL);
        const songs = response.ok ? parseCatalog(await response.json()) : null;
        if (songs) next = { status: "success", songs };
      } catch {
        // 네트워크 오류, 깨진 JSON — 실패로 둔다
      }
      if (alive) setCatalog(next);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return catalog;
}
