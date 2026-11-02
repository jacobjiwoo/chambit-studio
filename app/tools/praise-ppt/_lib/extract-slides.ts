/**
 * 슬라이드 추출 — 담당자가 올린 `.ppt`·`.pptx`에서 슬라이드 이미지를 뽑는다(seam 1).
 *
 * 원본 praise-ppt의 `extract-ppt-client`를 동작과 오류 문구 그대로 옮겼다. 다른 점은 `.pptx`의
 * ZIP을 JSZip 대신 이미 의존성에 있는 `fflate`로 푸는 것 하나다.
 *
 * - `.ppt`(OLE): `Pictures` 스트림의 BLIP 레코드에서 PNG·JPEG 바이트를 그대로 꺼낸다.
 * - `.pptx`(ZIP): 슬라이드마다 처음 나오는 그림을 따라가 `ppt/media/`에서 꺼낸다.
 *
 * 이미지는 디코딩하지 않는다. 바이트를 그대로 data URL로 옮긴다.
 */
import * as CFB from "cfb";
import { strFromU8, unzipSync, type Unzipped } from "fflate";

import type { Slide } from "./song";

/** 슬라이드를 뽑지 못한 이유. 화면은 `message`를 그대로 보여 준다. */
export class ExtractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExtractError";
  }
}

type ImageMime = "image/png" | "image/jpeg";

/** 이름이 `.ppt`나 `.pptx`로 끝나는가. 대소문자는 가리지 않는다. */
export function isPptName(name: string): boolean {
  return /\.pptx?$/i.test(name);
}

/** 올린 곡의 제목 — 파일 이름에서 `.ppt`/`.pptx`를 뗀 것. */
export function titleFromFileName(name: string): string {
  return name.replace(/\.pptx?$/i, "");
}

/** 파일 하나에서 슬라이드를 뽑는다. 번호는 뽑힌 것끼리 0부터다. 못 뽑으면 {@link ExtractError}. */
export async function extractSlides(file: File): Promise<Slide[]> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pptx")) return fromPptx(new Uint8Array(await file.arrayBuffer()));
  if (lower.endsWith(".ppt")) return fromPpt(new Uint8Array(await file.arrayBuffer()));
  throw new ExtractError("지원하지 않는 파일 형식입니다 (.ppt 또는 .pptx 만 가능)");
}

function toSlides(images: { bytes: Uint8Array; mime: ImageMime }[]): Slide[] {
  return images.map(({ bytes, mime }, index) => ({
    index,
    image: `data:${mime};base64,${bytesToBase64(bytes)}`,
  }));
}

function bytesToBase64(data: Uint8Array): string {
  // `String.fromCharCode`에 한 번에 넘길 수 있는 인자 수에 한도가 있어 잘라서 넘긴다
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < data.length; i += chunk) {
    binary += String.fromCharCode(...data.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// ─── .ppt (OLE) ───────────────────────────────────────────────────────────────

const PNG_RECORD = 0xf01e;
const JPEG_RECORD = 0xf01d;
/** CMYK JPEG. 드물지만 있다 */
const JPEG_CMYK_RECORD = 0xf02a;
/** 본문 앞의 UID 16바이트 + tag 1바이트 */
const PICTURE_HEADER_SKIP = 17;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];

function startsWith(data: Uint8Array, signature: number[]): boolean {
  return data.length >= signature.length && signature.every((byte, i) => data[i] === byte);
}

/** IHDR color type(바이트 25)이 6이면 RGBA다 */
function isRgbaPng(data: Uint8Array): boolean {
  return data.length >= 26 && data[25] === 6;
}

function fromPpt(bytes: Uint8Array): Slide[] {
  let container: CFB.CFB$Container;
  try {
    container = CFB.parse(bytes, { type: "array" });
  } catch (error) {
    throw new ExtractError(`OLE 파싱 실패: ${errorText(error)}`);
  }

  const pictures = CFB.find(container, "Pictures");
  if (!pictures) {
    throw new ExtractError("Pictures 스트림을 찾을 수 없습니다 — 지원되는 PPT 형식이 아닙니다");
  }

  const data = Uint8Array.from(pictures.content);
  const view = new DataView(data.buffer);
  const candidates: { bytes: Uint8Array; mime: ImageMime; rgba: boolean }[] = [];

  // 레코드 헤더 8바이트: 타입은 offset 2의 u16, 본문 길이는 offset 4의 u32
  let offset = 0;
  while (offset + 8 <= data.length) {
    const type = view.getUint16(offset + 2, true);
    const length = view.getUint32(offset + 4, true);
    offset += 8;

    const start = offset + PICTURE_HEADER_SKIP;
    const end = offset + length;
    if (start < end && end <= data.length) {
      const image = data.subarray(start, end);
      if (type === PNG_RECORD && startsWith(image, PNG_SIGNATURE)) {
        candidates.push({ bytes: image, mime: "image/png", rgba: isRgbaPng(image) });
      } else if (
        (type === JPEG_RECORD || type === JPEG_CMYK_RECORD) &&
        startsWith(image, JPEG_SIGNATURE)
      ) {
        candidates.push({ bytes: image, mime: "image/jpeg", rgba: false });
      }
      // EMF/WMF 등은 래스터가 아니라 버린다
    }
    offset += length;
  }

  // 블로그 형식은 가사가 투명 PNG이고 JPEG이 공유 배경이다. 투명 PNG가 없으면 슬라이드마다
  // 그림 한 장인 형식으로 보고 전부 쓴다
  const rgba = candidates.filter((c) => c.rgba);
  const chosen = rgba.length > 0 ? rgba : candidates;
  if (chosen.length === 0) {
    throw new ExtractError(
      "추출된 슬라이드가 없습니다 — Pictures 스트림에 인식 가능한 이미지 (PNG/JPEG) 가 없습니다",
    );
  }
  return toSlides(chosen);
}

// ─── .pptx (ZIP) ──────────────────────────────────────────────────────────────

const IMAGE_RELATIONSHIP =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";

type Relationship = { id: string; type: string; target: string };

function parseRelationships(xml: string): Relationship[] {
  const relationships: Relationship[] = [];
  for (const [, attrs = ""] of xml.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
    const id = /\bId="([^"]+)"/.exec(attrs)?.[1];
    const type = /\bType="([^"]+)"/.exec(attrs)?.[1] ?? "";
    const target = /\bTarget="([^"]+)"/.exec(attrs)?.[1];
    if (id && target) relationships.push({ id, type, target });
  }
  return relationships;
}

/** `presentation.xml`의 `sldIdLst` 순서를 `presentation.xml.rels`로 슬라이드 경로로 바꾼다 */
function slideOrder(files: Unzipped): string[] {
  const presentation = files["ppt/presentation.xml"];
  const presentationRels = files["ppt/_rels/presentation.xml.rels"];
  if (!presentation || !presentationRels) return [];

  const relationships = parseRelationships(strFromU8(presentationRels));
  const paths: string[] = [];
  for (const [, refId] of strFromU8(presentation).matchAll(/<p:sldId\b[^>]*r:id="([^"]+)"/g)) {
    const target = relationships.find((r) => r.id === refId)?.target;
    if (target) paths.push(resolveSlidePath(target));
  }
  return paths;
}

/** `presentation.xml`이 비었을 때 — `ppt/slides/slide{n}.xml`을 `n` 숫자 순으로 */
function slidesByNumber(files: Unzipped): string[] {
  return Object.keys(files)
    .flatMap((path) => {
      const n = /^ppt\/slides\/slide(\d+)\.xml$/.exec(path)?.[1];
      return n ? [{ path, n: Number(n) }] : [];
    })
    .sort((a, b) => a.n - b.n)
    .map(({ path }) => path);
}

/** `slides/slide3.xml`, `/ppt/slides/slide3.xml` → `ppt/slides/slide3.xml` */
function resolveSlidePath(ref: string): string {
  if (ref.startsWith("ppt/")) return ref;
  if (ref.startsWith("/")) return ref.slice(1);
  return `ppt/${ref}`;
}

/** 슬라이드 폴더 기준 상대 경로를 푼다. `../media/image1.jpg` → `ppt/media/image1.jpg` */
function resolveImagePath(slidePath: string, target: string): string {
  if (target.startsWith("/")) return target.slice(1);
  const slideDir = slidePath.replace(/[^/]+$/, "");
  const stack: string[] = [];
  for (const segment of (slideDir + target).split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") stack.pop();
    else stack.push(segment);
  }
  return stack.join("/");
}

function mimeOf(path: string): ImageMime | null {
  const extension = path.split(".").pop()?.toLowerCase();
  if (extension === "png") return "image/png";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  return null;
}

/** 슬라이드에서 처음 나오는 그림을 꺼낸다. 못 찾으면 `null`이고 그 슬라이드는 건너뛴다 */
function firstImage(
  files: Unzipped,
  slidePath: string,
): { bytes: Uint8Array; mime: ImageMime } | null {
  const slide = files[slidePath];
  if (!slide) return null;
  const embedId = /<a:blip\b[^>]*r:embed="([^"]+)"/.exec(strFromU8(slide))?.[1];
  if (!embedId) return null;

  const rels = files[slidePath.replace(/^(.*\/)([^/]+)$/, "$1_rels/$2.rels")];
  if (!rels) return null;
  const target = parseRelationships(strFromU8(rels)).find(
    (r) => r.id === embedId && r.type === IMAGE_RELATIONSHIP,
  )?.target;
  if (!target) return null;

  const imagePath = resolveImagePath(slidePath, target);
  const bytes = files[imagePath];
  const mime = mimeOf(imagePath);
  return bytes && mime ? { bytes, mime } : null;
}

function fromPptx(bytes: Uint8Array): Slide[] {
  let files: Unzipped;
  try {
    files = unzipSync(bytes);
  } catch (error) {
    throw new ExtractError(`PPTX (ZIP) 파싱 실패: ${errorText(error)}`);
  }

  const ordered = slideOrder(files);
  const slidePaths = ordered.length > 0 ? ordered : slidesByNumber(files);
  if (slidePaths.length === 0) {
    throw new ExtractError("슬라이드를 찾을 수 없습니다 — 손상된 PPTX 파일일 수 있습니다");
  }

  const images = slidePaths.flatMap((path) => firstImage(files, path) ?? []);
  if (images.length === 0) {
    throw new ExtractError(
      "추출된 슬라이드가 없습니다 — 슬라이드에 배경 이미지가 없거나 인식 불가능한 형식입니다",
    );
  }
  return toSlides(images);
}
