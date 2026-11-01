# 02: R2 커스텀 도메인과 CORS 붙이기

Status: ready-for-human
Blocked by: 없음 — 바로 시작할 수 있다

## 무엇을 하나

R2 버킷 `praise-ppt-storage`를 `praise-ppt-images.chambitstudio.com`으로 열고, 브라우저가 슬라이드 이미지를 `fetch`할 수 있게 CORS를 연다. 이것이 없으면 썸네일은 보여도(`<img>`는 CORS가 필요 없다) 곡 목록 곡으로 `.pptx` 만들기([10](10-pptx-generation.md))가 실패한다.

사람이 Cloudflare 대시보드에서 한다.

## 완료 조건

- [ ] `chambitstudio.com` 존과 R2 버킷이 같은 Cloudflare 계정에 있는지 확인했다. 다르면 `## Comments`에 적고 멈춘다
- [ ] 버킷에 커스텀 도메인 `praise-ppt-images.chambitstudio.com`을 붙였다(한 단계 서브도메인이라 무료 Universal SSL이 덮는다). `r2.dev`는 쓰지 않는다
- [ ] CORS가 chambit 배포 도메인과 `http://localhost:3000`의 `GET`만 연다
- [ ] `https://praise-ppt-images.chambitstudio.com/images/{id}/0.png`를 브라우저에서 열면 이미지가 나온다
- [ ] localhost 페이지의 개발자 도구에서 `fetch`로 같은 주소를 받으면 CORS 오류 없이 받힌다
