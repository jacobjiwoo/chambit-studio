/**
 * 사이드바와 첫 페이지 목록 — 페이지 frontmatter에서 만든다.
 *
 * 라우트 바로 아래 폴더 하나가 페이지 하나이고 폴더 이름이 `slug`다. 목록을 손으로 두지
 * 않는다. 페이지마다 frontmatter와 목록 두 곳을 고치면 언젠가 어긋나기 때문이다.
 * 폴더와 `slug`가 어긋나면 링크가 404가 되므로 빌드를 멈춘다. 첫 페이지
 * (`broadcast-system/page.mdx`)는 목록에 들지 않으니 읽지 않는다.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { readBaseFrontmatter, sortByOrder } from "../../_lib/frontmatter";
import { toLink, type PageLink } from "../../_lib/page-link";

/** 라우트 바로 아래 폴더 하나. `page.mdx`가 없으면 `source`가 없다. */
export type PageSource = { dir: string; source?: string };

/** `_`로 시작하는 폴더와 `page.mdx`가 없는 폴더를 건너뛰고 `order` 순 목록을 만든다. */
export function toPages(sources: PageSource[]): PageLink[] {
  const pages = sources
    .filter(({ dir, source }) => !dir.startsWith("_") && source !== undefined)
    .map(({ dir, source }) => {
      const file = `app/docs/broadcast-system/${dir}/page.mdx`;
      const fm = readBaseFrontmatter(source as string, file);
      if (fm.slug !== dir) {
        throw new Error(`${file}: \`slug: ${fm.slug}\`가 폴더 \`${dir}\`와 다르다`);
      }
      return { ...fm, file, href: `/docs/broadcast-system/${dir}` };
    });

  return sortByOrder(pages).map(toLink);
}

/** `app/docs/broadcast-system/<slug>/page.mdx`를 모두 읽는다. 빌드 때 서버 컴포넌트에서만 부른다. */
export function loadPages(): PageLink[] {
  const root = path.join(process.cwd(), "app/docs/broadcast-system");
  const sources = readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map(({ name }): PageSource => {
      const file = path.join(root, name, "page.mdx");
      return { dir: name, source: existsSync(file) ? readFileSync(file, "utf8") : undefined };
    });

  return toPages(sources);
}
