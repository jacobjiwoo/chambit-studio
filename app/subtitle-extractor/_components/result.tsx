"use client";

import { useState } from "react";
import { downloadName, downloadNabiTxt } from "../_lib/nabi-cg";
import { Header } from "./header";
import { SubtitlePane } from "./subtitle-pane";

/**
 * 결과 화면 — 얇은 헤더 + 자막 장.
 *
 * 여기까지가 **잘 돌아가는 날의 두 걸음**이다. 올린다 → 받는다. 왼쪽에 설 원고 전문(05)과
 * 노출 의무 칩 한 줄(06)은 이 위에 얹히는 검수 장치다.
 *
 * 규칙 층 출력을 뭉치로 받지 않고 **화면이 쓰는 것만** 받는다 — 05·06이 필요로 하는
 * 걸러낸 것·모르는 색은 그때 각자 열린다.
 */
export function Result({
  filename,
  subtitles,
  onBack,
}: {
  filename: string;
  subtitles: string[];
  onBack: () => void;
}) {
  // 선택된 장 — 상호작용 상태라 문서 상태와 섞지 않고 쓰이는 자리에 둔다
  const [active, setActive] = useState<number | null>(null);

  const name = downloadName(filename);

  return (
    <div className="flex h-screen flex-col bg-white">
      <Header
        filename={filename}
        count={subtitles.length}
        onBack={onBack}
        onDownload={() => downloadNabiTxt(subtitles, name)}
      />

      <div className="grid min-h-0 flex-1">
        <SubtitlePane subtitles={subtitles} active={active} onSelect={setActive} />
      </div>
    </div>
  );
}
