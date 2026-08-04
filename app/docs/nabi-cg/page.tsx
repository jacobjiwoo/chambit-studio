import type { Metadata } from "next";

import { DocShell } from "./_components/doc-shell";
import { docs, pageOf } from "./_lib/docs";
import { LANDING } from "./_meta/nav";

export const metadata: Metadata = {
  title: `${LANDING.title} — 참빛 스튜디오`,
  description: LANDING.lede,
};

/**
 * `/docs/nabi-cg/` — **카드 없이** *"이 문서는 무엇인가"* 서너 줄이다.
 *
 * 개요 페이지를 만들지 않는다. 발견 면(항목마다 한 줄)이 이미 사이드바에 상시 떠 있어 카드가
 * 같은 일을 두 번 하고, 그 두 번째는 일부러 찾아와야만 보인다.
 *
 * `/docs` 인덱스도 만들지 않는다 — 항목 1개짜리 목록은 정보가 0이다. 둘째 문서가 오면 그때
 * `/docs/handover/`가 **옆에** 서고 여기 주소는 안 깨진다.
 */
export default function NabiCgLandingPage() {
  return <DocShell page={pageOf(LANDING.slug)} nav={docs.nav} />;
}
