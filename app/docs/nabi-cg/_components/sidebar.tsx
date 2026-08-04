import Link from "next/link";

import type { DocNavItem } from "../_lib/build-docs";
import { SearchBox } from "./search-box";

/**
 * 사이드바가 곧 발견 면이다(골격 B).
 *
 * 폭 **300px**이고 한 줄 설명은 본문보다 작고 흐리다. 이 한 줄을 개요 페이지 카드가 아니라
 * 여기 둔 이유는 진입이 검색이기 때문이다 — 대부분의 방문이 딥 페이지에 떨어지는데 발견 면을
 * 개요에 가둬 두면 비싸게 산 그 한 줄을 아무도 안 본다.
 *
 * **본문이 아직 없는 항목은 링크가 아니다.** 일곱 줄은 그대로 서고(무엇이 올지가 보인다) 클릭만
 * 안 먹는다 — *"준비 중"* 배지나 별도 목록 같은 장치를 짓지 않는다. 07–11이 본문을 넣는 순간
 * 저절로 링크가 된다.
 */
export function Sidebar({ nav, current }: { nav: DocNavItem[]; current: string }) {
  return (
    <nav className="shrink-0 border-b border-neutral-200 px-4 py-6 md:w-[300px] md:border-r md:border-b-0">
      {/* 검색은 *찾기*, 아래 일곱 줄은 *발견*이다. 검색창이 위에 서지만 결과는 여기 안 뜬다 —
          모달(S2)로 열려서 사이드바가 끝까지 발견 전용으로 남는다 */}
      <SearchBox />

      <ul className="space-y-0.5">
        {nav.map((item) => (
          <li key={item.slug}>
            <Row item={item} active={item.slug === current} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Row({ item, active }: { item: DocNavItem; active: boolean }) {
  const body = (
    <>
      <span className="block text-sm font-semibold">{item.title}</span>
      {/* 한 줄 설명 — 본문보다 작고 흐리다. `Style Catalog`라는 이름만으로는 그게 뭔지 모른다 */}
      <span className="mt-0.5 block text-xs leading-snug text-neutral-500">{item.lede}</span>
    </>
  );

  if (!item.ready) {
    return <span className="block rounded-lg px-3 py-2 text-neutral-400">{body}</span>;
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`block rounded-lg px-3 py-2 transition ${
        active ? "bg-neutral-100 text-neutral-900" : "text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      {body}
    </Link>
  );
}
