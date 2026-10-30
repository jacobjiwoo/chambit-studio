# cg/playout 변환

Type: task
Status: resolved
Blocked by: 05, 06, 07

## Question

Chapter 2 `6. 송출`(PDF 132–135)을 `/docs/nabi/cg/playout`으로 옮긴다.

변환 규칙은 [map.md](../map.md)의 Notes, [03 페이지 목록과 slug](03-page-list-and-slugs.md)와 [07 setup 변환](07-setup-conversion.md)의 Answer를 따른다. `## Answer`에는 07처럼 확인 필요·이미지·고친 오탈자 표 셋을 둔다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.

## Answer

### 한 일

- 절 페이지 `cg/playout`(`app/docs/nabi/cg/playout/page.mdx`)을 만들었다. 07의 "정한 변환 방식"을 따른다.
- 개발 서버에서 페이지가 렌더되고 사이드바 NABI-CG 아래에 `송출`이 나오는 것을 봤다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다. 원문 추출본과 MDX를 공백·서식 기호를 빼고 글자 단위로 비교해, 차이가 아래 오탈자 하나뿐인 것을 확인했다.
- 07에 없던 경우를 이렇게 옮겼다.
  - `㉠.`–`㉧.` 항목은 글머리표가 아니라 번호 글자라 목록으로 바꾸지 않고, 한 문단 안에 줄 끝 `\`로 잇는다. `㉧. Mark` 아래 `- ` 항목만 목록이다.
  - 원문이 굵게 쓴 항목 이름(`In`, `Top / Bottom`, `Mark 지정` 등)은 굵게 둔다. 6.5의 `①.`·`②.`는 원문이 굵지 않아 굵게 하지 않는다.
  - `*.nbi`의 `*`은 `\*`로 이스케이프한다. `▶`, `■`, `▲▼`는 원문이 글자로 쓴 것이라 글자로 둔다.
  - PDF 132–135쪽마다 있는 `NABI-CG` 머리글 이미지(`pdfimages` 5, 8, 12, 20)는 머리글이라 옮기지 않는다.

### 확인 필요

없다.

### 이미지

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 `pdfimages -list -f 131 -l 136`의 `num` 열이다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-playout-01.png` | 132 | 6 | Playback 송출 제어 창 |
| `cg-playout-02.png` | 132 | 7 | Run Setting 창 |
| `cg-playout-03.png` | 133 | 9 | Stamp Playback 창 |
| `cg-playout-04.png` | 133 | 10 | Pause 아이콘(인라인) |
| `cg-playout-05.png` | 133 | 11 | Refresh 아이콘(인라인) |
| `cg-playout-06.png` | 134 | 13 | Global Animation Playback 창 |
| `cg-playout-07.png` | 134 | 14 | 파일설정 `...` 버튼(인라인) |
| `cg-playout-08.png` | 134 | 15 | Seek 버튼(인라인) |
| `cg-playout-09.png` | 134 | 16 | OnAir 버튼(인라인) |
| `cg-playout-10.png` | 134 | 17 | Pause 아이콘(인라인. 04와 같은 그림) |
| `cg-playout-11.png` | 134 | 18 | Rewind 아이콘(인라인) |
| `cg-playout-12.png` | 134 | 19 | 위아래 화살표 포인터(인라인) |
| `cg-playout-13.png` | 135 | 21 | Mark 구간의 Start Time, End Time, Duration |
| `cg-playout-14.png` | 135 | 22 | Take In, Take Out 아이콘 두 개가 한 객체(인라인) |
| `cg-playout-15.png` | 135 | 23 | Preview In, Preview Out 아이콘 두 개가 한 객체(인라인) |

### 고친 오탈자

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `playout` 6.4 | 134 | `OnAir중이였다면` | `OnAir중이었다면` |
