# 01: 원격 D1 스냅샷 export

Status: ready-for-human
Blocked by: 없음 — 바로 시작할 수 있다

## 무엇을 하나

praise-ppt의 원격 D1에서 마지막 스냅샷을 떠서 파일로 넘긴다. [04](04-song-list-json.md)가 이 파일로 **곡 목록** JSON을 만든다. D1을 지우기([12](12-praise-ppt-teardown.md)) 전에 해야 한다.

사람이 한다. 자격증명이 public 저장소에 들어오지 않게 하려는 것이다([spec](../spec.md) 67).

## 완료 조건

- [ ] 대시보드나 `wrangler d1 export`로 원격 D1(로컬 아님)을 SQL 또는 JSON으로 떴다
- [ ] 곡마다 id·제목·슬라이드 경로(또는 장수)를 알 수 있는 테이블이 들어 있다
- [ ] 파일을 저장소 밖이나 gitignore된 `fixtures/`에 두고, 경로를 이 파일의 `## Comments`에 적었다
- [ ] 뜬 날짜를 `## Comments`에 적었다 — 곡 목록이 얼린 시점이다
