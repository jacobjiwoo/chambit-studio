"use client";

/** 드롭존·거부 화면이 쓰는 제목만 있는 줄. */
export function TitleBar() {
  return (
    <header className="shrink-0 border-b border-neutral-200 px-6 py-3.5">
      <h1 className="font-semibold">설교 자막 추출기</h1>
    </header>
  );
}

/**
 * 결과 화면의 헤더 — 얇게 둔다.
 *
 * 검은 히어로 배너는 2단에서 원고와 자막을 세로로 밀어낸다. 헤더에 경쟁자가 없으므로
 * 얇아도 받기 버튼이 주인공이다.
 */
export function Header({
  filename,
  count,
  onBack,
  onPreview,
  onDownload,
}: {
  filename: string;
  count: number;
  onBack: () => void;
  onPreview: () => void;
  onDownload: () => void;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-3.5">
      <div className="flex min-w-0 items-baseline gap-3">
        <h1 className="shrink-0 font-semibold">설교 자막 추출기</h1>
        <span className="truncate font-mono text-xs text-neutral-400">{filename}</span>
        <button
          onClick={onBack}
          className="shrink-0 text-xs text-neutral-400 underline underline-offset-2 hover:text-neutral-700"
        >
          다른 파일
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm text-neutral-500">
          자막 <b className="text-neutral-900">{count}장</b> 준비됨
        </span>
        <button
          onClick={onPreview}
          className="rounded-xl px-4 py-3 font-medium text-neutral-600 ring-1 ring-neutral-300 transition hover:bg-neutral-50"
        >
          미리보기
        </button>
        <button
          onClick={onDownload}
          className="rounded-xl bg-neutral-900 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-neutral-700"
        >
          ⤓ 나비CG 파일 받기
        </button>
      </div>
    </header>
  );
}
