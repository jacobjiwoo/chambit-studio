# 04: 메인 화면 카드

Type: task
Status: ready-for-agent
Blocked by: 03

## 무엇을 하나

`app/page.tsx` 도구 목록에 "방송 시스템" 카드를 더한다. 링크는 `/docs/broadcast-system`, 설명은 기존 카드처럼 한 문장이다(예: "방송실 장비와 연결, 운영 방법을 정리했습니다." — 03이 끝난 뒤 실제 페이지에 맞게 고친다).

03 뒤에 두는 이유: 문서가 비어 있는 동안 메인 화면에서 들어가게 하지 않는다.

## 끝난 조건

- 메인 화면에서 카드로 들어가 사이드바가 보인다.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다.
