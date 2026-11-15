"use client";

import { DEVICE_FIGURE_IDS, OPEN_DEVICE_FIGURE } from "../_lib/device-figure-ids";

/**
 * "생김새 보기" 버튼. 그 장비의 생김새 그림이 있을 때만 나온다. 같은 페이지의 `DeviceFigureHost`가
 * 이벤트를 받아 dialog를 연다.
 */
export function DeviceFigureButton({ id, className }: { id: string; className?: string }) {
  if (!DEVICE_FIGURE_IDS.includes(id)) return null;
  return (
    <button type="button" className={className ?? "device-figure-button"} onClick={() => window.dispatchEvent(new CustomEvent(OPEN_DEVICE_FIGURE, { detail: id }))}>
      생김새 보기
    </button>
  );
}
