import Link from "next/link";

import type { PageLink } from "../../_lib/page-link";
import { SidebarPageLink } from "../../_components/sidebar-page-link";

/** 왼쪽 사이드바 — 페이지 한 단계. 목록은 레이아웃이 빌드 때 만들어 넘긴다. */
export function Sidebar({ pages }: { pages: PageLink[] }) {
  return (
    <nav className="space-y-4 text-sm">
      <Link href="/docs/broadcast-system" className="block font-bold">
        방송 시스템
      </Link>
      <ul className="space-y-1">
        {pages.map((page) => (
          <li key={page.href}>
            <SidebarPageLink page={page} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
