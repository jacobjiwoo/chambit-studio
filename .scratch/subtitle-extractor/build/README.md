# 구현 티켓 — 설교 자막 추출기

[`../spec.md`](../spec.md)를 tracer bullet 9개로 쪼갠 것이다. 결정 티켓(웨이파인딩)은
[`../issues/`](../issues/)에 있고 여기 있는 것은 **구현** 티켓이다.

의존 순서대로 번호가 붙어 있다. 어느 시점이든 **blocker가 전부 끝난 티켓**(frontier)을 잡는다.

```
01 이식·삭제·git init        ← 안전장치. 무조건 먼저
      │
02 Vitest + 규칙 층
      │
03 파서 + 바이트 대조
      │
04 올린다 → 받는다           ← 여기서 실전 투입 가능
      ├── 05 원고 패널 2단 ── 06 칩 한 줄 + 원고 표기
      ├── 07 미리보기 모달
      ├── 08 잘 안 되는 날
      └── 09 배포
```

| # | 티켓 | Blocked by | Status |
|---|---|---|---|
| 01 | [프로토타입 이식 · 삭제 · 정적 export · `git init`](01-prototype-port-and-git-init.md) | — | **resolved** |
| 02 | [Vitest + 규칙 층](02-rules-layer.md) | 01 | **resolved** |
| 03 | [파서 층 + 전 파이프라인 바이트 대조](03-parser-and-corpus.md) | 02 | **resolved** |
| 04 | [올린다 → 받는다](04-drop-to-download.md) | 03 | **resolved** |
| 05 | [원고 패널 2단 + 상호 하이라이트](05-script-pane.md) | 04 | **resolved** |
| 06 | [노출 의무: 칩 한 줄 + 원고 표기 3종](06-exposure-chips.md) | 05 | **resolved** |
| 07 | [미리보기 모달](07-preview-modal.md) | 04 | **resolved** |
| 08 | [잘 안 되는 날](08-failure-states.md) | 04 | **resolved** |
| 09 | [배포](09-deploy.md) | 04 | **resolved** |

**티켓 9개 전부 resolved.** 도구가 `chambitstudio.com`에서 돌고 있고 방송실 PC에서 실제 원고로
올린다 → 받는다가 확인됐다. 여기서부터 나오는 것은 실전 운용이 알려 주는 것들이며, 이 목록에
미리 적어 둘 수 있는 것이 아니다.
