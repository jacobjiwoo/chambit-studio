"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

/** 헤더 메뉴. 도구와 문서 두 묶음으로 나눠 이름표를 붙인다. */
const GROUPS = [
  {
    label: "도구",
    links: [
      { href: "/subtitle-extractor", label: "자막 추출기" },
      { href: "/tools/praise-ppt", label: "찬양 PPT" },
    ],
  },
  {
    label: "문서",
    links: [
      { href: "/docs/nabi", label: "NABI 매뉴얼" },
      { href: "/docs/broadcast-system", label: "방송 시스템" },
    ],
  },
];

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 사이트 헤더. 모든 페이지 위에 붙는다.
 *
 * sticky로 두지 않는다. 찬양 PPT의 도구 막대와 문서 사이드바가 이미 `top-0`에 붙으므로,
 * 헤더까지 붙으면 위치를 서로 맞춰야 한다. 스크롤하면 사라지는 편이 단순하다.
 *
 * 높이는 `h-16`(4rem)이다. 자막 추출기가 화면을 꽉 채울 때 이 값을 뺀다.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // 페이지를 옮기면 모바일 메뉴를 닫는다. 렌더 중에 이전 경로와 비교해 바로 맞춘다
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 md:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 text-[17px] font-bold">
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-lg bg-neutral-900 text-sm text-white"
          >
            참
          </span>
          참빛 스튜디오
        </Link>

        <nav aria-label="주 메뉴" className="hidden items-center gap-1 text-[15px] md:flex">
          {GROUPS.map((group, i) => (
            <div key={group.label} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden="true" className="mx-3 h-5 w-px bg-neutral-200" />}
              <span className="px-2 text-xs text-neutral-500">{group.label}</span>
              {group.links.map((link) => {
                const current = isCurrent(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    className={`rounded-lg px-3 py-2.5 hover:bg-neutral-100 ${current ? "bg-neutral-100 font-bold" : ""}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="site-menu"
          className="-mr-2 flex size-11 items-center justify-center rounded-lg hover:bg-neutral-100 md:hidden"
        >
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="site-menu"
          aria-label="주 메뉴"
          className="flex flex-col border-t border-neutral-200 px-4 pt-3 pb-5 md:hidden"
        >
          {GROUPS.map((group, i) => (
            <div key={group.label} className="flex flex-col">
              <span className={`pb-1 text-xs text-neutral-500 ${i > 0 ? "pt-4" : "pt-2"}`}>
                {group.label}
              </span>
              {group.links.map((link) => {
                const current = isCurrent(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    className={`py-3 ${current ? "font-bold" : ""}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
