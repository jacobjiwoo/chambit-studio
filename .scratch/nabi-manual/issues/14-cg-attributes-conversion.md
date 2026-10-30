# cg/attributes 변환

Type: task
Status: open
Blocked by: 05, 06, 07

## Question

Chapter 2 `4. 속성편집(Attribute)`(PDF 101–121)를 `/docs/nabi/cg/attributes`로 옮긴다. 21쪽에 큰 이미지가 77개라 한 세션에 넘칠 수 있다. 넘치면 2단계 절 경계에서 끊고, 남은 범위로 이어 쓰는 티켓을 새로 만든다.

변환 규칙은 [map.md](../map.md)의 Notes와 [03 페이지 목록과 slug](03-page-list-and-slugs.md)의 Answer를 따른다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.
