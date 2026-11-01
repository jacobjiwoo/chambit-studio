/**
 * 슬라이드 이미지가 있는 곳. 버킷을 옮기면 이 한 줄을 바꾼다.
 */
export const IMAGE_ORIGIN = "https://praise-ppt-images.chambitstudio.com";

/** 곡 목록 JSON이 있는 곳. `public/praise-ppt/songs.json`이다. */
export const CATALOG_URL = "/praise-ppt/songs.json";

/**
 * 곡 목록 JSON의 한 항목. 원본 D1의 post id(양수)와 제목, 슬라이드 장수(1 이상)만 담는다.
 * 슬라이드 이미지 주소는 담지 않고 {@link catalogSong}이 규칙으로 다시 만든다.
 */
export type CatalogEntry = { id: number; title: string; slideCount: number };

/** 슬라이드 한 장 — 번호(0부터)와 이미지 주소. 주소는 R2 URL이거나 data URL이다. */
export type Slide = { index: number; image: string };

/**
 * 곡. 곡 목록의 곡(id 양수)과 올린 곡(id 음수)을 화면과 생성 계획이 똑같이 다룬다.
 * 둘은 슬라이드의 이미지 주소가 R2 URL인지 data URL인지만 다르다.
 */
export type Song = { id: number; title: string; slides: Slide[] };

/** 올린 곡의 id는 음수다. 곡 목록의 id(양수)와 겹치지 않는다. */
export function isUploadedId(id: number): boolean {
  return id < 0;
}

/** id로 곡을 찾는다. 곡 목록과 올린 곡을 함께 뒤진다. */
export type FindSong = (id: number) => Song | undefined;

/** 곡 목록 곡의 슬라이드를 R2 주소 규칙 `images/{id}/{n}.png`으로 다시 만든다. */
export function catalogSong({ id, title, slideCount }: CatalogEntry): Song {
  const slides = Array.from({ length: slideCount }, (_, index) => ({
    index,
    image: `${IMAGE_ORIGIN}/images/${id}/${index}.png`,
  }));
  return { id, title, slides };
}

/**
 * 내려받은 곡 목록 JSON의 모양을 검사한다. 틀리면 `null`이다 — 화면은 불러오기 실패로 본다.
 */
export function parseCatalog(value: unknown): CatalogEntry[] | null {
  if (!Array.isArray(value)) return null;
  const ok = value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      Number.isInteger(item.id) &&
      item.id > 0 &&
      typeof item.title === "string" &&
      Number.isInteger(item.slideCount) &&
      item.slideCount >= 1,
  );
  return ok ? (value as CatalogEntry[]) : null;
}
