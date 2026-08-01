"use client";

import { useCallback, useMemo, useState } from "react";

import { downloadName, downloadNabiTxt } from "../_lib/nabi-cg";
import type { Dropped, StyledRun, Subtitle, UnknownColor } from "../_lib/rules";
import { toScript } from "../_lib/view";
import { Chips } from "./chips";
import type { Picked, Revealed } from "./follow";
import { Header } from "./header";
import { ScriptPane } from "./script-pane";
import { SubtitlePane } from "./subtitle-pane";

/**
 * 결과 화면 — 얇은 헤더 + 칩 한 줄 + **왼쪽 원고 전문 · 오른쪽 자막 장**.
 *
 * 자막만 봐서는 **없는 자막**을 절대 못 잡는다. 원고를 나란히 세우는 것이 검수의 본질이며
 * 이게 이 화면의 존재 이유다. 두 패널은 각각 스크롤한다 — 원고 뒷부분을 보면서 앞쪽 자막을
 * 확인할 수 있어야 한다.
 *
 * 규칙 층 출력 셋을 **그 모양 그대로** 받는다(`Subtitle`·`Dropped`·`UnknownColor`). 화면이
 * 쓰는 모양은 `toScript`가 여기서 유도하며, 규칙 층 출력을 화면 사정으로 비틀지 않는다.
 */
export function Result({
  filename,
  runs,
  subtitles,
  dropped,
  unknownColors,
  onBack,
}: {
  filename: string;
  runs: StyledRun[];
  subtitles: Subtitle[];
  dropped: Dropped[];
  unknownColors: UnknownColor[];
  onBack: () => void;
}) {
  const script = useMemo(() => toScript(runs, subtitles), [runs, subtitles]);

  /**
   * 담당자가 지금 짝을 맞춰 보고 있는 자막 장.
   *
   * 상호작용 상태라 `page.tsx`의 문서 상태와 섞지 않고 쓰이는 자리에 산다. 문서 상태는 파일
   * 하나의 결과이고 이것은 담당자가 지금 어디를 보고 있는지라, 수명도 주인도 다르다.
   *
   * 같은 장을 다시 눌러도 **새 객체**가 들어간다 — 그 클릭은 "거기로 다시 데려다 달라"는
   * 뜻이라 값이 같다고 없던 일이 되면 안 된다(`useFollow` 참조).
   */
  const [picked, setPicked] = useState<Picked>(null);

  /**
   * 칩에서 「원고에서 보기 →」로 부른 원고의 자리.
   *
   * `picked`와 나란히 서지만 섞지 않는다 — 저쪽은 두 패널이 서로를 따라가는 것이고 이쪽은
   * 칩이 원고를 부르는 것이다. 한 상태에 담으면 자막 장을 눌렀을 때도 원고가 노랗게
   * 깜빡이거나, 칩을 눌렀을 때 엉뚱한 자막 장이 강조된다.
   */
  const [revealed, setRevealed] = useState<Revealed>(null);

  const fromScript = useCallback((subtitle: number) => setPicked({ subtitle, from: "script" }), []);
  const fromSubtitle = useCallback(
    (subtitle: number) => setPicked({ subtitle, from: "subtitle" }),
    [],
  );
  // 같은 항목을 다시 눌러도 새 객체가 들어간다 — 그 클릭은 "거기로 다시 데려다 달라"는 뜻이다
  const reveal = useCallback((paragraph: number) => setRevealed({ paragraph }), []);

  const name = downloadName(filename);

  return (
    <div className="flex h-screen flex-col bg-white">
      <Header
        filename={filename}
        count={subtitles.length}
        onBack={onBack}
        onDownload={() => downloadNabiTxt(subtitles.map((s) => s.text), name)}
      />

      {/* 할 말이 없는 날엔 이 줄이 통째로 없다 — `Chips`가 스스로 판단한다 */}
      <Chips dropped={dropped} unknownColors={unknownColors} onReveal={reveal} />

      {/* 행을 `minmax(0,1fr)`로 못 박는다 — 암묵 행은 내용 높이로 커지므로, 문단 100개짜리
          원고가 들어오면 두 패널이 각자 스크롤하는 대신 화면 전체가 길어진다 */}
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(0,1fr)] divide-x divide-neutral-200">
        <ScriptPane lines={script} picked={picked} revealed={revealed} onSelect={fromScript} />
        <SubtitlePane subtitles={subtitles} picked={picked} onSelect={fromSubtitle} />
      </div>
    </div>
  );
}
