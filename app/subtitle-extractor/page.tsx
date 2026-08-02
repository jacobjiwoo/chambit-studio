"use client";

import { useState } from "react";

import { DropZone } from "./_components/drop-zone";
import { Notice } from "./_components/notice";
import { Result } from "./_components/result";
import { emptyGuidance, rejectGuidance } from "./_lib/guidance";
import { parseHwp, type RejectReason } from "./_lib/hwp";
import { toSubtitles, type Extraction, type StyledRun } from "./_lib/rules";

/**
 * 문서 상태 — 파일 하나를 열어 본 **결과**다. 열린 것과 열리지 않은 것을 함께 담으므로
 * 이름이 `Opened`가 아니다. 담기는 값은 **파서와 규칙 층의 출력 그대로다.**
 *
 * 프로토타입이 화면을 그리려고 발명한 `Doc`/`Block`/`Verdict`는 여기 없다. 화면이 필요로
 * 하는 모양은 규칙 층 출력에서 화면 쪽이 유도한다(`view.ts`의 `toScript`) — 규칙 층 출력을
 * 화면 사정으로 비틀지 않는다.
 *
 * 조각(`runs`)까지 함께 드는 이유는 원고 패널이 **자막이 되지 못한 문단을 포함한 원고
 * 전문**을 그리기 때문이다. 규칙 층 출력만으로는 원고를 되살릴 수 없다 — 그쪽에는 살아남은
 * 것만 담겨 있다.
 *
 * 거부를 같은 상태에 담는 이유는 파서가 이미 사유를 갈라 놓았기 때문이다. `ok`가 갈리는
 * 유니온이라 자막이 없는 화면과 열리지 않은 화면을 헷갈릴 수 없다.
 */
type Attempt = { filename: string } & (
  | ({ ok: true; runs: StyledRun[] } & Extraction)
  | { ok: false; reason: RejectReason }
);

/**
 * 설교 자막 추출기.
 *
 * 첫 화면은 라우트를 나누지 않는다 — 드롭존이 화면을 채우고 있다가 파일을 올리면 **같은
 * 자리가** 결과로 바뀐다. 헤더의 `다른 파일`로 언제든 돌아오므로 새로고침이 필요 없다.
 *
 * **문서 상태는 `useState` 하나다.** 화면이 읽기 전용이라 상태를 바꾸는 경로가 문자 그대로
 * 하나이고(파일이 들어온다), 결과가 한 번 만들어진 뒤로는 변하지 않는다. Context·reducer·
 * store는 값을 치를 대상이 없다.
 *
 * **원고는 이 컴퓨터 밖으로 나가지 않는다.** 파일이 지나는 곳이 `File.arrayBuffer()` →
 * 파서 → 규칙 → `Blob` 뿐이라 네트워크로 나가는 길이 애초에 없다.
 */
export default function SubtitleExtractorPage() {
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  /** 파일이 정해지는 순간 부른다 — "변환하기" 같은 걸음을 사이에 두지 않는다. */
  async function open(file: File) {
    // 바이트를 읽는 것부터 실패할 수 있다 — 드롭 뒤에 원본이 옮겨지거나 지워진 경우다.
    // 여기서 잡지 않으면 거절이 조용히 새고 화면은 드롭존에 머문 채 아무 말도 하지 않는다
    let bytes: ArrayBuffer;
    try {
      bytes = await file.arrayBuffer();
    } catch {
      setAttempt({ filename: file.name, ok: false, reason: "broken" });
      return;
    }

    const parsed = parseHwp(bytes);
    setAttempt(
      parsed.ok
        ? { filename: file.name, ok: true, runs: parsed.runs, ...toSubtitles(parsed.runs) }
        : { filename: file.name, ok: false, reason: parsed.reason },
    );
  }

  if (attempt === null) return <DropZone onFile={open} />;

  // 파일 하나가 갈리는 세 갈래가 여기 다 있다 — 거부 · 빈 결과 · 정상. 화면 셋이 톤으로
  // 갈리지만 **그 톤을 여기서 고르지 않는다.** 문구와 톤은 `guidance.ts`가 파서·규칙 층의
  // 출력에서 유도한다(사유별로 다른 말이 나오는지는 눈으로 확인할 수 없다)
  if (!attempt.ok) {
    return (
      <Notice
        guidance={rejectGuidance(attempt.reason)}
        file={attempt.filename}
        onBack={() => setAttempt(null)}
      />
    );
  }

  // 자막이 0장인 원고는 **실패가 아니다.** 파싱은 성공했다. 결과 화면으로 보내면 빈 오른쪽
  // 패널만 남아 담당자는 앱이 고장난 줄 알고 손으로 돌아간다. 원인(빨강이 아예 없는지, 검은
  // 글 사이에 껴 있는지, 색이 어긋났는지)은 추출 결과가 쥐고 있으므로 통째로 넘긴다
  if (attempt.subtitles.length === 0) {
    return (
      <Notice
        guidance={emptyGuidance(attempt)}
        file={attempt.filename}
        onBack={() => setAttempt(null)}
      />
    );
  }

  return (
    <Result
      filename={attempt.filename}
      runs={attempt.runs}
      subtitles={attempt.subtitles}
      dropped={attempt.dropped}
      unknownColors={attempt.unknownColors}
      onBack={() => setAttempt(null)}
    />
  );
}
