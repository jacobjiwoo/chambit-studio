# 곡 목록 JSON을 만드는 것

`public/praise-ppt/songs.json`이 어디서 왔는지가 파일 자체에는 안 적혀 있다. 여기 적혀 있다.

```
build-songs.py   원격 D1 export(SQL) → ../../../public/praise-ppt/songs.json
```

## 쓰는 법

1. praise-ppt 저장소에서 원격 D1을 SQL로 뜬다. `--remote`다 — `--local`은 개발용 빈 DB다.

   ```bash
   npx wrangler d1 export praise-ppt-database --remote --output <chambit-studio>/fixtures/praise-ppt/d1-export-<YYYY-MM-DD>.sql
   ```

   `fixtures/`는 gitignore돼 있다. export는 커밋하지 않는다.

2. 이 폴더에서 스크립트를 돌린다.

   ```bash
   python3 build-songs.py <chambit-studio>/fixtures/praise-ppt/d1-export-<YYYY-MM-DD>.sql
   ```

   곡 수, 걸러 낸 수, 크기, gzip 크기를 출력한다. 같은 export로 다시 돌리면 같은 바이트가 나온다.

## 하는 일

- export를 메모리 SQLite에 실행해 `posts`와 `slide_images`를 읽는다.
- 슬라이드가 0장인 곡은 걸러 낸다. 곡 목록의 모든 곡은 `slideCount ≥ 1`이다.
- 곡마다 `image_path`가 `images/{id}/{n}.png`이고 `n`이 0부터 빈틈없는지 검사한다. 화면이 이 규칙으로
  주소를 다시 만들기 때문이다. 어긋나는 곡이나 곡 없는 슬라이드가 하나라도 있으면 아무것도 쓰지 않고 실패한다.
- `[{ "id", "title", "slideCount" }]`만 id 순으로 쓴다. 검색이 원본 SQL처럼 이 순서로 앞의 50곡을 낸다.
