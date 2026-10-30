# setup 변환

Type: task
Status: open
Blocked by: 05, 06

## Question

Chapter 1 `Setting & Control` 전체(PDF 12, 14–27)를 옮긴다. 이 지도의 시범 변환 티켓이다.

- `/docs/nabi` 첫 페이지와 `/docs/nabi/setup` Chapter 첫 페이지를 만든다
- `hd200-install`(PDF 14), `cg-board`(15–17), `software-install`(18–25), `troubleshooting`(25–27) 네 페이지를 옮긴다. PDF 25는 `3.6.` 끝과 `4.` 시작이 나눠 쓴다
- 해 보고 map의 Not yet specified 두 항목을 정한다: 확인 필요·이미지 목록을 모으는 방식, 오탈자 수정 기록을 어디에 둘지. 정한 것을 `## Answer`에 적고 map을 고친다

변환 규칙은 [map.md](../map.md)의 Notes와 [03 페이지 목록과 slug](03-page-list-and-slugs.md)의 Answer를 따른다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.
