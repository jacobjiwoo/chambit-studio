import type { Metadata } from "next";

import { Sidebar } from "./_components/sidebar";
import { loadNav } from "./_lib/pages";

export const metadata: Metadata = {
  title: { template: "%s — NABI 매뉴얼", default: "NABI 매뉴얼" },
};

/**
 * NABI 매뉴얼 — 사이드바와 본문.
 *
 * 절 페이지(`<chapter>/<절>/page.mdx`)는 본문만 쓴다. 목록은 빌드 때 frontmatter에서 만든다.
 */
export default function NabiLayout({ children }: { children: React.ReactNode }) {
  const nav = loadNav();

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-6 py-6 md:sticky md:top-0 md:h-screen md:w-64 md:overflow-y-auto md:border-r md:border-b-0">
        <Sidebar nav={nav} />
      </aside>
      <article className="min-w-0 max-w-3xl flex-1 px-6 py-10 md:px-12">{children}</article>
    </div>
  );
}
