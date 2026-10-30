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

import { parse } from "yaml";

/** 폴더 이름 오타를 막는다. 순서와 이름은 Chapter 첫 페이지의 frontmatter가 정한다. */
export const CHAPTER_KEYS = ["setup", "cg", "db"] as const;

export type ChapterKey = (typeof CHAPTER_KEYS)[number];

export type Frontmatter = {
  title: string;
  description: string;
  slug: string;
  chapter: ChapterKey;
  order: number;
};

export type PageLink = { title: string; href: string; order: number };

export type ChapterNav = PageLink & { key: ChapterKey; pages: PageLink[] };

/**
 * 디스크에서 읽은 페이지 하나. 폴더 이름과 원문을 함께 든다. `sectionDir`가 없으면 Chapter
 * 첫 페이지(`<chapter>/page.mdx`)다.
 */
export type PageSource = { chapterDir: string; sectionDir?: string; source: string };

const DESCRIPTION_MAX = 150;

/** `page.mdx` 맨 앞의 YAML 블록을 읽고 다섯 키를 확인한다. */
export function readFrontmatter(source: string, file: string): Frontmatter {
  const block = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
  if (!block) throw new Error(`${file}: 맨 앞에 frontmatter(---)가 없다`);

  const data: unknown = parse(block[1]);
  if (typeof data !== "object" || data === null) {
    throw new Error(`${file}: frontmatter가 키-값 묶음이 아니다`);
  }
  const { title, description, slug, chapter, order } = data as Record<string, unknown>;

  for (const [key, value] of Object.entries({ title, description, slug })) {
    if (typeof value !== "string" || value === "") {
      throw new Error(`${file}: frontmatter \`${key}\`가 비어 있거나 문자열이 아니다`);
    }
  }
  if (!CHAPTER_KEYS.includes(chapter as ChapterKey)) {
    throw new Error(`${file}: frontmatter \`chapter\`는 setup·cg·db 중 하나다`);
  }
  if (typeof order !== "number" || !Number.isInteger(order)) {
    throw new Error(`${file}: frontmatter \`order\`는 정수다`);
  }
  if ((description as string).length > DESCRIPTION_MAX) {
    throw new Error(`${file}: frontmatter \`description\`이 ${DESCRIPTION_MAX}자를 넘는다`);
  }

  return { title, description, slug, chapter, order } as Frontmatter;
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

  const chapters = sortUnique(pages.filter((p) => p.isChapter));
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
    pages: sortUnique(pages.filter((p) => !p.isChapter && p.chapter === c.chapter)).map(toLink),
  }));
}

/** `order` 순으로 늘어놓는다. 같은 값이 둘이면 순서를 정할 수 없으니 멈춘다. */
function sortUnique<T extends { order: number; file: string }>(pages: T[]): T[] {
  const sorted = [...pages].sort((a, b) => a.order - b.order);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].order === sorted[i - 1].order) {
      throw new Error(`${sorted[i - 1].file}, ${sorted[i].file}: \`order: ${sorted[i].order}\`가 겹친다`);
    }
  }
  return sorted;
}

function toLink({ title, href, order }: PageLink): PageLink {
  return { title, href, order };
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
