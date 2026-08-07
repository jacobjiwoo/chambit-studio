# 브라우저에서 편집 가능한 `.pptx`를 만드는 법 — 갈래와 각 갈래의 대가

- 조사일: 2026-08-07
- 대상: dawn-prayer-ppt (Next.js 16.2 `output: 'export'`, Cloudflare Pages, 서버 없음, `fflate` 이미 의존성)
- 티켓: [`.scratch/dawn-prayer-ppt/issues/03-browser-pptx-generation.md`](../issues/03-browser-pptx-generation.md)
- 질문: **서버 없이 브라우저 안에서, 파워포인트가 열어 고칠 수 있는 진짜 `.pptx`를 만들 수 있는가 — 어떤 길이 있고 각각 무엇을 요구하는가.**

> 이 문서의 숫자는 **추정이 아니라 실측**이다. 후보 패키지를 실제로 설치해 esbuild로 번들해 쟀고,
> `fflate`만으로 **실제로 열리는 최소 `.pptx`(13개 파트, 5,843바이트)를 만들어** 검증했으며,
> 한글 폰트 메트릭은 시스템에 깔린 폰트 파일의 `cmap`/`hmtx`/`hhea` 테이블을 직접 파싱해 읽었다.
> 재현 절차는 [부록 C](#부록-c--재현-절차와-측정-환경)에 있다.
> **파워포인트 본체로는 열어보지 못했다** — 이 세션은 macOS TCC가 Apple Event(자동화)와 화면 기록을 둘 다 막는다. 무엇으로 검증했고 무엇을 못 했는지는 [§8](#8-무엇으로-검증했고-무엇을-못-했나)에 정직하게 적었다.

---

## 0. 결론 요약 — 갈래 × 대가

| # | 갈래 | 판정 | 브라우저 번들 증가분(실측, gzip) | 자작량 | 이 갈래가 지는 위험 |
|---|---|---|---:|---|---|
| **가** | **pptxgenjs 4.0.1로 백지에서 생성** | **된다** | **126,467 B** | 거의 0 | **jszip을 통째로 끌고 온다**(저장소엔 이미 fflate가 있다). 스키마 위반 XML을 내보낸다. `fit:'shrink'`가 사실상 무동작 |
| **나** | **물려받은 파일을 zip으로 열어 가운데만 갈아끼우기** | **된다, 라이브러리 없이** | **7,339 B** | 중간(≈110줄) | 템플릿 실물이 앱 안에 있어야 한다. 실물 파일의 구조에 코드가 물린다 |
| **다** | **`fflate` + 손수 OOXML** | **된다** | **6,764 B** | 중간(≈140줄, XML 9.4 KB) | 디자인(배경 이미지·마스터)을 우리가 다시 저작해야 한다 |
| — | *(참고) `fflate`의 `zipSync`만* | | 4,524 B | | |
| — | *(참고) pptx-automizer 0.8.2* — 템플릿 병합 전용 라이브러리 | **브라우저에서 못 쓴다** | — | — | `require("fs")` 7곳 + `require("path")` 6곳, `extract-zip` 의존, `browser` 필드 없음. **Node 전용** |

**한 문장 요약** — 세 갈래 모두 서버 없이 성립하고 셋 다 진짜 텍스트 상자를 만든다. 갈리는 것은 **디자인을 어디서 가져오느냐**뿐이고, **번들 비용의 차이는 갈래가 아니라 zip 라이브러리 하나에서 나온다.** pptxgenjs를 고르면 fflate 위에 jszip이 얹혀 **+119,703 B(gzip)**, 직전 커밋이 깎아낸 87 KB의 **1.4배**가 들어온다.

### 이 조사가 뒤집은 것 — 티켓·맵이 전제한 것과 다른 사실 넷

1. **맵의 "둘째 위험"(조판을 우리가 책임진다)은 생각보다 작다.** 한글 본문 폰트는 **11,172개 음절 전부가 같은 advance 폭**을 갖는다(맑은 고딕에서 정확히 `1.0 em`, 실측). 폰트 메트릭 라이브러리도, Canvas `measureText`도, `document.fonts`도 필요 없다. **폰트당 상수 하나 + 공백·문장부호 폭 몇 개면 줄바꿈 위치가 정확히 떨어진다.** 실물 렌더로 검증했다 — 예측 임계값 21자, 실측 21자 ([§7](#7-길이-판정--폰트-메트릭을-잴-필요가-없다)).
2. **`normAutofit`은 대책이 아니다.** `fontScale`은 소비자가 렌더 시각에 계산하는 값이 아니라 **생산자가 계산해 파일에 박아 넣는 값**이다(ISO/IEC 29500-1 원문). 그리고 실측상 **Apple의 Office 렌더러는 `noAutofit`/`normAutofit`/`fontScale=25%`/`spAutoFit` 네 경우의 렌더 결과가 픽셀 단위로 동일하다** — `fontScale`을 아예 무시한다 ([§6](#6-autofit--켜도-아무도-줄여주지-않는다)).
3. **폰트 임베딩은 필요 없을 가능성이 크고, 하려 해도 브라우저에선 사실상 못 한다.** 맑은 고딕은 **Windows Vista~11 전부 + Office(Mac 포함)** 에 들어 있다(Microsoft 자사 문서). 반대로 임베딩하려면 파워포인트가 쓰는 **EOT / MicroType Express** 포맷을 브라우저에서 만들어야 하는데(Microsoft가 표준과의 차이로 명시), 그리고 맑은 고딕 원본은 **13,457,192 B**다 ([§5](#5-한글-폰트--임베딩은-거의-확실히-불필요하다)).
4. **템플릿 수술에서 손대야 하는 패키지 파일은 티켓이 나열한 목록보다 짧다 — 3개다.** `[Content_Types].xml` · `ppt/_rels/presentation.xml.rels` · `ppt/presentation.xml`. **`docProps/app.xml`은 안 건드려도 된다** — 슬라이드 수가 `0`으로 남고 `PresentationFormat`이 4:3으로 거짓말을 해도 열리고 렌더된다(실측) ([§3](#3-갈래-나--템플릿-수술-실물-실험)).

### 그리고 맵이 모르는 사실 하나

**이 개발자는 이미 pptxgenjs 4.0.1로 교회용 PPT를 만들어 쓴 전례가 있다.** `/Users/jiwoo/dev/projects/praise-pdf-to-ppt/` — `build-pptx.mjs`가 pptxgenjs로 찬양 악보 슬라이드를 굽고 `output/`에 6곡이 실제로 떨어져 있다(2026-07-08). 다만 **Node 스크립트다**(브라우저가 아니다). 이 조사에서 그 산출물 하나(`영광송.pptx`)를 열어 검증에 썼고, 거기서 pptxgenjs의 스키마 위반을 찾았다([§4-3](#4-3-pptxgenjs가-내보내는-presentationxml은-iso-스키마-위반이다-확인됨)). **"백지에서 생성" 갈래는 이 저장소에서 미지의 길이 아니다.**

---

## 1. 번들 증가분 실측 — 205 KB를 깎던 저장소의 자로

esbuild로 실제 진입점을 번들·minify해서 쟀다(`--platform=browser`, 트리셰이킹 포함, `browser` 필드 적용됨).

| 진입점 | raw | gzip | brotli |
|---|---:|---:|---:|
| **(가) `pptxgenjs` + `jszip`** — 슬라이드 1장에 텍스트 1개 | 373,796 | **126,467** | 113,277 |
| (나) `fflate` + 템플릿 수술 코드(110줄) | 15,251 | **7,339** | 6,641 |
| (다) `fflate` + 손수 OOXML 생성기(140줄) | 16,632 | **6,764** | 6,080 |
| *(참고)* `fflate`의 `zipSync`+`strToU8`만 | 9,023 | 4,524 | 4,127 |

**(가)의 내역** — esbuild `--metafile`로 갈랐다:

```
275,000 B  pptxgenjs/dist/pptxgen.es.js   (minify 후)
 97,317 B  jszip/dist/jszip.min.js
    135 B  진입점
```

- **`pptxgenjs@4.0.1`의 `dependencies`에 `jszip@^3.10.1`이 있고, ESM 빌드가 첫 줄에서 `import JSZip from 'jszip'`을 한다.** 즉 **저장소에 이미 있는 `fflate`와 별개로 두 번째 zip 구현이 실린다.** jszip은 다시 `pako`·`readable-stream`·`setimmediate`·`lie`를 끌고 오는 패키지지만, pptxgenjs가 참조하는 것은 사전 번들된 `jszip.min.js` 하나라 실제 증가분은 위의 97,317 B에서 멈춘다(실측).
- 배포 파일 자체 크기(참고): `pptxgen.es.js` 516,931 B / gz 140,724 · `pptxgen.min.js` 271,010 B / gz 96,368 · `pptxgen.bundle.js`(jszip 포함) 460,889 B / gz 157,726.
- `browser` 필드가 `fs`·`https`·`image-size`·`os`·`path`를 `false`로 꺼 준다(실측: 번들에 `(disabled):node:fs` 18 B로만 남는다). 브라우저에서 Node 폴리필이 필요하지 않다.

**기준선 대비.** 직전 커밋이 검색 색인을 292 KB → 205 KB로 깎았다(**−87 KB**). pptxgenjs를 고르면 **+123.5 KB(gzip)** 다 — **깎아낸 것의 1.42배가 다른 라우트로 들어온다.** 다만 이 사이트는 라우트별 코드 스플리팅이 되므로 `/docs/nabi-cg`를 보는 사람에게 내려가지는 않는다. **비교해야 할 대상은 사이트 총량이 아니라 "새벽기도 PPT 페이지 하나를 여는 값"이다.**

---

## 2. 갈래 (다) — 최소 `.pptx` 실물

`fflate`만으로 만들었고, **13개 파트 / 압축 전 XML 9,446 B / zip 5,843 B**다. 전문은 [부록 A](#부록-a--최소-pptx-전문). 슬라이드 2장(한글 절 각 1개)이 들어 있다.

### 2-1. 필요한 파트 목록과 각각의 분량 (실측)

| 파트 | 바이트 | 줄 | 없으면 |
|---|---:|---:|---|
| `[Content_Types].xml` | 1,114 | 11 | — |
| `_rels/.rels` | 303 | 4 | — |
| `ppt/presentation.xml` | 547 | 6 | — |
| `ppt/_rels/presentation.xml.rels` | 710 | 7 | — |
| `ppt/slideMasters/slideMaster1.xml` | 701 | 9 | **렌더러가 멈춘다** |
| `ppt/slideMasters/_rels/slideMaster1.xml.rels` | 448 | 5 | — |
| `ppt/slideLayouts/slideLayout1.xml` | 513 | 8 | **렌더러가 멈춘다** |
| `ppt/slideLayouts/_rels/slideLayout1.xml.rels` | 312 | 4 | — |
| `ppt/theme/theme1.xml` | 1,862 | 16 | **렌더러가 멈춘다** |
| `ppt/slides/slide1.xml` | 1,210 | 20 | — |
| `ppt/slides/_rels/slide1.xml.rels` | 312 | 4 | **렌더러가 멈춘다** |
| `ppt/slides/slide2.xml` | 1,102 | 20 | — |
| `ppt/slides/_rels/slide2.xml.rels` | 312 | 4 | — |
| **합계** | **9,446** | **118** | |

**즉 고정 비용은 앞의 9개 파트 / 6,510 B / 70줄이고, 절 슬라이드는 한 장당 XML 20줄 + 관계 4줄이다.**

### 2-2. 필요 없는 것들 — 목록에서 뺀 것이 답이다

**`docProps/app.xml` · `docProps/core.xml` · `ppt/presProps.xml` · `ppt/viewProps.xml` · `ppt/tableStyles.xml` · `ppt/notesMasters/*` · `docProps/thumbnail.jpeg` — 전부 없어도 열린다(실측).** 파워포인트가 만든 파일에는 전부 들어 있지만 필수가 아니다. 티켓이 "손대야 하는 파일"로 `docProps/app.xml`을 지목했는데, **만들 필요도 고칠 필요도 없다**([§3-2](#3-2-docpropsappxml은-낡은-채로-둬도-된다-실측)).

### 2-3. 잘라내기 실험 — 무엇이 진짜 필수인가 (실측)

파트를 하나씩 떼고 두 개의 독립 판독기에 물렸다. **Apple의 `/System/Library/QuickLook/Office.qlgenerator` (v5.0)** — macOS 자체 OOXML 구현이며 실제로 슬라이드를 그린다 — 와 **python-pptx 1.0.2**, 그리고 **ISO/IEC 29500-4:2016 XSD 검증**이다.

| 변형 | 파트 수 | Apple 렌더러 | python-pptx | ISO XSD |
|---|---:|---|---|---|
| 원본(13파트) | 13 | **RENDERED** | OK 2슬라이드 | 13/13 valid |
| `theme1.xml` 제거 | 12 | **멈춤(hang)** | OK | 12/12 valid |
| `slideLayout1.xml` 제거 | 11 | **멈춤** | OK | 11/11 valid |
| `slideMaster1.xml` + layout 제거 | 9 | **멈춤** | OK | 9/9 valid |
| 슬라이드의 `.rels`(→layout) 제거 | 11 | **멈춤** | OK | 11/11 valid |
| `<p:notesSz>` 제거 | 13 | **RENDERED** | OK | **12 valid / 1 invalid** |

읽는 법:

- **테마·마스터·레이아웃·슬라이드→레이아웃 관계는 전부 필수다.** 넷 중 하나만 빠져도 Apple 렌더러가 **에러가 아니라 무한 대기**에 빠진다(25초 타임아웃으로 죽였다). 이건 "적당히 빼도 되겠지"가 조용히 실패하는 지점이다.
- **python-pptx와 XSD는 넷 다 통과시킨다.** `python-pptx`는 lxml로 XML을 읽을 뿐이고, XSD는 **파트 안의 문법만** 검사하지 **패키지의 관계 그래프를 검사하지 않는다.** 스키마 통과 = 열린다가 아니다.
- `<p:notesSz>`는 반대다. **스키마상 필수인데(`minOccurs="1"`, ISO/IEC 29500-4 `pml.xsd` CT_Presentation) 없어도 렌더된다.** 넣어 두는 게 맞다.

### 2-4. zip·XML 층위의 함정 — 실제로 걸리는 것은 하나뿐

| 실험 | 결과 |
|---|---|
| `[Content_Types].xml`을 zip 엔트리 **맨 뒤**에 둠 | 열린다 |
| 무압축(`level: 0`) — 5,843 B → 11,178 B | 열린다 |
| 슬라이드 XML 앞에 UTF-8 BOM | 열린다 |
| XML 선언(`<?xml ... ?>`) 제거 | 열린다 |
| `mtime` 미지정(현재 시각) | 열린다 |
| **`fflate`에 `mtime: 0`** | **`Error: date not in range 1980-2099`로 생성 자체가 실패** |

**마지막 하나만 진짜 함정이다.** 재현 가능한 바이트를 원해 `mtime: 0`을 주면 fflate가 던진다(ZIP의 DOS 날짜 필드가 1980년 기준이다). `new Date('1980-01-01T00:00:00Z')`를 써야 한다.

---

## 3. 갈래 (나) — 템플릿 수술, 실물 실험

물려받은 실물 파일이 아직 없으므로 **파워포인트가 저작한 마스터·레이아웃·테마**(python-pptx 1.0.2 동봉 `default.pptx` — 진짜 PowerPoint 산출물이다)를 바탕으로 *[배경 이미지 인트로] → [절 3장] → [배경 이미지 아웃트로]* 5장짜리 대역 템플릿(48파트 / 37,969 B)을 만들고, **`fflate`만으로 가운데를 갈아끼웠다**(110줄, [부록 B](#부록-b--템플릿-수술의-핵심-110줄의-요지)).

### 3-1. 손대야 하는 파일 — 정확히 3개 + 슬라이드 파트 (실측)

절 4개짜리로 갈아끼웠을 때(5장 → 6장):

```
MODIFIED (패키지 수준, 3개)
   [Content_Types].xml                       ← 슬라이드 Override 재작성
   ppt/_rels/presentation.xml.rels           ← 슬라이드 Relationship 재작성
   ppt/presentation.xml                      ← <p:sldIdLst>만 재작성

MODIFIED / ADDED (슬라이드 파트, 절 개수만큼)
   ppt/slides/slideN.xml  +  ppt/slides/_rels/slideN.xml.rels

BYTE-IDENTICAL (42개)
   ppt/media/image1.png, image2.png          ← 배경 이미지 그대로
   ppt/theme/theme1.xml
   ppt/slideMasters/slideMaster1.xml
   ppt/slideLayouts/slideLayout1..11.xml (+ 각 .rels)
   ppt/slides/slide1.xml, slide5.xml         ← 인트로·아웃트로 바이트째 보존
   ppt/presProps.xml, viewProps.xml, tableStyles.xml,
   ppt/printerSettings/printerSettings1.bin, docProps/*
```

**인트로·아웃트로 슬라이드와 배경 이미지가 바이트 단위로 그대로 남는다.** 맵이 원한 *"디자인을 다시 저작할 필요가 사라진다"* 가 문자 그대로 성립한다.

검증: Apple 렌더러 **RENDERED**, python-pptx **6슬라이드 / 절 텍스트 4개 전부 정상**, ISO XSD **41 valid / 0 invalid**. 절 30개로 늘려도(32슬라이드, 102파트, 71,829 B) 동일하게 통과했다.

### 3-2. `docProps/app.xml`은 낡은 채로 둬도 된다 (실측)

일부러 안 고치고 내보냈다. 결과 파일 안의 `app.xml`은 이렇게 거짓말을 하고 있다:

```xml
<PresentationFormat>On-screen Show (4:3)</PresentationFormat>   ← 실제는 16:9
<Slides>0</Slides>                                               ← 실제는 6
<TitlesOfParts><vt:vector size="1" ...><vt:lpstr>Office Theme</vt:lpstr>
```

그래도 Apple 렌더러가 그리고 python-pptx가 6슬라이드로 읽는다. **`app.xml`은 파워포인트가 "파일 정보" 패널에 쓰는 캐시일 뿐 구조가 아니다.** (다만 파워포인트가 저장할 때 알아서 갱신하는지는 확인 못 했다 — [§8](#8-무엇으로-검증했고-무엇을-못-했나).)

### 3-3. 절 슬라이드 "복제"는 되는가 — 된다, 그리고 레이아웃·마스터·미디어 참조가 따라온다

원본 절 슬라이드의 `slideN.xml`을 통째로 복사하고 **`slideN.xml.rels`도 그대로 복사**하면 끝이다. `.rels`가 `../slideLayouts/slideLayoutX.xml`과 `../media/imageY.png`를 상대 경로로 가리키므로 **레이아웃·마스터·테마·배경 이미지 참조가 자동으로 따라온다.** 텍스트는 첫 `<a:t>`만 갈아치우면 되고, 그 슬라이드의 **글꼴·크기·색·위치·자간·줄간격·상자 좌표는 원본에서 손대지 않은 채 상속된다.** 이게 이 갈래의 핵심 이점이다 — **조판 값을 우리가 정할 필요조차 없다. 물려받은 파일이 이미 정해 놓았다.**

주의 하나: 미디어 파트는 복제되지 않고 **공유**된다. 절 슬라이드 30장이 배경 이미지 하나를 함께 가리킨다(파일 크기에 유리하다). 실측 — 30절 결과물 71,829 B 중 배경 PNG 2장은 여전히 각 7,664 B 한 벌뿐이다.

### 3-4. 임베딩된 폰트도 바이트째 따라온다 (실측)

템플릿에 `ppt/fonts/font1.fntdata`(200,000 B) + `<p:embeddedFontLst>` + 폰트 Relationship + `<Default Extension="fntdata" ContentType="application/x-fontdata"/>`를 심어 두고 수술을 돌렸다:

```
fntdata part preserved byte-identical: True 200000 B
embeddedFontLst survived:  True
font relationship survived: True
fntdata Default survived:   True
```

**물려받은 파일이 폰트를 임베딩하고 있다면, 템플릿 수술은 그것을 공짜로 물려받는다.** 브라우저에서 EOT를 만들 수 없다는 [§5-3](#5-3-임베딩하려면-eot--microtype-express를-만들어야-한다-사실상-막힌-길)의 벽을 이 갈래만 우회한다. **물려받은 실물을 확보하면 제일 먼저 확인할 것이 이것이다** — `unzip -l 파일.pptx | grep fntdata`.

### 3-5. 이 갈래에서 실제로 물리는 곳 두 개

**(1) 관계 ID는 `rId<숫자>`라는 보장이 없다.** 내가 처음 쓴 코드가 `Math.max(...ids.map(r => +r.slice(3)))`로 다음 ID를 뽑았는데, 폰트 관계 ID를 `rIdFont1`로 심은 템플릿에서 **`rIdNaN`을 내보내 ISO XSD 검증에 걸렸다**(`'rIdNaN' is not a valid value of the atomic type 'xs:ID'`). OPC가 요구하는 것은 `xsd:ID`일 뿐이다. **쓰인 ID 집합을 그대로 들고 빈 자리를 찾는 방식**으로 고쳤다. 파워포인트 자신은 `rIdN`만 쓰지만, 남의 파일을 파싱하는 코드는 이걸 가정하면 안 된다.

**(2) `<p:embeddedFont>` 안의 폰트 이름 요소는 `p:font`이지 `a:font`가 아니다.** 타입은 `a:CT_TextFont`인데 요소 이름은 pml 네임스페이스다(ISO/IEC 29500-4 `pml.xsd` `CT_EmbeddedFontListEntry`). 내가 테스트 픽스처를 `<a:font>`로 만들었다가 검증에서 잡혔다.

### 3-6. 템플릿을 번들에 넣을 것인가, 사용자가 올릴 것인가

이 조사가 결정하지는 않지만 **무게는 잴 수 있다.**

| | 번들에 넣기 | 사용자가 올리기 |
|---|---|---|
| 정적 자산 증가 | 물려받은 파일 크기 그대로. 대역 템플릿 기준 **37,969 B**, 배경이 실사진이면 수백 KB~수 MB | 0 |
| *"방송부 여럿이 돌아가며"* | **걸리지 않는다.** 당번이 아무것도 챙기지 않는다 | **걸린다.** 맵이 이미 기각한 *"기기에 파일을 한 번 넣어두면 된다"* 와 같은 형태다 |
| 디자인이 바뀌면 | 재배포(git push) | 새 파일을 올리면 끝 |
| 코드가 무는 것 | 그 파일의 슬라이드 배치(어디까지가 인트로인가), 절 슬라이드의 `<a:t>` 위치 | 같음 + **파일 구조를 신뢰할 수 없다** |

**측정된 사실 하나만 덧붙인다** — Cloudflare Pages의 단일 파일 상한은 25 MiB, 배포당 파일 수 상한은 무료 20,000개다(나비CG 조사 §4-1에서 이미 확인된 값). **템플릿 파일 하나를 번들에 넣는 것은 이 상한에 전혀 걸리지 않는다.** 걸리는 것은 성경 데이터(5.1 MB)지 템플릿이 아니다.

---

## 4. 갈래 (가) — pptxgenjs 4.0.1 실사

### 4-1. 브라우저 지원

- 배포판: `exports.import` → `dist/pptxgen.es.js`, `exports.require` → `dist/pptxgen.cjs.js`. **ESM/CJS 이중 배포이고 번들러에서 그대로 잡힌다**(esbuild로 확인).
- `package.json`의 `browser` 필드가 `express`·`fs`·`https`·`image-size`·`node:fs`·`node:https`·`os`·`path`를 전부 `false`로 매핑한다. **Node 폴리필이 필요 없다**(실측).
- 공식 README(v4.0.1 태그)는 *"Supports every major modern browser - desktop and mobile"*, *"Instantly download `.pptx` files from the browser with proper MIME handling"*, *"Export as base64, Blob, Buffer, or Node stream"* 라고 적는다. 브라우저에서는 `pres.write({ outputType: 'blob' })` 또는 `pres.writeFile({ fileName })`을 쓴다.
  - 출처: <https://raw.githubusercontent.com/gitbrent/PptxGenJS/v4.0.1/README.md>
- 유지보수: npm `4.0.1`, 빌드 타임스탬프 `2025-06-25T23:35:35Z`, MIT.

### 4-2. 한글 처리 — 기본값이 이미 맑은 고딕이다

- **`fontFace`를 주면 `<a:latin>`·`<a:ea>`·`<a:cs>` 세 개를 모두 그 이름으로 쓴다**(`pptxgen.es.js:5961`). 한글에는 `<a:ea>`가 걸리므로 이게 맞는 동작이다.
- **`fontFace`를 안 줘도 한글은 맑은 고딕으로 간다.** pptxgenjs가 만드는 `ppt/theme/theme1.xml`의 `fontScheme`에 `<a:font script="Hang" typeface="맑은 고딕"/>` 가 major/minor 양쪽에 박혀 있다(실제 산출물에서 확인).
- **다만 `lang`은 기본이 `en-US`다**(`pptxgen.es.js:5920`). 한글이면 `lang: 'ko-KR'`을 줘야 하고, 그러면 `altLang="en-US"`가 자동으로 붙는다. 앞선 프로젝트의 실제 산출물은 `<a:rPr lang="en-US" ...><a:t>♫ 영광송</a:t>` 로 나가 있다 — 동작에는 지장이 없었지만 정확하지 않다.
- 같은 산출물이 `Apple SD Gothic Neo`를 지정하고 있다. **이건 macOS 전용 폰트다.** 예배당 PC가 Windows면 그대로 대체된다 — 그리고 [§7-2](#7-2-폰트가-바뀌면-폭이-146-틀어진다-실측)에서 재듯 **폭이 14.6% 틀어진다.**

### 4-3. pptxgenjs가 내보내는 `presentation.xml`은 ISO 스키마 위반이다 (확인됨)

앞선 프로젝트의 실제 산출물 `영광송.pptx`를 ISO/IEC 29500-4:2016 `pml.xsd`에 물렸다:

```
INVALID ppt/presentation.xml -> pml.xsd
  Element 'notesMasterIdLst': This element is not expected.
  Expected is one of ( sldSz, notesSz ).
```

스키마의 `CT_Presentation`은 순서를 이렇게 못박는다:

```xml
<!-- ISO-IEC29500-4_2016/pml.xsd:1053  CT_Presentation -->
<xsd:sequence>
  <xsd:element name="sldMasterIdLst"     minOccurs="0"/>
  <xsd:element name="notesMasterIdLst"   minOccurs="0"/>   ← 2번째
  <xsd:element name="handoutMasterIdLst" minOccurs="0"/>
  <xsd:element name="sldIdLst"           minOccurs="0"/>   ← 4번째
  ...
```

pptxgenjs는 `sldMasterIdLst → sldIdLst → notesMasterIdLst` 순으로 쓴다. **2·4번째가 뒤바뀐다.**

- **그럼에도 이 파일은 실제 예배에 쓰였다.** 파워포인트는 이 순서를 받아준다(이 저장소 개발자의 실사용이 증거다). 다른 20개 파트는 전부 valid다.
- **그러나 이건 "고쳐도 되는 것"이 아니다.** pptx 스킬 문서가 같은 지점을 정반대 방향에서 경고한다 — *"Never reorder the children of `<p:presentation>` … move the element and the same deck becomes unopenable."* 즉 **스펙대로 고치면 오히려 깨질 수 있다.** 이 라이브러리를 쓰면 그 산출물을 후처리로 손대지 않는 편이 안전하다.

### 4-4. 텍스트 상자 속성 제어 범위

| 요구 | pptxgenjs | 실체 |
|---|---|---|
| 자동 맞춤 | `fit?: 'none' \| 'shrink' \| 'resize'` | **`'shrink'`는 `<a:normAutofit/>`만 쓴다 — `fontScale`을 안 쓴다.** 아래 참조 |
| 줄간격 | `lineSpacing`(pt), `lineSpacingMultiple`(0.0~9.99) | 둘 다 있다 |
| 자간 | `charSpacing` | 있다. **`letterSpacing`은 조용히 무시된다**(스킬 문서 경고) |
| 배경 이미지 | `slide.background = { path }` 또는 `{ data: 'image/png;base64,...' }` | 브라우저에서 `path`는 fetch 가능한 URL이어야 한다 → 정적 자산으로 올려야 한다 |
| 여백 | `margin`(pt) | 있다 |
| 언어 | `lang` | 기본 `en-US` |

**`fit: 'shrink'`의 실체 — 라이브러리 소스가 직접 말한다**(`pptxgen.es.js:6060-6070`):

```js
// NOTE: Shrink does not work automatically - PowerPoint calculates the `fontScale` value dynamically upon resize
// else if (slideObject.options.fit === 'shrink') bodyProperties += '<a:normAutofit fontScale="85000" lnSpcReduction="20000"/>'
else if (slideObject.options.fit === 'shrink')
    bodyProperties += '<a:normAutofit/>'
```

**`fontScale`을 쓰는 줄이 주석 처리되어 있고, 그 자리에 빈 `<a:normAutofit/>`이 들어간다.** 라이브러리 저자 본인이 이유를 적어 놓았다 — *"Shrink does not work automatically."* [§6](#6-autofit--켜도-아무도-줄여주지-않는다)이 이 말을 실측으로 확인한다.

### 4-5. 템플릿 갈래를 위한 라이브러리는 브라우저에서 못 쓴다 (확인됨)

`.pptx`를 템플릿으로 열어 슬라이드를 합치는 정식 라이브러리는 **pptx-automizer** 하나뿐이다(0.8.2, 2026-06-24). 설치해 확인했다:

```json
{ "main": "dist/index.js",  "module": 없음,  "browser": 없음,  "exports": 없음,
  "deps": { "@xmldom/xmldom": "^0.9.10", "extract-zip": "^2.0.1",
            "jszip": "^3.10.1", "pptxgenjs": "^3.12.0", ... } }
```

- `dist/`에 **`require("fs")` 7곳, `require("path")` 6곳.** `extract-zip`은 디스크에 압축을 푸는 Node 전용 패키지다.
- CJS 단일 배포, `browser` 필드 없음, ESM 없음.

**즉 갈래 (나)에는 쓸 수 있는 라이브러리가 없다. 직접 XML을 다뤄야 한다.** 다만 그 "직접"이 [부록 B](#부록-b--템플릿-수술의-핵심-110줄의-요지)의 110줄이다.

---

## 5. 한글 폰트 — 임베딩은 거의 확실히 불필요하다

### 5-1. 맑은 고딕은 Windows에도 Office에도 이미 들어 있다 (확인됨)

Microsoft 자사 타이포그래피 문서의 "Products that supply this font" 표:

> Windows 11 · Windows 10 · Windows 8.1 · Windows 8 · Windows 7 · Windows Vista(5.00) · Windows Server 2008
> "This typeface is also available within Office applications."
> — <https://learn.microsoft.com/en-us/typography/font-list/malgun-gothic>

그리고 이 조사 중 **macOS의 Office 설치본 안에서도 직접 찾았다**(실측):

```
/Applications/Microsoft PowerPoint.app/Contents/Resources/DFonts/malgun.ttf    13,457,192 B
/Applications/Microsoft PowerPoint.app/Contents/Resources/DFonts/malgunbd.ttf  12,574,656 B
/Applications/Microsoft PowerPoint.app/Contents/Resources/DFonts/malgunsl.ttf   5,083,240 B
/Applications/Microsoft PowerPoint.app/Contents/Resources/DFonts/batang.ttc     16,264,732 B  (바탕/궁서)
/Applications/Microsoft PowerPoint.app/Contents/Resources/DFonts/gulim.ttc      13,524,972 B  (굴림/돋움)
```

**따라서 `<a:latin>`/`<a:ea>`에 `맑은 고딕`을 이름으로 써 두면, 파워포인트가 깔린 어떤 PC에서도(Windows든 Mac이든) 폰트가 유지된다.** 예배당 PC에서 파워포인트로 연다는 전제 자체가 폰트를 보장한다. 굴림·바탕도 마찬가지다.

**반대 사례가 이미 저장소 안에 있다** — 앞선 프로젝트가 `Apple SD Gothic Neo`를 지정했다. 이건 macOS 전용이고 Office에 딸려 오지 않는다. **폰트 선택은 "예쁜가"가 아니라 "예배당 PC에 있는가"의 문제다.**

### 5-2. 임베딩 자체는 라이선스상 허용된다 (실측)

폰트 파일의 OS/2 테이블 `fsType` 비트를 직접 읽었다:

| 폰트 | 파일 크기 | `fsType` | 의미 |
|---|---:|---|---|
| 맑은 고딕 (malgun.ttf) | 13,457,192 B | `0x0008` | **Editable embedding** (서브셋 허용, no-subset 비트 꺼짐) |
| 맑은 고딕 Bold | 12,574,656 B | `0x0008` | Editable embedding |
| 굴림 (gulim.ttc) | 13,524,972 B | `0x0008` | Editable embedding |
| 바탕 (batang.ttc) | 16,264,732 B | `0x0000` | Installable (제한 없음) |
| Apple SD Gothic Neo | 55,373,848 B | `0x0008` | Editable embedding |

Microsoft 자사 안내도 같은 결을 말한다 — *"Not all TrueType fonts can be embedded. Font creators can set different options … Non-embeddable, Preview/Print, Editable, and Installable."* (<https://support.microsoft.com/en-us/office/embed-fonts-in-documents-or-presentations-cb3982aa-ea76-4323-b008-86670f222dbc>). **맑은 고딕은 Editable이므로 걸리지 않는다.**

### 5-3. 임베딩하려면 EOT / MicroType Express를 만들어야 한다 (사실상 막힌 길)

Microsoft가 자기 구현과 표준의 차이를 직접 문서화해 두었다:

> **c.** *The standard states that `application/x-fontdata` specifies that the font shall be stored as a bitmapped font (each glyph is stored as a raster image).*
> — **PowerPoint stores TrueType and OpenType fonts ([Embed-Open-Type-Format], [Micro-Type-Exp-Format]) in parts of this type.** Word does not read or write this content type.
>
> **b.** *The standard states that `application/x-font-ttf` specifies that the font shall be stored in the TrueType or OpenType format.*
> — **PowerPoint does not use this content type.**
>
> — [MS-OE376] Part 1 §15.2.12, <https://learn.microsoft.com/en-us/openspecs/office_standards/ms-oe376/1663dabc-5d98-463f-889e-bcd9b77c3d34>

읽는 법: **파워포인트는 `.fntdata` 파트에 생 TTF를 넣지 않는다. EOT(Embedded OpenType) 혹은 Monotype MicroType Express로 압축해 넣는다.** 그리고 표준이 규정한 `x-font-ttf`(=생 TTF를 넣는 길)는 **파워포인트가 아예 읽지 않는다.**

여기에 크기가 겹친다. **맑은 고딕 Regular 원본이 13,457,192 B다.** 서브셋 없이 넣으면 `.pptx` 하나가 **13 MB**가 된다 — 맵이 "최대 위험"으로 지목한 `bible.json` 5.1 MB의 2.6배가 파일 하나마다 붙는 셈이다. 서브셋하려면 브라우저에서 TTF 서브셋터를 돌린 뒤 다시 EOT/MTX로 인코딩해야 하는데, **후자를 하는 브라우저 라이브러리를 찾지 못했다.**

**결론: 임베딩은 갈래 (가)·(다)에서 실질적으로 불가능하고, 필요하지도 않다.** 유일한 실현 경로는 [§3-4](#3-4-임베딩된-폰트도-바이트째-따라온다-실측) — **물려받은 파일이 이미 임베딩하고 있다면 템플릿 수술이 그대로 보존한다.**

`p:embeddedFontLst`의 구조는 확인해 두었다(ISO/IEC 29500-4 `pml.xsd:930`): `<p:embeddedFont>` 안에 `<p:font typeface="…"/>` 하나와 `<p:regular r:id="…"/>`/`bold`/`italic`/`boldItalic` 중 필요한 것. `[Content_Types].xml`에는 `<Default Extension="fntdata" ContentType="application/x-fontdata"/>`.

---

## 6. autofit — 켜도 아무도 줄여주지 않는다

이건 티켓이 *"`절이 넘칠 때 어떻게 쪼개나`의 판을 통째로 바꿀 수 있는 사실"* 이라고 표시한 항목이다. **판은 바뀌지 않는다. 반대 방향으로 확정된다.**

### 6-1. 스펙이 말하는 것 — `fontScale`은 생산자가 계산해 넣는 값이다

ISO/IEC 29500-1 §21.1.2.1.2 (`normAutofit`) 원문:

> This element specifies that text within the text body should be normally auto-fit to the bounding box. … **For the application to know how and to what degree the text should be resized two attributes are set for the auto-fit resize logic.**
>
> **fontScale** — Specifies the percentage of the original font size to which each run in the text body is scaled. … **If this attribute is omitted, then a value of 100% is implied.**
>
> **lnSpcReduction** — Specifies the percentage amount by which the line spacing of each paragraph in the text body is reduced. … If this attribute is omitted, then a value of 0% is implied.
>
> — <https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.drawing.normalautofit> (Remarks에 ISO/IEC 29500-1 원문을 그대로 싣는다)

스키마의 값 범위(ISO/IEC 29500-4 `dml-main.xsd:2629-2643`): `fontScale`은 `ST_TextFontScalePercent`(1000~100000, 즉 1%~100%, 1000분의 1퍼센트 단위) 또는 `"92.000%"` 형태의 문자열. 기본값 `100%`.

**핵심은 "omitted → 100%"다.** 우리가 `<a:normAutofit/>`만 써 놓으면 그 파일은 **"100%로 그려라"** 라고 말하고 있는 것이다. 축소하려면 우리가 축소율을 계산해서 넣어야 한다 — 즉 **autofit을 켜는 것으로 길이 판정을 면제받지 못한다.**

### 6-2. 실측 — Apple 렌더러는 네 경우가 픽셀 단위로 같다

40pt 한글 130자(그 상자에서 6줄이 되어 넘치는 길이)를 같은 상자에 넣고 `bodyPr`의 autofit 요소만 바꿔 5개 파일을 만들어 렌더했다:

| 파일 | `<a:bodyPr>` 안의 요소 | 렌더 SHA-256(앞 16) |
|---|---|---|
| af-none | `<a:noAutofit/>` | `96bf6351ec827f82` |
| af-bare | `<a:normAutofit/>` | `96bf6351ec827f82` |
| af-scale50 | `<a:normAutofit fontScale="50000" lnSpcReduction="20000"/>` | `96bf6351ec827f82` |
| af-scale25 | `<a:normAutofit fontScale="25000" lnSpcReduction="20000"/>` | `96bf6351ec827f82` |
| af-spAutoFit | `<a:spAutoFit/>` | `96bf6351ec827f82` |

**다섯 개가 픽셀 하나까지 동일하다**(`ImageChops.difference`의 bbox가 전부 `None`). Apple의 Office 렌더러는 **명시적으로 적힌 `fontScale="25%"`조차 무시하고 40pt 그대로 그린다.**

### 6-3. 그래서 무엇이 결론인가

- **`normAutofit`을 켜는 것만으로는 아무 일도 일어나지 않는다.** 축소는 파워포인트가 **텍스트를 편집하거나 상자를 리사이즈할 때** 다시 계산해 파일에 써 넣는 동작이다(라이브러리 저자의 관찰: *"PowerPoint calculates the `fontScale` value dynamically upon resize"*). 파일을 **열기만** 했을 때 파워포인트가 재계산하는지는 **확인하지 못했다** — TCC 때문에 파워포인트를 못 띄웠다([§8](#8-무엇으로-검증했고-무엇을-못-했나)).
- **설령 파워포인트가 열 때 재계산한다 해도 갈래를 살려주지 않는다.** 티켓이 우려한 *"파일을 열기 전에는 축소 결과를 알 수 없다"* 가 정확히 그 지점이다 — 새벽 5시에 열어 보고서야 "12번째 절만 글자가 작다"를 알게 된다. 그리고 **파워포인트가 아닌 뷰어(Apple 렌더러가 실측 증거다)에서는 재계산이 아예 없어서 그냥 넘친다.**
- **다행히 이건 문제가 아니게 됐다.** [§7](#7-길이-판정--폰트-메트릭을-잴-필요가-없다)에서 축소율을 **우리가 정확히 계산할 수 있다는 것**이 확인됐다. 계산해서 `fontScale`에 박아 넣거나, 아예 `sz`를 줄여 쓰면 된다. **후자가 낫다** — 모든 소비자가 `sz`는 존중하고 `fontScale`은 안 그런다.

---

## 7. 길이 판정 — 폰트 메트릭을 잴 필요가 없다

**이 절이 이 조사에서 가장 값어치 있는 부분이다.** 맵의 *"둘째 위험 — 조판을 우리가 책임진다 … 그건 폰트 메트릭을 잰다는 뜻이다"* 를 정면으로 줄인다.

### 7-1. 한글 본문 폰트는 전부 고정폭이다 (실측)

시스템에 있는 한글 폰트 전부에 대해 `cmap`으로 한글 음절 영역(U+AC00~U+D7A3)의 글리프를 찾고 `hmtx`에서 advance를 읽어, **서로 다른 advance 값이 몇 종류인지** 셌다:

| 폰트 | upem | 한글 음절 커버리지 | **서로 다른 advance 종류** | 값(em) |
|---|---:|---:|---:|---:|
| **맑은 고딕** | 2048 | 11,172자 전부 | **1** | **1.0** |
| 굴림 | 1024 | 11,172 | **1** | 1.0 |
| 바탕 | 1024 | 11,172 | **1** | 1.0 |
| AppleGothic | 1000 | 11,172 | **1** | 1.0 |
| Arial Unicode | 2048 | 11,172 | **1** | 1.0 |
| AppleMyungjo | 1025 | 11,172 | **1** | 0.999 |
| 나눔명조 | 1024 | 11,172 | **1** | 0.9502 |
| 나눔고딕 | 1000 | 11,172 | **1** | 0.94 |
| Apple SD Gothic Neo | 1000 | 11,172 | **1** | 0.865 |
| *(예외)* 나눔손글씨 | 1000 | 11,172 | 164 | 0.36~ |
| *(예외)* 배민 기랑해랑 | 1000 | 11,172 | 13 | 0.48~ |

**본문용 한글 폰트 9종 전부가 한글 음절 11,172개에 대해 단 하나의 폭을 쓴다.** 예외 둘은 손글씨/디스플레이 서체다. 이건 우연이 아니라 한글 활자 설계 관행이다 — 음절이 정사각 격자 위에 앉는다.

**따라서 필요한 것은 폰트당 상수 하나다:**

```js
// 맑은 고딕 (실측)
const EM = { hangul: 1.0, space: 0.3516, period: 0.2188, comma: 0.2188,
             latinA: 0.6582, digit: 0.5508, lquote: 0.3789 };
// 굴림: hangul 1.0, space 0.3330 / Apple SD Gothic Neo: hangul 0.8650, space 0.2630
```

`Canvas.measureText`도, `document.fonts`도, 폰트 파일 로드도 필요 없다. **줄바꿈 판정은 곱셈이다.**

### 7-2. 폰트가 바뀌면 폭이 14.6% 틀어진다 (실측)

같은 절을 40pt로 놓았을 때의 전체 advance 합:

| 절 | 맑은 고딕 | Apple SD Gothic Neo | 굴림 | 바탕 | Arial Unicode |
|---|---:|---:|---:|---:|---:|
| 요 3:16 (63자) | **2130.94 pt** | 1818.60 (**−14.66%**) | 2119.80 (−0.52%) | 2119.80 (−0.52%) | 2086.70 (−2.08%) |
| 시 23:4 (51자) | **1728.75 pt** | 1475.64 (**−14.64%**) | 1719.84 (−0.52%) | 1719.84 (−0.52%) | 1693.36 (−2.05%) |
| 창 1:1 (19자) | **682.19 pt** | 585.16 (**−14.22%**) | 679.96 (−0.33%) | 679.96 (−0.33%) | 673.34 (−1.30%) |

읽는 법:

- **한국 계열 본문 폰트끼리는 0.5% 이내로 같다.** 맑은 고딕 기준으로 계산해 두면 굴림·바탕에서도 사실상 맞는다.
- **틀어지는 것은 Apple SD Gothic Neo뿐이고, 그 차이가 14.6%다.** 즉 "브라우저에서 `measureText`로 재고 파워포인트에서 열었을 때 얼마나 다른가"의 답은 **"어느 폰트를 쟀느냐에 전적으로 달려 있다"** 이다. 맥에서 Office 없이 브라우저만 있으면 `맑은 고딕`이 없어 Apple SD Gothic Neo로 대체되고, 그러면 **한 줄에 3자쯤 더 들어간다고 잘못 계산한다.**
- **그러니 브라우저에서 재면 안 된다.** 상수를 코드에 박는 편이 정확하고, 가볍고, 재현 가능하다. (브라우저에서 굳이 재야 한다면 `document.fonts.check('40pt "맑은 고딕"')`로 **폰트가 실제로 있는지 먼저 확인**해야 하는데, 그 결과가 기기마다 갈리므로 *"방송부 여럿이 돌아가며"* 와 정면으로 충돌한다.)

### 7-3. 모델을 실물 렌더로 검증했다 — 예측 21자, 실측 21자

`min.pptx`의 절 상자를 그대로 두고 `가`를 17~25개 넣은 파일 9개를 만들어 Apple 렌더러로 그렸다.

**예측** — 상자 `cx = 10,515,600` EMU, `lIns = rIns = 91,440` EMU(명시적으로 지정):

```
사용 가능 폭 = 10,515,600 − 2 × 91,440 = 10,332,720 EMU
             = 10,332,720 ÷ 914,400 = 11.2999 in = 813.594 pt
40pt 기준     = 813.594 ÷ 40 = 20.3398 em
→ 한글 20자(20.0 em)는 들어가고, 21자(21.0 em)는 넘친다
```

**실측:**

| 글자 수 | 렌더 줄 수 | 잉크 폭(px, 슬라이드 폭 400px) | 역산한 em/자 |
|---:|---:|---:|---:|
| 17 | 1 | 283 | 0.9988 |
| 18 | 1 | 300 | **1.0000** |
| 19 | 1 | 316 | 0.9979 |
| 20 | 1 | 333 | 0.9990 |
| **21** | **2 ← 여기서 넘어간다** | 333 | — |
| 22~25 | 2 | 333 | — |

**예측 임계값 21, 실측 임계값 21. 정확히 일치한다.** 그리고 역산한 자당 폭이 0.998~1.000 em으로, 폰트 파일에서 읽은 1.0 em과 일치한다(잔차는 400px 렌더의 서브픽셀 오차다).

### 7-4. 다만 세로(줄 높이)는 아직 정확하지 않다

가로는 폰트 파일에서 그대로 나오지만, **한 줄의 높이는 렌더러마다 다르다**(실측):

| 폰트 | `hhea` (asc−desc+gap) | OS/2 typo | OS/2 win |
|---|---:|---:|---:|
| 맑은 고딕 | **1.3301 em** | 1.0000 em | 1.3301 em |
| 굴림 | 1.1484 em | 1.1484 em | 1.0000 em |
| Apple SD Gothic Neo | 1.2000 em | 1.2000 em | 1.2000 em |

그런데 **Apple 렌더러가 실제로 쓴 행간은 1.2240 × 폰트 크기**였다(6줄 렌더에서 행 피치 20.4px, 30 px/in → 48.96 pt ÷ 40 pt). 위 세 값 어느 것과도 다르다. **파워포인트가 어떤 값을 쓰는지는 확인하지 못했다.**

**귀결** — "절이 몇 줄이 되는가"는 지금 정확히 계산할 수 있다. "그 줄 수가 상자 높이에 들어가는가"는 **행간 상수 하나만 더 실측하면** 정확해진다. 그리고 그 실측은 **물려받은 실물 파일을 파워포인트로 한 번 열어 재면 끝난다** — 티켓 `새벽기도 PPT 실물 확보와 조판 실측`이 이미 잡아 둔 자리다. **거기에 "40pt 한글 N줄이 상자에 몇 줄까지 들어가는지"를 확인 항목으로 추가할 것을 권한다.**

**그리고 맵의 *"넘치는 절이 몇 개인지 아무도 모른다"* 는 이제 세기만 하면 되는 문제다.** 상자 폭 하나와 행간 하나가 실측되면, 개역개정 31,102절 전부에 대해 `ceil(글자수 × 1.0 + 공백수 × 0.3516 ÷ 사용가능em)` 을 돌려 **정확한 개수가 떨어진다.** 규칙을 발명하기 전에 세라는 맵의 지침이 그대로 실행 가능해졌다.

---

## 8. 무엇으로 검증했고 무엇을 못 했나

### 8-1. 쓴 검증 수단 세 개

| 수단 | 무엇을 보증하나 | 무엇을 보증하지 않나 |
|---|---|---|
| **Apple `/System/Library/QuickLook/Office.qlgenerator` v5.0** (`qlmanage -t`) | **독립 구현이 패키지를 파싱하고 슬라이드를 실제로 그린다.** 파트가 하나만 빠져도 멈추므로 관계 그래프까지 검사하는 셈이다 | 파워포인트가 아니다. `fontScale`을 무시하는 등 렌더 규칙이 다르다 |
| **ISO/IEC 29500-4:2016 XSD** (`pml.xsd`, `dml-main.xsd`, `opc-contentTypes.xsd`, `opc-relationships.xsd` + lxml) | 각 파트의 **문법**이 국제표준에 맞다 | **패키지 구조를 전혀 안 본다.** 테마·마스터를 다 지워도 통과했다 |
| **python-pptx 1.0.2** | XML을 열어 슬라이드·도형·텍스트를 객체로 읽는다 → **"진짜 텍스트 상자"가 맞는지 확인** | lxml 위의 얇은 층이라 관대하다. 마스터 없는 파일도 통과 |

최소 `.pptx`가 python-pptx에서 이렇게 읽힌다 — **이미지가 아니라 편집 가능한 텍스트 상자라는 증거다:**

```
slides: 2   size: 12192000 x 6858000
  1 MSO_SHAPE_TYPE.TEXT_BOX (17)  '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다…'
  2 MSO_SHAPE_TYPE.TEXT_BOX (17)  '태초에 하나님이 천지를 창조하시니라'
```

렌더 결과(Apple QuickLook, 400×225): 40pt 한글이 3줄로 자동 줄바꿈되어 가운데 정렬로 그려졌다.

### 8-2. 못 한 것 — 파워포인트로 열어보지 못했다

**이 기기에는 Microsoft PowerPoint 16.111.3, Keynote, 한컴오피스 HWP가 전부 설치돼 있다. 그런데 셋 다 못 썼다.**

- AppleScript(`osascript`)로 파워포인트를 띄워 슬라이드를 읽으려 하자 **`-10003 접근이 허용되지 않습니다`** 로 막혔다. 프로세스가 뜨지도 않았다 — macOS TCC의 **자동화(Apple Events) 권한**이 없다.
- 화면을 찍어 확인하려 하자 `screencapture`가 **`could not create image from display`** — **화면 기록 권한**도 없다.
- 맵이 이미 기록한 *"macOS TCC가 `~/Downloads` 접근을 막아 이 세션에서 못 읽었다"* 와 같은 벽이다.

**따라서 "파워포인트에서 열린다"고 말할 수 없다.** 말할 수 있는 것은 이것뿐이다 — *독립 OOXML 구현 하나가 렌더했고, ISO 스키마 13/13이 통과했고, python-pptx가 텍스트 상자로 읽었다.* LibreOffice·Google Slides·한컴오피스도 확인하지 못했다(LibreOffice는 미설치이며, 사용자 기기에 700 MB짜리 앱을 설치하는 것은 이 조사의 범위를 넘는다고 판단했다).

**대신 다음 사람이 30초에 끝낼 수 있게 물건을 남겼다.** 아래 파일들을 더블클릭하면 바로 답이 나온다:

```
/Users/jiwoo/.claude/jobs/0bd0c26c/tmp/build/
  min.pptx            ← 갈래 (다) 최소 파일. 13파트 5,843 B, 절 2장
  scratch30.pptx      ← 갈래 (다) 30절, 37,877 B
  swapped.pptx        ← 갈래 (나) 템플릿 수술 결과. 인트로/아웃트로 보존, 절 4장
  swapped30.pptx      ← 갈래 (나) 30절, 71,829 B
  swapped-font.pptx   ← 갈래 (나) + 임베딩 폰트 보존 확인용
  af-bare.pptx, af-scale25.pptx  ← autofit 비교용(넘치는 절 1장)
  w20.pptx, w21.pptx  ← 줄바꿈 임계값 검증용(가 20자 / 21자)
```

*(이 디렉터리는 에이전트 작업 디렉터리라 언젠가 정리된다. 사라졌으면 [부록 A](#부록-a--최소-pptx-전문)를 파일로 저장해 `node`로 한 번 돌리면 그대로 다시 나온다.)*

**확인할 것은 정확히 셋이다:** ① "복구 필요" 대화상자가 뜨는가 ② 텍스트를 클릭해서 고칠 수 있는가 ③ `af-bare.pptx`를 열었을 때 넘치는 글자가 **자동으로 줄어드는가**(= 파워포인트가 열 때 `fontScale`을 재계산하는가 — [§6-3](#6-3-그래서-무엇이-결론인가)의 유일한 미확인 항목).

---

## 9. 후속 티켓이 실제로 고를 조합 (결정하지 않고 나열만 한다)

| 조합 | 번들(gzip) | 디자인의 출처 | 폰트 임베딩 | 자작량 | 이 조합이 지는 위험 |
|---|---:|---|---|---|---|
| **pptxgenjs 그대로** | 126,467 B | **우리가 다시 저작** | ❌ 불가 | 낮음 | jszip 중복. 스키마 위반 XML(그러나 실사용 검증됨). 배경 이미지를 정적 자산으로 다시 준비해야 함 |
| **pptxgenjs + 템플릿 배경만 이미지로** | 126,467 B + 배경 PNG | 이미지만 물려받음 | ❌ | 낮음 | 위와 같음. 인트로/아웃트로가 "똑같아 보이는 재현"이지 원본이 아님 |
| **fflate + 손수 OOXML** | 6,764 B | **우리가 다시 저작** | ❌ | 중간(140줄) | 마스터·레이아웃·테마를 우리가 유지보수한다. 디자인이 바뀌면 코드가 바뀐다 |
| **fflate + 템플릿 수술** | 7,339 B | **물려받은 파일 그대로(바이트 보존)** | **✅ 있으면 보존** | 중간(110줄) | 템플릿 파일이 앱 안에 있어야 한다. 코드가 그 파일의 슬라이드 배치에 물린다 |
| **fflate + 템플릿 수술 + 사용자 업로드** | 7,339 B | 물려받은 파일 | ✅ | 중간+ | *"방송부 여럿이 돌아가며"* 에 걸린다(맵이 이미 기각한 형태) |

**세 갈래 어디를 골라도 공통으로 필요한 것** — [§7](#7-길이-판정--폰트-메트릭을-잴-필요가-없다)의 폭 상수 테이블(코드 5줄), 상자 폭·높이 실측값 하나씩, 그리고 행간 상수 하나. **라이브러리 선택과 무관하다.**

---

## 부록 A — 최소 `.pptx` 전문

`fflate`만 쓴다. Node에서 `node min.mjs out.pptx`로 돌리면 되고, 브라우저에서는 마지막 `writeFileSync`만 `new Blob([zip], {type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'})` + `<a download>`로 바꾸면 그대로 동작한다.

```js
import { zipSync, strToU8 } from 'fflate';

const X = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const NS_P = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
           + 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
           + 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const contentTypes = n => X + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
${Array.from({length:n},(_,i)=>`<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join('\n')}
<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
</Types>`;

const rootRels = X + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="${R}/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;

// 16:9 = 12192000 x 6858000 EMU (13.333in x 7.5in). notesSz는 스키마상 필수다.
const presentation = n => X + `<p:presentation ${NS_P}>
<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
<p:sldIdLst>${Array.from({length:n},(_,i)=>`<p:sldId id="${256+i}" r:id="rId${i+2}"/>`).join('')}</p:sldIdLst>
<p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;

const presentationRels = n => X + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="${R}/slideMaster" Target="slideMasters/slideMaster1.xml"/>
${Array.from({length:n},(_,i)=>`<Relationship Id="rId${i+2}" Type="${R}/slide" Target="slides/slide${i+1}.xml"/>`).join('\n')}
<Relationship Id="rId${n+2}" Type="${R}/theme" Target="theme/theme1.xml"/>
</Relationships>`;

const slideMaster = X + `<p:sldMaster ${NS_P}>
<p:cSld><p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>
</p:spTree></p:cSld>
<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>`;

const slideMasterRels = X + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="${R}/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
<Relationship Id="rId2" Type="${R}/theme" Target="../theme/theme1.xml"/>
</Relationships>`;

const slideLayout = X + `<p:sldLayout ${NS_P} type="blank" preserve="1">
<p:cSld name="Blank"><p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>
</p:spTree></p:cSld>
<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>`;

const slideLayoutRels = X + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="${R}/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`;

// 절 슬라이드. 상자 10515600 x 3600000 EMU, lIns/rIns 명시 -> 폭 계산이 정확해진다.
const slide = (text, id = 2) => X + `<p:sld ${NS_P}>
<p:cSld><p:spTree>
<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>
<p:sp>
<p:nvSpPr><p:cNvPr id="${id}" name="TextBox ${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
<p:spPr><a:xfrm><a:off x="838200" y="1600200"/><a:ext cx="10515600" cy="3600000"/></a:xfrm>
<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>
<p:txBody>
<a:bodyPr wrap="square" lIns="91440" tIns="45720" rIns="91440" bIns="45720"><a:normAutofit/></a:bodyPr>
<a:lstStyle/>
<a:p><a:pPr algn="ctr"/><a:r>
<a:rPr lang="ko-KR" altLang="en-US" sz="4000" dirty="0"><a:latin typeface="맑은 고딕"/><a:ea typeface="맑은 고딕"/></a:rPr>
<a:t>${esc(text)}</a:t></a:r></a:p>
</p:txBody>
</p:sp>
</p:spTree></p:cSld>
<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;

const slideRels = X + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="${R}/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`;

const dk = (n,v) => `<a:${n}><a:srgbClr val="${v}"/></a:${n}>`;
const theme = X + `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="T">
<a:themeElements>
<a:clrScheme name="T">${dk('dk1','000000')}${dk('lt1','FFFFFF')}${dk('dk2','44546A')}${dk('lt2','E7E6E6')}${dk('accent1','4472C4')}${dk('accent2','ED7D31')}${dk('accent3','A5A5A5')}${dk('accent4','FFC000')}${dk('accent5','5B9BD5')}${dk('accent6','70AD47')}${dk('hlink','0563C1')}${dk('folHlink','954F72')}</a:clrScheme>
<a:fontScheme name="T">
<a:majorFont><a:latin typeface="맑은 고딕"/><a:ea typeface="맑은 고딕"/><a:cs typeface=""/></a:majorFont>
<a:minorFont><a:latin typeface="맑은 고딕"/><a:ea typeface="맑은 고딕"/><a:cs typeface=""/></a:minorFont>
</a:fontScheme>
<a:fmtScheme name="T">
<a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
<a:lnStyleLst><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
</a:fmtScheme>
</a:themeElements>
</a:theme>`;

export function build(texts) {
  const n = texts.length;
  const files = {
    '[Content_Types].xml': contentTypes(n),
    '_rels/.rels': rootRels,
    'ppt/presentation.xml': presentation(n),
    'ppt/_rels/presentation.xml.rels': presentationRels(n),
    'ppt/slideMasters/slideMaster1.xml': slideMaster,
    'ppt/slideMasters/_rels/slideMaster1.xml.rels': slideMasterRels,
    'ppt/slideLayouts/slideLayout1.xml': slideLayout,
    'ppt/slideLayouts/_rels/slideLayout1.xml.rels': slideLayoutRels,
    'ppt/theme/theme1.xml': theme,
  };
  texts.forEach((t, i) => {
    files[`ppt/slides/slide${i+1}.xml`] = slide(t);
    files[`ppt/slides/_rels/slide${i+1}.xml.rels`] = slideRels;
  });
  return zipSync(
    Object.fromEntries(Object.entries(files).map(([k,v]) => [k, strToU8(v)])),
    { level: 9, mtime: new Date('1980-01-01T00:00:00Z') }   // mtime:0 은 던진다
  );
}
```

**주의 — 배경.** 위 파일에는 `<p:bg>`가 없다. Apple 렌더러는 이걸 회색으로 그렸다(실측). 배경을 정하려면 마스터의 `<p:cSld>` 안 첫 자식으로 `<p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>`를 넣는다. **배경 이미지를 쓰려면 `ppt/media/`에 파트를 추가하고 `[Content_Types].xml`에 `<Default Extension="png" .../>`를 넣고 슬라이드(또는 마스터)의 `.rels`에 image 관계를 걸어야 한다** — 이게 갈래 (다)가 갈래 (나)보다 비싸지는 지점이다.

---

## 부록 B — 템플릿 수술의 핵심 (110줄의 요지)

전체는 스크래치패드(`/Users/jiwoo/.claude/jobs/0bd0c26c/tmp/build/swap.mjs`)에 있고, 알고리즘은 이렇다. **`fflate`의 `unzipSync`/`zipSync` 외에 아무 의존성도 없다.**

```js
import { unzipSync, zipSync } from 'fflate';

export function retypeset(templateBytes, verses, { introCount = 1, outroCount = 1 } = {}) {
  const src = unzipSync(templateBytes);
  const out = { ...src };                       // ← 기본이 "전부 그대로 둔다"

  // 1) presentation.xml의 <p:sldIdLst> 순서 + presentation.xml.rels 로 슬라이드 목록을 복원
  // 2) 앞 introCount개 / 뒤 outroCount개를 남기고, 가운데를 프로토타입으로 삼는다
  // 3) 가운데 슬라이드 파트와 그 .rels 를 out 에서 삭제
  // 4) 절 개수만큼 프로토타입을 복제:
  //      - slideN.xml : 첫 <a:t>…</a:t> 안의 텍스트만 교체 (나머지 전부 원본 그대로)
  //      - slideN.xml.rels : 프로토타입의 것을 그대로 복사
  //        → 레이아웃·마스터·테마·배경 이미지 참조가 자동으로 따라온다
  // 5) presentation.xml.rels : slide 타입 관계만 재작성, 나머지(theme/master/font/…)는 원문 보존
  //      ※ 관계 Id는 "rId"+숫자 라는 보장이 없다(xsd:ID 면 된다). 쓰인 Id 집합에서 빈 자리를 찾을 것
  // 6) presentation.xml : <p:sldIdLst> 만 교체
  // 7) [Content_Types].xml : 슬라이드 Override 만 교체
  //    docProps/app.xml 은 손대지 않는다 — 낡은 채로 열린다

  return zipSync(out, { level: 9, mtime: new Date('1980-01-01T00:00:00Z') });
}
```

**손대는 것은 이게 전부다.** 나머지 42개 파트(테마·마스터·11개 레이아웃·미디어·인트로/아웃트로 슬라이드)는 `out`에 원본 `Uint8Array` 참조가 그대로 남아 **바이트 단위로 동일하게 다시 압축된다.**

---

## 부록 C — 재현 절차와 측정 환경

```bash
# 1) 패키지 실측
mkdir m && cd m && pnpm add pptxgenjs fflate pptx-automizer && pnpm add -D esbuild
npx esbuild entry-pptxgen.mjs --bundle --minify --format=esm --platform=browser \
    --outfile=out.js --metafile=meta.json           # 번들 크기 + 모듈별 내역

# 2) 최소 .pptx 만들기  (부록 A를 min.mjs 로 저장)
node min.mjs min.pptx

# 3) ISO/IEC 29500-4:2016 XSD 검증  (스키마는 document-skills:pptx 스킬에 동봉돼 있다)
#    schemas/ISO-IEC29500-4_2016/{pml,dml-main}.xsd + schemas/ecma/fouth-edition/opc-*.xsd
python3 xsdval.py min.pptx            # lxml.etree.XMLSchema 로 파트별 검증

# 4) 렌더 검증 (macOS 자체 OOXML 구현)
qlmanage -t -s 400 -o out min.pptx    # ※ 깨진 패키지에서는 "실패"가 아니라 "멈춘다". 타임아웃을 걸 것

# 5) 텍스트 상자인지 확인
python3 -c "from pptx import Presentation; p=Presentation('min.pptx');
print([(sh.shape_type, sh.text_frame.text) for s in p.slides for sh in s.shapes])"

# 6) 폰트 메트릭 (라이브러리 없이 cmap/hmtx/hhea/OS2 직접 파싱)
python3 fontmetrics.py               # advance 종류 수, fsType, 줄 높이
```

**측정 환경**

| | |
|---|---|
| OS | macOS 26.5.2 (25F84), arm64 |
| Node | v24.14.0 |
| pnpm | 11.18.0 |
| Python | 3.9.6 · lxml 6.0.3 · python-pptx 1.0.2 · Pillow |
| 렌더러 | `/System/Library/QuickLook/Office.qlgenerator` v5.0 |
| *(설치돼 있으나 TCC로 못 씀)* | Microsoft PowerPoint 16.111.3, Keynote, 한컴오피스 HWP |

**측정 대상 버전 (2026-08-07 기준 npm `latest`)**

| 패키지 | 버전 | 배포/빌드 |
|---|---|---|
| pptxgenjs | 4.0.1 | 2025-06-25 |
| jszip *(pptxgenjs 의존)* | 3.10.1 | — |
| fflate | 0.8.3 | *(저장소에 이미 있음)* |
| pptx-automizer | 0.8.2 | 2026-06-24 |

---

## 부록 D — 확인 못 한 것 / 추론임을 밝히는 것

- **(확인 못 함) 파워포인트에서 실제로 열리는가.** TCC가 자동화·화면기록을 둘 다 막아 파워포인트·Keynote·한컴오피스를 하나도 못 띄웠다([§8-2](#8-2-못-한-것--파워포인트로-열어보지-못했다)). *"열린다"* 가 아니라 *"Apple의 독립 구현이 렌더했고 ISO 스키마 13/13이 통과했다"* 까지가 이 조사가 보증하는 범위다. 남긴 파일을 더블클릭하면 30초에 끝난다.
- **(확인 못 함) 파워포인트가 파일을 *열 때* `normAutofit`의 `fontScale`을 재계산하는가.** 스펙은 "생산자가 넣는 값"이라고만 하고, pptxgenjs 저자는 *"upon resize"* 라고 관찰했다. **열 때**의 동작은 확인 못 했다. [§6-3](#6-3-그래서-무엇이-결론인가)의 결론은 이 답이 어느 쪽이어도 바뀌지 않지만, 안다면 더 좋다.
- **(확인 못 함) LibreOffice Impress · Google Slides · 한컴오피스에서의 거동.** LibreOffice는 미설치고, 사용자 기기에 대형 앱을 설치하지 않았다. Google Slides는 계정이 필요하다. **다만 Apple 렌더러가 `fontScale`을 무시한 것을 보면, "파워포인트 아닌 소비자는 autofit을 안 해 준다"는 쪽에 무게가 실린다**(추론).
- **(확인 못 함) 파워포인트가 이 파일을 저장할 때 `docProps/app.xml`을 갱신하는가.** 낡은 채로 **열린다**는 것만 확인했다.
- **(확인 못 함) 파워포인트가 쓰는 행간 상수.** Apple 렌더러에서 40pt 한글의 행 피치가 **1.2240 × 폰트 크기**로 실측됐으나, 맑은 고딕의 `hhea`(1.3301) · OS/2 typo(1.0000) · OS/2 win(1.3301) 어느 값과도 다르다. **파워포인트의 값은 실물 파일을 열어 재야 한다**([§7-4](#7-4-다만-세로줄-높이는-아직-정확하지-않다)).
- **(확인 못 함) `.fntdata`에 생 TTF를 넣으면 파워포인트가 읽는가.** [MS-OE376]은 파워포인트가 EOT/MicroType Express를 쓴다고만 하고, EOT 헤더로 감싼 비압축 TTF가 통하는지는 말하지 않는다. 브라우저에서 EOT 헤더를 만드는 것 자체는 가능해 보이지만 **시도하지 않았다.** [§3-4](#3-4-임베딩된-폰트도-바이트째-따라온다-실측)의 경로가 있으므로 급하지 않다.
- **(추론) 템플릿 수술 실험에 쓴 파일은 물려받은 실물이 아니다.** 파워포인트가 저작한 마스터·레이아웃·테마(python-pptx 동봉 `default.pptx`) 위에 python-pptx로 슬라이드를 얹어 만든 대역이다. **실물은 슬라이드 배치·플레이스홀더 사용 여부·`<a:t>` 개수가 다를 수 있고, 그 차이가 §3의 "첫 `<a:t>`만 교체" 전략을 흔들 수 있다.** 실물이 확보되면 §3의 실험을 그 파일로 한 번 더 돌려야 한다 — 코드는 그대로 쓸 수 있다.
- **(추론) 한글 음절이 전부 1.0 em이라는 성질**은 시스템에 있는 본문 폰트 9종에서 확인했고 한글 활자 설계 관행에 부합하지만, **모든 한글 폰트에 대한 증명은 아니다.** 손글씨/디스플레이 서체 2종은 실제로 가변폭이었다. **실제로 쓸 폰트 하나만 이 방식으로 재면 그 폰트에 대해서는 확정이다.**
- **(추론) 번들 증가분은 esbuild 기준이다.** 이 저장소는 Next.js 16.2(webpack/Turbopack)로 빌드한다. 트리셰이킹 결과가 몇 %는 다를 수 있다. **자릿수는 유지될 것으로 본다** — pptxgenjs는 단일 거대 클래스라 셰이킹의 여지가 거의 없고, `jszip.min.js` 97,317 B는 통째로 들어온다.
- **(추론) Apple `Office.qlgenerator`가 "멈춘다"는 것을 "파워포인트도 거부한다"로 읽으면 안 된다.** 다만 **네 파트(테마·마스터·레이아웃·슬라이드→레이아웃 관계)가 필수라는 결론 자체는 스펙과도 일치**한다 — PresentationML은 슬라이드가 레이아웃을, 레이아웃이 마스터를, 마스터가 테마를 참조하는 그래프를 전제한다.
