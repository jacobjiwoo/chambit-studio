import { figureFileUrl } from "../_lib/device-figure-files";
import { DEVICE_FIGURES, pluggedInto } from "../_lib/device-figures";
import "./anatomy/iso.css";
import "./device-figure.css";
import { DeviceFigureDialog, type DialogFigure } from "./device-figure-dialog";

/**
 * 장비 생김새 그림의 dialog 자리. "생김새 보기" 버튼이 있는 페이지에 한 번 둔다.
 *
 * 페이지에는 이름 목록과 단자마다 `system.ts`에서 찾은 "꽂힌 상대"만 싣는다. 그림 SVG는 빌드 때
 * `device-figures/<slug>.json`으로 따로 만들어지고, `DeviceFigureDialog`(클라이언트)가 열 때 받는다.
 */
export function DeviceFigureHost() {
  const figures: DialogFigure[] = DEVICE_FIGURES.map((figure) => {
    const plugged = pluggedInto(figure);
    return {
      id: figure.id,
      model: figure.model,
      caption: `${figure.caveat} 근거: ${figure.source}.`,
      src: figureFileUrl(figure),
      views: figure.views.map((view) => ({
        key: view.key,
        width: view.width,
        height: view.height,
        label: view.label,
        spots: view.spots.map((spot) => ({ ...spot, plugged: plugged[spot.name] ?? [] })),
      })),
    };
  });
  return <DeviceFigureDialog figures={figures} />;
}
