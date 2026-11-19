/**
 * 생김새 그림이 있는 장비 id. 버튼(클라이언트)이 그림 모듈을 끌어오지 않고 그림이 있는지만 알도록
 * 따로 둔다. 그림을 더하면 여기에도 더한다. 그림 하나를 여러 장비가 같이 쓰면(`sharedWith`) 그 장비들도
 * 모두 적는다. `device-figures.test.ts`가 둘이 같은지 본다.
 */
export const DEVICE_FIGURE_IDS: readonly string[] = ["영상 스위처", "PTZ 컨트롤러", "백업 송출 장비", "오디오 임베더", "오디오 분배기", "무선 마이크 수신기 1~4", "무선 마이크 수신기 5~6"];

/** "생김새 보기" 버튼이 dialog를 여는 이벤트. `detail`이 장비 id다 */
export const OPEN_DEVICE_FIGURE = "device-figure:open";
