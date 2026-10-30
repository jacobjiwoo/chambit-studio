import Link from "next/link";

import { loadNav, type ChapterKey, type PageLink } from "../_lib/pages";

/**
 * 첫 페이지의 링크 목록. 사이드바와 같은 frontmatter에서 만들어 손으로 쓴 목록이 생기지 않게
 * 한다. 빌드 때 디스크를 읽으므로 서버 컴포넌트다. MDX 페이지가 import해서 쓴다.
 */
export function ChapterLinks() {
  return <Links links={loadNav()} />;
}

/** 한 Chapter의 절 목록. */
export function SectionLinks({ chapter }: { chapter: ChapterKey }) {
  return <Links links={loadNav().find((c) => c.key === chapter)?.pages ?? []} />;
}

function Links({ links }: { links: PageLink[] }) {
  return (
    <ul className="mt-4 list-disc space-y-1 pl-6">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="text-blue-700 underline">
            {link.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
