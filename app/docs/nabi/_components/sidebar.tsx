"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ChapterNav } from "../_lib/pages";

/**
 * 왼쪽 사이드바 — Chapter → 절. 문서 안 탐색은 이것 하나다. Chapter 이름은 그 Chapter 첫
 * 페이지로 간다.
 *
 * 목록은 레이아웃이 빌드 때 만들어 넘긴다. 여기서는 지금 보는 절을 표시하려고 주소만 읽으므로
 * 클라이언트 컴포넌트다.
 */
export function Sidebar({ nav }: { nav: ChapterNav[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6 text-sm">
      <Link href="/docs/nabi" className="block font-bold">
        NABI 매뉴얼
      </Link>
      {nav.map((chapter) => (
        <section key={chapter.key}>
          <h2>
            <Link
              href={chapter.href}
              aria-current={pathname === chapter.href ? "page" : undefined}
              className={
                pathname === chapter.href
                  ? "font-semibold text-neutral-900"
                  : "font-semibold text-neutral-500 hover:text-neutral-900"
              }
            >
              {chapter.title}
            </Link>
          </h2>
          <ul className="mt-2 space-y-1">
            {chapter.pages.map((page) => {
              const current = pathname === page.href;
              return (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    aria-current={current ? "page" : undefined}
                    className={
                      current
                        ? "block rounded px-2 py-1 font-semibold text-neutral-900 bg-neutral-200"
                        : "block rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100"
                    }
                  >
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </nav>
  );
}
