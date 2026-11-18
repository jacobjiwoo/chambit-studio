/**
 * 장비 그림 파일. 그림 SVG는 페이지에 싣지 않고 장비마다 `device-figures/<slug>.json`으로
 * 내보낸다. 서버(빌드)와 dialog(브라우저)가 같은 이름과 모양을 쓰도록 여기 둔다.
 *
 * 그림 모듈을 import하지 않는다. dialog가 이 파일을 불러도 그림 코드가 딸려 가지 않게 하려는 것이다.
 */

/** 시점 이름 → 그 시점의 SVG 본문(`<svg>` 안쪽) */
export type FigureSvgs = Record<string, string>;

/** 페이지 주소. `app/docs/broadcast-system/device-figures/[file]/route.ts`가 이 자리에 파일을 만든다 */
const BASE = "/docs/broadcast-system/device-figures";

export function figureFileName(figure: { slug: string }): string {
  return `${figure.slug}.json`;
}

export function figureFileUrl(figure: { slug: string }): string {
  return `${BASE}/${figureFileName(figure)}`;
}

export function figureSvgs(figure: { views: readonly { key: string; svg: string }[] }): FigureSvgs {
  return Object.fromEntries(figure.views.map((view) => [view.key, view.svg]));
}
