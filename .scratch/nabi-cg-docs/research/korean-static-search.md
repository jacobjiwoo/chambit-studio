# 정적 사이트에서 한글 전문 검색 — 가능한 길과 각 길의 대가

- 조사일: 2026-08-03
- 대상: nabi-cg-docs (Next.js 16.2 App Router + React 19.2 + Tailwind v4 + TS strict, `output: 'export'`, Cloudflare Pages, 서버 없음)
- 티켓: [`.scratch/nabi-cg-docs/issues/03-korean-static-search.md`](../issues/03-korean-static-search.md)
- 질문: **서버 없이 한글 문서를 제대로 검색하게 만들 수 있는가 — 어떤 방법이 있고 무엇을 포기해야 하는가.**

> 이 문서의 숫자는 **추정이 아니라 실측**이다. `~/Downloads/NABI_2.5.pdf`를 `pdftotext -enc UTF-8`로 뽑아
> **153페이지 / 본문 105,846자 / 한글 32,934자**짜리 HTML 사이트를 만들고 후보 도구를 전부 그 위에 돌렸다.
> 재현 절차는 [부록 A](#부록-a--측정-재현-절차)에 있다. 측정 환경: Node v24.14.0 (ICU 78.2), macOS 26 arm64.

---

## 0. 결론 요약 — 가능한 길과 대가

"도구를 고르는" 표가 아니라 **"기술 경로 × 대가"** 표다. 도구는 경로를 담는 그릇일 뿐이고, 갈리는 것은 **토큰화 방식**이다.

| # | 경로 | 판정 | 첫 검색 전송량(실측, 153p) | 재현율(실측) | 조사 | 복합명사 | 초성 | 대가 |
|---|---|---|---|---|---|---|---|---|
| **A** | **어절 색인 + prefix 확장** (Pagefind, ZBSearch/Fumadocs, MiniSearch `prefix:true`) | **된다** | Pagefind ≈ **195 KB**<br>MiniSearch ≈ **70 KB** | **92%** | ✅ 대부분 해결 | ❌ 앞에서만 | ❌ | 접두 일치라 `송출`이 `화면송출`을 못 잡는다. 그대로 두면 복합명사 질의에서 재현율이 44~63%로 떨어진다 |
| **B** | **한글 n-gram(2-gram) 색인** (MiniSearch·FlexSearch·Lunr에 커스텀 토크나이저) | **된다** | ≈ **101 KB** | **100%** | ✅ | ✅ | ❌ | 인덱스 gzip **52 → 83 KB (+60%)**. 정밀도는 짧은 질의에서 흔들릴 수 있다(이 코퍼스에선 안 흔들렸다) |
| **C** | **형태소 분석**(garu-ko / kiwi-nlp WASM) | **조건부** | 색인만 ≈ **54 KB**<br>**+ 분석기 1.6 MB** | **99%** | ✅ | ✅ | ❌ | 질의도 같은 분석기로 돌려야 한다 → 브라우저에 **모델 1.4 MB + WASM 398 KB**. 미등록 도메인 용어에서 무너진다(`크롤` 33%) |
| **C′** | **형태소는 빌드에서만 + 질의는 "어절→형태소 사전"** | **된다 (실측 확인)** | ≈ **76 KB** | **99%**(코퍼스 내 어절) | ✅ | ✅ | ❌ | 사전 gzip **22 KB**. 코퍼스에 없는 활용형(`저장했다`)은 못 잡는다 |
| **D** | **자모/초성 색인** (전부 커스텀) | **된다, 단 자작** | +**23 KB**(A 대비) | — | — | — | ✅ | 기성 도구 중 초성을 지원하는 것이 **하나도 없다**. 직접 만들어야 한다 |
| **E** | **음절 1-gram** (FlexSearch `Charset.CJK`) | **쓰면 안 된다** | 31 KB(가장 작다) | — | — | — | ❌ | `화면송출` 질의가 153개 중 **101개**를 돌려준다. 인덱스는 제일 작지만 검색이 아니다 |
| **F** | **문자열 퍼지 매칭** (Fuse.js) | **조건부** | ≈ **60 KB** | 부분문자열 일치 | ✅ | ✅ | ❌ | 역색인이 없다. 153문서에서 **검색 1회 9.3 ms**, 문서 수에 선형. 점수가 BM25가 아니라 편집거리라 문서 검색 랭킹으로는 약하다 |
| **G** | **Cloudflare Workers / Pages Functions에 인덱스를 두기** | **된다, 그러나 "서버 없음"을 깬다** | ~0 (질의당 왕복) | 서버급 | — | — | — | 물려받은 제약(`output:'export'` + 서버 없음)을 정면으로 깬다. 이 티켓의 전제를 바꾸는 결정이다 |

**한 문장 요약** — 한글은 어절이 공백으로 갈리므로 **경로 A만으로도 92%는 간다.** 나머지 8%는 전부 **복합명사 안쪽**이고, 이걸 메우는 값은 **2-gram이면 인덱스 +31 KB, 형태소면 브라우저에 1.6 MB**다. **초성은 어떤 기성 도구도 주지 않는다.**

---

## 1. 한글이 왜 어려운가 — 이 코퍼스에서 실제로 무엇이 깨지는가

### 1-1. 통념 하나를 먼저 깨야 한다: 한국어는 CJK 세그멘테이션 문제가 아니다

중국어·일본어는 공백이 없어서 사전 기반 분절이 필수다. **한국어는 공백으로 어절이 갈린다.** 그래서 정적 검색 도구들의 "CJK 지원"은 한국어에 **거의 아무것도 해주지 않는다.** 이건 추론이 아니라 코드에 그렇게 쓰여 있다.

**(확인됨) Pagefind는 한국어를 분절하지 않는다.** 색인 쪽:

```rust
// pagefind/src/fossick/mod.rs:370
let should_segment = matches!(data.language.split('-').next().unwrap(), "zh" | "ja" | "th");
```

검색 쪽도 같다:

```ts
// pagefind_web_js/lib/coupled_search.ts:24-28
// Languages that need non-whitespace segmentation.
const needsWordSegmentation = (lang: string | null): boolean => {
  if (!lang) return false;
  const primaryLang = lang.split("-")[0].toLowerCase();
  return ["zh", "ja", "th"].includes(primaryLang);
};
```

- 출처: <https://github.com/Pagefind/pagefind/blob/main/pagefind/src/fossick/mod.rs>, <https://github.com/Pagefind/pagefind/blob/main/pagefind_web_js/lib/coupled_search.ts> (main 브랜치, 마지막 커밋 2026-07-30)
- **문서와 코드가 어긋난다(확인됨).** 공식 문서 `multilingual.md`는 "This section currently applies to Chinese, Japanese, and Korean languages"라고 쓰고 있으나(<https://pagefind.app/docs/multilingual/>) 실제 분절 대상은 `zh|ja|th`이고 **`ko`는 빠져 있다.** 같은 문서의 언어 표에서 Korean은 stemming `❌`다.
- 실제로 `--verbose` 출력이 이렇게 말한다(실측): `Note: Pagefind doesn't support stemming for the language ko. Search will still work, but will not match across root words.`

**(확인됨) `Intl.Segmenter('ko', {granularity:'word'})`도 한국어를 안 쪼갠다.** Node v24.14.0 / ICU 78.2에서 직접 돌린 결과:

```
"자막을 선택하면 화면송출이 시작됩니다"
  -> 자막을 | 선택하면 | 화면송출이 | 시작됩니다      ← 조사가 붙은 채 통째
ja "東京大学の学生"
  -> 東京 | 大学 | の | 学生                          ← 일본어는 사전으로 쪼갠다
```

이게 중요한 이유: **Orama/ZBSearch의 한국어 토크나이저도, Fumadocs의 기본 `multilingual` 모드도 전부 `Intl.Segmenter`다.** 즉 세 도구가 서로 다른 이름으로 **같은 일(공백 분리)** 을 하고 있다.

- Orama 한국어 토크나이저 소스: `const segmenter = new Intl.Segmenter('ko', { granularity: 'word' })` — <https://github.com/oramasearch/orama/blob/main/packages/tokenizers/src/korean.ts>
- Orama 자신의 테스트 파일이 이 한계를 주석으로 적어 두었다(1차 출처로서 결정적):
  > `Intl.Segmenter('ko', { granularity: 'word' })` segments Korean on whitespace (UAX#29), so space-less compounds such as '서울대학교' stay a single token and are NOT split into '서울' + '대학교' (unlike the Japanese/Mandarin tokenizers, where dictionary segmentation splits e.g. '東京大学' into '東京' + '大学'). This is an experimental limitation of the Korean tokenizer.
  > — <https://github.com/oramasearch/orama/blob/main/packages/tokenizers/tests/korean.test.ts>
- ZBSearch `multilingual` 모드: `new Intl.Segmenter(undefined, { granularity: 'word' })` — `zbsearch@3.3.4/dist/esm/components/tokenizer/index.js`

### 1-2. 그래서 진짜 문제는 둘이다: 조사와 복합명사

Pagefind가 만든 실제 인덱스를 gzip 해제해 열어 보면 이렇게 들어 있다(실측):

```
자막*  →  자막, 자막을, 자막의, 자막이, 자막이나, 자막파일   (6개 별개 토큰)
화면*  →  화면, 화면사이즈, 화면사이즈에, 화면상에, 화면송출,
          화면송출을, 화면에, 화면에서, 화면을, 화면의, 화면이
```

**조사 문제는 prefix 확장이 거의 공짜로 풀어 준다.** 조사는 항상 **접미**이기 때문이다. Pagefind는 색인 단어를 양방향 접두 매칭한다:

```rust
// pagefind_web/src/search.rs:811-822  fn find_word_extensions
if key.starts_with(term) { extensions.push((key, results)); }      // 자막 → 자막을/자막이/…
else if term.starts_with(key) && … { longest_prefix = Some(key); } // 자막을 → 자막 (폴백)
```

Orama/ZBSearch도 기본 `exact: false`에서 radix 트리 접두 매칭을 한다(위 테스트 파일 주석이 명시). MiniSearch는 `prefix: true` 옵션, Lunr은 질의에 `*`를 직접 붙여야 한다.

**복합명사가 남는다.** 접두 매칭은 `송출`로 `화면송출`을 못 잡는다. 이 코퍼스에서 그 손실을 세어 봤다:

| 질의어 | 정답(부분문자열 일치) | 어절 정확일치만 | 어절 prefix | prefix 재현율 |
|---|---:|---:|---:|---:|
| 자막 | 15 | 7 | 12 | 80% |
| 송출 | 38 | 32 | 38 | 100% |
| 페이지 | 61 | 51 | 59 | 97% |
| **모드** | 24 | 6 | 11 | **46%** |
| 효과 | 23 | 9 | 20 | 87% |
| 단축키 | 24 | 14 | 24 | 100% |
| 설정 | 63 | 34 | 60 | 95% |
| 파일 | 66 | 41 | 63 | 95% |
| 그룹 | 4 | 2 | 4 | 100% |
| **화면** | 19 | 5 | 12 | **63%** |
| 방영 | 7 | 3 | 7 | 100% |
| 삽입 | 30 | 19 | 30 | 100% |
| 리스트 | 19 | 10 | 17 | 89% |
| 폰트 | 12 | 5 | 11 | 92% |
| 정렬 | 21 | 13 | 20 | 95% |
| 템플릿 | 17 | 15 | 17 | 100% |
| **크롤** | 9 | 2 | 4 | **44%** |
| 이미지 | 43 | 33 | 41 | 95% |
| 배경 | 17 | 6 | 17 | 100% |
| 저장 | 33 | 22 | 33 | 100% |
| **합계** | **545** | 329 | 500 | **92%** |

- **어절 정확일치만 쓰면 재현율 60%** — prefix 확장 없는 설계는 애초에 후보가 아니다.
- **prefix까지 쓰면 92%.** 실패는 전부 복합명사 안쪽(`입력모드`, `페이지모드전환`, `화면송출`, `크롤타입`)이다.
- 나비CG 매뉴얼은 UI 용어를 붙여 쓰는 문서라 이 패턴이 특히 많다. `모드`가 46%라는 건 방송부 사람이 "모드"를 검색하면 **관련 페이지 절반을 못 본다**는 뜻이다.

### 1-3. 초성 검색 — 아무도 안 해 준다

**(확인됨) Pagefind · Orama/ZBSearch · FlexSearch · Lunr · MiniSearch · Fuse.js · Nextra · Fumadocs 전부 초성 검색을 지원하지 않는다.** 전부 실측으로 확인했다(`ㅈㅁ` 질의 → 모두 0건). 지원 언어 목록·토크나이저 소스 어디에도 자모 분해가 없다.

되게 하려면 **색인 시 초성 문자열을 추가 토큰으로 넣는 수밖에 없다.** 자모 분해는 유니코드 산술이라 라이브러리 없이도 20줄이면 되고, 쓰겠다면 `es-hangul`(toss, v2.4.0, 2026-07-09, `getChoseong`/`disassemble`)이 있다.

실측: `getChoseong("자막을 선택하면") === "ㅈㅁㅇ ㅅㅌㅎㅁ"`. 초성 토큰을 얹은 MiniSearch 인덱스에서 `"ㅈㅁ"` prefix 질의 → **21건**, `"ㄷㅊㅋ"` → 24건(= 단축키). 대가는 인덱스 gzip **52 → 75 KB**.

### 1-4. 세 접근이 각각 무엇을 잡고 무엇을 놓치나 (요약)

| 접근 | 잡는 것 | 놓치는 것 | 이 코퍼스 재현율 | 인덱스 gzip |
|---|---|---|---:|---:|
| 어절 + prefix | 조사 변화 | 복합명사 안쪽, 활용형 어간 변화(`만든`↔`만들다`), 초성 | 92% | 52 KB |
| 2-gram | 조사·복합명사·부분문자열 전부 | 초성, 1글자 질의, 어간 변화 | 100% | 83 KB |
| 형태소 분석 | 조사·복합명사·활용형 전부 | 사전에 없는 도메인 용어, 초성 | 99% | **36 KB** |
| 자모/초성 | 초성 질의 | (단독으론 검색이 안 됨. 다른 것과 겹쳐 써야 함) | — | +23 KB |
| 음절 1-gram | (표면적으론) 전부 | **정밀도 전부** | — | 31 KB |

**형태소 인덱스가 가장 작다**는 게 반직관적이지만 이유는 명확하다. 어절 3,331종이 형태소 몇백 종으로 접히므로 사전 키가 줄어든다. 값은 **분석기를 브라우저에 실어야 한다**는 것이다(§3-3).

---

## 2. 후보 도구 실사

### 2-0. 한눈에

| 도구 | 한국어 공식 지원 | 실제로 하는 일 | 인덱스 청크 분할 | 유지보수(2026-08-03) |
|---|---|---|---|---|
| **Pagefind** 1.5.2 | **부분** — 언어 표에 `ko` 있음, stemming ❌, **분절 대상에서 제외** | 어절 색인 + 양방향 접두 확장 | **있음** (단, 이 규모에선 1청크) | ✅ 활발. 마지막 커밋 2026-07-30, ★5.4k, 열린 이슈 136, MIT |
| **Orama** `@orama/*` 3.1.18 | 한국어 토크나이저 존재하나 **npm 미출시** | `Intl.Segmenter('ko')` = 공백 분리 | 없음 (통짜) | ⚠️ **팀 전원 이탈**. 마지막 npm 배포 2025-12-19 |
| **ZBSearch** 3.3.4 (Orama 후속) | **있음** — `@zbsearch/tokenizers/korean` 출시됨 | 위와 동일 | 없음 (통짜) | ✅ 활발. 2026-07-08 개설, 2026-07-27 배포, ★139 |
| **FlexSearch** 0.8.212 | **"CJK" 프리셋 있음 = 사실상 없음** | `Charset.CJK`는 `{split:""}` — 음절 1-gram | 없음(`export`가 key별로 나눠 주긴 함) | ⚠️ 코드는 활발(2026-06-28), npm 배포는 2025-09-06, Apache-2.0 |
| **Lunr** 2.3.9 + lunr-languages 1.20.0 | 목록에 Korean 있음 | **스테머가 항등함수**(아무것도 안 함) + 불용어 + 한글 trimmer | 없음 | ❌ lunr 본체 마지막 배포 **2023-07-10**, 마지막 푸시 2024-07-31, 열린 이슈 130 |
| **MiniSearch** 7.2.0 | **없음**(중립) | 정규식 공백/구두점 분리, `tokenize`/`processTerm` 완전 교체 가능 | 없음 | ✅ 안정. 2025-09-16, ★6.1k, 열린 이슈 13, MIT |
| **Fuse.js** 7.5.0 | 해당 없음(문자 단위 퍼지) | Bitap 근사 부분문자열 매칭 | 없음 | ✅ 2026-07-13, ★20.4k, 열린 이슈 1, Apache-2.0 |
| **Nextra** 4.6.1 | 검색은 Pagefind에 위임 | = Pagefind | = Pagefind | ⚠️ 저장소는 활발(2026-07-31)이나 npm `latest`는 2025-12-04 |
| **Fumadocs** 16.14.0 | 기본 `multilingual` 모드 | `Intl.Segmenter(undefined)` = 공백 분리 | 없음 (통짜 `static.json`) | ✅ 가장 활발. 2026-08-02, ★12.8k, 열린 이슈 2, MIT |

### 2-1. Pagefind — 이 제약 조합에 가장 맞는 그릇 (한국어 품질은 A 경로 그대로)

**동작 (실측).** `pdftotext` 본문으로 만든 153페이지 사이트에 `npx pagefind --site site`:

```
Discovered 1 language: ko
  * ko: 153 pages
Indexed 153 pages / Indexed 5527 words
Finished in 0.104 seconds
```

**첫 검색에서 실제로 내려가는 바이트 (실측).** Pagefind는 인덱스를 **자체 gzip해서 저장**하므로 아래가 곧 전송량이다("Pagefind handles compression of the files in the bundle directly, so no server gzip support is required" — <https://pagefind.app/docs/hosting/>).

| 파일 | 크기 | 비고 |
|---|---:|---|
| `pagefind-entry.json` | 173 B | |
| `pagefind.ko_*.pf_meta` | 1,185 B | gzip 저장 |
| `wasm.unknown.pagefind` | 68,199 B | gzip 저장 (원본 140,536 B) |
| `pagefind.js` | 45,555 B → **12,849 B** | CDN gzip 후 |
| `index/ko_*.pf_index` | **109,405 B** | gzip 저장 (원본 317,591 B) |
| `fragment/*.pf_fragment` × 결과수 | 평균 **680 B** | 153개 전체 합계 104,170 B |
| *(기본 UI 쓸 경우)* `pagefind-ui.js` + `.css` | 32,392 B | gzip 후 |
| **합계 (커스텀 UI, 결과 5건)** | **≈ 195 KB** | |

**청크 분할 — 있지만 이 규모에선 안 걸린다(중요).** Pagefind는 단어 인덱스를 청크로 쪼개고 질의어 범위에 걸리는 청크만 `request_indexes()`로 받아온다(`pagefind_web_js/lib/coupled_search.ts:669`). 그러나 기본 청크 크기가 20,000이라(`pagefind/src/options.rs:217 default_index_chunk_size()`) **153페이지·5,527단어는 청크 1개(109 KB)로 끝난다.** 즉 이 사이트 규모에서 "청크 분할"은 **작동하지 않는 이점**이고, 첫 검색에 인덱스 전량이 내려온다. 규모가 몇 배로 커져야 의미가 생긴다.

**한국어 품질.** §1-2의 경로 A 그대로다. `자막` → `자막을/자막이/자막의/자막파일` 전부 잡고, `송출` → `화면송출` 못 잡는다. **Pagefind는 토크나이저를 바꿀 수 없다** — 색인기가 Rust 바이너리라 n-gram이나 형태소를 끼워 넣을 방법이 없다. HTML을 미리 변형해서(보이지 않는 보조 토큰을 심어서) 우회하는 건 이론상 가능하지만 발췌문이 오염된다. **경로 A에 고정된다는 게 Pagefind의 근본 제약이다.**

**그 외 확인된 성질.**
- 기본 제외 셀렉터: `head, style, script, noscript, label, form, svg, footer, nav, iframe, template` (`pagefind/src/fossick/parser.rs:31`). Next.js App Router가 HTML에 인라인으로 박는 RSC 페이로드(`<script>`)는 자동으로 빠지고, 사이드바(`<nav>`)도 빠진다 — 문서 사이트엔 유리하다.
- 제목 가중치 기본 h1=7.0 … h6=2.0, `data-pagefind-weight`로 0.0~10.0 조절 (<https://pagefind.app/docs/weighting/>).
- CSP 주의: WASM 때문에 `script-src 'wasm-unsafe-eval'`, 워커 때문에 `worker-src 'self' blob:` 필요할 수 있다 (<https://pagefind.app/docs/hosting/>).
- 설치: `pagefind@1.5.2`는 플랫폼별 바이너리를 **optionalDependencies**(`@pagefind/linux-x64` 등)로 받는다. postinstall 다운로드가 없어 CI에서 안전하다.

### 2-2. Orama → **ZBSearch** — 조사 중 발견한 가장 큰 지형 변화

**(확인됨) Orama 엔지니어링 팀 전원이 이탈해 ZBSearch로 포크했다.**

> ZBSearch (_zee bee search_) is a zero-bs fork of Orama maintained by **the original Orama team**. … After Michele's departure, the entire engineering team left Orama and reassembled to maintain this popular project with no external influence.
> — <https://github.com/micheleriva/zbsearch/blob/main/README.md> (저장소 개설 2026-07-08, ★139, 마지막 푸시 2026-07-31)

실무적 귀결:

| | `@orama/*` | `zbsearch` / `@zbsearch/*` |
|---|---|---|
| 최신 npm 버전 | 3.1.18 | 3.3.4 |
| 마지막 npm 배포 | **2025-12-19** | **2026-07-27** |
| 한국어 토크나이저 | 소스엔 있으나(2026-06-27 머지) **npm 미출시** — 설치해 확인한 3.1.18의 `exports`는 `['./japanese','./mandarin']`뿐 | **출시됨** — `exports`에 `'./korean'` 포함 |
| Fumadocs가 쓰는 것 | — | **`zbsearch@^3.3.4`** (fumadocs-core 16.14.0 dependencies) |

**즉 "Orama를 쓴다"는 선택은 오늘 시점에서 유지보수가 멈춘 패키지를 고르는 것이다.** 한국어 토크나이저를 쓰려면 `@zbsearch/tokenizers/korean`이어야 한다.

**한국어 지원의 실체.** 위 §1-1에서 본 대로 `Intl.Segmenter('ko')` = 공백 분리. 스테머·불용어는 **없다** — `zbsearch`의 `SUPPORTED_LANGUAGE_LOCALES`에 `korean` 항목 자체가 없다(31개 언어, 한국어 미포함). 즉 **Fumadocs의 기본 `multilingual` 모드와 한국어 결과가 사실상 같다.**

**인덱스 크기 — 여기서 무너진다 (실측).** 같은 153페이지·4필드:

| | raw | gzip | brotli |
|---|---:|---:|---:|
| `multilingual` 기본 | 700 KB | 142 KB | 67 KB |
| `@zbsearch/tokenizers/korean` | 1,474 KB | **291 KB** | 157 KB |
| `persist('binary')` | 2,108 KB | 329 KB | 167 KB |
| `persist('dpack')` | 1,196 KB | 284 KB | 159 KB |

**청크 분할이 없다.** 정적 모드에서는 통짜 인덱스를 통째로 받는다. Fumadocs 문서도 이 값을 경고한다:

> Static Search requires clients to download the exported search indexes. For large docs sites, it can be expensive.
> — <https://fumadocs.dev/docs/headless/search/orama>

즉 **Pagefind 195 KB vs ZBSearch 291 KB + 런타임 JS.** 그리고 한국어 검색 품질은 둘이 같은 경로 A다.

**동작 확인 (실측, `threshold:0`).** `자막` 12건 / `자막을` 2건 / `송출` 38건 / `화면송출` 1건 / `ㅈㅁ` 0건. 검색 100회 3.1 ms. — 관찰된 quirk 하나: `exact: true`를 주면 어떤 질의도 0건이 나왔다(색인에 `자막` 토큰이 실제로 있는데도). 원인은 확인 못 했다.

### 2-3. FlexSearch — "CJK 지원"이 한국어에 함정인 사례

README가 "Chinese, Korean, Japanese (CJK)"를 지원 목록에 올리고 `Charset.CJK` 프리셋을 제공한다(<https://github.com/nextapps-de/flexsearch/blob/master/doc/encoder.md#cjk-word-break-chinese-japanese-korean>). **그 프리셋의 전문은 이게 전부다:**

```js
// dist/module-debug/charset/cjk.js
const options = { split: "" };
```

즉 **모든 문자를 개별 토큰으로 쪼갠다.** 중국어에는 그럭저럭 통하지만 한국어에서는 재앙이다(실측, 고유 문서 수 / 전체 153):

| 질의 | `Charset.CJK` | 기본 encoder |
|---|---:|---:|
| 자막 | **105** | 7 |
| 자막을 | **103** | 2 |
| 송출 | **100** | 32 |
| **화면송출** | **101** | 0 |
| 단축키 | **101** | 14 |

`화면송출`을 찾으면 153쪽 중 101쪽이 나온다. 검색이 아니다. (인덱스는 31 KB gzip으로 제일 작다 — 아무 정보도 담지 않았으니 당연하다.)

**FlexSearch의 진짜 값어치는 `encoder`/`split`을 통째로 교체할 수 있다는 유연성**이다. 커스텀 한글 토크나이저(2-gram·형태소)를 꽂는 그릇으로는 쓸 수 있다. 다만 기본 encoder도 어절 통짜 매칭이라 `화면송출`이 0건이 되는 등 그대로는 못 쓴다.

### 2-4. Lunr — 후보에서 빼도 된다

**(확인됨) `lunr-languages`의 한국어 스테머는 항등함수다.** 아무 일도 하지 않는다:

```js
// lunr.ko.js
lunr.ko.stemmer = (function() {
  return function(word) {
    if (typeof word.update === "function") {
      return word.update(function(word) { return word; })   // ← 그대로 반환
    } else { return word; }
  }
})();
```

같은 파일에서 **토크나이저는 통째로 주석 처리되어 있다**(`// change the tokenizer for japanese one`). 실제로 살아 있는 것은 한글 음절 범위 trimmer(`가-힣`)와 불용어 목록뿐이다.
- 출처: <https://github.com/MihaiValentin/lunr-languages/blob/master/lunr.ko.js>

거기에:
- **인덱스가 제일 크다** — 697 KB raw / **121 KB gzip** (같은 코퍼스에서 MiniSearch 52 KB의 2.3배).
- **lunr 본체가 멈춰 있다** — npm `lunr@2.3.9` 마지막 배포 2023-07-10, 저장소 마지막 푸시 2024-07-31, 열린 이슈 130.
- 접두 매칭이 자동이 아니다. 질의에 `*`를 직접 붙여야 한다(실측: `자막` 7건 → `자막*` 12건).

### 2-5. MiniSearch — 한국어 "공식 지원"은 없지만, 커스텀을 꽂기에 가장 깔끔하다

**공식 언어 지원 없음(중립).** 기본 토크나이저는 유니코드 공백/구두점 정규식이라 한글 어절이 그대로 토큰이 된다. 결정적인 건 **`tokenize`와 `processTerm`을 색인 시점과 검색 시점 각각에 임의 함수로 갈아끼울 수 있다**는 점이다. 위 §1-4의 n-gram·초성·형태소 실험은 **전부 MiniSearch 위에서 돌렸다.**

- 런타임 번들 17.7 KB gzip (dist/es).
- 기본 인덱스 52 KB gzip / 41 KB brotli — **원문 JSON(51 KB gzip)과 거의 같다.** 필드 지정(`fields: ["alt"]`), 필드 부스트(`boost: {title: 3}`) 지원.
- 검색 1,000회 14.8 ms (0.015 ms/회).
- 유지보수: v7.2.0, 2025-09-16, ★6.1k, 열린 이슈 13, MIT. "활발"은 아니고 "안정"이다.
- **인덱스 직렬화는 `JSON.stringify(miniSearch)`, 복원은 `MiniSearch.loadJSON`** — 빌드에서 굽고 정적 파일로 내려보내는 데 특별한 플러그인이 필요 없다. 청크 분할은 **직접 만들어야 한다**.

### 2-6. Fuse.js — 다른 종류의 도구

역색인이 아니라 **Bitap 근사 문자열 매칭**이라 부분문자열이 그냥 걸린다(실측: `송출` 38건, `화면송출` 3건 — n-gram 없이 복합명사가 잡힌다). 인덱스는 51 KB gzip(사실상 원문). 하지만:

- **문서 수에 선형.** 153문서 20회 검색에 186.6 ms = **회당 9.3 ms**. 100페이지면 견디지만 "타이핑하는 동안 결과"에는 빠듯하고, 문서가 늘면 그대로 늘어난다.
- **점수가 편집거리**라 BM25 같은 문서 랭킹이 아니다. `threshold`를 조금만 풀어도 무관한 문서가 섞인다.
- 초성 ❌(실측 0건).
- 유지보수는 최상급(★20.4k, 2026-07-13, 열린 이슈 1).

**"제목·헤딩만 대상으로 하는 보조 검색"** 으로는 아주 좋은 도구지만, 본문 전문 검색의 주 엔진으로는 위험하다.

### 2-7. Nextra 4 — 검색은 Pagefind다

**(확인됨)** Nextra 4는 FlexSearch를 버리고 Pagefind로 갈아탔다. 빌드 통합은 `postbuild` 스크립트다:

```
pagefind --site .next/server/app --output-path public/_pagefind
```

정적 빌드(`output: 'export'`)에서는 `out/_pagefind`로 내보내는 별도 레시피를 문서가 제공한다.
- 출처: <https://nextra.site/docs/guide/search>, <https://the-guild.dev/blog/nextra-4>
- 즉 **Nextra를 고르는 것은 곧 Pagefind(경로 A)를 고르는 것**이고, 한국어 관련 이점은 0이다.
- 주의: npm `nextra@4.6.1`의 마지막 배포는 **2025-12-04**다(저장소는 2026-07-31까지 활발하나 `latest` 태그가 8개월 묵었다).

### 2-8. Fumadocs 16 — 정적 검색을 문서화한 유일한 프레임워크, 그러나 경로 A

- **정적 export 정식 지원(확인됨).** 서버 라우트 대신 `staticGET`을 쓰고 클라이언트는 `fumadocs-core/search/client/orama-static`의 `staticClient`로 통짜 인덱스를 받는다. Next.js에서는 `export const revalidate = false`.
- **한국어는 기본 `multilingual` 모드로 "그냥 된다"** — `Intl.Segmenter` 기반이라 별도 설정이 필요 없고, 대신 §1-1대로 **공백 분리 이상은 아니다.** `localeMap`으로 언어별 스테밍을 켤 수 있지만 **한국어는 그 목록에 없다.**
- 엔진은 **`zbsearch@^3.3.4`** (Orama가 아니다).
- 문서가 직접 경고한다: "Static Search requires clients to download the exported search indexes. For large docs sites, it can be expensive."
- 출처: <https://fumadocs.dev/docs/headless/search/orama>, `packages/core/src/search/zbsearch/create-db.ts`
- 유지보수는 후보 중 최상(2026-08-02 푸시, 열린 이슈 2).

---

## 3. 인덱스 크기 실측 — 같은 코퍼스, 같은 필드

153페이지 / 4필드(`title`, `content`, `caption`, `alt`) / 본문 105,846자.

| 인덱스 | raw | gzip | brotli |
|---|---:|---:|---:|
| **FlexSearch — `Charset.CJK`(음절 1-gram)** | 189 KB | **31 KB** | 25 KB |
| **MiniSearch — 형태소(garu-ko)** | 153 KB | **36 KB** | **28 KB** |
| MiniSearch — 형태소 + 초성 | 216 KB | 47 KB | 35 KB |
| *(참고) 원문 문서 JSON 전체* | 243 KB | 51 KB | 39 KB |
| Fuse.js — `createIndex` | 248 KB | 51 KB | 40 KB |
| **MiniSearch — 어절(기본)** | 234 KB | **52 KB** | 41 KB |
| FlexSearch — 기본 encoder | 433 KB | 65 KB | 49 KB |
| MiniSearch — 어절 + 초성 | 366 KB | 75 KB | 58 KB |
| **MiniSearch — 어절 + 2-gram** | 391 KB | **83 KB** | 64 KB |
| MiniSearch — 어절 + 2-gram + 3-gram | 515 KB | 102 KB | 76 KB |
| MiniSearch — 어절 + 2-gram + 초성 | 522 KB | 107 KB | 81 KB |
| **Pagefind — `.pf_index`(자체 gzip)** | 310 KB | **107 KB** | — |
| Lunr + lunr-languages ko | 697 KB | 121 KB | 92 KB |
| ZBSearch — multilingual 기본 | 700 KB | 142 KB | 67 KB |
| **ZBSearch — `tokenizers/korean`** | 1,474 KB | **291 KB** | 157 KB |

런타임 번들(별도로 내려가는 JS):

| 라이브러리 | raw | gzip | brotli |
|---|---:|---:|---:|
| Lunr | 28.8 KB | 8.2 KB | 7.4 KB |
| Fuse.js | 25.5 KB | 9.0 KB | 7.8 KB |
| FlexSearch (bundle.module.min) | 50.0 KB | 17.2 KB | 15.4 KB |
| MiniSearch | 76.2 KB | 17.7 KB | 15.2 KB |
| ZBSearch core *(트리셰이킹 전 dist/browser 전량 — 실사용은 이보다 작다)* | 252.2 KB | 49.4 KB | 40.6 KB |
| Pagefind (`pagefind.js` + WASM) | 45.6 KB + 137 KB | 12.8 KB + **68 KB(이미 gzip)** | — |
| es-hangul (초성/자모용) | 110.4 KB | 22.4 KB | 10.0 KB |
| **garu-ko 형태소 분석기** | WASM 398 KB + 모델 **1,405 KB** | 172 KB + **1,405 KB(비압축)** | 123 KB + 1,405 KB |

### 3-1. "한글 n-gram이 인덱스를 부풀린다"는 통념 검증 — **부풀지만, 이 규모에선 27 KB다**

어절만 52 KB → 어절+2-gram 83 KB. **gzip 기준 +31 KB(+60%)**, brotli 기준 +23 KB. 비율로는 크지만 절대값은 이미지 한 장보다 작다. 3-gram까지 얹으면 102 KB(+96%)인데 **재현율 이득이 없다**(2-gram만으로 이미 100%).

### 3-2. 2-gram의 재현율·정밀도 (실측)

`combineWith: "AND"`로 질의 bigram 전부 요구하면, §1-2의 20개 질의어 전부에서 **재현율 100%, 그리고 결과 개수가 정답 개수와 정확히 일치**했다(오탐 0). 짧은 도메인 용어 검색에서 2-gram은 사실상 부분문자열 검색이다.

### 3-3. 형태소 경로의 진짜 비용 — 질의측 (실측, 중요)

garu-ko(`ongjin/garu`, MIT, ★163, 2026-07-27, "1MB model, WASM, F1 93.7% NIKL MP")로 색인:

```
analyze("자막을 선택하면 화면송출이 시작됩니다")
→ 자막/NNG 을/JKO | 선택/NNG 하/XSV 면/EC | 화면/NNG 송출/NNG 이/JKS | 시작/NNG 되/XSV ㅂ니다/EF
```

조사를 떼고 **`화면송출`을 `화면` + `송출`로 분해한다.** 재현율 99%, 인덱스 36 KB gzip(최소), 153페이지 색인 1,542 ms, 로드 92 ms.

**그런데 색인만 형태소로 굽고 질의를 순진하게 처리하면 전부 무너진다 (실측):**

| 질의 | 순진(공백) | 순진+prefix | 질의도 형태소 |
|---|---:|---:|---:|
| 자막 | 15 | 15 | 15 |
| **자막을** | **0** | **0** | 15 |
| **자막이** | **0** | **0** | 15 |
| **송출하는** | **0** | **0** | 38 |
| **화면송출** | **0** | **0** | 9 |

인덱스에는 `자막`만 있고 질의는 `자막을`이라 접두 매칭조차 걸리지 않는다. **따라서 형태소 경로는 브라우저에 분석기를 실어야 한다: 모델 1,405 KB(이미 압축돼 있어 gzip이 안 먹는다) + WASM 172 KB gzip ≈ 1.6 MB.**

### 3-4. 경로 C′ — 형태소를 빌드에서만 돌리고 질의는 사전으로 대체 (실측, 이 문서의 발견)

코퍼스에 등장한 모든 어절에 대해 `어절 → 형태소` 매핑을 빌드 시 만들어 정적 파일로 내려보내면, **브라우저는 분석기 없이 사전 조회만으로 질의를 형태소화**할 수 있다.

- 사전 크기(실측): **항목 3,488개 / raw 86 KB / gzip 22 KB / brotli 19 KB**
- 실측 결과: `자막을`→`자막` 15건, `자막이`→`자막` 15건, `송출하는`→`송출` 38건 — 전부 정상
- 실패: 코퍼스에 없는 활용형(`저장했다`), 코퍼스에 없는 형태의 복합어(`화면송출` 단독형)

**클라이언트 총량 ≈ MiniSearch 18 KB + 형태소 인덱스 36 KB + 사전 22 KB ≈ 76 KB gzip.** Pagefind(195 KB)보다 작고 재현율은 92% → 99%다. 대가는 **전부 자작이라는 것**(토크나이저·사전 생성·폴백·UI를 직접 짜고 테스트해야 한다).

---

## 4. Cloudflare Pages / `output: 'export'` 와의 궁합

### 4-1. 빌드 타임 인덱싱은 성립하는가 — **성립한다**

| 확인 항목 | 결과 |
|---|---|
| `next build`(export) → `out/` → 후처리 색인 | **된다.** Pagefind는 `postbuild`로 `pagefind --site out`. Nextra가 이 레시피를 공식 문서에 싣고 있다(<https://nextra.site/docs/guide/search>) |
| Pagefind 바이너리를 CI에서 받을 수 있는가 | **된다.** `pagefind@1.5.2`는 postinstall 다운로드 없이 `optionalDependencies`(`@pagefind/linux-x64` 등)로 플랫폼 바이너리를 받는다. pnpm에서도 optional deps만 허용하면 끝 |
| JS 도구(MiniSearch/ZBSearch)로 굽기 | **된다.** 빌드 스크립트에서 `JSON.stringify(index)`를 `public/`에 쓰면 그대로 정적 자산 |
| 파일 수 제한 | **여유 있다.** Pages 무료 플랜 **20,000 files/deployment**, 유료 100,000. 이 사이트는 153 fragment + 인덱스 + 스크린샷 406장 ≈ 수백~천 단위 (<https://developers.cloudflare.com/pages/platform/limits/>) |
| 단일 파일 크기 | **여유 있다.** 상한 **25 MiB**. 가장 큰 인덱스가 291 KB |
| 빌드 시간 | **여유 있다.** 상한 **20분**. Pagefind 색인 실측 **0.104초**, 형태소 색인 1.5초 |
| 호스팅 설정 | **불필요.** "Pagefind outputs a static bundle directory … no hosting configuration is required" / "Pagefind handles compression … directly, so no server gzip support is required" (<https://pagefind.app/docs/hosting/>) |

**주의 하나 — CSP.** Pagefind는 WASM과 Web Worker를 쓴다. 엄격한 CSP를 붙일 거라면 `script-src 'wasm-unsafe-eval'`, `worker-src 'self' blob:`이 필요하다. 순수 JS 경로(MiniSearch 등)에는 이 문제가 없다.

### 4-2. Workers / Pages Functions가 여는 길 — 열리지만 전제를 깬다

**(확인됨) Cloudflare 자신이 신규 프로젝트에 Pages 대신 Workers를 권한다:**

> "Now that Workers supports both serving static assets **and** server-side rendering, you should **start with Workers**." … "Cloudflare Pages will continue to be supported, but, going forward, all of our investment, optimizations, and feature work will be dedicated to improving Workers."
> — <https://blog.cloudflare.com/full-stack-development-on-cloudflare-workers/>

이건 **호스팅 선택**의 문제이지 검색의 문제가 아니다. 정적 자산만 올리는 한 Pages든 Workers Static Assets든 위 4-1의 결론은 그대로다.

**검색을 서버로 옮기는 길은 세 갈래이고 셋 다 "서버 없음"을 깬다:**

| 길 | 여는 것 | 깨는 것 |
|---|---|---|
| Pages Functions / Worker 안에서 인덱스 조회 (인덱스는 KV·R2·번들에) | 인덱스가 클라이언트로 안 내려간다. 형태소 분석기를 서버에 두면 1.6 MB 문제가 사라진다 | 질의당 네트워크 왕복. **`output:'export'`의 "순수 정적 파일 뭉치, 호스트 갈아타는 비용 0"이라는 열린 문이 닫힌다** |
| `@zbsearch/edge-core` + `@zbsearch/runtime-cloudflare` + `@zbsearch/storage-s3`(R2) | ZBSearch 인덱스를 R2에 두고 Worker가 매니페스트 기반으로 조각만 읽는 정식 경로가 이미 npm에 있다(3.3.4) | 위와 같다. 게다가 인프라(R2 버킷·바인딩·배포)가 붙는다 |
| Orama Cloud / Algolia 등 SaaS | 운영 부담 0, 품질 최상 | 외부 의존 + 비용 + 색인 파이프라인. Fumadocs 문서가 대규모 사이트에 이걸 권한다 |

**판단:** 수십~백 페이지 규모에서 검색 때문에 서버를 도입할 이유가 실측상 없다. 최악(ZBSearch 한국어) 291 KB, 권장 경로들은 70~200 KB다. **경로 G는 "인증이 붙는다면"(맵의 `공개 범위` 미해결 항목) 같은 다른 이유로 서버가 이미 서게 됐을 때에나 다시 볼 카드다.**

---

## 5. 본문 외 필드 — 이미지 캡션 · alt 텍스트

스크린샷 406장이 답인 매뉴얼이라 이 항목이 실질적이다.

### 5-1. Pagefind — 실험으로 확인한 정확한 동작

한 페이지에 이미지 3개(1번은 h1 직후 자동 대상, 2번은 아무 표시 없음, 3번은 `data-pagefind-index-attrs="alt"`)를 넣고 색인해 인덱스를 열어 봤다:

| 대상 | 색인됨? | 어디에 |
|---|---|---|
| `<figcaption>` 텍스트 (3개 전부) | ✅ | 본문 텍스트. 발췌문에도 나온다 |
| h1 직후 **첫 이미지**의 `alt` | ✅ | **메타데이터** `image_alt`. 검색은 되지만 발췌문 본문에는 안 들어간다 |
| **두 번째** 이미지의 `alt` | ❌ | **색인 안 됨** |
| `data-pagefind-index-attrs="alt"`를 단 이미지의 `alt` | ✅ | **본문에 인라인으로** 삽입 |

실제 fragment 내용:
```json
{"content":"제목입니다. 첫번째캡션 본문내용. 두번째캡션 세번째알트텍스트. 세번째캡션",
 "meta":{"image":"/1.png","image_alt":"첫번째알트텍스트","title":"제목입니다"}}
```

- 근거(문서): "Attributes of HTML elements can be added to the search index with the `data-pagefind-index-attrs` attribute" (<https://pagefind.app/docs/indexing/>), "`image_alt` will contain the `alt` of the first `img` that follows the `h1`" (<https://pagefind.app/docs/metadata/>)
- 근거(코드): `pagefind/src/fossick/parser.rs:481-487` — `auto_image` / `auto_image_alt` 메타 삽입
- **귀결:** MDX에서 이미지를 렌더하는 컴포넌트가 **모든** `<img>`에 `data-pagefind-index-attrs="alt"`를 붙이도록 만들면 alt 406개가 전부 검색에 걸린다. 붙이지 않으면 페이지당 첫 장만 걸린다. 한 줄짜리 결정이지만 **모르면 조용히 새는 지점**이다.

### 5-2. 나머지 도구 — 전부 필드 기반이라 자연스럽다

| 도구 | 필드 지정 | 필드별 가중치 | 실측 |
|---|---|---|---|
| MiniSearch | `fields: [...]`, 검색 시 `fields: ["alt"]`로 한정 | `boost: { title: 3 }` | `alt` 한정 `스크린샷` 153건, `content` 한정 0건 — 필드 분리가 정확히 작동 |
| ZBSearch/Orama | 스키마 필드, `properties: ["alt"]` | `boost` | 동일하게 확인 |
| FlexSearch `Document` | `document.index: ["title","content","caption","alt"]` | 필드별 인덱스 분리 | 확인 |
| Lunr | `this.field("alt")` | `{ boost: 10 }` | 확인 |
| Fuse.js | `keys: [{name:"alt", weight:2}]` | 키별 weight | 확인 |

**즉 캡션/alt 인덱싱은 Pagefind만 HTML 속성 규약을 요구하고, 나머지는 데이터 모델 문제로 끝난다.** 후자 쪽은 오히려 **"본문 vs 캡션 vs alt에 다른 가중치"** 같은 세밀한 조정이 가능하다는 이점이 있다.

---

## 6. 후속 티켓이 실제로 고를 조합 (결정하지 않고 나열만 한다)

| 조합 | 클라이언트 총량(gzip) | 재현율 | 초성 | 자작량 | 이 조합이 지는 위험 |
|---|---:|---:|---|---|---|
| **Pagefind 그대로** (Nextra 포함) | ≈ 195 KB | 92% | ❌ | **거의 0** | 복합명사 손실을 못 고친다. 토크나이저를 바꿀 방법이 없다 |
| **Fumadocs 기본**(ZBSearch multilingual) | ≈ 190 KB (인덱스 142 + 런타임 49) | 92% | ❌ | 거의 0 | 위와 같음 + 인덱스 통짜 |
| **Fumadocs + `@zbsearch/tokenizers/korean`** | ≈ 340 KB | 92% | ❌ | 낮음 | 기본 모드 대비 **인덱스가 2배인데 한국어 결과는 같다** |
| **MiniSearch + 어절 + 2-gram**(직접 구축) | ≈ 101 KB | **100%** | ❌ | 중간 | 인덱스 로딩·UI·하이라이트를 전부 직접. 검색 UX를 처음부터 짜야 한다 |
| **MiniSearch + 2-gram + 초성** | ≈ 125 KB | 100% | ✅ | 중간+ | 위 + 초성 질의 판별 로직 |
| **MiniSearch + 형태소(C′ 사전 방식)** | ≈ 76 KB | 99% | ❌ | **높음** | garu-ko(★163, 2026년 신생)에 빌드 의존. 도메인 용어 사전 관리 필요 |
| **Pagefind(본문) + Fuse.js(제목·헤딩 보조)** | ≈ 195 KB + 제목 인덱스 소량 | 92% + 보조 | ❌ | 낮음 | 두 엔진의 결과를 합치는 UX 설계 부담 |

---

## 부록 A — 측정 재현 절차

```bash
# 1) 원본 코퍼스 (저장소 밖)
pdftotext -enc UTF-8 ~/Downloads/NABI_2.5.pdf nabi.txt      # 155 pages, 107,547 chars

# 2) 페이지당 HTML 1장 (lang="ko", data-pagefind-body, figure/figcaption/alt 포함)
python3 mksite.py                                            # -> site/p000..p152, docs.json

# 3) Pagefind
npx -y pagefind@latest --site site --verbose

# 4) JS 도구들
npm i @orama/orama @orama/tokenizers zbsearch @zbsearch/tokenizers \
      @zbsearch/plugin-data-persistence flexsearch lunr lunr-languages \
      minisearch fuse.js es-hangul garu-ko
node final.mjs      # 인덱스 크기 표
node recall.mjs     # 재현율 표 + n-gram/초성 비용
node morph.mjs      # 형태소 경로
node morph3.mjs     # 어절→형태소 사전(C′)
node probe.mjs      # Intl.Segmenter 거동, 필드 한정, 지연시간
```

스크립트는 스크래치패드에만 있고 저장소에 넣지 않았다. 재현이 필요하면 위 절차로 다시 만들면 된다.

**측정 대상 버전(2026-08-03 기준 npm `latest`)**

| 패키지 | 버전 | 마지막 배포 |
|---|---|---|
| pagefind | 1.5.2 | 2026-04-12 |
| zbsearch / @zbsearch/tokenizers | 3.3.4 | 2026-07-27 |
| @orama/orama / @orama/tokenizers | 3.1.18 | 2025-12-19 |
| flexsearch | 0.8.212 | 2025-09-06 |
| minisearch | 7.2.0 | 2025-09-16 |
| lunr / lunr-languages | 2.3.9 / 1.20.0 | 2023-07-10 / 2026-05-10 |
| fuse.js | 7.5.0 | 2026-07-13 |
| es-hangul | 2.4.0 | 2026-07-09 |
| garu-ko | 0.9.12 | 2026-07-27 |
| nextra | 4.6.1 | 2025-12-04 |
| fumadocs-core | 16.14.0 | 2026-07-30 |

---

## 부록 B — 확인 못 한 것 / 추론임을 밝히는 것

- **(추론)** 재현율 표의 "정답"은 **부분문자열 일치**로 정의했다. 사람이 실제로 원하는 결과와 완전히 같지는 않다(예: `설정`이 부분문자열로 들어간 페이지가 전부 "설정에 대한 페이지"는 아니다). 도구 간 **상대 비교**로는 타당하지만 절대적 품질 지표로 읽으면 안 된다.
- **(추론)** 질의어 20개는 매뉴얼 본문에서 눈에 띄는 UI 용어를 손으로 골랐다. 방송부가 실제로 뭘 검색하는지는 모른다. 맵의 `사람이 어떻게 찾아 들어가는가`가 아직 안 잡혀 있어 실제 질의 로그가 없다.
- **(추론)** 측정에 쓴 사이트는 PDF 텍스트를 **페이지 경계 그대로** 잘라 만든 153쪽이다. 실제 사이트는 정보 구조를 새로 짜므로 문서 경계·개수·제목이 달라진다. 인덱스 크기는 총 텍스트량에 대체로 비례하므로 자릿수는 유지될 것으로 본다.
- **(추론)** 스크린샷 406장의 `alt`/캡션은 아직 존재하지 않는다. 측정에서는 페이지당 한 줄짜리 합성 캡션/alt를 넣었다. 실제로 alt를 성실히 쓰면 검색 대상 텍스트가 늘고 인덱스도 그만큼 는다.
- **(확인 못 함)** Pagefind를 실제 브라우저에서 돌려 검색 결과를 눈으로 확인하지는 못했다(헤드리스 브라우저 없음). 검색 거동은 **인덱스 내용물 직접 검사 + Rust/TS 소스 독해**로 확인했다. 나머지 JS 도구는 전부 Node에서 실제 검색을 실행해 확인했다.
- **(확인 못 함)** ZBSearch에서 `exact: true`가 모든 질의에 0건을 반환하는 이유. 색인에 해당 토큰이 실재하는데도 0이 나왔다. 버그인지 의도된 의미(전체 필드 일치)인지 확인하지 못했다.
- **(확인 못 함)** Orama가 `@orama/tokenizers`에 한국어 토크나이저를 언제 배포할지, 혹은 배포할지. 소스에는 2026-06-27에 머지되었으나 npm에는 없다.
- **(확인 못 함)** garu-ko의 사용자 사전(도메인 용어 등록) 기능 유무. `크롤` 재현율 33%는 사용자 사전으로 고칠 수 있을 가능성이 있으나 API를 확인하지 못했다.
- **(확인 못 함)** Cloudflare Pages가 응답에 brotli를 적용하는지(위 표의 brotli 수치는 로컬 `zlib.brotliCompressSync` 기준이다). Pagefind는 어차피 자체 gzip이라 무관하고, JS 인덱스는 CDN 압축에 따라 gzip~brotli 사이 값이 된다.
