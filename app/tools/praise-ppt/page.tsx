import type { Metadata } from "next";

import { PraisePpt } from "./_components/praise-ppt";

export const metadata: Metadata = { title: "찬양 PPT" };

/** 찬양 PPT — 곡을 골라 셋리스트를 짜고 `.pptx` 한 벌로 받는다. 상호작용은 전부 클라이언트다. */
export default function PraisePptPage() {
  return <PraisePpt />;
}
