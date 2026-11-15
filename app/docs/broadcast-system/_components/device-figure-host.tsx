import { DEVICE_FIGURES, pluggedInto } from "../_lib/device-figures";
import "./anatomy/iso.css";
import "./device-figure.css";
import { DeviceFigureDialog, type DialogFigure } from "./device-figure-dialog";

/**
 * 장비 생김새 그림의 dialog 자리. "생김새 보기" 버튼이 있는 페이지에 한 번 둔다.
 *
 * 서버 컴포넌트라 그림은 빌드 때 만들어진 SVG다. 단자마다 `system.ts`에서 찾은 "꽂힌 상대"를 붙여
 * `DeviceFigureDialog`(클라이언트)에 넘긴다.
 */
export function DeviceFigureHost() {
  const figures: DialogFigure[] = DEVICE_FIGURES.map((figure) => {
    const plugged = pluggedInto(figure);
    return {
      id: figure.id,
      model: figure.model,
      caption: `${figure.caveat} 근거: ${figure.source}.`,
      views: figure.views.map((view) => ({
        key: view.key,
        width: view.width,
        height: view.height,
        label: view.label,
        spots: view.spots.map((spot) => ({ ...spot, plugged: plugged[spot.name] ?? [] })),
        art: <g key={`${figure.id}-${view.key}`} dangerouslySetInnerHTML={{ __html: view.svg }} />,
      })),
    };
  });
  return <DeviceFigureDialog figures={figures} />;
}
