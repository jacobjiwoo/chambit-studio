/**
 * 사이드바와 첫 페이지 목록 — Chapter 첫 페이지와 절 페이지의 frontmatter에서 만든다.
 *
 * 목록을 손으로 두지 않는다. 페이지마다 frontmatter와 목록 두 곳을 고치면 언젠가 어긋나기
 * 때문이다. frontmatter가 하나뿐인 원천이고, 레이아웃과 첫 페이지가 빌드 때 이 파일로 읽는다.
 * Chapter 이름과 순서도 `<chapter>/page.mdx`의 `title`·`order`다.
 *
 * 경로는 폴더가 정하고 frontmatter의 `chapter`·`slug`는 그 폴더를 되풀이한다. 둘이 어긋나면
 * 사이드바 링크가 404가 되므로 빌드를 멈춘다. `description` 150자도 여기서 막는다.
 * `/docs/nabi/page.mdx`는 목록에 들지 않으니 읽지 않는다.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  readBaseFrontmatter,
  readFrontmatterData,
  sortByOrder,
  type BaseFrontmatter,
} from "../../_lib/frontmatter";
import { toLink, type PageLink } from "../../_lib/page-link";

/** 폴더 이름 오타를 막는다. 순서와 이름은 Chapter 첫 페이지의 frontmatter가 정한다. */
export const CHAPTER_KEYS = ["setup", "cg", "db"] as const;

export type ChapterKey = (typeof CHAPTER_KEYS)[number];

export type Frontmatter = BaseFrontmatter & { chapter: ChapterKey };

export type ChapterNav = PageLink & { key: ChapterKey; pages: PageLink[] };

/**
 * 디스크에서 읽은 페이지 하나. 폴더 이름과 원문을 함께 든다. `sectionDir`가 없으면 Chapter
 * 첫 페이지(`<chapter>/page.mdx`)다.
 */
export type PageSource = { chapterDir: string; sectionDir?: string; source: string };

/** `page.mdx` 맨 앞의 YAML 블록을 읽고 다섯 키를 확인한다. 네 키는 문서 공용 규칙이다. */
export function readFrontmatter(source: string, file: string): Frontmatter {
  const base = readBaseFrontmatter(source, file);
  const { chapter } = readFrontmatterData(source, file);

  if (!CHAPTER_KEYS.includes(chapter as ChapterKey)) {
    throw new Error(`${file}: frontmatter \`chapter\`는 setup·cg·db 중 하나다`);
  }

  return { ...base, chapter } as Frontmatter;
}

/**
 * Chapter 첫 페이지 순서대로, 그 안의 절은 `order` 순으로 묶는다. 절이 있는데 Chapter 첫
 * 페이지가 없으면 사이드바에 이름을 붙일 수 없으니 멈춘다.
 */
export function toNav(sources: PageSource[]): ChapterNav[] {
  const pages = sources.map(({ chapterDir, sectionDir, source }) => {
    const dir = sectionDir === undefined ? chapterDir : `${chapterDir}/${sectionDir}`;
    const file = `app/docs/nabi/${dir}/page.mdx`;
    const fm = readFrontmatter(source, file);
    if (fm.chapter !== chapterDir) {
      throw new Error(`${file}: \`chapter: ${fm.chapter}\`가 폴더 \`${chapterDir}\`와 다르다`);
    }
    const folder = sectionDir ?? chapterDir;
    if (fm.slug !== folder) {
      throw new Error(`${file}: \`slug: ${fm.slug}\`가 폴더 \`${folder}\`와 다르다`);
    }
    return { ...fm, file, href: `/docs/nabi/${dir}`, isChapter: sectionDir === undefined };
  });

  const chapters = sortByOrder(pages.filter((p) => p.isChapter));
  for (const p of pages) {
    if (!p.isChapter && !chapters.some((c) => c.chapter === p.chapter)) {
      throw new Error(`${p.file}: Chapter 첫 페이지 \`app/docs/nabi/${p.chapter}/page.mdx\`가 없다`);
    }
  }

  return chapters.map((c) => ({
    key: c.chapter,
    title: c.title,
    href: c.href,
    order: c.order,
    pages: sortByOrder(pages.filter((p) => !p.isChapter && p.chapter === c.chapter)).map(toLink),
  }));
}

/**
 * `app/docs/nabi/<chapter>/page.mdx`와 `<chapter>/<절>/page.mdx`를 모두 읽는다. 빌드 때 서버
 * 컴포넌트에서만 부른다.
 */
export function loadNav(): ChapterNav[] {
  const root = path.join(process.cwd(), "app/docs/nabi");
  const sources: PageSource[] = [];

  for (const chapterDir of subdirs(root)) {
    const chapterFile = path.join(root, chapterDir, "page.mdx");
    if (existsSync(chapterFile)) {
      sources.push({ chapterDir, source: readFileSync(chapterFile, "utf8") });
    }
    for (const sectionDir of subdirs(path.join(root, chapterDir))) {
      const file = path.join(root, chapterDir, sectionDir, "page.mdx");
      if (!existsSync(file)) continue;
      sources.push({ chapterDir, sectionDir, source: readFileSync(file, "utf8") });
    }
  }

  return toNav(sources);
}

/** private folder(`_lib` 등)는 라우트가 아니니 건너뛴다. */
function subdirs(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name);
}
