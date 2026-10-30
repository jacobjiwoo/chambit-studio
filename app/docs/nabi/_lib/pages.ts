/**
 * 사이드바 목록 — 절 페이지의 frontmatter에서 만든다.
 *
 * 목록을 손으로 두지 않는다. 페이지마다 frontmatter와 목록 두 곳을 고치면 언젠가 어긋나기
 * 때문이다. frontmatter가 하나뿐인 원천이고, 레이아웃이 빌드 때 이 파일로 읽는다.
 *
 * 경로는 폴더가 정하고 frontmatter의 `chapter`·`slug`는 그 폴더를 되풀이한다. 둘이 어긋나면
 * 사이드바 링크가 404가 되므로 빌드를 멈춘다. `description` 150자도 여기서 막는다.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { parse } from "yaml";

/** 원문 Chapter 순서대로. 이름은 원문 제목 그대로다. */
export const CHAPTERS = [
  { key: "setup", title: "Setting & Control" },
  { key: "cg", title: "NABI-CG" },
  { key: "db", title: "교회DB" },
] as const;

export type ChapterKey = (typeof CHAPTERS)[number]["key"];

export type Frontmatter = {
  title: string;
  description: string;
  slug: string;
  chapter: ChapterKey;
  order: number;
};

export type PageLink = { title: string; href: string; order: number };

export type ChapterNav = { key: ChapterKey; title: string; pages: PageLink[] };

/** 디스크에서 읽은 절 페이지 하나. 폴더 이름과 원문을 함께 든다. */
export type PageSource = { chapterDir: string; sectionDir: string; source: string };

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
  if (!CHAPTERS.some((c) => c.key === chapter)) {
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

/** 절 페이지들을 Chapter → `order` 순으로 묶는다. 절이 없는 Chapter는 뺀다. */
export function toNav(sources: PageSource[]): ChapterNav[] {
  const pages = sources.map(({ chapterDir, sectionDir, source }) => {
    const file = `app/docs/nabi/${chapterDir}/${sectionDir}/page.mdx`;
    const fm = readFrontmatter(source, file);
    if (fm.chapter !== chapterDir) {
      throw new Error(`${file}: \`chapter: ${fm.chapter}\`가 폴더 \`${chapterDir}\`와 다르다`);
    }
    if (fm.slug !== sectionDir) {
      throw new Error(`${file}: \`slug: ${fm.slug}\`가 폴더 \`${sectionDir}\`와 다르다`);
    }
    return { ...fm, file };
  });

  return CHAPTERS.map(({ key, title }) => {
    const inChapter = pages.filter((p) => p.chapter === key).sort((a, b) => a.order - b.order);
    for (let i = 1; i < inChapter.length; i++) {
      if (inChapter[i].order === inChapter[i - 1].order) {
        throw new Error(
          `${inChapter[i - 1].file}, ${inChapter[i].file}: \`order: ${inChapter[i].order}\`가 겹친다`,
        );
      }
    }
    return {
      key,
      title,
      pages: inChapter.map((p) => ({
        title: p.title,
        href: `/docs/nabi/${p.chapter}/${p.slug}`,
        order: p.order,
      })),
    };
  }).filter((c) => c.pages.length > 0);
}

/** `app/docs/nabi/<chapter>/<절>/page.mdx`를 모두 읽는다. 빌드 때 서버 컴포넌트에서만 부른다. */
export function loadNav(): ChapterNav[] {
  const root = path.join(process.cwd(), "app/docs/nabi");
  const sources: PageSource[] = [];

  for (const chapterDir of subdirs(root)) {
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
