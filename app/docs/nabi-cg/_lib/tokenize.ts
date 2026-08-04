/**
 * **한글 토크나이저 — 지는 것이 셋이다.**
 *
 * 1. **어절 분해** — 조사는 접미라서 prefix 확장이 흡수한다(실측 재현율 60% → 92%)
 * 2. **2-gram** — 복합명사 안쪽을 연다(→ 100%). 실패는 전부 `화면송출`·`입력모드`처럼
 *    붙여 쓴 UI 용어 안쪽이었다
 * 3. **공백 제거 정규화** — 색인을 구울 때 `줄 간격`의 `줄간격` 버전도 **함께** 넣는다.
 *    **2-gram만으로는 띄어쓰기 변형을 못 흡수한다** — 어절 경계를 넘는 `줄간`이 색인에 없다
 *
 * 형태소 경로(`garu-ko` WASM)는 안 간다. 우리 코퍼스가 조사 코퍼스의 22%(한글 약 7,200자)라
 * **그 경로의 유일한 근거였던 25 KB 우위가 5 KB로 붕괴한다.** 2-gram이 재현율은 더 높고
 * WASM 빌드 의존·사전 생성·폴백이 통째로 사라진다. 근거 전문은
 * `.scratch/nabi-cg-docs/research/korean-static-search.md`.
 */

/**
 * 어절 경계. **`+`는 글자 취급한다** — `Ctrl+H`가 `ctrl`과 `h`로 갈리면 단축키 질의가
 * 아무 데나 걸린다(사용자 스토리 4 — *"이름은 모르고 키만 아는 것"*).
 */
const BOUNDARY = /[^\p{L}\p{N}+]+/u;

/** 완성형 음절이 하나라도 있으면 한글 어절이다. 자모(`ㅈㄱ`)는 여기 안 걸린다 — 초성 검색은 1차 제외다. */
const HANGUL = /[가-힣]/;

/**
 * 붙여 쓴 형태를 만들어 볼 어절 쌍의 길이 상한.
 *
 * `줄 간격`(3) · `글자 크기`(4) · `텍스트 임포트`(6) · `스타일 카탈로그`(8)는 사람이 붙여서
 * 치지만 그보다 길어지면 아무도 안 친다. 상한이 없으면 문장 전체가 색인에 한 토큰씩 더 쌓인다.
 *
 * **세 어절짜리 띄어쓰기 변형은 어차피 안 잡힌다**(`한 줄 간격` → `한줄간격`). 붙여서 치는 것은
 * 이름이고, 이름은 두 어절에서 끝난다 — 그 뒤는 문장이다.
 */
const JOIN_MAX = 8;

function words(text: string): string[] {
  return text.toLowerCase().split(BOUNDARY).filter(Boolean);
}

/** 어절 하나 + 그 안의 2-gram. 한글이 없는 어절(`kerning`·`ctrl+h`)은 쪼개지 않는다 — 라틴
 * 문자는 조사도 복합도 없어 2-gram이 색인만 부풀리고 `in`·`er` 같은 잡음을 늘린다. */
function expand(word: string): string[] {
  const out = [word];
  if (HANGUL.test(word)) {
    for (let i = 0; i + 2 <= word.length; i++) out.push(word.slice(i, i + 2));
  }
  return out;
}

/**
 * **색인 쪽.** 어절 · 2-gram · 공백 제거 정규화 셋이 전부 여기서 적용된다.
 *
 * 붙여 쓴 형태에서 새로 생기는 정보는 둘뿐이다 — **합친 어절 자체**와 **경계를 넘는 2-gram**.
 * 나머지 2-gram은 두 어절이 각자 이미 냈다.
 */
export function indexTokens(text: string): string[] {
  const parts = words(text);
  const out: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const word = parts[i];
    out.push(...expand(word));

    const next = parts[i + 1];
    if (
      next !== undefined &&
      HANGUL.test(word) &&
      HANGUL.test(next) &&
      word.length + next.length <= JOIN_MAX
    ) {
      out.push(word + next, word.slice(-1) + next[0]);
    }
  }

  return [...new Set(out)];
}

/**
 * **질의 쪽 — 공백 제거 정규화를 여기서는 안 한다.** 비대칭이 의도다.
 *
 * 질의어를 붙여 버리면 `자간 크기`처럼 **본문에서 떨어져 있는 두 낱말**이 `자간크기`가 되고,
 * 색인에 없는 `간크`를 AND로 요구하다 **0건**이 된다. 붙여 친 질의(`줄간격`)는 색인 쪽이
 * 이미 붙여 넣어 뒀으므로 여기서 또 붙일 일이 없다.
 */
export function queryTokens(text: string): string[] {
  return [...new Set(words(text).flatMap(expand))];
}
