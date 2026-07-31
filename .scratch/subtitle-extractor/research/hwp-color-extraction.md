# 브라우저에서 HWP/HWPX 글자 색상 추출 가능성 조사

- 조사일: 2026-07-31
- 대상: chambit-studio (Next.js 16 + React 19 + TypeScript, 클라이언트 사이드 전용 처리)
- 질문: 목사님 설교 원고(.hwp / .hwpx)에서 **빨간 글자만** 골라내 자막으로 뽑는 일을, 서버 업로드 없이 브라우저 안에서 할 수 있는가?

---

## 결론 요약

| 경로 | 판정 | 한 줄 요약 |
|---|---|---|
| **1. hwpx (ZIP+XML 직접 파싱)** | **가능** | 색상은 `Contents/header.xml`의 `<hh:charPr id="N" textColor="#RRGGBB">`에 있고, 본문 `<hp:run charPrIDRef="N">`이 이를 참조한다. 브라우저에서 unzip + XML 파싱만 하면 되며 외부 파서 라이브러리조차 필수가 아니다. |
| **2. hwp (바이너리, 브라우저 파싱)** | **조건부 가능** | 색상까지 노출하는 브라우저용 파서가 실제로 2개 존재. `hwp.js`는 색상을 노출하지만 사실상 유지보수 중단(마지막 커밋 2024-04, 저자 본인이 "커버리지 20%, 알파" 선언). `@rhwp/core`(Rust+WASM)는 활발하고 `getCharPropertiesAt()`이 `textColor`를 반환하지만 WASM 번들 7.7MB. |
| **3. 우회로 (한글에서 hwpx로 저장 / 서버 사이드)** | **가능, 그리고 권장 정책** | 한글 2014+ 에서 "다른 이름으로 저장 → 한글 표준 문서(.hwpx)"로 바로 저장 가능하고, 기본 저장 형식 자체를 hwpx로 바꿀 수도 있다. 서버 사이드(파이썬 등)는 **필요 없다.** |

### 추천 경로

**주 경로: hwpx 직접 파싱 (자체 구현).** 원고를 .hwpx로 받는 것을 1차 규약으로 삼고, 브라우저에서 `fflate`(또는 `jszip`)로 압축을 풀고 `DOMParser`로 XML을 읽어 `charPr.textColor` → `run.charPrIDRef` 매핑으로 빨간 글자를 뽑는다. 의존성이 얇고, 동작을 100% 우리가 통제하며, 서버 업로드가 전혀 없다.

**보조 경로: .hwp 업로드 시 `@rhwp/core`(WASM)로 처리.** 목사님이 .hwp로 주셨을 때를 대비한 폴백. 다만 7.7MB WASM이므로 **동적 import로 .hwp가 들어왔을 때만 로드**한다. 이것도 부담스러우면, "한글에서 hwpx로 저장해 주세요" 안내 UI로 대체해도 기능적 손실이 없다.

**하지 말 것:** `hwp.js` 채택(유지보수 중단), 서버 사이드 파이썬 파이프라인 도입(민감성 요구사항 정면 위배 + 불필요).

---

## 1. hwpx 경로 — **가능**

### 1-1. 포맷 정체 (확인됨)

HWPX는 국가표준 **KS X 6101**로 제정된 **OWPML(Open Word-Processor Markup Language)** 기반의 개방형 포맷이고, 실체는 **ZIP 아카이브 + XML**이다.

- 출처: 한컴테크 「한/글 문서 파일 형식 : HWPX 포맷 구조 살펴보기」 — https://tech.hancom.com/hwpxformat/
- 출처: 한컴 공식 저장소 `hancom-io/hwpx-owpml-model` README — "hwpx-owpml-model은 OOXML형태로 구성된 owpml파일 필터의 모델입니다." https://github.com/hancom-io/hwpx-owpml-model

패키지 구조(한컴테크 문서 기준, 확인됨):

```
mimetype                  ← 포맷 시그니처 (ZIP 첫 엔트리, STORED)
META-INF/container.xml
META-INF/manifest.xml     ← 암호 설정 시 암호화 정보도 여기
Contents/content.hpf      ← 매니페스트 + spine(읽기 순서)
Contents/header.xml       ← 글자 모양/문단 모양/폰트 등 서식 정의 ★
Contents/section0.xml     ← 본문 1구역 ★ (section1.xml, section2.xml …)
BinData/                  ← 이미지 등
Preview/                  ← 미리보기 텍스트/썸네일
settings.xml
```

### 1-2. 색상이 어디에 어떤 형태로 기록되는가 (확인됨 — 이게 핵심)

**인라인 속성이 아니라 "문자 모양(charPr) 정의 참조" 방식이다.**

`Contents/header.xml`의 `refList/charProperties` 안에 문자 모양들이 id와 함께 정의되고, `textColor`는 **`hh:charPr` 요소의 XML 속성**으로 16진 색상값을 담는다:

```xml
<hh:charPr id="7" textColor="#6182D6">
    <hh:fontRef hangul="0" latin="0" hanja="0"
                japanese="0" other="0" symbol="0" user="0" />
</hh:charPr>
```

본문 `Contents/sectionN.xml`의 텍스트 run이 `charPrIDRef`로 이를 가리킨다:

```xml
<hp:run charPrIDRef="7">
    <hp:t>한글</hp:t>
</hp:run>
```

- 1차 출처: 한컴테크 「Python을 통한 HWPX 포맷 파싱하기 (2)」 — https://tech.hancom.com/python-hwpx-parsing-2/ (위 두 XML 스니펫은 이 문서에 실린 것)
- 교차 검증 1: `python-hwpx` 구현이 정확히 이 구조를 읽는다. `src/hwpx/oxml/run.py`에 `def text_color(self) -> str | None: return self.attributes.get("textColor")`, `_char_properties_from_header()`가 `{hh}charProperties` 아래 `{hh}charPr`를 순회, `char_pr_id_ref` 프로퍼티가 `element.get("charPrIDRef")`를 읽음 — https://github.com/airmang/python-hwpx/blob/main/src/hwpx/oxml/run.py
- 교차 검증 2: TypeScript 구현 `@ssabrojs/hwpxjs`의 `src/lib/hwpxReader.ts`도 동일하게 `charPr?.["@textColor"]`를 읽고 `charPrIDRef`로 조인 — https://github.com/ssabro/hwpxjs/blob/main/src/lib/hwpxReader.ts

즉 **색상 추출에 필요한 정보는 두 개의 XML 파일에 평문으로 들어 있다.** 바이너리 해석도, 압축 스트림 해제(zlib raw deflate)도, 레코드 트리 순회도 필요 없다.

### 1-3. 브라우저 구현 난이도 (판단: 낮음)

필요한 것은 사실상 이게 전부다:

1. `File` → `ArrayBuffer`
2. ZIP 해제 — `fflate`(약 8KB gzip, 순수 JS) 또는 `jszip`
3. `Contents/header.xml` 파싱 → `Map<charPrId, textColor>` 구성
4. `Contents/section*.xml` 파싱 → `<hp:p>`(문단) 순회 → 하위 `<hp:run charPrIDRef>` → `<hp:t>` 텍스트 수집
5. run의 색상이 "빨강"이면 채택

`DOMParser`(브라우저 내장)로 충분하고, 라이브러리를 쓴다면 `fast-xml-parser` 정도. **전 과정이 순수 클라이언트 사이드이며 네트워크 요청이 0이다.**

주의할 실무 포인트(일부는 추론임을 명시):

- **(확인됨)** 네임스페이스 접두사는 문서 버전마다 달라질 수 있다. 한컴테크 파싱 글(1)이 `iterparse(..., ('start-ns',))`로 **네임스페이스를 동적으로 추출**하는 코드를 싣고 있다. → `getElementsByTagNameNS`를 쓰거나, 접두사를 하드코딩하지 말고 로컬 네임으로 매칭할 것. (https://tech.hancom.com/python-hwpx-parsing-1/)
- **(확인됨)** 표 안의 텍스트는 `<hp:tbl>/<hp:tr>/<hp:tc>/<hp:subList>` 아래에 중첩된다(hwpxjs README의 보존 항목 목록). → 재귀 순회가 필요. 설교 원고에 표가 없다면 생략 가능.
- **(추론)** "빨간색"은 정확히 `#FF0000`이 아닐 수 있다. 목사님이 색상 팔레트에서 고른 빨강 계열(`#EE0000`, `#C00000` 등)일 가능성이 크므로, **정확히 일치 대신 색 거리/휴리스틱 판정**을 넣어야 한다. 이건 명세 문제가 아니라 UX 문제이므로 "색 목록을 문서에서 뽑아 사용자가 고르게 하는" UI가 가장 안전하다.
- **(추론)** 빨간 "글자색"이 아니라 **형광펜/음영**으로 강조했을 가능성도 있다. 그건 `charPr`의 `shadeColor` 속성 또는 `hp:markpenBegin` 계열이다. 실제 원고 샘플로 확인 필요.
- **(확인 못 함)** 한 문장이 여러 run으로 쪼개져 있을 때(한글은 서식이 바뀌는 지점마다 run을 나눔) 문장 경계를 어떻게 복원할지는 데이터 의존. 실제 원고를 열어봐야 안다.
- **(확인됨)** 암호가 걸린 hwpx는 `META-INF`에 암호화 정보가 있고 본문이 암호화된다(한컴테크 hwpxformat 문서). → 암호 문서는 지원 불가로 처리하고 안내 메시지를 띄울 것.

### 1-4. 참고할 JS 라이브러리 (쓸 수는 있으나 필수는 아님)

| 라이브러리 | 상태 | 색상 노출 | 평가 |
|---|---|---|---|
| `@ssabrojs/hwpxjs` | ⭐9, 최근 커밋 2026-04-28(v0.4.0), 미해결 이슈 1, MIT, 브라우저 ESM 번들 제공(~730KB) | **간접**: `extractHtml({renderStyles:true})`가 `color:#RRGGBB` 인라인 스타일이 붙은 HTML을 뱉음. 구조화된 run+color 배열 API는 없음 | 스타 9개, 사실상 1인 프로젝트. HTML을 다시 파싱해 색을 꺼내는 건 우회적. **참고 구현으로 읽을 가치는 크지만 의존하기엔 이르다.** repo: https://github.com/ssabro/hwpxjs |
| `hancom-io/hwpx-contents-extract` | Java, ⭐3, 마지막 푸시 2022-05-20, Apache-2.0 | ❌ 텍스트만 (README: "텍스트의 경우 본문 영역의 텍스트에 한하여 추출") | 한컴 공식이지만 Java + 텍스트 전용. **"unzip 후 XML 파싱"이 공식 권장 방식임을 확인해주는 근거**로만 유용. https://github.com/hancom-io/hwpx-contents-extract |
| `hancom-io/hwpx-owpml-model` | C++, ⭐36, 마지막 푸시 2023-10-24, Apache-2.0, Visual Studio 2017 기준 | 모델 전체 커버(필터 모델) | Windows/C++ 전용. 브라우저와 무관. **OWPML 요소 정의를 확인할 때 참조용.** https://github.com/hancom-io/hwpx-owpml-model |

### 1-5. KS X 6101 / 공개 명세

- KS X 6101(OWPML)은 2011-12-30 제정된 한국산업표준이다. **(출처: 한컴테크 hwpxformat 문서 및 검색 결과. 표준 원문(e-나라표준인증 등)은 직접 확인 못 함.)**
- 한컴 공식 다운로드 센터(https://www.hancom.com/support/downloadCenter/hwpOwpml)에서 받을 수 있는 문서는 실제로 확인한 결과 다음과 같다:
  - HWP 3.0 / HWPML 형식
  - **HWP 5.0 형식** ← hwp 바이너리 파서들이 근거로 삼는 문서
  - 배포용 문서 형식
  - 수식 형식
  - 차트 형식
- **주의(확인됨):** 이 페이지에 "HWPX/OWPML 명세" 항목이 독립적으로 걸려 있는지는 명확하지 않았다. `hancom-io/hwpx-owpml-model` README는 "OWPML 표준 문서의 상세 스펙은 [링크](https://www.hancom.com/etc/hwpDownload.do)를 참조"라고 같은 다운로드 페이지를 가리킨다. **OWPML 상세 명세 PDF를 실제로 내려받아 목차를 확인하지는 못했다.**
- **라이선스 주의(확인됨):** 한컴 다운로드 페이지는 "이 문서를 참조하여 도구를 만든 개발자는 제품의 인터페이스·문서·코드에 한컴 HWP 문서를 참조해 개발했음을 명시해야 한다"는 취지의 조건을 달고 있다. 우리가 명세를 직접 보고 구현할 경우 이 고지 의무가 생길 수 있다. **다만 hwpx는 KS 국가표준이라 이 조건이 그대로 적용되는지는 확인 못 함.** 실무적으로는 README에 한 줄 고지를 넣는 것으로 충분하다고 판단.

---

## 2. hwp 바이너리 경로 — **조건부 가능**

포맷: HWP 5.0 = **OLE2 복합 파일(CFB)** 컨테이너 + 각 스트림이 **raw deflate(zlib, windowBits=-15)** 로 압축. 색상은 `DocInfo` 스트림의 CharShape 레코드에, 텍스트는 `BodyText/SectionN` 스트림에 있고, 문단마다 "이 위치부터 이 CharShape" 라는 포인터 배열이 붙는다.

브라우저에서 이걸 파싱하는 라이브러리는 **두 개**가 실재하고, **둘 다 색상을 노출한다.**

### 2-1. `hwp.js` (hahnlee/hwp.js) — 색상 노출 O, 유지보수 X

**유지보수 상태 (2026-07-31 기준, GitHub API로 직접 확인):**

| 항목 | 값 |
|---|---|
| ⭐ 스타 | 1,304 |
| 포크 | 108 |
| 미해결 이슈 | 34 |
| **마지막 커밋** | **2024-04-09** (`fix: invalid compressing flag implementation (#83)`) — 그 직전 커밋은 2022-08-20 |
| npm 최신 버전 | **0.0.3, 2020-10-01 발행** (그 후 6년간 미발행) |
| 아카이브 여부 | 아니오 |
| 라이선스 | Apache-2.0 |

repo: https://github.com/hahnlee/hwp.js · npm: https://www.npmjs.com/package/hwp.js

**색상 노출 여부: 노출한다 (소스 직접 확인).**

`packages/parser/src/models/charShape.ts`에 색상 필드가 명시적으로 있다:

```ts
class CharShape {
  fontBaseSize: number
  attr: number
  color: RGB              // ← 글자 색
  underLineColor: RGB
  shadeColor: RGB
  shadowColor: RGB
  strikeColor: RGB | null
  // …
  this.color = getRGB(color)
}
```
https://github.com/hahnlee/hwp.js/blob/main/packages/parser/src/models/charShape.ts

문단→색상 조인 경로도 갖춰져 있다:
- `DocInfo.charShapes: CharShape[]` + `getCharShpe(index)` (오타 그대로다) — `models/docInfo.ts`
- `Paragraph.shapeBuffer: ShapePointer[]`, `ShapePointer { pos, shapeIndex }`, `getShapeEndPos(index)` — `models/paragraph.ts`, `models/shapePointer.ts`
- 뷰어가 실제로 이 경로로 색을 칠한다 — `packages/viewer/src/viewer.ts:313,324`:
  ```ts
  const charShape = this.hwpDocument.info.getCharShpe(shapePointer.shapeIndex)
  span.style.color = this.getRGBStyle(color)
  ```

브라우저 동작 가능: 의존성이 `cfb` + `pako`뿐이고(`packages/parser/package.json`), 진입점 `parse(input: CFB$Blob)`가 바이트를 받는다.

**하지만 채택하면 안 되는 이유 (모두 1차 출처 확인):**

1. **저자 본인의 상태 선언** — Issue #7 「메인터넌스 공지」(2020-09-07, 여전히 open):
   > "현재 제가 생각하고 있는 커버리지는 20% 정도 되는것 같습니다. … 알파 수준의 라이브러리 … Real World에선 아직 역부족 … 안정적인 API를 제공하고 있지 않습니다 … 무엇보다 이 프로젝트는 제 주된 업무가 아닙니다."
   https://github.com/hahnlee/hwp.js/issues/7
2. **배포용 문서 미지원** — 위 공지 및 Issue #5 「배포용 문서는 작동하지 않습니다」. 교회 원고엔 해당 없을 가능성이 높지만 리스크.
3. **버전 가드가 빡빡함 (소스 확인)** — `parse.ts`가 `SUPPORTED_VERSION = 5.1.0.0`에 대해 `isCompatible()`을 호출하고, `version.ts`의 구현은 `this.major === target.major && this.minor <= target.minor`. 즉 **major 5, minor ≤ 1**만 통과하고 그 외엔 `throw`. 한글 2022/2024가 쓰는 5.1.x.x는 통과할 것으로 보이나 **실제 파일로 검증하지 않았다(확인 못 함)**.
4. **최신 한글에서 만든 파일 파싱 실패 보고** — Issue #88(2025-12-05) 「20xx이상? 버전에서 이미지 추가하면 한글파일 안열리는거 해결」: 한글 2022/2024로 만든 문서에 이미지가 있으면 `visitBinData`에서 깨진다는 사용자 리포트 + 패치 제안. **PR로 머지되지 않았고 이슈는 열려 있다.**
5. **npm 배포본이 2020년 코드** — 위 #83 수정 포함본이 npm에 없다. GitHub 소스를 직접 벤더링해야 한다.

**판정: 기술적으로는 가능하지만, 이 프로젝트에 넣기엔 리스크 대비 이득이 없다.**

### 2-2. `@rhwp/core` (edwardkim/rhwp) — 색상 노출 O, 활발 O ★ 폴백 후보

Rust + WebAssembly로 작성된 HWP/HWPX 뷰어·에디터. hwp.js와 달리 **현재 활발히 개발 중**이다.

**유지보수 상태 (2026-07-31 기준, GitHub/npm API로 직접 확인):**

| 항목 | 값 |
|---|---|
| ⭐ 스타 | **3,621** |
| 저장소 생성 | 2026-03-27 (즉 매우 신생 + 매우 급성장) |
| **마지막 푸시** | **2026-07-30** (조사 당일 전날) |
| 최근 커밋 | `v0.8.2 핫픽스 — 확장 인쇄 복구 (#3445)` 2026-07-26 — 이슈/PR 번호가 3,400번대 |
| 미해결 이슈 | 88 |
| 라이선스 | MIT |
| npm | `@rhwp/core@0.8.2`, 2026-07-26 발행, 총 22개 버전 |
| 배포 채널 | Chrome/Edge/Firefox 확장, VS Code Marketplace, GitHub Pages 데모 |

repo: https://github.com/edwardkim/rhwp · npm: https://www.npmjs.com/package/@rhwp/core · 데모: https://edwardkim.github.io/rhwp/

**지원 범위 (README 확인):** HWP 5.0 바이너리, HWPX, HML(HWPML 2.9/2.91) 모두 파싱. 문단·표·수식·이미지·차트 렌더링, 3,400+ Rust 테스트.

**색상 노출 여부: 노출한다 (타입 정의 + Rust 소스 직접 확인).**

`rhwp.d.ts`:
```ts
/**
 * 캐럿 위치의 글자 속성을 조회한다.
 * 반환값: JSON 객체 (fontFamily, fontSize, bold, italic, underline, strikethrough, textColor 등)
 */
getCharPropertiesAt(sec_idx: number, para_idx: number, char_offset: number): string;
```

Rust 구현(`src/document_core/commands/formatting.rs`, `build_char_properties_json`)이 실제로 `"textColor":"{}"` 를 `color_ref_to_css(cs.text_color)`로 채워 넣는 것을 확인했다. 내부적으로 `para.char_shape_id_at(char_offset)` → `styles.char_styles[id]` 를 탄다.

관련 API:
- `new HwpDocument(bytes: Uint8Array)` — 바이트에서 바로 로드
- `getSectionCount()`, `getParagraphCount(sec)`, `getParagraphLength(sec, para)`
- `getTextRange(sec, para, char_offset, count)` — 텍스트
- `getCharPropertiesAt(sec, para, char_offset)` — 해당 위치의 `textColor`
- `exportSelectionHtml(sec, startPara, startOff, endPara, endOff)` — 범위를 HTML로 (색 span 포함 추정)
- `getPageTextLayout(page)` — "각 TextRun의 위치, 텍스트, 글자별 X 좌표 경계값"

**조건 (이게 "조건부 가능"의 조건):**

1. **번들 크기 7.7MB** (npm unpackedSize 7,731,074 bytes, 파일 7개). WASM 바이너리를 `public/`에 복사해 서빙해야 한다:
   ```bash
   cp node_modules/@rhwp/core/rhwp_bg.wasm public/
   ```
   → Next.js에서는 **`.hwp` 파일이 들어왔을 때만 `await import('@rhwp/core')`** 하는 동적 로딩이 필수.
2. **`globalThis.measureTextWidth` 를 먼저 등록해야 한다** (README 명시, "필수"). Canvas 2D 컨텍스트로 텍스트 폭을 재는 콜백. 렌더링용이지만 초기화 계약이므로 파싱만 할 때도 넣어줘야 할 가능성이 높다 — **파싱 전용으로 생략 가능한지는 확인 못 함.**
   ```js
   globalThis.measureTextWidth = (font, text) => { ctx.font = font; return ctx.measureText(text).width }
   await init({ module_or_path: '/rhwp_bg.wasm' })
   ```
3. **색상 조회가 "글자 오프셋 단위" API다.** run 단위로 묶어주는 공개 getter(`getCharShapeIdAt` 등)는 `.d.ts`에 **없다**(setter인 `setCharShapeId`만 있음). 따라서 문단 길이만큼 `getCharPropertiesAt`를 호출하며 색이 바뀌는 지점을 찾아 run을 재구성하거나, `exportSelectionHtml`로 문단 HTML을 받아 `color:` 스타일을 읽어야 한다. **WASM 경계를 글자 수만큼 왕복하는 비용은 측정하지 않았다(확인 못 함).** 설교 원고 정도(수천~수만 자)면 문제없을 것으로 추정하나, 프로토타입에서 반드시 측정할 것.
4. **신생 프로젝트 리스크.** 4개월 된 저장소에 0.8.x 버전. API가 빠르게 바뀔 수 있으므로 **버전 핀 고정** 필요. 미해결 이슈 88개.

**참고:** `@ssabrojs/hwpxjs`의 HWP 5.0 바이너리 파서도 이 rhwp의 Rust 구조를 TypeScript로 포팅한 것이라고 README에 명시되어 있다. 즉 현재 JS 생태계의 HWP 바이너리 파싱은 rhwp가 사실상 기준점이다.

### 2-3. hwp 경로 종합

|  | hwp.js | @rhwp/core |
|---|---|---|
| 색상 노출 | ✅ `CharShape.color: RGB` | ✅ `getCharPropertiesAt().textColor` |
| 브라우저 | ✅ 순수 JS (cfb+pako) | ✅ WASM |
| 크기 | 작음 | 7.7MB |
| 최근 활동 | 2024-04 (사실상 중단) | 2026-07-30 (매일) |
| 저자의 성숙도 자평 | "커버리지 20%, 알파" | 0.8.x, "뼈대" 단계 |
| 판정 | ❌ 비추천 | ⚠️ 조건부 채택 가능 |

---

## 3. 우회로 — **가능하며, 오히려 이게 정공법**

### 3-1. 한글에서 hwpx로 저장 — 가장 현실적 (권장)

- 한글 프로그램에서 `다른 이름으로 저장` → 파일 형식 `한글 표준 문서 (*.hwpx)` 선택으로 즉시 변환된다.
- 기본 저장 형식 자체를 바꿀 수도 있다: `도구 → 환경 설정 → 파일 탭 → "다음 형식으로 파일 저장" → 한글 표준 문서(.hwpx)`. 한 번만 설정하면 이후 목사님이 신경 쓸 게 없다.
  - **(2차 출처)** 위 메뉴 경로는 여러 가이드 문서에서 일치하게 서술됨. 한컴 공식 매뉴얼 페이지는 직접 확인 못 함.
- **바람이 우리 편이다 (2차 출처, 언론 보도):** 국가인공지능전략위원회가 행정안전부·문화체육관광부와 함께 **2026년 10월부터 공공기관 기본 문서 포맷을 .hwpx로 의무화**한다고 발표. 이유는 "hwp는 AI에게 이미지처럼 보여 데이터 추출이 어렵지만 hwpx는 구조화되어 있다"는 것. (https://v.daum.net/v/20260425140114703) → **hwpx 우선 설계는 시간이 갈수록 유리해진다.**
- 색상 손실 여부: hwp → hwpx는 한글 자체 변환이므로 글자색이 보존된다고 보는 게 타당하다. **다만 실제 원고로 검증하지 않았다(확인 못 함).** 프로토타입 1순위 검증 항목.

### 3-2. docx / xml(HML)로 내보내기 — 가능하지만 비추천

- **docx**: 브라우저에서 docx의 run 색상(`<w:color w:val="FF0000"/>`)을 읽는 건 기술적으로 문제없다(docx도 ZIP+XML). 하지만 한글 → docx 변환은 서식 손실·문단 재편이 발생하는 이종 포맷 변환이라, hwpx 대비 이득이 전혀 없다. **hwpx가 가능한데 docx를 경유할 이유가 없다.**
- **HML(.hml, HWPML)**: 단일 XML 파일이라 unzip조차 불필요해 더 단순해 보이지만, 구세대 포맷이고 `rhwp`조차 "실제 corpus로 확인된 HWPML 2.9/2.91 구조만 제한 지원"이라고 명시한다(README). **비추천.**

### 3-3. 서버 사이드 (파이썬 등) — **불필요**

민감성 요구사항상 애초에 배제 대상이지만, 기술적으로도 강제되지 않는다. 참고로 서버를 쓸 수밖에 없는 상황이 온다면 후보는:

- **`python-hwpx`** (⭐101, 마지막 푸시 2026-07-30, Apache-2.0) — HWPX 전용, 순수 파이썬, `RunStyle.text_color()`로 `textColor` 직접 노출. https://github.com/airmang/python-hwpx
- **`kordoc`** (chrisryugj/kordoc, TypeScript, ⭐1,575, 2026-07-29) — HWP/HWPX/PDF/Office → Markdown CLI·MCP. **Markdown 변환은 색상 정보를 버리므로 우리 목적엔 부적합.**

**결론: 서버 사이드는 필요 없다.** hwpx 경로가 열려 있는 이상 원고를 네트워크로 내보낼 이유가 없다.

---

## 4. 확인된 사실 / 추론 / 확인 못 함 정리

**확인된 사실 (1차 출처 인용)**
- HWPX = ZIP + XML, KS X 6101 OWPML 기반 (한컴테크)
- 색상은 `Contents/header.xml`의 `<hh:charPr id textColor="#RRGGBB">` 속성, 본문은 `<hp:run charPrIDRef>`로 참조 (한컴테크 + python-hwpx + hwpxjs 3중 교차 검증)
- `hwp.js`는 `CharShape.color: RGB`를 노출하고 뷰어가 실제로 `span.style.color`에 쓴다 (소스 코드)
- `hwp.js` 마지막 커밋 2024-04-09, npm 0.0.3(2020-10-01), 이슈 34개, 저자 본인 "커버리지 20%, 알파" 선언 (GitHub API + Issue #7)
- `@rhwp/core`는 `getCharPropertiesAt()`이 `textColor`를 포함한 JSON을 반환한다 (`.d.ts` + Rust `formatting.rs`)
- `@rhwp/core` ⭐3,621, 마지막 푸시 2026-07-30, npm 0.8.2, unpackedSize 7.7MB
- 한컴 공식 다운로드 센터가 제공하는 명세는 HWP 3.0/HWPML, HWP 5.0, 배포용, 수식, 차트 5종

**추론 (검증 필요)**
- 빨간색이 `#FF0000` 정확 일치가 아닐 가능성 → 색 유사도 판정 또는 색 선택 UI 필요
- 강조가 글자색이 아니라 형광펜/음영(`shadeColor`)일 가능성
- 한글의 hwp → hwpx 변환에서 글자색 보존
- rhwp의 글자 단위 `getCharPropertiesAt` 반복 호출 성능

**확인 못 함**
- OWPML/HWPX 상세 명세 PDF의 실제 존재·목차 (다운로드 페이지 항목에서 독립 항목으로 특정하지 못함)
- KS X 6101 표준 원문
- `hwp.js`가 한글 2022/2024가 저장한 실제 .hwp를 파싱하는지 (실파일 미검증)
- rhwp WASM에서 파싱만 할 때 `measureTextWidth` 등록을 생략할 수 있는지
- `exportSelectionHtml`이 글자색을 인라인 스타일로 실제 출력하는지 (구현 미확인)

---

## 5. 아키텍처 시사점

1. **"서버 없는 브라우저 전용" 제약이 살아 있다.** 이 조사의 가장 큰 결론이다. hwpx 경로가 열려 있으므로 원고를 네트워크로 내보낼 필요가 전혀 없고, Next.js 앱은 **정적 배포(서버 런타임 0)** 로도 성립한다. 백엔드·업로드·스토리지·보존기간 정책이 전부 사라진다.

2. **입력 포맷을 hwpx로 좁히는 것이 최선의 설계 결정이다.** "hwp도 받아주자"는 유혹이 아키텍처 비용(7.7MB WASM, 신생 라이브러리 종속, 버전 가드 실패 처리)을 통째로 끌고 들어온다. 반면 목사님 쪽 비용은 **한글 환경 설정에서 기본 저장 형식을 한 번 바꾸는 것**뿐이다. 2026년 10월 공공기관 hwpx 의무화까지 겹쳐 시간이 갈수록 유리해진다.
   → **권고: v1은 .hwpx 전용. .hwp를 올리면 "한글에서 hwpx로 저장해 주세요" 안내(스크린샷 포함)를 띄운다.**

3. **파서를 자체 구현하고, 라이브러리 의존을 만들지 않는다.** 필요한 로직은 "ZIP 풀기 + XML 두 개 읽기 + id 조인"이며, 조사한 어떤 라이브러리도 우리가 원하는 형태(= `{text, color}[]` 배열)를 그대로 주지 않는다. hwpxjs는 HTML을 뱉고 rhwp는 글자 오프셋 API를 준다. 둘 다 우리 쪽에서 후처리가 필요하므로, **차라리 얇게 직접 짜는 편이 제어권·번들 크기·수명 모두에서 낫다.** 의존성은 `fflate` 하나로 족하다.

4. **모듈 경계는 "파일 → 색상 태그된 텍스트 조각 배열"에 그어야 한다.** 예:
   ```ts
   type StyledRun = { text: string; color: string; paragraphIndex: number }
   parseHwpx(file: File): Promise<StyledRun[]>
   ```
   이 인터페이스만 지키면 나중에 .hwp 지원을 rhwp로 붙이든, 서버 파서로 바꾸든 상류(자막 추출·편집·출력)는 전혀 손대지 않는다. **판정이 뒤집혀도 이 seam 하나만 갈아끼우면 된다.**

5. **다음 액션은 "코드"가 아니라 "샘플 파일"이다.** 실제 설교 원고 .hwpx 하나를 확보해 (a) 빨간색의 실제 hex 값, (b) 글자색인지 형광펜인지, (c) 한 문장이 몇 개 run으로 쪼개지는지, (d) 표/글상자 사용 여부를 확인해야 한다. 이 네 가지가 자막 추출 로직의 형태를 결정하며, 위 판정 중 유일하게 남은 불확실성이다.

---

## 참고 URL 목록

**1차 출처 — 포맷 명세/공식**
- 한컴테크, HWPX 포맷 구조: https://tech.hancom.com/hwpxformat/
- 한컴테크, Python HWPX 파싱 (1): https://tech.hancom.com/python-hwpx-parsing-1/
- 한컴테크, Python HWPX 파싱 (2) — charPr/textColor/charPrIDRef 스니펫: https://tech.hancom.com/python-hwpx-parsing-2/
- 한컴 HWP/OWPML 명세 다운로드 센터: https://www.hancom.com/support/downloadCenter/hwpOwpml
- hancom-io/hwpx-owpml-model (OWPML 필터 모델, C++): https://github.com/hancom-io/hwpx-owpml-model
- hancom-io/hwpx-contents-extract (HWPX 텍스트 추출 예제, Java): https://github.com/hancom-io/hwpx-contents-extract

**1차 출처 — 라이브러리**
- hahnlee/hwp.js: https://github.com/hahnlee/hwp.js
- hwp.js `charShape.ts`: https://github.com/hahnlee/hwp.js/blob/main/packages/parser/src/models/charShape.ts
- hwp.js Issue #7 「메인터넌스 공지」: https://github.com/hahnlee/hwp.js/issues/7
- hwp.js Issue #88 (최신 한글 파일 파싱 실패): https://github.com/hahnlee/hwp.js/issues/88
- edwardkim/rhwp: https://github.com/edwardkim/rhwp
- @rhwp/core npm: https://www.npmjs.com/package/@rhwp/core
- rhwp npm README (브라우저 사용법): https://github.com/edwardkim/rhwp/blob/main/npm/README.md
- ssabro/hwpxjs: https://github.com/ssabro/hwpxjs
- airmang/python-hwpx (`text_color()`): https://github.com/airmang/python-hwpx/blob/main/src/hwpx/oxml/run.py

**2차 출처**
- 공공기관 hwpx 의무화 보도 (2026-10 시행): https://v.daum.net/v/20260425140114703
