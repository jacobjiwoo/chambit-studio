# db 변환

Type: task
Status: open
Blocked by: 05, 06, 07

## Question

Chapter 3 `교회DB` 전체(PDF 141, 143–153)를 옮긴다.

- `/docs/nabi/db` Chapter 첫 페이지를 만든다
- `getting-started`(PDF 143), `search`(144–146), `templates`(147–150), `options`(151–153) 네 페이지를 옮긴다

변환 규칙은 [map.md](../map.md)의 Notes와 [03 페이지 목록과 slug](03-page-list-and-slugs.md)의 Answer를 따른다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.
