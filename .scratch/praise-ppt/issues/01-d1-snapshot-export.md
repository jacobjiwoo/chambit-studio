# 01: 원격 D1 스냅샷 export

Status: resolved
Blocked by: 없음 — 바로 시작할 수 있다

## 무엇을 하나

praise-ppt의 원격 D1에서 마지막 스냅샷을 떠서 파일로 넘긴다. [04](04-song-list-json.md)가 이 파일로 **곡 목록** JSON을 만든다. D1을 지우기([12](12-praise-ppt-teardown.md)) 전에 해야 한다.

사람이 한다. 자격증명이 public 저장소에 들어오지 않게 하려는 것이다([spec](../spec.md) 67).

## 완료 조건

- [x] 대시보드나 `wrangler d1 export`로 원격 D1(로컬 아님)을 SQL 또는 JSON으로 떴다
- [x] 곡마다 id·제목·슬라이드 경로(또는 장수)를 알 수 있는 테이블이 들어 있다
- [x] 파일을 저장소 밖이나 gitignore된 `fixtures/`에 두고, 경로를 이 파일의 `## Comments`에 적었다
- [x] 뜬 날짜를 `## Comments`에 적었다 — 곡 목록이 얼린 시점이다

## Comments

- 2026-11-03에 `npx wrangler d1 export praise-ppt-database --remote`로 원격 D1을 SQL로 떴다. 곡 목록은 이 날짜로 얼린다.
- 사용자가 에이전트에게 맡겼다. 사용자가 `wrangler login`을 하고 에이전트가 export만 실행했다. 쓰기·삭제 명령은 실행하지 않았고 자격증명은 어디에도 적지 않았다.
- 파일: 메인 체크아웃의 `fixtures/praise-ppt/d1-export-2026-11-03.sql`(18,143,780 B, gitignore). `posts` 7,343행, `slide_images`, `attachment_files`가 들어 있다.
