/**
 * 아직 확인하지 않은 정보 표시. `mdx-components.tsx`에 등록해 import 없이 쓴다.
 *
 * `<Unconfirmed>출발 장비</Unconfirmed>`처럼 미확인인 것을 감싼다. 감싼 내용은 그대로 보이고
 * 뒤에 "확인 필요" 배지가 붙는다. 감쌀 대상이 분명하지 않으면 `<Unconfirmed />`로 배지만 쓴다.
 * 감싸는 형태라 나중에 미확인 목록을 모을 수 있다(.scratch/broadcast-system/map.md).
 *
 * 표 칸과 문장 안에서 쓰므로 블록이 아닌 인라인 요소만 쓴다. 배지 글자는 줄이 바뀌지 않는다.
 *
 * 루트 `mdx-components.tsx`가 쓰므로 `app/_components`에 둔다. 라우트의 private folder는
 * 루트에서 import할 수 없다.
 */
export function Unconfirmed({ children }: { children?: React.ReactNode }) {
  return (
    <span>
      {children}
      <span
        className={`${children ? "ml-1 " : ""}inline-block rounded border border-neutral-300 bg-neutral-100 px-1.5 align-[0.1em] text-xs leading-5 whitespace-nowrap text-neutral-600`}
      >
        확인 필요
      </span>
    </span>
  );
}
