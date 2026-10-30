# cg/shortcuts 변환

Type: task
Status: open
Blocked by: 05, 06, 07

## Question

Chapter 2 `7. 단축키`(PDF 136–140)를 `/docs/nabi/cg/shortcuts`로 옮긴다. 단축키 표 7개의 `Icon` 열이 그림이다. 7.2는 두 쪽에 걸친다.

변환 규칙은 [map.md](../map.md)의 Notes, [03 페이지 목록과 slug](03-page-list-and-slugs.md)와 [07 setup 변환](07-setup-conversion.md)의 Answer를 따른다. `## Answer`에는 07처럼 확인 필요·이미지·고친 오탈자 표 셋을 둔다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.
