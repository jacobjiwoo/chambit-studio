import type { CSSProperties } from "react";

import type { Background } from "../_lib/background";

/** 배경 미리보기와 썸네일 뒤에 깔 인라인 스타일. 곡 카드(08)와 배경(09)이 함께 쓴다. */
export function backgroundStyle(background: Background): CSSProperties {
  if (background.type === "color") return { background: `#${background.value}` };
  return {
    backgroundImage: `url(${background.data})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}
