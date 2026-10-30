/**
 * MDX 본문의 주의·경고 상자. `mdx-components.tsx`에 등록해 import 없이 `<Callout>`으로 쓴다.
 *
 * 종류는 원문의 시각적 구분 두 가지다(.scratch/nabi-manual/issues/04-callout-types.md).
 * `warning`은 `※` + 굵은 글씨 문단, `danger`는 빨간 굵은 밑줄 문단이다.
 *
 * 아이콘과 색만 넣고 "주의" 같은 글자 라벨은 넣지 않는다. 원문에 없는 글이 되기 때문이다.
 *
 * 루트 `mdx-components.tsx`가 쓰므로 `app/_components`에 둔다. 라우트의 private folder는
 * 루트에서 import할 수 없다.
 */
type CalloutType = "warning" | "danger";

const STYLES: Record<CalloutType, { box: string; icon: string; path: string }> = {
  warning: {
    box: "border-amber-300 bg-amber-50",
    icon: "text-amber-600",
    // 삼각형 안의 느낌표
    path: "M12 3.5 1.75 21h20.5L12 3.5Zm0 6v5m0 3v.01",
  },
  danger: {
    box: "border-red-300 bg-red-50",
    icon: "text-red-600",
    // 팔각형 안의 느낌표
    path: "M8.1 2h7.8L22 8.1v7.8L15.9 22H8.1L2 15.9V8.1L8.1 2Zm3.9 6v5m0 3v.01",
  },
};

export function Callout({ type, children }: { type: CalloutType; children: React.ReactNode }) {
  const style = STYLES[type];

  return (
    <div role="note" className={`mt-4 flex gap-3 rounded-lg border px-4 py-3 ${style.box}`}>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`mt-1 size-5 shrink-0 ${style.icon}`}
      >
        <path d={style.path} />
      </svg>
      <div className="min-w-0 [&>:first-child]:mt-0">{children}</div>
    </div>
  );
}
