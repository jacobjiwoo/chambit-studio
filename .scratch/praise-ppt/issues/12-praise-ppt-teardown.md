# 12: praise-ppt 배포 내리기

Status: ready-for-human
Blocked by: 11

## 무엇을 하나

chambit의 찬양 PPT를 실제로 써 본 뒤 옛 praise-ppt 배포를 내린다([map](../map.md) Decisions). Worker·D1·KV를 지우고 **R2는 남긴다** — chambit이 R2 커스텀 도메인에서 슬라이드 이미지를 받는다.

사람이 Cloudflare 대시보드에서 한다. 지우는 일은 되돌릴 수 없다.

## 완료 조건

- [ ] [11](11-end-to-end-check.md) 뒤로 chambit에서 실제 예배 준비에 한 번 이상 썼다
- [ ] [01](01-d1-snapshot-export.md)의 D1 export가 남아 있는지 다시 확인했다
- [ ] praise-ppt Worker, D1, KV를 지웠다
- [ ] R2 버킷 `praise-ppt-storage`와 커스텀 도메인이 남아 있고, chambit의 썸네일과 만들기가 여전히 된다
- [ ] 지운 날짜를 `## Comments`에 적었다
