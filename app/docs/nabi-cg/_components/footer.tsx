import { MANUAL_URL, NABI_BUILD, NABI_VERSION } from "../_meta/nabi-build";

/**
 * 네 줄. **모든 문서 페이지에 붙고 홈·자막 추출기에는 안 붙는다** — 표기 대상이 매뉴얼에서 온
 * 내용이므로 붙는 범위가 그 대상과 일치해야 한다. 검색으로 딥 페이지에 바로 떨어지는 사이트라
 * 홈에만 두면 대부분이 못 본다.
 *
 * **페이지 상단 배지는 안 만든다.** 급할 때 여는 페이지에서 첫 화면 한 줄을 먹는다.
 *
 * 마지막 줄의 대조 유도가 게이트의 **유일한 사각**을 인프라 0으로 메운다 — 게을러서
 * `NABI_BUILD`를 안 올리면 테스트는 아무것도 안 터뜨리지만, 읽는 사람이 여기로 건너가면
 * 우리가 몇 년째 갱신을 안 했다는 것을 스스로 알아챈다.
 */
export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-6 py-6 text-xs leading-relaxed text-neutral-500 md:px-10">
        <p>출처 — compix 나비CG 매뉴얼 기반</p>
        {/* 날짜를 손으로 적으면 상수와 어긋난다. 어긋난 날 아무도 안 알려준다 */}
        <p>
          기준 — 나비CG {NABI_VERSION} ({NABI_BUILD} 빌드) · compix 최신 버전은 아래 링크에서 확인
        </p>
        <p>비공식 — compix 공식 문서가 아닙니다</p>
        <p>
          원본 —{" "}
          <a
            href={MANUAL_URL}
            className="underline underline-offset-2 hover:text-neutral-800"
            target="_blank"
            rel="noreferrer"
          >
            {MANUAL_URL}
          </a>
        </p>
      </div>
    </footer>
  );
}
