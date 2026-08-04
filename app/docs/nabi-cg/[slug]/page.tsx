import type { Metadata } from "next";

import { DocShell } from "../_components/doc-shell";
import { docs, pageOf, routes } from "../_lib/docs";

/** 소스에 있는 마크다운만 주소가 된다 — 본문이 아직 없는 항목은 라우트 자체가 안 생긴다. */
export function generateStaticParams() {
  return routes.map(({ slug }) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const page = pageOf((await params).slug);
  return { title: `${page.title} — 나비CG 문서`, description: page.lede };
}

/**
 * 문서 한 장. **클라이언트 JS가 안 내려간다** — Server Component가 빌드 타임에 HTML을 굽고
 * `output: 'export'`가 그걸 그대로 내보낸다. 급할 때 여는 페이지가 가장 빨리 뜬다.
 */
export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  return <DocShell page={pageOf((await params).slug)} nav={docs.nav} />;
}
