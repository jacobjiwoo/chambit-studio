# 03: 확인 필요 목록 자동 수집

Type: task
Status: claimed
Blocked by: 01

## 무엇을 하나

장비 목록표 끝의 손으로 쓴 "확인 필요 목록"을 01 데이터의 `toConfirm`에서 모은 목록으로 바꾼다. 결정과 이유는 [map](../map.md) Decisions에 있다.

1. 장비·연결의 `toConfirm`을 모아 파트별로 묶는 순수 함수를 `_lib`에 두고 테스트한다.
2. 손 목록에 있던 우선순위(1–15)와 "(보류)" 표시를 잃지 않는다. 01이 남긴 대응표를 보고, 우선순위를 데이터에 둘지(예: `toConfirm` 항목에 `priority`) 정해 Answer에 적는다.
3. 각 항목에서 그 장비의 표 행으로 가는 링크를 단다. 02가 먼저 끝났으면 신호 흐름도에서 그 장비를 고른 상태로 여는 링크도 단다.

## 건드리지 않는 것

장비 목록표에서는 "확인 필요 목록" 절만 바꾼다.

## 끝난 조건

- 바뀐 목록이 손 목록 15항목을 모두 담는지 사람이 확인한다.
- `pnpm lint && pnpm typecheck && pnpm test`, `pnpm build`가 통과한다.

## Answer

모으는 함수는 `app/docs/broadcast-system/_lib/to-confirm.ts`의 `collectToConfirm`, 테스트는 옆의 `to-confirm.test.ts`다. 절은 `_components/to-confirm-list.tsx`의 `<ToConfirmList />`가 그린다. 장비 목록표의 각 행에는 `장비-<id>`(공백은 `-`) 앵커가 생겼다(`equipmentRowId`).

**우선순위는 데이터에 둔다.**

- `system.ts`에 `priorities` 표(1–15)를 두었다. 번호마다 `title`(손 목록의 머리말), `note`(어느 `toConfirm`에도 담기지 않은 손 목록의 말 — 확인 방법, 가능성, 장비 행이 없는 음향 앰프), `deferred`(보류)가 있다.
- 장비 `toConfirm` 항목에 `priority?`를 더했다. 연결은 `toConfirm`이 모두 하나뿐이라 연결에 `priority?`를 두었다. 연결의 `toConfirm`을 `string[]`에서 객체로 바꾸지 않은 것은 02가 같은 필드를 쓰기 때문이다. 한 연결에 우선순위가 다른 거리가 생기면 항목마다 두도록 바꾼다.
- 한 `toConfirm`은 번호 하나만 갖는다. 01 대응표에서 두 번호에 걸리던 백업 녹화기 용도 "실제 운영 방식"은 4번(동작)에 두었다.
- 손 목록에 없던 거리는 번호가 없고 파트 안에서 번호 있는 것 뒤에 온다.
- `to-confirm.test.ts`가 지키는 것: 모든 `toConfirm`이 목록에 빠짐없이 들어가는지, 쓰이는 번호가 정확히 1–15이고 `priorities` 표와 같은지(풀린 번호를 표에 남기면 멈춘다), 보류가 14·15뿐인지.

**01 대응표의 빈 곳을 채우려 더한 `toConfirm`** (모두 손 목록의 말을 옮겼다. 장비 목록표에 배지가 새로 보인다)

| # | 더한 것 |
| - | - |
| 3 | 연결 오디오 임베더 → 백업 송출 장비, 백업 송출 장비 → 백업 녹화기에 "실물 연결(직렬 구조)". `unconfirmed`는 01 Comments 5번대로 false로 두었다 |
| 9 | 송출 PC / notes "OBS 비디오 설정(FPS, 해상도)과 소스 디인터레이스 설정", '프로필 이름 "백업"의 의미'. "송출 PC OBS 설정" 표의 배지와 겹친다 |
| 11 | 영상 전원 시퀀서 / notes "켜는 순서". 음향 앰프 전원 위치는 장비 행이 없어 `priorities[11].note`에만 있다 |
| 14 | LED 프로세서, TV 채널 변환기 / notes "뒷면 연결" |

8번의 "중간 변환기 가능성", 3·6번의 확인 방법은 `note`에 있다.

## Comments

**사람이 손 목록과 대조하는 법** — `pnpm build` 뒤 `out/docs/broadcast-system/equipment.html`의 "확인 필요 목록"을 연다. 옛 15항목은 `git show feat/broadcast-system-visuals:app/docs/broadcast-system/equipment/page.mdx`의 끝에 있다.

1. "우선순위" 번호 목록이 1–15이고, 14·15에 "(보류)"가 붙었는지 본다. 머리말과 덧붙인 말이 옛 항목의 말과 같은 뜻인지 본다.
2. 옛 항목마다 그 번호 표가 붙은 줄을 파트 목록에서 찾아, 옛 항목의 세부(예: 11번의 전압조정기·시퀀서 순서·시퀀서 채널·임베더 어댑터)가 줄 또는 덧붙인 말로 모두 있는지 본다. Answer의 01 대응표·더한 것 표가 짝을 적어 둔다.
3. 장비 이름 링크를 몇 개 눌러 그 행으로 가고 행이 노랗게 칠해지는지 본다.
4. 송출 PC, 영상 전원 시퀀서, LED 프로세서, TV 채널 변환기 비고 칸과 직렬 구조 연결 두 줄에 배지가 새로 생긴 것은 의도한 차이다.

02(신호 흐름도)가 아직 끝나지 않아 신호 흐름도로 가는 링크는 달지 않았다.
