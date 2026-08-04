import { LANDING } from "../_meta/nav";
import { buildDocs, CONTENT_DIR, type DocPage } from "./build-docs";

/**
 * 실물 소스로 구운 산출물. **빌드 타임에 한 번 굽고 페이지들이 나눠 쓴다.**
 *
 * 모듈을 읽는 순간 파일을 읽으므로 소스가 잘못돼 있으면 `next build`가 여기서 멈춘다 —
 * 잘못된 소스가 조용히 배포되는 것보다 낫다.
 */
export const docs = buildDocs(CONTENT_DIR);

/**
 * `[slug]` 라우트가 만들 페이지들 — 랜딩은 자기 라우트(`page.tsx`)가 따로 있어 빠진다.
 *
 * 랜딩의 슬러그가 빈 문자열이라는 것을 **라우트가 알 필요가 없다.** 이 갈래가 라우트 쪽에
 * 있으면 페이지가 하나 늘 때마다 같은 조건을 다시 쓰게 된다.
 */
export const routes = docs.pages.filter((page) => page.slug !== LANDING.slug);

/** 라우트가 자기 페이지를 집는다. 없는 슬러그는 `generateStaticParams()`가 애초에 안 만든다. */
export function pageOf(slug: string): DocPage {
  const page = docs.pages.find((p) => p.slug === slug);
  if (!page) throw new Error(`/docs/nabi-cg/${slug}: 본문이 없다.`);
  return page;
}
