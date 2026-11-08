/**
 * 방송실 장비·연결 데이터. 장비 목록표, 신호 흐름도, 확인 필요 목록의 유일한 원천이다.
 *
 * 장비가 늘거나 미확인이 풀리면 이 파일만 고친다. 결정과 이유는
 * `.scratch/broadcast-system-visuals/map.md`에 있다.
 *
 * - 장비 `id`는 용어집 페이지의 이름이다. 다른 이름을 쓰면 `system.test.ts`가 멈춘다.
 * - 아직 확인하지 않은 것은 문장 안에 섞지 않고 `toConfirm`에 따로 적는다. 장비 목록표가
 *   이것을 "확인 필요" 배지로 그리고, 확인 필요 목록도 여기서 모은다.
 * - "추정", "선임 설명", "사용자 확인"은 배지가 아니라 글자다. 연결은 `evidence`에,
 *   장비는 해당 칸 글에 그대로 둔다.
 * - 출발이나 도착을 모르는 연결은 끝점을 지어내지 않고 `unknown`으로 둔다.
 */

/** 장비 목록표의 H2 하나. 표 순서이기도 하다. */
export type Part = "전원" | "영상·온라인 송출" | "네트워크" | "음향" | "조명" | "기타";

/** 장비 목록표의 칸. `toConfirm` 항목이 어느 칸의 배지로 보일지 정한다. */
export type Cell = "model" | "location" | "purpose" | "connections" | "notes";

type PriorityDef = {
  /** 그 번호의 확인할 거리를 한데 부르는 이름. */
  readonly title: string;
  /** 어느 장비·연결의 `toConfirm`에도 담기지 않은 손 목록의 말. 확인 방법이나 가능성 등이다. */
  readonly note?: string;
  /** 손 목록의 "(보류)". */
  readonly deferred?: true;
};

/**
 * 확인 필요 목록의 우선순위. 장비 목록표 끝에 손으로 쓰던 목록(1–15)을 옮겼다. 숫자가 작을수록
 * 먼저 확인한다. 장비·연결의 `toConfirm`이 `priority`로 이 번호를 가리킨다.
 *
 * 한 번호의 확인할 거리가 모두 풀려 아무 `toConfirm`도 가리키지 않으면 여기서도 지운다.
 * 남겨 두면 `to-confirm.test.ts`가 멈춘다.
 */
export const priorities = {
  1: {
    title: "평소 녹화 방식",
    note: "홈페이지에 올리는 녹화본이 OBS 녹화 파일인지, 백업 녹화기 SD카드 파일인지",
  },
  2: { title: "영상 hub 사진" },
  3: {
    title: "직렬 구조 실물 확인",
    note: "백업 녹화기 앞 화면의 입력·오디오 레벨, 백업 송출 장비 웹 화면, 케이블 추적",
  },
  4: {
    title: "백업 녹화기 동작",
    note: "평소 녹화 상태로 두는지, 재생 상태가 되면 송출 PC로 재생 영상이 나가는지",
  },
  5: { title: "오디오 임베더 XLR 2개의 출발 장비" },
  6: { title: "영상 스위처 출력 설정", note: "스위처 메뉴의 출력 할당 화면으로 확인" },
  7: { title: "백업 송출 장비 HDMI IN 출발 장비, 입력 선택(SDI/HDMI)과 SDI OUT의 관계" },
  8: {
    title: "HDMI 입력 출발 장비",
    note: "영상 스위처는 HDMI 출력이 없어 중간 변환기 가능성",
  },
  9: { title: 'OBS 비디오 설정, 프로필 이름 "백업"의 의미' },
  10: { title: '오디오 분배기 출력2 "RF-" 용도' },
  // 음향 앰프는 장비 목록에 행이 없어 note에만 둔다.
  11: { title: "전원 계통", note: "음향 앰프 전원 위치" },
  12: { title: "무선 마이크 수신기 5~6 사용 여부" },
  13: { title: '스위처 버튼 "CP"의 뜻, CAM5·CAM6 위치' },
  14: { title: "영상 스위처 · 백업 녹화기 · LED 프로세서 · TV 채널 변환기 뒷면 연결", deferred: true },
  15: { title: "PTZ 컨트롤러 정확한 모델명", deferred: true },
} as const satisfies Record<number, PriorityDef>;

export type Priority = keyof typeof priorities;

/**
 * 장비의 확인할 거리 하나. `what`은 그 칸에서 배지와 함께 보이는 글이다. `priority`는
 * 확인 필요 목록의 우선순위이고, 없으면 목록 끝에 놓인다.
 */
export type EquipmentToConfirm = {
  readonly cell: Cell;
  readonly what: string;
  readonly priority?: Priority;
};

type EquipmentDef = {
  /** 용어집 이름. */
  readonly id: string;
  /** 이름 뒤 괄호에 붙는 말. 예: "원격 카메라", "가칭". */
  readonly aside?: string;
  readonly part: Part;
  /** 제조사·모델명. 모르면 빈 글이고 `toConfirm`에 적는다. */
  readonly model: string;
  readonly location: string;
  /** "기타" 파트는 용도 칸이 없다. */
  readonly purpose?: string;
  /** 연결 칸 첫머리에 보이는 단자 목록. 장비끼리의 연결은 `connections`에 둔다. */
  readonly ports?: readonly string[];
  readonly notes?: string;
  readonly toConfirm: readonly EquipmentToConfirm[];
};

const equipmentDefs = [
  // 전원
  {
    id: "전압조정기",
    part: "전원",
    model:
      "세계전원(WE) Sound Clinic AV100 (AVR 자동전압조정기 + Balanced Power Isolation Transformer)",
    location: "음향 데스크 오른쪽 (흰색 바퀴 캐비닛)",
    purpose: "들어오는 전압을 일정하게 유지하고, 절연 트랜스로 전기 잡음을 줄여 장비에 공급",
    notes:
      "켜는 순서 ①POWER 차단기 ②OUT ON(파란 버튼). 고장 시 입력 OFF 후 BY-PASS로 전환해 수동 사용 가능(본체 운전요령)",
    toConfirm: [],
  },
  {
    id: "음향 UPS",
    part: "전원",
    model: "APC Smart-UPS C1000 (1000VA / 600W)",
    location: "음향 콘솔 아래",
    purpose: "정전 시 배터리로 전원 유지",
    notes: "켜는 순서 ③. 위에 Furman 전원 장치 있음",
    toConfirm: [{ cell: "connections", what: "음향 콘솔 외 공급 장비", priority: 11 }],
  },
  {
    id: "음향 파워 컨디셔너",
    part: "전원",
    model: "Furman",
    location: "음향 UPS 위",
    purpose: "전원 분배·필터 추정",
    toConfirm: [
      { cell: "model", what: "모델" },
      { cell: "connections", what: "연결" },
    ],
  },
  {
    id: "영상 전원 시퀀서",
    part: "전원",
    model: "LEEM NS-8SW (NS-series Ver.3 Sequence Power Supply)",
    location: "영상 데스크 아래 오른쪽",
    purpose: "8개 채널 전원을 순서대로 켜고 끔",
    notes: "DIRECT OUT 최대 2500W. BYPASS 버튼 있음. 전압 표시창",
    toConfirm: [
      { cell: "connections", what: "채널별 할당, 그 외 연결 장비", priority: 11 },
      { cell: "notes", what: "켜는 순서", priority: 11 },
    ],
  },

  // 영상·온라인 송출
  {
    id: "영상 스위처",
    part: "영상·온라인 송출",
    model: "Panasonic AV-HS410 (연결 패널 표기: AV-HS410E)",
    location: "영상 데스크 오른쪽",
    purpose:
      "모든 영상 원본이 처음 들어오는 곳. 카메라·PC 화면 선택 및 전환. 여기서 고른 화면(PGM)에 CG가 합쳐져 LED 스크린·온라인 송출·녹화 등으로 나감. 예배 소리는 여기서 섞지 않음(소리는 오디오 임베더에서 합쳐짐)",
    ports: [
      '입력(SDI 8 + DVI 1): SDI IN1~4 = CAM1~4, SDI IN5 = CAM5(버튼 "CP"), SDI IN6 = CAM6(버튼 "강단"), SDI IN7 = CG KEY, SDI IN8 = CG FILL. 그 밖에 PC',
      "출력: SDI 5 + DVI 1, AUX1~4",
    ],
    notes: "CG 켜기/끄기는 DSK ON 버튼. 버튼 CP·강단 대응은 사용자 확인. SDI IN1~8 배치는 사용자 확인(2026-11-08).",
    toConfirm: [
      { cell: "purpose", what: "각 출력 할당", priority: 6 },
      { cell: "notes", what: '"CP" 뜻', priority: 13 },
      { cell: "notes", what: "AUX1 라벨" },
      { cell: "notes", what: "본체 위치·뒷면 연결", priority: 14 },
    ],
  },
  {
    id: "영상 hub",
    aside: "가칭",
    part: "영상·온라인 송출",
    model: "",
    location: "",
    purpose: "영상 스위처 출력을 나눠 보내는 장비로 추정",
    notes:
      '선임 설명은 "출력 2개 = 오디오 임베더, 멀티뷰". 확인할 거리: 멀티뷰는 분할 화면(영상 스위처 멀티뷰 전용 출력)을, 오디오 임베더는 PGM을 받으므로, 영상 hub가 일반 분배기라면 두 출력에는 같은 신호가 나간다. 정식 이름은 확인 후 결정',
    toConfirm: [
      { cell: "model", what: "제조사·모델", priority: 2 },
      { cell: "location", what: "위치", priority: 2 },
      { cell: "notes", what: "사진으로 모델·포트·연결", priority: 2 },
    ],
  },
  {
    id: "멀티뷰",
    part: "영상·온라인 송출",
    model: "",
    location: "영상 데스크 위 대형 TV",
    purpose:
      "PVW(다음에 내보낼 예비 화면)·PGM(실제 출력 화면)·전체 입력을 한 화면에 표시. 영상 스위처에서 나온 영상만 보여줌",
    notes:
      '표시 입력: CAM1~4, SDI IN5, SDI IN6, PC, CG_FILL. 사진 촬영 시 SDI IN5·6에 "!"(신호 없음) 표시. 전원: 영상 전원 시퀀서.',
    toConfirm: [
      { cell: "model", what: "제조사·모델" },
      { cell: "notes", what: "TV 입력 단자 종류(HDMI/SDI)" },
    ],
  },
  {
    id: "PTZ 컨트롤러",
    part: "영상·온라인 송출",
    model: "Sony (Remote Camera Controller RC-…)",
    location: "영상 데스크, 영상 스위처 왼쪽 위",
    purpose: "CAM1·CAM2 원격 조작",
    notes: "최근 교체. 상세 조사 보류",
    toConfirm: [{ cell: "model", what: "정확한 모델", priority: 15 }],
  },
  {
    id: "구형 카메라 컨트롤러",
    part: "영상·온라인 송출",
    model: "",
    location: "영상 데스크, 구리색 패널",
    purpose: "CAM3·CAM4 원격 조작",
    notes: "패널에 조이스틱 4개",
    toConfirm: [{ cell: "model", what: "제조사·모델" }],
  },
  {
    id: "CAM1·CAM2",
    aside: "원격 카메라",
    part: "영상·온라인 송출",
    model: "Sony PTZ 카메라 추정",
    location: "본당",
    purpose: "방송실 원격 촬영",
    notes: "최근 교체. 신형 IP 카메라(사용자 확인, 2026-11-08).",
    toConfirm: [
      { cell: "model", what: "모델" },
      { cell: "location", what: "위치" },
    ],
  },
  {
    id: "CAM3·CAM4",
    aside: "원격 카메라",
    part: "영상·온라인 송출",
    model: "(구형)",
    location: "본당",
    purpose: "방송실 원격 촬영",
    toConfirm: [
      { cell: "model", what: "제조사·모델" },
      { cell: "location", what: "위치" },
    ],
  },
  {
    id: "CAM5·CAM6",
    aside: "유인 카메라",
    part: "영상·온라인 송출",
    model: "",
    location: "본당",
    purpose: "사람이 직접 조작하는 촬영",
    notes: "버튼 대응은 사용자 확인.",
    toConfirm: [
      { cell: "model", what: "제조사·모델" },
      { cell: "notes", what: "카메라 위치", priority: 13 },
      {
        cell: "notes",
        what: '연결 패널의 "CH5 PATCH/외부기기", "AV-HS410E/강단" BNC가 이 입력과 관련 있는 것으로 보임',
      },
    ],
  },
  {
    id: "오디오 임베더",
    part: "영상·온라인 송출",
    model: "Blackmagic Mini Converter Audio to SDI",
    location: "영상 데스크 뒷면 케이블 사이",
    purpose:
      "영상 스위처 화면(SDI)에 음향 소리를 실어(embed) 영상+소리를 SDI 신호 하나로 만듦. 화면과 소리가 처음 합쳐지는 곳",
    notes:
      "사진 확인(2026-11-01): SDI IN·SDI OUT·CH1·CH2·전원 연결, ALT SDI IN 비어 있음, CH3·CH4 비어 있는 것으로 보임. 전원 +12V 어댑터. 상판 SDI LOCK 표시등 = 영상 입력 정상 여부. 꺼지면 주 송출·백업 송출·백업 녹화의 영상·소리가 모두 끊김",
    toConfirm: [
      { cell: "location", what: "정확한 위치" },
      { cell: "notes", what: "+12V 어댑터가 꽂힌 곳", priority: 11 },
    ],
  },
  {
    id: "송출 PC",
    part: "영상·온라인 송출",
    model: "",
    location: "영상 데스크 (송출 PC 모니터: 맨 왼쪽 작은 LG)",
    purpose:
      "주 송출(OBS) + 주 녹화(OBS). 일반 PC에 SDI 입력용 캡처카드를 꽂은 구성",
    notes:
      '아래 "송출 PC OBS 설정" 참고. OBS는 캡처카드 외의 소리 입력을 쓰지 않음. 인코딩에 NVIDIA GPU(NVENC) 사용',
    toConfirm: [
      { cell: "model", what: "PC 본체 사양" },
      { cell: "notes", what: "OBS 비디오 설정(FPS, 해상도)과 소스 디인터레이스 설정", priority: 9 },
      { cell: "notes", what: '프로필 이름 "백업"의 의미', priority: 9 },
    ],
  },
  {
    id: "송출 PC 캡처카드",
    part: "영상·온라인 송출",
    model: "Blackmagic DeckLink Mini Recorder 4K",
    location: "송출 PC 내부 (메인보드 PCIe 슬롯에 꽂는 확장 카드)",
    purpose: "SDI로 들어온 영상·소리를 OBS로 받음",
    notes:
      'OBS 소스 "Blackmagic 장치"에서 확인: 비디오 연결 SDI, 오디오 연결 Embedded(SDI 신호 안에 실린 소리), 2채널, 방식 Auto. "Recorder" = 입력 전용(SDI를 내보낼 수 없음). CG PC 문자발생기 보드와 같은 DeckLink 계열이지만 용도가 반대(출력용)',
    toConfirm: [],
  },
  {
    id: "CG PC",
    part: "영상·온라인 송출",
    model: "",
    location: "영상 데스크 (CG PC 모니터: 가운데 LG)",
    purpose: "CG 생성 및 CG 출력. Compix NABI-CG 사용",
    notes: '아래 "CG PC 문자발생기 보드" 참고',
    toConfirm: [{ cell: "model", what: "제조사·모델" }],
  },
  {
    id: "CG PC 문자발생기 보드",
    part: "영상·온라인 송출",
    model: "Blackmagic DeckLink 4K Extreme",
    location: "CG PC 내부",
    purpose: "NABI-CG의 CG를 방송 신호(HD-SDI)로 출력",
    notes:
      "Desktop Video Setup에서 모델 확인(2026-11-01). 출력 설정 SDI·HDMI·Component 모두 1080i59.94. 스위처에 CG FILL·CG KEY 버튼이 모두 있어 Fill+Key 방식으로 판단. 드라이버 Desktop Video. USB 동글 필수. Media Express 실행 시 보드를 점유해 CG 출력이 끊길 수 있으므로 예배 중 실행 금지",
    toConfirm: [],
  },
  {
    id: "NABI USB 동글",
    part: "영상·온라인 송출",
    model: "Compix (SafeNet HASP)",
    location: "CG PC에 꽂혀 있음",
    purpose: "NABI-CG 정품 인증",
    notes: "없거나 인식 안 되면 작업창에 빨간 십자선. 분실 시 재구매 비용 큼 → 관리 주의",
    toConfirm: [{ cell: "location", what: "위치" }],
  },
  {
    id: "백업 송출 장비",
    part: "영상·온라인 송출",
    model: "AJA HELO Plus",
    location: "영상 데스크 상판",
    purpose: "백업 송출 + 녹화. 주 송출 문제 시 대체",
    notes:
      "동시 2곳 송출 + SD/USB 녹화 가능. 전원: 영상 전원 시퀀서. 주 송출 경로 중간에 있음 → 꺼지거나 고장 나면 주 송출도 끊김(선임 설명 기준). 입력 상태의 비디오 소스 = SDI(사용자 확인, 2026-11-07).",
    toConfirm: [
      {
        cell: "notes",
        what: "입력 선택(SDI/HDMI)에 따라 SDI OUT 내용이 바뀌는지",
        priority: 7,
      },
    ],
  },
  {
    id: "백업 녹화기",
    part: "영상·온라인 송출",
    model: "Blackmagic HyperDeck Studio 계열 (HD Mini 추정)",
    location: "영상 데스크 상판",
    purpose: "백업 녹화",
    notes:
      '1080i59.94, SD 슬롯 2개. 전원: 영상 전원 시퀀서. 기존 기록 "SD카드 → 홈페이지 업로드"와 용어집 정의(OBS = 주 녹화)가 다름. 주 송출 경로 중간에 있음 → 꺼지면 주 송출도 끊김. HyperDeck은 재생 상태에서 SDI OUT으로 입력 대신 재생 영상을 내보내는 방식이라 예배 중 재생 시 유튜브에 재생 영상이 나갈 위험',
    toConfirm: [
      { cell: "purpose", what: "실제 운영 방식", priority: 4 },
      { cell: "notes", what: "정확한 모델(뒷면 라벨)", priority: 14 },
      {
        cell: "notes",
        what: "기존 기록과 용어집 정의 중 어느 쪽이 실제 녹화 방식인지",
        priority: 1,
      },
      { cell: "notes", what: "재생 시 실제 동작", priority: 4 },
    ],
  },
  {
    id: "LED 프로세서",
    part: "영상·온라인 송출",
    model: "Colorlight X8E",
    location: "영상 데스크 왼쪽 랙",
    purpose: "영상을 LED 스크린 규격으로 변환",
    notes: '버튼 메모 "HDMI(항상)". 밝기 77%.',
    toConfirm: [{ cell: "notes", what: "뒷면 연결", priority: 14 }],
  },
  {
    id: "LED 스크린 전원 버튼",
    part: "영상·온라인 송출",
    model: "",
    location: "LED 프로세서 바로 위",
    purpose: "LED 스크린 전원 ON/OFF",
    notes: '빨간 버튼, 라벨 "LED스크린전원"',
    toConfirm: [],
  },
  {
    id: "TV 채널 변환기",
    part: "영상·온라인 송출",
    model: "Nextwill NWBM-200HD (8VSB HD Media Caster)",
    location: "영상 데스크 왼쪽 랙",
    purpose: "예배 화면을 TV 채널로 변환해 교회 내 TV로 배포",
    toConfirm: [
      { cell: "notes", what: '채널명 "CBS" 표시 의미' },
      { cell: "notes", what: "수신 TV 위치" },
      { cell: "notes", what: "뒷면 연결", priority: 14 },
    ],
  },
  {
    id: "연결 패널",
    part: "영상·온라인 송출",
    model: "",
    location: "TV 채널 변환기 아래",
    purpose: "외부 장비 연결 단자 모음",
    ports: [
      'BNC "AV-HS410E/강단", BNC "CH5 PATCH/외부기기", HDMI "외부기기", USB (HD Recorder PC / HD CG PC), AC 220V',
    ],
    toConfirm: [{ cell: "notes", what: "용도" }],
  },
  {
    id: "방송실 TV",
    part: "영상·온라인 송출",
    model: "",
    location: "방송실 창문 위 벽걸이",
    purpose: "방송실 모니터링",
    toConfirm: [{ cell: "model", what: "제조사·모델" }],
  },

  // 네트워크
  {
    id: "공유기",
    part: "네트워크",
    model: "ipTIME",
    location: "영상 데스크 상판",
    purpose: "인터넷 연결·분배",
    notes: "전원: 영상 전원 시퀀서",
    toConfirm: [{ cell: "model", what: "모델" }],
  },
  {
    id: "네트워크 스위치",
    part: "네트워크",
    model: "netis PE6108G",
    location: "공유기 아래",
    purpose: "유선 랜 포트 확장 (PoE 지원)",
    ports: ["1·2번 포트 사용 중"],
    notes: "PoE 미사용(표시등 꺼짐).",
    toConfirm: [{ cell: "notes", what: "연결 장비" }],
  },

  // 음향
  {
    id: "음향 콘솔",
    part: "음향",
    model: "Soundcraft Vi3000",
    location: "음향 데스크",
    purpose: "전체 소리 믹싱",
    notes: "상세는 음향 파트에서",
    toConfirm: [{ cell: "connections", what: "그 외 연결" }],
  },
  {
    id: "오디오 분배기",
    part: "음향",
    model: "Drawmer DA-6",
    location: "영상 데스크 랙 (PTZ 컨트롤러 위)",
    purpose: "소리 1개를 6곳으로 분배",
    ports: [
      '출력1: 라벨 "스트리밍" (사용자 확인) / 출력2: "RF-" (용도 모름) / 출력4: "음성녹음" / 출력6: "유아실"',
    ],
    toConfirm: [
      {
        cell: "notes",
        what: '출력1 "스트리밍"은 오디오 임베더로 가는 것으로 보임',
        priority: 5,
      },
      {
        cell: "notes",
        what: "오디오 임베더 소리 입력은 XLR 2개라 출력1 하나로 둘 다 채워지는지",
        priority: 5,
      },
      { cell: "notes", what: "출력2 → TV 채널 변환기 가능성", priority: 10 },
    ],
  },
  {
    id: "무선 마이크 수신기 1~4",
    part: "음향",
    model: "Shure QLXD4 ×4",
    location: "오디오 분배기 아래",
    purpose: "무선 마이크 수신",
    notes: "X51 대역(925–937.5MHz), 채널 1·10·12·20",
    toConfirm: [],
  },
  {
    id: "무선 마이크 수신기 5~6",
    part: "음향",
    model: "Shure QLXD4 ×2",
    location: "멀티뷰 아래, 영상 스위처 위",
    purpose: "무선 마이크 수신",
    notes: '한 대에 "5" 메모. 촬영 시 화면 꺼짐/미표시',
    toConfirm: [{ cell: "notes", what: "사용 여부", priority: 12 }],
  },
  {
    id: "안테나 분배기 A",
    part: "음향",
    model: "Shure UA844+SWB",
    location: "무선 마이크 수신기 1~4 위",
    purpose: "안테나·전원을 수신기에 분배",
    toConfirm: [],
  },
  {
    id: "안테나 분배기 B",
    part: "음향",
    model: "Shure UA844+SWB",
    location: "무선 마이크 수신기 5~6 아래",
    purpose: "안테나·전원을 수신기에 분배",
    toConfirm: [{ cell: "notes", what: "안테나 분배기 A와의 cascade(연결) 여부" }],
  },
  {
    id: "CD/USB 플레이어",
    part: "음향",
    model: "Numark MP103USB",
    location: "멀티뷰 아래, 안테나 분배기 B 아래",
    purpose: "음원 재생",
    ports: ["BALANCED OUT·DIGITAL OUT 미사용 추정"],
    notes: "2014년 5월 제조",
    toConfirm: [],
  },
  {
    id: "방송실 스피커",
    part: "음향",
    model: "(Yamaha HS 계열 추정)",
    location: "방송실 창문 위 좌우",
    purpose: "방송실 청취용",
    toConfirm: [
      { cell: "model", what: "제조사·모델" },
      { cell: "connections", what: "연결" },
    ],
  },

  // 조명
  {
    id: "조명 콘솔",
    part: "조명",
    model: "Botex DC-2448 Light Operator 48",
    location: "영상 데스크 왼쪽 상판",
    purpose: "본당 조명 제어 (DMX 48채널)",
    notes: "라벨: ①강대상(위) ②새벽기도 ④성가대1 ⑤성가대2 ⑥강대상(아래) ⑧지휘자",
    toConfirm: [],
  },

  // 기타 (용도 확인 필요)
  {
    id: "DVD 레코더",
    part: "기타",
    model: "(…-DVM70, DV/HDD/DVD Recorder)",
    location: "영상 데스크 왼쪽 랙",
    toConfirm: [
      { cell: "model", what: "제조사·모델" },
      { cell: "notes", what: "현재 사용 여부" },
    ],
  },
] as const satisfies readonly EquipmentDef[];

export type EquipmentId = (typeof equipmentDefs)[number]["id"];
export type Equipment = EquipmentDef & { readonly id: EquipmentId };

/** 장비 목록표 순서의 장비 전체. */
export const equipment: readonly Equipment[] = equipmentDefs;

const externalDefs = [
  { id: "건물 전원" },
  { id: "인터넷" },
  { id: "유튜브" },
  { id: "LED 스크린" },
  { id: "교회 내 TV" },
  { id: "본당 조명" },
  { id: "안테나" },
] as const;

/** 장비 목록 밖의 끝점. 방송실 밖이거나 이 문서가 장비로 다루지 않는 것이다. */
export type ExternalId = (typeof externalDefs)[number]["id"];
export const externals: readonly { readonly id: ExternalId }[] = externalDefs;

/** 아는 끝점. `unit`은 한 행으로 묶인 장비(CAM5·CAM6 등) 중 어느 것인지, `port`는 단자다. */
export type KnownEndpoint = {
  readonly id: EquipmentId | ExternalId;
  readonly unit?: string;
  readonly port?: string;
};

/** 모르는 끝점. `unknown`은 그 자리에 보일 말이고, 후보 장비가 있으면 `candidates`에 둔다. */
export type UnknownEndpoint = {
  readonly unknown: string;
  readonly candidates?: readonly EquipmentId[];
};

export type Endpoint = KnownEndpoint | UnknownEndpoint;

export type Connection = {
  readonly from: Endpoint;
  readonly to: Endpoint;
  /** 케이블/신호 종류. */
  readonly signal?: string;
  /** 신호 내용 등 덧붙이는 말. */
  readonly detail?: string;
  /** 근거. "추정", "선임 설명", "사용자 확인" 등을 글자 그대로 둔다. */
  readonly evidence?: string;
  /** 연결이 있는지, 끝점이 맞는지부터 확인해야 하면 true다. 흐린 톤으로 그린다. */
  readonly unconfirmed: boolean;
  readonly toConfirm: readonly string[];
  /**
   * `toConfirm`의 확인 필요 목록 우선순위. 연결의 확인할 거리는 지금 모두 하나라 연결에 둔다.
   * 한 연결에 우선순위가 다른 거리가 생기면 장비처럼 항목마다 두도록 바꾼다.
   */
  readonly priority?: Priority;
};

/** 장비 목록표 순서로 늘어놓은 연결. 같은 연결은 한 번만 적는다. */
export const connections: readonly Connection[] = [
  // 전원
  { from: { id: "건물 전원" }, to: { id: "전압조정기" }, signal: "전원", unconfirmed: false, toConfirm: [] },
  {
    from: { id: "전압조정기" },
    to: { unknown: "하위 장비" },
    signal: "전원",
    unconfirmed: false,
    toConfirm: ["연결 범위"],
    priority: 11,
  },
  {
    from: { id: "전압조정기" },
    to: { id: "음향 UPS" },
    signal: "전원",
    evidence: "추정",
    unconfirmed: true,
    toConfirm: ["연결 여부"],
  },
  {
    from: { id: "음향 UPS" },
    to: { id: "음향 콘솔" },
    signal: "전원",
    unconfirmed: true,
    toConfirm: ["연결 여부"],
  },
  { from: { id: "영상 전원 시퀀서" }, to: { id: "공유기" }, signal: "전원", unconfirmed: false, toConfirm: [] },
  { from: { id: "영상 전원 시퀀서" }, to: { id: "멀티뷰" }, signal: "전원", unconfirmed: false, toConfirm: [] },
  { from: { id: "영상 전원 시퀀서" }, to: { id: "백업 녹화기" }, signal: "전원", unconfirmed: false, toConfirm: [] },
  { from: { id: "영상 전원 시퀀서" }, to: { id: "백업 송출 장비" }, signal: "전원", unconfirmed: false, toConfirm: [] },

  // 영상·온라인 송출
  {
    from: { id: "영상 스위처", port: "AUX4" },
    to: { id: "방송실 TV" },
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "영상 스위처" },
    to: { id: "영상 hub" },
    signal: "SDI",
    detail: "PGM+CG",
    evidence: "선임 설명",
    unconfirmed: false,
    toConfirm: ["영상 스위처 출력 단자 번호"],
    priority: 6,
  },
  {
    from: { id: "영상 hub" },
    to: { id: "오디오 임베더", port: "SDI IN" },
    signal: "SDI",
    detail: "PGM+CG",
    evidence: "선임 설명",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "영상 hub" },
    to: { id: "멀티뷰" },
    detail: "영상 hub 비고의 확인할 거리 참고",
    evidence: "선임 설명",
    unconfirmed: true,
    toConfirm: ["연결 여부"],
    priority: 2,
  },
  {
    from: { id: "영상 스위처" },
    to: { id: "멀티뷰" },
    detail: "영상 스위처 멀티뷰 전용 출력",
    evidence: "추정",
    unconfirmed: true,
    toConfirm: ["출력 단자·영상 hub 경유 여부"],
    priority: 6,
  },
  {
    from: { id: "PTZ 컨트롤러" },
    to: { id: "CAM1·CAM2" },
    signal: "제어",
    unconfirmed: false,
    toConfirm: ["IP 제어인지"],
  },
  {
    from: { id: "구형 카메라 컨트롤러" },
    to: { id: "CAM3·CAM4" },
    signal: "제어",
    unconfirmed: true,
    toConfirm: ["연결 여부"],
  },
  {
    from: { id: "CAM1·CAM2", unit: "CAM1" },
    to: { id: "영상 스위처", port: "SDI IN1" },
    signal: "SDI",
    evidence: "사용자 확인",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "CAM1·CAM2", unit: "CAM2" },
    to: { id: "영상 스위처", port: "SDI IN2" },
    signal: "SDI",
    evidence: "사용자 확인",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "CAM3·CAM4", unit: "CAM3" },
    to: { id: "영상 스위처", port: "SDI IN3" },
    signal: "SDI",
    evidence: "사용자 확인",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "CAM3·CAM4", unit: "CAM4" },
    to: { id: "영상 스위처", port: "SDI IN4" },
    signal: "SDI",
    evidence: "사용자 확인",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "CAM5·CAM6", unit: "CAM5" },
    to: { id: "영상 스위처", port: "SDI IN5" },
    detail: '버튼 "CP"',
    evidence: "사용자 확인",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "CAM5·CAM6", unit: "CAM6" },
    to: { id: "영상 스위처", port: "SDI IN6" },
    detail: '버튼 "강단"',
    evidence: "사용자 확인",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { unknown: "음향 소리", candidates: ["음향 콘솔", "오디오 분배기"] },
    to: { id: "오디오 임베더", port: "CH1·CH2" },
    signal: "XLR ×2",
    evidence: "선임 설명(음향 콘솔)",
    unconfirmed: true,
    toConfirm: ['출발 장비: 음향 콘솔 직결 또는 오디오 분배기 출력1 "스트리밍" 경유'],
    priority: 5,
  },
  {
    from: { id: "오디오 임베더", port: "SDI OUT" },
    to: { id: "백업 송출 장비", port: "SDI IN" },
    signal: "SDI",
    detail: "영상+소리",
    evidence: "선임 설명",
    unconfirmed: false,
    toConfirm: ["실물 연결(직렬 구조)"],
    priority: 3,
  },
  {
    from: { id: "백업 녹화기", port: "SDI OUT" },
    to: { id: "송출 PC 캡처카드" },
    signal: "SDI 1개",
    detail: "영상+소리 embedded",
    evidence: "선임 설명",
    unconfirmed: true,
    toConfirm: ["실물 연결(직렬 구조)"],
    priority: 3,
  },
  {
    from: { id: "송출 PC 캡처카드" },
    to: { id: "송출 PC" },
    signal: "PCIe",
    detail: "송출 PC 내부",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "송출 PC" },
    to: { id: "공유기" },
    unconfirmed: true,
    toConfirm: ["연결 여부"],
  },
  {
    from: { id: "CG PC" },
    to: { id: "CG PC 문자발생기 보드" },
    signal: "PCIe",
    detail: "CG PC 내부",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "CG PC 문자발생기 보드", port: "FILL Out" },
    to: { id: "영상 스위처", port: "SDI IN8" },
    signal: "HD-SDI",
    detail: "CG FILL",
    evidence: "사용자 확인",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "CG PC 문자발생기 보드", port: "KEY Out" },
    to: { id: "영상 스위처", port: "SDI IN7" },
    signal: "HD-SDI",
    detail: "CG KEY",
    evidence: "사용자 확인",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "CG PC" },
    to: { id: "영상 스위처", port: "PC 입력" },
    detail: "PC 화면, 디스플레이 확장 모드",
    unconfirmed: false,
    toConfirm: ["신호 종류 — 스위처 유일한 DVI 입력일 가능성"],
  },
  {
    from: { unknown: "미상" },
    to: { id: "백업 송출 장비", port: "HDMI IN" },
    signal: "HDMI",
    unconfirmed: false,
    toConfirm: ["출발 장비"],
    priority: 7,
  },
  {
    from: { id: "백업 송출 장비", port: "SDI OUT" },
    to: { id: "백업 녹화기", port: "SDI IN" },
    signal: "SDI",
    evidence: "선임 설명",
    unconfirmed: false,
    toConfirm: ["실물 연결(직렬 구조)"],
    priority: 3,
  },
  {
    from: { id: "백업 송출 장비", port: "LAN" },
    to: { id: "공유기" },
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { unknown: "미상" },
    to: { id: "LED 프로세서", port: "HDMI1" },
    signal: "HDMI",
    detail: "1920×1080@59.94",
    unconfirmed: false,
    toConfirm: ["출발 장비"],
    priority: 8,
  },
  {
    from: { id: "LED 프로세서" },
    to: { id: "LED 스크린" },
    signal: "이더넷",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { unknown: "미상" },
    to: { id: "TV 채널 변환기" },
    signal: "HDMI",
    unconfirmed: false,
    toConfirm: ["출발 장비"],
    priority: 8,
  },
  {
    from: { id: "TV 채널 변환기" },
    to: { id: "교회 내 TV" },
    signal: "동축",
    detail: "CATV 채널 004 = 4-1",
    unconfirmed: false,
    toConfirm: [],
  },

  // 네트워크
  {
    from: { id: "인터넷" },
    to: { id: "공유기", port: "WAN" },
    detail: "2.5G 포트, 검정 랜선",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "공유기", port: "LAN" },
    to: { id: "네트워크 스위치" },
    detail: "공유기 LAN에는 그 외 장비도 연결",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "공유기" },
    to: { id: "유튜브" },
    detail: "송출 PC의 주 송출",
    unconfirmed: false,
    toConfirm: [],
  },

  // 음향
  {
    from: { id: "음향 콘솔" },
    to: { id: "오디오 분배기" },
    evidence: "추정",
    unconfirmed: true,
    toConfirm: ["입력 출발 장비"],
    priority: 5,
  },
  {
    from: { id: "안테나 분배기 A" },
    to: { id: "무선 마이크 수신기 1~4" },
    signal: "RF",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "무선 마이크 수신기 1~4" },
    to: { id: "음향 콘솔" },
    unconfirmed: true,
    toConfirm: ["연결 여부"],
  },
  {
    from: { id: "안테나 분배기 B" },
    to: { id: "무선 마이크 수신기 5~6" },
    signal: "RF",
    unconfirmed: false,
    toConfirm: [],
  },
  {
    from: { id: "무선 마이크 수신기 5~6", port: "출력" },
    to: { unknown: "미상" },
    signal: "XLR",
    unconfirmed: false,
    toConfirm: ["연결처"],
  },
  { from: { id: "안테나" }, to: { id: "안테나 분배기 A" }, unconfirmed: false, toConfirm: [] },
  { from: { id: "안테나" }, to: { id: "안테나 분배기 B" }, unconfirmed: false, toConfirm: [] },
  {
    from: { id: "CD/USB 플레이어", port: "LINE OUT" },
    to: { unknown: "미상" },
    signal: "RCA",
    unconfirmed: false,
    toConfirm: ["연결처"],
  },

  // 조명
  {
    from: { id: "조명 콘솔" },
    to: { id: "본당 조명" },
    signal: "DMX",
    unconfirmed: false,
    toConfirm: [],
  },
];

/** 데이터 밖(테스트 등)에서도 쓰도록 이름을 `string`으로 넓힌 끝점과 연결. */
export type AnyEndpoint =
  | { readonly id: string; readonly unit?: string; readonly port?: string }
  | { readonly unknown: string; readonly candidates?: readonly string[] };
export type AnyLink = { readonly from: AnyEndpoint; readonly to: AnyEndpoint };

/** 그 장비가 끝점이거나 미상의 후보인지. */
function touches(end: AnyEndpoint, id: string): boolean {
  return "unknown" in end ? (end.candidates ?? []).includes(id) : end.id === id;
}

/** 그 장비가 끝점이거나 미상의 후보인 연결. 장비 목록표 행의 연결 칸이 이것이다. */
export function connectionsOf<C extends AnyLink>(id: string, links: readonly C[]): C[] {
  return links.filter((c) => touches(c.from, id) || touches(c.to, id));
}

/** 아무 연결에도 나오지 않는 장비 id. 장비 순서를 따른다. */
export function unconnectedEquipment(
  list: readonly { readonly id: string }[],
  links: readonly AnyLink[],
): string[] {
  return list.map((e) => e.id).filter((id) => connectionsOf(id, links).length === 0);
}

function endpointText(end: AnyEndpoint): string {
  if ("unknown" in end) {
    const candidates = end.candidates ?? [];
    return candidates.length > 0 ? `${end.unknown}(후보: ${candidates.join(", ")})` : end.unknown;
  }
  return [end.unit ?? end.id, end.port].filter(Boolean).join(" ");
}

/**
 * 연결 한 줄. 기록 규칙대로 "출발 장비 → 도착 장비 (케이블/신호 종류)"로 적는다.
 * 확인할 거리는 넣지 않는다. 그리는 쪽이 배지로 붙인다.
 */
export function connectionText(
  c: AnyLink & Partial<Pick<Connection, "signal" | "detail" | "evidence">>,
): string {
  const line = `${endpointText(c.from)} → ${endpointText(c.to)}`;
  const aside = [c.signal, c.detail, c.evidence].filter(Boolean).join(", ");
  return aside ? `${line} (${aside})` : line;
}
