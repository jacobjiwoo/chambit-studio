# cg/editing 변환 4 (3.7–3.8)

Type: task
Status: resolved
Blocked by: 05, 06, 07, 12

## Question

Chapter 2 `3.7. 도구`–`3.8. 창`(PDF 89–100)을 `/docs/nabi/cg/editing` 페이지 뒤에 이어 쓴다.

변환 규칙은 [map.md](../map.md)의 Notes, [03 페이지 목록과 slug](03-page-list-and-slugs.md)와 [07 setup 변환](07-setup-conversion.md)의 Answer를 따른다. `## Answer`에는 07처럼 확인 필요·이미지·고친 오탈자 표 셋을 둔다. 표지·목차·쪽 위치는 [pdf-survey.md](../research/pdf-survey.md)에 있다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과하고, 개발 서버에서 페이지가 렌더되고 사이드바에 나와야 끝난다.

## Answer

### 한 일

- `app/docs/nabi/cg/editing/page.mdx` 뒤에 `3.7. 도구`–`3.8. 창`(PDF 89–100)을 이어 써서 `3. 편집` 페이지를 끝냈다. PDF 89 위쪽의 3.6.13 그림과 3.6.14는 [12](12-cg-editing-3-conversion.md)가 옮겼다.
- 개발 서버에서 페이지가 렌더되고(H2 8개, H3 61개, 표 6개, 이미지 자리표시자 157개가 `001`–`157` 순서대로) 사이드바에 `편집`이 나오는 것을 봤다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다. 원문 추출본과 MDX를 글자 단위로 비교해, 차이가 아래 오탈자 둘과 글머리표, `\*` 이스케이프뿐인 것을 확인했다.
- PDF 90의 `•` 글머리표도 `.`·`·`·`-`처럼 마크다운 목록 `- `로 옮겼다.
- PDF 97의 두 줄로 끊긴 제목(3.7.6.3.13)은 한 줄로 잇는다.
- PDF 100의 굵은 밑줄 `도킹 가이드 마커`는 굵은 글씨로만 옮겼다. 마크다운에 밑줄이 없고 04가 정한 Callout 대상(빨간 밑줄 경고)도 아니다.
- PDF 90의 Prompter 그림(`pdfimages` 180)에는 마스크 객체(181)가 딸려 있다. 자리표시자는 하나다.

### 확인 필요

| 페이지 | PDF | 내용 |
| - | - | - |
| `editing` 3.7.1 | 90 | ①과 ③의 `Data & Time`이 ②와 Schedule Item 창의 `Date & Time`과 다르다. 두 번 똑같이 나와 원문대로 뒀다 |
| `editing` 3.7.6.3.12 | 97 | 제목 `Use Alternate fonts when is no font`에 General 탭 옵션 이름(`… when there is no font`)의 `there`가 빠져 있다. 낱말을 더하는 일이라 원문대로 뒀다 |

### 이미지

모두 `public/docs/nabi/images/` 아래다. `pdfimages` 번호는 10과 같은 `pdfimages -list -f 49 -l 100`의 `num` 열이다. 쪽마다 맨 앞의 503×93 머리글 로고는 뺐다.

| 파일 | PDF | `pdfimages` 번호 | 무엇 |
| - | - | - | - |
| `cg-editing-137.png` | 89 | 177 | 스케줄 송출 아이콘(제목 안) |
| `cg-editing-138.png` | 89 | 178 | Schedule Item 창 |
| `cg-editing-139.png` | 90 | 180 | 2번 모니터의 Prompter 화면과 Prompter 설정 창(마스크 181이 딸림) |
| `cg-editing-140.png` | 91 | 183 | Prompter 설정 창 |
| `cg-editing-141.png` | 91 | 184 | Decklink Capture 창 |
| `cg-editing-142.png` | 92 | 186 | Options 창의 Editor 탭 |
| `cg-editing-143.png` | 93 | 188 | Safe Area, Horizontal Center, Vertical Center, SD Area 안내기준선 |
| `cg-editing-144.png` | 93 | 189 | 격자점 |
| `cg-editing-145.png` | 93 | 190 | Background Pattern 6가지 |
| `cg-editing-146.png` | 94 | 192 | Options 창의 General 탭 |
| `cg-editing-147.png` | 95 | 194 | Word Wrap을 끈 텍스트 |
| `cg-editing-148.png` | 95 | 195 | Word Wrap을 켠 텍스트 |
| `cg-editing-149.png` | 96 | 197 | Folder List와 Style Catalog |
| `cg-editing-150.png` | 96 | 198 | URL 아이콘(제목 안) |
| `cg-editing-151.png` | 96 | 199 | Display layer TopDown 체크와 해제에 따른 Timeline 레이어 순서 |
| `cg-editing-152.png` | 97 | 201 | 작업창 뷰가 셋으로 나누어진 Multi View |
| `cg-editing-153.png` | 97 | 202 | Options 창의 Playback 탭 |
| `cg-editing-154.png` | 98 | 204 | PowerPoint 슬라이드 쇼 리본의 프레젠테이션에 사용할 모니터 |
| `cg-editing-155.png` | 99 | 206 | 창 메뉴 |
| `cg-editing-156.png` | 99 | 207 | Custom Layout 메뉴 |
| `cg-editing-157.png` | 100 | 209 | 도킹 가이드 마커와 하늘색으로 표시된 이동할 위치 |

### 고친 오탈자

| 페이지 | PDF | 원문 | 고친 것 |
| - | - | - | - |
| `editing` 3.7.6.3.3 | 94 | `Scheduler Alter` | `Scheduler Alert`(General 탭 스크린샷 글자와 3.7.1의 `Schedule Alert`) |
| `editing` 3.7.6.3.13 | 97 | `when creading TAD` | `when creating TAD`(General 탭 스크린샷 글자) |
