/**
 * 슬라이드 뒤에 깔 배경. 색은 앞의 `#` 없는 hex(`FFFFFF`)이고, 이미지는 data URL이다.
 */
export type Background =
  | { type: "color"; value: string }
  | { type: "image"; data: string };

/** 색 프리셋 8개. 산출물의 일부라 값은 원본 그대로다. */
export const COLOR_PRESETS: readonly { name: string; value: string }[] = [
  { name: "흰색", value: "FFFFFF" },
  { name: "크림", value: "FFF8E7" },
  { name: "회색", value: "EEF0F2" },
  { name: "하늘", value: "EAF4FB" },
  { name: "연두", value: "EAF5EA" },
  { name: "진회색", value: "555555" },
  { name: "남색", value: "1A1A40" },
  { name: "검정", value: "000000" },
];

/** 공통 배경의 기본값. 저장하지 않으니 새로고침하면 이것으로 돌아간다. */
export const DEFAULT_BACKGROUND: Background = { type: "color", value: "FFFFFF" };

/** 배경이 그 색(`#` 없는 hex)인지 본다. hex는 대소문자를 가리지 않는다. */
export function isColor(background: Background, hex: string): boolean {
  return background.type === "color" && background.value.toLowerCase() === hex.toLowerCase();
}

/** 화면에 보일 배경 이름 — 프리셋 이름, 아니면 `#RRGGBB`, 이미지면 "업로드 이미지". */
export function backgroundName(background: Background): string {
  if (background.type === "image") return "업로드 이미지";
  const preset = COLOR_PRESETS.find((p) => isColor(background, p.value));
  return preset ? preset.name : `#${background.value}`;
}

/**
 * localStorage처럼 밖에서 들어온 값이 배경 모양인지 본다. 색은 hex 6자리, 이미지는
 * `data:image/` data URL이어야 한다 — 아니면 이름도 PPT 배경도 깨진다.
 */
export function isBackground(value: unknown): value is Background {
  if (typeof value !== "object" || value === null) return false;
  const { type, value: hex, data } = value as Record<string, unknown>;
  if (type === "color") return typeof hex === "string" && /^[0-9a-f]{6}$/i.test(hex);
  if (type === "image") return typeof data === "string" && data.startsWith("data:image/");
  return false;
}
