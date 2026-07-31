"use client";

import type { Block, Doc, Dropped, UnknownColor } from "../_lib/view";

/**
 * 왼쪽 원고 전문.
 *
 * 자막만 보면 **없는 자막**은 절대 못 잡는다. 원고를 나란히 세우는 것이 검수의 본질이며
 * 이게 이 화면의 존재 이유다.
 *
 * 표기는 셋으로 갈린다 — 자막이 된 빨강은 원래 색 그대로, 걸러낸 빨강은 회색 배경 +
 * 취소선, 모르는 색은 주황 물결 밑줄.
 */
export function ScriptPane({
  doc,
  dropped,
  unknown,
  active,
  onSelect,
  registerMark,
}: {
  doc: Doc;
  dropped: Dropped[];
  unknown: UnknownColor[];
  active: number | null;
  onSelect: (index: number) => void;
  registerMark: (key: string, el: HTMLElement | null) => void;
}) {
  return (
    <div className="min-h-0 overflow-y-auto px-6 py-5">
      <p className="sticky top-0 -mt-5 bg-white pt-5 pb-2 text-xs font-semibold tracking-wide text-neutral-400">
        원고
      </p>
      {doc.blocks.map((b) => (
        <Paragraph
          key={b.paragraph}
          block={b}
          active={active === b.index}
          onClick={() => b.index && onSelect(b.index)}
          registerDropped={(el, fragment) => {
            const i = dropped.findIndex(
              (d) => d.fragment === fragment && d.paragraph === b.text,
            );
            if (i >= 0) registerMark(`d${i}`, el);
          }}
          registerUnknown={(el, color) => {
            const i = unknown.findIndex(
              (u) => u.color === color && u.paragraph === b.paragraph,
            );
            if (i >= 0) registerMark(`u${i}`, el);
          }}
        />
      ))}
    </div>
  );
}

function Paragraph({
  block,
  active,
  onClick,
  registerDropped,
  registerUnknown,
}: {
  block: Block;
  active: boolean;
  onClick: () => void;
  registerDropped: (el: HTMLElement | null, fragment: string) => void;
  registerUnknown: (el: HTMLElement | null, color: string) => void;
}) {
  const isSubtitle = block.verdict === "subtitle";

  return (
    <div
      onClick={onClick}
      className={`-mx-2 flex gap-2 rounded-lg px-2 py-1.5 ${
        isSubtitle ? "cursor-pointer" : ""
      } ${active ? "bg-red-50 ring-2 ring-red-300" : isSubtitle ? "hover:bg-neutral-50" : ""}`}
    >
      <span className="w-6 shrink-0 pt-0.5 text-right font-mono text-xs text-neutral-300 tabular-nums">
        {isSubtitle ? block.index : ""}
      </span>
      <p className="flex-1 text-sm leading-relaxed">
        {block.runs.map((r, i) => {
          const droppedRed = r.color === "#FF0000" && !isSubtitle;
          const unknownColor = r.color !== "#FF0000" && r.color !== "#000000";
          return (
            <span
              key={i}
              ref={
                droppedRed
                  ? (el) => registerDropped(el, r.text.trim())
                  : unknownColor
                    ? (el) => registerUnknown(el, r.color)
                    : undefined
              }
              style={{ color: r.color }}
              className={
                droppedRed
                  ? "rounded bg-neutral-100 line-through decoration-neutral-400"
                  : unknownColor
                    ? "rounded bg-amber-100 underline decoration-amber-500 decoration-wavy underline-offset-2"
                    : ""
              }
              title={
                droppedRed
                  ? "빨갛지만 검은 글 사이에 섞여 있어 자막에서 뺐습니다"
                  : unknownColor
                    ? `빨강도 검정도 아닌 색(${r.color})입니다 — 자막으로 쓰지 않았습니다`
                    : undefined
              }
            >
              {r.text}
            </span>
          );
        })}
      </p>
    </div>
  );
}
