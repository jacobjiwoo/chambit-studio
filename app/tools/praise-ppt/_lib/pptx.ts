import type { Background } from "./background";
import type { PlannedSlide } from "./plan";

/** 16:9 레이아웃(inch). 슬라이드 이미지를 이 크기로 (0, 0)부터 가득 놓는다. */
const WIDTH = 10;
const HEIGHT = 5.625;

/**
 * 생성 계획의 장들로 `.pptx` Blob을 만든다. pptxgenjs는 여기서 처음 내려받는다. 이미지를 하나라도
 * 받지 못하면 전체가 실패한다 — 일부만 빠진 PPT를 내주지 않는다.
 */
export async function writePptx(slides: readonly PlannedSlide[]): Promise<Blob> {
  // 장마다 받는 동안 pptxgenjs도 함께 내려받는다
  const [{ default: PptxGenJS }, images] = await Promise.all([
    import("pptxgenjs"),
    Promise.all(slides.map((s) => imageData(s.image))),
  ]);

  const presentation = new PptxGenJS();
  presentation.defineLayout({ name: "WIDE", width: WIDTH, height: HEIGHT });
  presentation.layout = "WIDE";

  slides.forEach((slide, i) => {
    const pptSlide = presentation.addSlide();
    pptSlide.background = backgroundProps(slide.background);
    pptSlide.addImage({ data: images[i], x: 0, y: 0, w: WIDTH, h: HEIGHT });
  });

  // `outputType`로 반환 타입이 좁혀지지 않는다(라이브러리 타입 한계). "blob"이면 Blob이다
  return (await presentation.write({ outputType: "blob" })) as Blob;
}

function backgroundProps(background: Background) {
  return background.type === "color"
    ? { color: background.value }
    : { data: stripDataPrefix(background.data) };
}

/**
 * pptxgenjs가 받는 꼴(`image/…;base64,…`)의 이미지. 올린 곡은 이미 data URL이고, 곡 목록 곡은
 * R2 도메인에서 받아 바꾼다.
 */
async function imageData(src: string): Promise<string> {
  if (src.startsWith("data:")) return stripDataPrefix(src);

  let response: Response;
  try {
    response = await fetch(src);
  } catch {
    throw new Error(`슬라이드 이미지를 받지 못했습니다: ${src}`);
  }
  if (!response.ok) {
    throw new Error(`슬라이드 이미지를 받지 못했습니다 (${response.status}): ${src}`);
  }
  return stripDataPrefix(await readAsDataUrl(await response.blob()));
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("슬라이드 이미지를 읽지 못했습니다"));
    reader.readAsDataURL(blob);
  });
}

function stripDataPrefix(dataUrl: string): string {
  return dataUrl.startsWith("data:") ? dataUrl.slice("data:".length) : dataUrl;
}

/** `찬양_YYYYMMDD.pptx` — 만든 시각의 로컬 날짜. */
export function pptxFileName(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `찬양_${yyyy}${mm}${dd}.pptx`;
}
