import type { Metadata } from "next";

import { DocsShell } from "../_components/docs-shell";
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

  return <DocsShell sidebar={<Sidebar nav={nav} />}>{children}</DocsShell>;
}
