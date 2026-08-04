"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";

/**
 * **문이 열리는 자리.** 이 조각이 지는 일은 셋뿐이다 — 검색창을 그리고, `Ctrl+K`를 듣고,
 * 무거운 쪽을 `import()`한다.
 *
 * 나머지 전부(엔진 `minisearch` · 색인 · 모달 · 하이라이트)가 저 `import()` 뒤에 있다.
 * **검색을 안 쓰는 방문에서는 그 바이트가 하나도 안 내려간다** — 사이드바에 검색창이 있다는
 * 이유로 급할 때 여는 페이지가 무거워지면 안 된다(사용자 스토리 8·56).
 */
const load = () => import("./search-modal");
const SearchModal = lazy(load);

export function SearchBox() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // `Ctrl+K`가 관례다. 손이 마우스로 안 가는 것이 이 단축키가 사는 이유다(사용자 스토리 5)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        // 포커스하거나 마우스가 얹히는 **순간** 무거운 쪽이 내려오기 시작한다. 여는 것은
        // 클릭이고 내려받는 것은 그 앞이라, 눌렀을 때는 이미 와 있다
        onFocus={() => void load()}
        onPointerEnter={() => void load()}
        onClick={() => setOpen(true)}
        className="mb-5 flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50"
      >
        <span>검색…</span>
        <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-sans text-[11px] text-neutral-400">
          Ctrl K
        </kbd>
      </button>

      {open && (
        <Suspense fallback={null}>
          <SearchModal
            onClose={(navigated) => {
              setOpen(false);
              // 닫고 나면 손이 검색창 위에 있다. `Ctrl+K`로 연 경우 `<dialog>`가 되돌릴 자리가
              // 없어서(열기 전 포커스가 본문에 있었다) 여기서 직접 돌려준다.
              // **결과를 골라 나간 경우는 안 돌린다** — 그때 손이 있어야 할 자리는 새 페이지다.
              // `preventScroll` 없이 포커스하면 사이드바 맨 위가 화면에 끌려 들어오면서
              // **읽던 자리가 통째로 날아간다** — 헤드리스로 확인한, 이 티켓의 요구 하나가
              // 조용히 깨지는 자리다(*"Esc로 닫히고 보던 자리로 돌아간다"*)
              if (!navigated) trigger.current?.focus({ preventScroll: true });
            }}
          />
        </Suspense>
      )}
    </>
  );
}
