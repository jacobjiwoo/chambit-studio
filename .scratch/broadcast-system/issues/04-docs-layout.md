# 04: 방송 시스템 레이아웃과 첫 페이지

Type: task
Status: ready-for-agent
Blocked by: 01, 02

## 무엇을 하나

`/docs/broadcast-system`에 사이드바·본문 레이아웃과 첫 페이지를 세운다. 03(문서 옮기기)과 동시에 돈다. 결정과 이유는 [map](../map.md) Decisions에 있다.

1. **페이지 목록 함수** — 라우트 바로 아래 폴더 하나가 페이지 하나이고 폴더 이름이 `slug`다. (폴더 이름, `page.mdx` 원문) 목록을 받아 `order` 순의 (`title`, `href`, `order`) 목록을 내는 순수 함수와, 디스크를 읽어 그 함수에 넘기는 얇은 loader로 나눈다(NABI `toNav`/`loadNav`와 같은 모양). frontmatter 읽기·정렬은 01이 올린 공용 함수를 쓴다. frontmatter 없음, 키 누락, `description` 150자 초과, `slug`·폴더 불일치, `order` 중복에서 빌드를 멈춘다. `_`로 시작하는 폴더와 `page.mdx`가 없는 폴더는 건너뛴다.
2. **레이아웃** — `app/docs/broadcast-system/layout.tsx`가 01에서 올린 사이드바·레이아웃 껍데기를 쓴다. 사이드바는 한 단계다. metadata title 템플릿은 `%s — 방송 시스템`, 기본값은 `방송 시스템`.
3. **첫 페이지** — `app/docs/broadcast-system/page.mdx`. 이 문서가 무엇인지(방송실 장비·연결·운영, 계속 고치는 문서), 배지의 뜻(`<Unconfirmed />`를 직접 보인다)을 짧게 쓰고 페이지 링크 목록을 둔다. 목록은 손으로 쓰지 않고 1의 함수에서 만든다.

## 건드리지 않는 것

03이 `glossary/`·`equipment/` 폴더를 만든다. 이 티켓은 그 폴더를 만들지 않고, 샘플 페이지도 커밋하지 않는다. 페이지가 없으면 사이드바와 링크 목록이 비어 있는 것이 맞다.

## 끝난 조건

- 페이지 목록 함수의 테스트가 대상 파일 옆에 있다. 원문 문자열을 직접 넣어 정렬과 위의 멈춤 조건, 폴더 건너뛰기를 확인한다. 선례는 `app/docs/nabi/_lib/pages.test.ts`.
- 임시 샘플 페이지 둘로 사이드바 순서, 현재 페이지 강조, 첫 페이지 링크 목록을 빌드한 HTML에서 본 뒤 샘플을 지운다.
- `/docs/nabi`가 그대로다.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다.
