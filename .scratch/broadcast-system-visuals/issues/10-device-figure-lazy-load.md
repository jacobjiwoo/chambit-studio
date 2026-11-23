# 10: 장비 그림을 dialog를 열 때 받는다

Type: task
Status: resolved
Blocked by: 06

## 무엇을 하나

지금은 장비 그림 SVG가 장비 목록표와 신호 흐름도 페이지에 모두 실린다. HTML과 RSC payload에 한 번씩 실려 세 장비에 장비 목록표가 gzip 323KB다. 장비를 열두 개쯤 더하면 gzip 1MB 안팎이 된다. 그림은 빌드할 때 장비마다 정적 파일로 만들어 두고, dialog가 그 장비를 열 때 받게 한다.

## 끝난 조건

- 페이지에는 장비 이름, 캡션, 이름 목록, 꽂힌 상대만 싣고 그림 SVG는 싣지 않는다.
- 그림 파일은 `output: "export"`로 빌드할 때 만들어진다. 서버는 여전히 없다.
- dialog를 열면 이름 목록이 바로 보이고, 그림은 받는 동안 받는 중이라고 보인다. 받지 못하면 그렇다고 보인다. 한 번 받은 그림은 다시 받지 않는다.
- 장비 목록표 페이지 크기가 장비 수와 거의 상관없어진다.

## 건드리지 않는 것

- 그림 모듈(`_lib/*-figure.ts`)의 그림과 그리는 순서 저장. `slug` 한 줄만 더한다.

## Answer

- **그림 파일.** `app/docs/broadcast-system/device-figures/[file]/route.ts`가 빌드 때 장비마다 `device-figures/<slug>.json`을 만든다. 시점 이름 → SVG 본문이다. `GET`만 있고 `dynamicParams = false`라 `output: "export"`에서 정적 파일이 된다([Static Exports › Route Handlers](https://nextjs.org/docs/app/guides/static-exports#route-handlers)). 서버는 여전히 없다.
- **`slug`.** `DeviceFigure`에 `slug`를 더했다. 모듈 이름 `<slug>-figure.ts`와 같고, 테스트가 겹치지 않는지와 그 모듈이 있는지 본다. 새 장비 그림을 더할 때 채운다. 이름과 주소는 `_lib/device-figure-files.ts` 한 곳에서 만든다.
- **dialog.** 페이지에는 장비 이름, 캡션, 시점 크기, 이름 목록, 꽂힌 상대만 싣는다. 장비를 처음 열 때 그 장비의 파일을 받고, 받는 동안 "그림을 받는 중이다"를 보인다. 이름 목록은 바로 보인다. 못 받으면 그렇다고 보이고, 다음에 열 때 다시 받는다. 받은 파일은 다시 받지 않는다.
- **크기.** 장비 목록표 페이지 HTML이 gzip 323KB → 114KB, 신호 흐름도는 223KB → 16KB다. 그림 파일은 gzip으로 AV-HS410 139KB, RC-IP100 43KB, HELO Plus 21KB다. 장비가 늘어도 페이지는 이름 목록만큼만 커진다.
- **검증.** `pnpm lint && pnpm typecheck && pnpm test`, `next build` 통과. 빌드 결과를 로컬 정적 서버로 띄워 두 페이지에서 세 장비를 열었다. 처음 열 때만 파일을 받고, 앞·뒤 넘기기와 자리 켜기가 전처럼 된다. `fetch`를 막아 실패 문구와 다시 받기를 확인했다. 그림 SVG는 고치지 않았다.
