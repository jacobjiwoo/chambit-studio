import { figureFileUrl } from "../_lib/device-figure-files";
import { DEVICE_FIGURES, figureIds } from "../_lib/device-figures";
import "./anatomy/iso.css";
import "./device-figure.css";
import "./device-gallery.css";
import { DeviceGalleryGrid, type GalleryItem } from "./device-gallery-grid";

/**
 * 생김새 그림이 있는 장비만 모아 앞모습을 격자로 보인다. 카드를 누르면 같은 페이지의
 * `DeviceFigureHost` dialog가 열린다. 그림 SVG는 페이지에 싣지 않고 카드가 보일 때 받는다.
 */
export function DeviceGallery() {
  const items: GalleryItem[] = DEVICE_FIGURES.map((figure) => {
    const front = figure.views.find((view) => view.key === "front") ?? figure.views[0];
    return {
      id: figure.id,
      also: figureIds(figure).slice(1),
      model: figure.model,
      src: figureFileUrl(figure),
      view: { key: front.key, width: front.width, height: front.height, label: front.label },
    };
  });
  return <DeviceGalleryGrid items={items} />;
}
