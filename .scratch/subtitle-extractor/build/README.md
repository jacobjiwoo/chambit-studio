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
| 02 | [Vitest + 규칙 층](02-rules-layer.md) | 01 | ready-for-agent |
| 03 | [파서 층 + 전 파이프라인 바이트 대조](03-parser-and-corpus.md) | 02 | ready-for-agent |
| 04 | [올린다 → 받는다](04-drop-to-download.md) | 03 | ready-for-agent |
| 05 | [원고 패널 2단 + 상호 하이라이트](05-script-pane.md) | 04 | ready-for-agent |
| 06 | [노출 의무: 칩 한 줄 + 원고 표기 3종](06-exposure-chips.md) | 05 | ready-for-agent |
| 07 | [미리보기 모달](07-preview-modal.md) | 04 | ready-for-agent |
| 08 | [잘 안 되는 날](08-failure-states.md) | 04 | ready-for-agent |
| 09 | [배포](09-deploy.md) | 04 | ready-for-human |
