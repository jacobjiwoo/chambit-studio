import Link from "next/link";

import type { PageLink } from "../_lib/page-link";

/** 첫 페이지에 놓는 링크 목록. */
export function PageLinkList({ links }: { links: PageLink[] }) {
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
