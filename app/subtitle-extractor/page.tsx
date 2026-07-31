"use client";

import { DropZone } from "./_components/drop-zone";

/**
 * 설교 자막 추출기.
 *
 * 첫 화면은 라우트를 나누지 않는다 — 드롭존이 화면을 채우고 있다가 파일을 올리면 **같은
 * 자리가** 결과로 바뀐다. 상태를 바꾸는 경로는 문자 그대로 하나다: 파일이 들어온다.
 *
 * 아직 파서도 규칙 층도 없어 파일을 놓아도 아무 일이 일어나지 않는다. 문서 상태(`useState`
 * 하나)와 결과 화면 배선은 `build/04-drop-to-download.md`가 얹는다.
 */
export default function SubtitleExtractorPage() {
  return <DropZone onPick={() => {}} />;
}
