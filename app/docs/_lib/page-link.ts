/** 사이드바와 첫 페이지 링크 목록이 쓰는 링크 하나. */
export type PageLink = { title: string; href: string; order: number };

/** 목록에 쓸 세 키만 남긴다. */
export function toLink({ title, href, order }: PageLink): PageLink {
  return { title, href, order };
}
