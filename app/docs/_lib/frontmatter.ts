/**
 * 문서 페이지 frontmatter의 공용 부분 — `title`, `description`, `slug`, `order`.
 *
 * 문서 라우트마다 목록 모양(NABI는 Chapter → 절, 방송 시스템은 페이지 한 단계)은 다르지만
 * frontmatter를 읽고 `order`로 줄 세우는 규칙은 같다. 라우트에만 있는 키(`chapter` 등)는
 * 각 라우트가 이 결과 위에 더한다.
 */
import { parse } from "yaml";

export type BaseFrontmatter = {
  title: string;
  description: string;
  slug: string;
  order: number;
};

const DESCRIPTION_MAX = 150;

/** YAML 블록 전체를 객체로 읽는다. 라우트 전용 키를 더 읽으려는 쪽이 쓴다. */
export function readFrontmatterData(source: string, file: string): Record<string, unknown> {
  const block = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
  if (!block) throw new Error(`${file}: 맨 앞에 frontmatter(---)가 없다`);

  const data: unknown = parse(block[1]);
  if (typeof data !== "object" || data === null) {
    throw new Error(`${file}: frontmatter가 키-값 묶음이 아니다`);
  }
  return data as Record<string, unknown>;
}

/** 네 키를 확인한다. */
export function readBaseFrontmatter(source: string, file: string): BaseFrontmatter {
  const { title, description, slug, order } = readFrontmatterData(source, file);

  for (const [key, value] of Object.entries({ title, description, slug })) {
    if (typeof value !== "string" || value === "") {
      throw new Error(`${file}: frontmatter \`${key}\`가 비어 있거나 문자열이 아니다`);
    }
  }
  if (typeof order !== "number" || !Number.isInteger(order)) {
    throw new Error(`${file}: frontmatter \`order\`는 정수다`);
  }
  if ((description as string).length > DESCRIPTION_MAX) {
    throw new Error(`${file}: frontmatter \`description\`이 ${DESCRIPTION_MAX}자를 넘는다`);
  }

  return { title, description, slug, order } as BaseFrontmatter;
}

/** `order` 순으로 늘어놓는다. 같은 값이 둘이면 순서를 정할 수 없으니 멈춘다. */
export function sortByOrder<T extends { order: number; file: string }>(pages: T[]): T[] {
  const sorted = [...pages].sort((a, b) => a.order - b.order);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].order === sorted[i - 1].order) {
      throw new Error(`${sorted[i - 1].file}, ${sorted[i].file}: \`order: ${sorted[i].order}\`가 겹친다`);
    }
  }
  return sorted;
}
