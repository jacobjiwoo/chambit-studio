/**
 * **한글 토크나이저 — 지는 것이 셋이다.**
 *
 * 1. **어절 분해** — 조사는 접미라서 prefix 확장이 흡수한다(실측 재현율 60% → 92%)
 * 2. **2-gram** — 복합명사 안쪽을 연다(→ 100%). 실패는 전부 `화면송출`·`입력모드`처럼
 *    붙여 쓴 UI 용어 안쪽이었다
 * 3. **공백 제거 정규화** — 붙여 친 `줄간격`이 `줄 간격`을 찾아야 한다.
 *    **2-gram만으로는 띄어쓰기 변형을 못 흡수한다** — 어절 경계를 넘는 `줄간`이 색인에 없다
 *
 * **셋째가 사는 자리가 2026-08-07에 바뀌었다 — 색인에서 질의로 옮겼다.** 예전에는 색인이
 * 붙인 어절(`줄간격`)을 통째로 들고 있었고, 그 합친 어절 하나가 **색인의 47%**였다(본문
 * 13,433자에 292 KB). 지금 색인에 넣는 것은 **경계 2-gram(`줄간`)뿐**이고, 어절을 붙여 치는
 * 경우는 `search.ts`의 `plan()`이 `OR[어절, AND[2-gram들]]`로 편다. 재현율은 그대로이고
 * 색인이 292 → 205 KB가 됐다.
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
 * **경계 2-gram을 만들어 둘 어절 쌍의 길이 상한.**
 *
 * `줄 간격`(3) · `글자 크기`(4) · `텍스트 임포트`(6) · `스타일 카탈로그`(8)는 사람이 붙여서
 * 치지만 그보다 길어지면 아무도 안 친다. 상한이 없으면 문장의 모든 어절 경계가 색인에 항을
 * 하나씩 더 쌓는다 — 붙여 칠 리 없는 자리까지.
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
 * **색인 쪽.** 어절 · 어절 안 2-gram · **어절 경계 2-gram** 셋을 낸다.
 *
 * 붙여 쓴 형태에서 새로 생기는 정보는 둘이었다 — **합친 어절 자체**와 **경계를 넘는 2-gram**.
 * 나머지 2-gram은 두 어절이 각자 이미 냈다. **앞의 것은 여기서 뺐다** — 항 하나가 길고
 * 문서마다 달라 색인의 절반을 먹는데, 질의 쪽에서 `OR[어절, AND[2-gram들]]`로 같은 일을 한다.
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
      out.push(word.slice(-1) + next[0]);
    }
  }

  return [...new Set(out)];
}

/**
 * **질의 쪽 — 색인에 실제로 요구할 항들.** 전부 AND로 묶여 나간다.
 *
 * **한글 세 글자 이상은 어절 자체를 안 요구하고 2-gram만 요구한다.** 붙여 친 `줄간격`은 색인에
 * 어절로 없지만(본문이 `줄 간격`이다) 경계 2-gram `줄간`과 어절 안 2-gram `간격`으로는 있다.
 * **색인이 합친 어절을 안 들고도 그 질의가 걸리는 이유 전부가 이 한 줄이다** — 색인의 47%가
 * 거기 있었다. 어절이 색인에 실재하는 경우(`스타일`)에도 그 2-gram은 같은 문서에 다 있으므로
 * 걸리는 문서 집합은 안 줄어든다(실측: 게이트 1의 20개 질의 전부 유지).
 *
 * **질의어끼리 붙이지는 않는다.** 붙여 버리면 `자간 크기`처럼 본문에서 떨어져 있는 두 낱말이
 * `자간크기`가 되고, 색인에 없는 `간크`를 요구하다 **0건**이 된다. 붙이는 것은 어절 **안**에서만
 * 일어나는 일이다.
 *
 * 두 글자 이하와 라틴 어절(`Kerning`·`Ctrl+H`)은 어절 그대로다 — 쪼갤 것이 없다.
 */
export function searchTokens(text: string): string[] {
  return [
    ...new Set(
      words(text).flatMap((word) => {
        const [self, ...grams] = expand(word);
        return grams.length > 0 ? grams : [self];
      }),
    ),
  ];
}

/**
 * **하이라이트 쪽 — 결과 줄에서 무엇을 칠할지.** 어절과 그 2-gram이 함께 필요하다.
 *
 * 색인에 요구하는 항(`searchTokens`)과 **다른 목록인 것이 의도다.** `스타일`을 치면 걸리는
 * 근거는 2-gram 둘이지만, 사람 눈에 칠해져야 하는 것은 **`스타일` 세 글자 통째**다.
 */
export function highlightTokens(text: string): string[] {
  return [...new Set(words(text).flatMap(expand))];
}
