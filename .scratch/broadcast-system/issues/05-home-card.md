# 05: 메인 화면 카드

Type: task
Status: resolved
Blocked by: 03, 04

## 무엇을 하나

`app/page.tsx` 도구 목록에 "방송 시스템" 카드를 더한다. 링크는 `/docs/broadcast-system`, 설명은 기존 카드처럼 한 문장이다(예: "방송실 장비와 연결, 운영 방법을 정리했습니다." — 03이 끝난 뒤 실제 페이지에 맞게 고친다).

03·04 뒤에 두는 이유: 문서가 비어 있거나 사이드바가 없는 동안 메인 화면에서 들어가게 하지 않는다. 03과 04가 따로 돌았으므로 둘이 합쳐진 모습을 여기서 처음 본다.

## 끝난 조건

- 메인 화면에서 카드로 들어가 사이드바가 보인다.
- 빌드한 HTML에서 사이드바와 첫 페이지 링크 목록이 용어집, 장비 목록표 순서이고, 각 페이지에서 현재 페이지가 강조된다.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다.

## Answer

### 만든 것

- `app/page.tsx` 도구 목록 끝에 "방송 시스템" 카드를 더했다. 링크는 `/docs/broadcast-system`, 설명은 "방송실 장비와 연결, 방송부 공식 용어를 정리했습니다."이다. 실제 페이지(용어집: 공식 용어, 장비 목록표: 장비와 연결)에 맞춰 예시 문장을 고쳤다.

### 확인

- 빌드한 `out/index.html`에 `href="/docs/broadcast-system"` 카드가 있다.
- `out/docs/broadcast-system.html`: 사이드바와 본문 링크 목록이 용어집 → 장비 목록표 순서다.
- `glossary.html`은 용어집 링크에만, `equipment.html`은 장비 목록표 링크에만 `aria-current="page"`가 붙는다. `<title>`은 `용어집 — 방송 시스템`, `장비 목록표 — 방송 시스템`이다.
- 첫 페이지에는 `aria-current`가 없다. 사이드바 맨 위 "방송 시스템"은 목록 항목이 아니라 제목 링크라 강조 대상이 아니다(04 설계). 문제가 되면 따로 고친다.
- `pnpm lint`, `pnpm build`, `pnpm typecheck` 통과.
