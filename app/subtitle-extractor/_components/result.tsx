"use client";

import { useRef, useState } from "react";
import { downloadName, downloadNabiTxt } from "../_lib/nabi-cg";
import { droppedInOrder, type Doc, type UnknownColor } from "../_lib/view";
import { Chips } from "./chips";
import { Header } from "./header";
import { PreviewModal } from "./preview-modal";
import { ScriptPane } from "./script-pane";
import { SubtitlePane } from "./subtitle-pane";

/**
 * 결과 화면 — 얇은 헤더 + 칩 한 줄 + 2단(원고 전문 | 자막 장).
 *
 * 두 패널이 공유하는 상태는 **선택된 장** 하나뿐이라 여기 산다. 나머지 상호작용 상태는
 * 각자 쓰이는 컴포넌트 안에 있다.
 *
 * 아직 이 화면에 도달하는 경로가 없다 — 파서와 규칙 층이 서는 날 `page.tsx`가 배선한다
 * (`build/04-drop-to-download.md`).
 */
export function Result({
  doc,
  unknown,
  onBack,
}: {
  doc: Doc;
  unknown: UnknownColor[];
  onBack: () => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const marks = useRef(new Map<string, HTMLElement | null>());

  const dropped = droppedInOrder(doc);
  const name = downloadName(doc.filename);

  /** 원고의 그 자리로 데려간 뒤 노란 깜빡임으로 알린다. */
  function reveal(key: string) {
    const el = marks.current.get(key);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.animate([{ background: "#fef08a" }, { background: "transparent" }], {
      duration: 1600,
      easing: "ease-out",
    });
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <Header
        filename={doc.filename}
        count={doc.subtitles.length}
        onBack={onBack}
        onPreview={() => setPreview(true)}
        onDownload={() => downloadNabiTxt(doc.subtitles, name)}
      />

      <Chips dropped={dropped} unknown={unknown} onReveal={reveal} />

      <div className="grid min-h-0 flex-1 grid-cols-2 divide-x divide-neutral-200">
        <ScriptPane
          doc={doc}
          dropped={dropped}
          unknown={unknown}
          active={active}
          onSelect={setActive}
          registerMark={(key, el) => marks.current.set(key, el)}
        />
        <SubtitlePane subtitles={doc.subtitles} active={active} onSelect={setActive} />
      </div>

      {preview && (
        <PreviewModal
          name={name}
          subtitles={doc.subtitles}
          onClose={() => setPreview(false)}
        />
      )}
    </div>
  );
}
