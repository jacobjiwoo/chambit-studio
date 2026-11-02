# 04: 곡 목록 JSON 만들기

Status: resolved
Blocked by: 01

## 무엇을 만드나

[01](01-d1-snapshot-export.md)에서 뜬 D1 export를 읽어 **곡 목록** JSON을 쓰는 일회성 스크립트를 만들고, 그 결과를 정적 파일로 커밋한다. 스냅샷을 다시 떠야 할 때 같은 스크립트로 다시 만든다(spec 68).

세부는 [spec](../spec.md)의 "곡 목록 JSON"과 "데이터 모델"에 있다.

- 스크립트는 앱 코드가 아니다. 새벽기도 PPT의 선례(`.scratch/dawn-prayer-ppt/tools/`)처럼 `.scratch/praise-ppt/tools/`에 두고, 쓰는 법을 같은 폴더 `README.md`에 적는다.
- 입력은 export 파일 경로다. 자격증명은 스크립트에 넣지 않는다.
- 출력 경로는 `public/praise-ppt/songs.json`(`/praise-ppt/songs.json`으로 열린다), 모양은 `[{ "id": number, "title": string, "slideCount": number }]`이다. [03](03-foundation.md)의 불러오기가 이 경로와 모양을 쓴다.
- `data/posts.json`(4월 스냅샷)은 쓰지 않는다.

라우트 코드는 건드리지 않는다. 03과 동시에 돌아도 겹치는 파일이 없다.

## 완료 조건

- [x] 스크립트가 export를 읽어 JSON을 쓴다. 다시 돌리면 같은 결과가 나온다
- [x] 슬라이드 0장인 곡을 걸러 낸다. 모든 곡이 `slideCount ≥ 1`이다. 걸러 낸 수를 출력한다(실측 기준 72개)
- [x] 모든 곡의 슬라이드 경로가 `images/{id}/{n}.png`, `n`이 0부터 빈틈없는지 검사하고, 어긋나는 곡이 있으면 실패한다
- [x] id·제목·장수 말고는 담지 않는다. gzip 크기를 출력한다(실측 기준 약 219 KB)
- [x] 곡 수와 걸러 낸 수, gzip 크기를 이 파일 `## Comments`에 적는다

## Comments

- 스크립트는 `.scratch/praise-ppt/tools/build-songs.py`, 쓰는 법은 같은 폴더 `README.md`다. export SQL을 메모리 SQLite에 실행해 읽는다.
- 입력: [01](01-d1-snapshot-export.md)의 `d1-export-2026-11-03.sql`.
- 결과: 곡 7,271 | 걸러 낸 곡(슬라이드 0장) 72 | 978,661 B | gzip 224,158 B(약 219 KiB). 주소 규칙에 어긋나는 곡 0. 두 번 돌려 같은 바이트(SHA-1 `ad24917`)인 것을 확인했다.
- 빌드 결과(`out/`)를 정적 서버로 열어 `/tools/praise-ppt`가 `songs.json`을 불러오고 검색하는 것을 확인했다. "은혜"는 50곡(상한), "amaging"은 "(Amaging Grace)"를 대소문자 무시로 찾는다. 원본 제목의 오타(Amazing → Amaging)는 그대로 둔다.
