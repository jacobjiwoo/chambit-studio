# 02: R2 커스텀 도메인과 CORS 붙이기

Status: resolved
Blocked by: 없음 — 바로 시작할 수 있다

## 무엇을 하나

R2 버킷 `praise-ppt-storage`를 `praise-ppt-images.chambitstudio.com`으로 열고, 브라우저가 슬라이드 이미지를 `fetch`할 수 있게 CORS를 연다. 이것이 없으면 썸네일은 보여도(`<img>`는 CORS가 필요 없다) 곡 목록 곡으로 `.pptx` 만들기([10](10-pptx-generation.md))가 실패한다.

사람이 Cloudflare 대시보드에서 한다.

## 완료 조건

- [x] `chambitstudio.com` 존과 R2 버킷이 같은 Cloudflare 계정에 있는지 확인했다. 다르면 `## Comments`에 적고 멈춘다
- [x] 버킷에 커스텀 도메인 `praise-ppt-images.chambitstudio.com`을 붙였다(한 단계 서브도메인이라 무료 Universal SSL이 덮는다). `r2.dev`는 쓰지 않는다
- [x] CORS가 chambit 배포 도메인과 `http://localhost:3000`의 `GET`만 연다
- [x] `https://praise-ppt-images.chambitstudio.com/images/{id}/0.png`를 브라우저에서 열면 이미지가 나온다
- [x] localhost 페이지의 개발자 도구에서 `fetch`로 같은 주소를 받으면 CORS 오류 없이 받힌다

## Comments

### 완료 (2026-11-03)

사람이 Cloudflare 대시보드에서 커스텀 도메인과 CORS를 붙였다. 최소 TLS 버전은 1.2로 골랐다. 확인은 `curl`로 했다.

- `https://praise-ppt-images.chambitstudio.com/images/1/0.png` → `200 image/png`
- `Origin: http://localhost:3000` → `access-control-allow-origin: http://localhost:3000`
- `Origin: https://chambitstudio.com` → `access-control-allow-origin: https://chambitstudio.com`
- 허용하지 않은 origin에는 `access-control-allow-origin`이 오지 않는다
- `_lib/song.ts`의 `IMAGE_ORIGIN`이 이 도메인과 같다
- `curl --tls-max 1.1`도 200을 받았다. macOS curl이 상한을 무시했을 수 있어 최소 TLS 설정이 적용됐는지는 대시보드에서 다시 본다
