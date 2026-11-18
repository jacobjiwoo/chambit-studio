import { figureFileName, figureSvgs } from "../../_lib/device-figure-files";
import { DEVICE_FIGURES } from "../../_lib/device-figures";

/**
 * 장비 생김새 그림 파일 `device-figures/<slug>.json`. 빌드할 때 장비마다 정적 파일로 만들어지고,
 * dialog가 그 장비를 열 때 받는다. 페이지에 그림을 싣지 않으려는 것이다.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return DEVICE_FIGURES.map((figure) => ({ file: figureFileName(figure) }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const figure = DEVICE_FIGURES.find((entry) => figureFileName(entry) === file);
  if (!figure) return new Response(null, { status: 404 });
  return Response.json(figureSvgs(figure));
}
