"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { PageLink } from "../_lib/page-link";

/**
 * 사이드바의 페이지 링크 하나. 지금 보는 페이지면 강조하고 `aria-current`를 단다. 주소를
 * 읽어야 하므로 클라이언트 컴포넌트다.
 */
export function SidebarPageLink({ page }: { page: PageLink }) {
  const current = usePathname() === page.href;

  return (
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
  );
}
