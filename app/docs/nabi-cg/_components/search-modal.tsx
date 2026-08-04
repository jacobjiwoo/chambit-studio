"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { INDEX_URL, loadIndex, type DocSearch } from "../_lib/search";

/**
 * **S2 — 화면 가운데 모달.** 관례를 따랐고, 손에 익은 것이 사고 없이 열린다.
 *
 * 대가는 기록해 둔다 — 나비CG와 브라우저가 모니터 한 대를 나눠 쓰는 중이라 **검색을 열면
 * 본문이 덮인다.** 그 대신 사이드바가 끝까지 발견 전용으로 남아 층위(찾기 · 발견)가 화면에서도
 * 안 섞인다. `Esc` 한 번이면 보던 자리로 돌아온다.
 *
 * 포커스 트랩 · 배경 비활성 · `Esc` · 포커스 복귀는 **브라우저의 `<dialog>`가 이미 하는 일**이라
 * 직접 짜지 않는다. 우리가 더 얹는 것은 스크롤 잠금 하나뿐이다.
 *
 * 이 파일과 여기서 끌어오는 것 전부가 `import()` 뒤에 있다 — 검색을 연 사람만 받는다.
 */
export default function SearchModal({ onClose }: { onClose: (navigated: boolean) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const navigated = useRef(false);
  const router = useRouter();

  const [search, setSearch] = useState<DocSearch | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  // 마우스를 결과 위로 옮기기만 해도 다시 그려지므로, 질의가 그대로면 다시 찾지 않는다
  const hits = useMemo(() => (search ? search.find(query) : []), [search, query]);

  useEffect(() => {
    dialog.current?.showModal();

    // `<dialog>`는 뒤 화면을 비활성화하지만 스크롤까지 막지는 않는다
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    fetch(INDEX_URL)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.text();
      })
      .then((json) => alive && setSearch(loadIndex(json)))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  /**
   * **닫는 문은 하나다.** 결과를 골라 나가는 길이 마우스·키보드 둘이라, 각자 닫으면 한쪽만
   * "골라서 나갔다"를 남기고 다른 쪽은 흘린다 — 그러면 포커스가 엉뚱한 데로 돌아간다.
   */
  const close = (chose: boolean) => {
    navigated.current = chose;
    dialog.current?.close();
  };

  return (
    <dialog
      ref={dialog}
      aria-modal="true"
      aria-label="문서 검색"
      // `Esc`(cancel)로 닫히든 결과를 골라 닫히든 한 자리로 모인다
      onClose={() => onClose(navigated.current)}
      onClick={(event) => {
        // 배경(`::backdrop`)을 누르면 `<dialog>` 자신이 클릭 대상이 된다
        if (event.target === dialog.current) close(false);
      }}
      // `mx-auto`가 필요한 이유 — 브라우저 기본 스타일이 `<dialog>`를 `margin:auto`로 가운데
      // 세우는데 Tailwind preflight가 그 마진을 0으로 지운다. 그대로 두면 왼쪽 위에 붙는다
      className="mx-auto mt-[12vh] w-[min(44rem,calc(100vw-2rem))] rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-neutral-900/30"
    >
      <input
        autoFocus
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((at) => Math.min(at + 1, hits.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((at) => Math.max(at - 1, 0));
          } else if (event.key === "Enter" && hits[active]) {
            event.preventDefault();
            close(true);
            router.push(hits[active].href);
          }
        }}
        placeholder="화면에 보이는 이름을 그대로 — 자간, Kerning, Ctrl+H…"
        aria-label="검색어"
        className="w-full border-b border-neutral-200 px-4 py-3.5 text-base outline-none placeholder:text-neutral-400"
      />

      <div className="max-h-[min(24rem,60vh)] overflow-auto p-1.5">
        {failed ? (
          <Empty>색인을 못 불러왔습니다. 새로고침한 뒤 다시 열어 보세요.</Empty>
        ) : !query.trim() ? (
          <Empty>기능 이름이나 단축키를 치세요.</Empty>
        ) : hits.length === 0 ? (
          <Empty>걸리는 게 없습니다. 화면에 보이는 이름으로 쳐 보세요.</Empty>
        ) : (
          hits.map((hit, at) => (
            <Link
              key={hit.href}
              href={hit.href}
              onClick={() => close(true)}
              onPointerEnter={() => setActive(at)}
              aria-current={at === active ? "true" : undefined}
              className={`block rounded-lg px-3 py-2 ${at === active ? "bg-neutral-100" : ""}`}
            >
              {/* 결과 한 줄 = `섹션 › 소제목` + 매치 문맥. 여덟 줄 중 하나를 고르려면
                  *"왜 이게 걸렸는가"*가 줄 안에 보여야 한다 */}
              <span className="block text-sm font-semibold">
                {hit.section}
                {hit.heading && <span className="text-neutral-400"> › </span>}
                {hit.heading}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-neutral-500">
                {hit.context.map((part, i) => (
                  <Fragment key={i}>
                    {part.hit ? (
                      <mark className="bg-amber-100 font-semibold text-amber-900">{part.text}</mark>
                    ) : (
                      part.text
                    )}
                  </Fragment>
                ))}
              </span>
            </Link>
          ))
        )}
      </div>

      <p className="border-t border-neutral-200 px-4 py-2 text-[11px] text-neutral-400">
        ↑↓ 이동 · Enter 열기 · Esc 닫기
      </p>
    </dialog>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-3 py-2 text-xs text-neutral-500">{children}</p>;
}
