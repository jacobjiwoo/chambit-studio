import type { Metadata } from "next";

import { DocsShell } from "../_components/docs-shell";
import { Sidebar } from "./_components/sidebar";
import { loadPages } from "./_lib/pages";

export const metadata: Metadata = {
  title: { template: "%s — 방송 시스템", default: "방송 시스템" },
};

/** 방송 시스템 — 사이드바와 본문. 목록은 빌드 때 페이지 frontmatter에서 만든다. */
export default function BroadcastSystemLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell sidebar={<Sidebar pages={loadPages()} />}>{children}</DocsShell>;
}
