import { isBackground, type Background } from "./background";
import { isUploadedId } from "./song";

/**
 * 셋리스트 한 항목 — 곡 하나와 뺀 슬라이드 번호, 곡별 배경. 곡별 배경이 없으면 공통 배경을 쓴다.
 */
export type SetlistEntry = {
  songId: number;
  excluded: ReadonlySet<number>;
  background?: Background;
};

/** 순서가 곧 예배 순서다. 조작은 전부 새 배열을 돌려준다. */
export type Setlist = readonly SetlistEntry[];

export const SETLIST_STORAGE_KEY = "praise-ppt:setlist";

/** 그 곡에 깔릴 배경 — 곡별 배경, 없으면 공통 배경. 썸네일과 생성 계획이 함께 쓴다. */
export function appliedBackground(entry: SetlistEntry, common: Background): Background {
  return entry.background ?? common;
}

/** 맨 뒤에 담는다. 이미 있으면 그대로다. */
export function addSong(setlist: Setlist, songId: number): Setlist {
  if (setlist.some((e) => e.songId === songId)) return setlist;
  return [...setlist, { songId, excluded: new Set() }];
}

export function removeSong(setlist: Setlist, songId: number): Setlist {
  return setlist.filter((e) => e.songId !== songId);
}

/** 있으면 빼고 없으면 맨 뒤에 담는다. */
export function toggleSong(setlist: Setlist, songId: number): Setlist {
  return setlist.some((e) => e.songId === songId)
    ? removeSong(setlist, songId)
    : addSong(setlist, songId);
}

/** `from` 자리의 곡을 `to` 자리로 옮긴다. 같은 자리거나 범위 밖이면 그대로다. */
export function moveSong(setlist: Setlist, from: number, to: number): Setlist {
  const inRange = (i: number) => i >= 0 && i < setlist.length;
  if (from === to || !inRange(from) || !inRange(to)) return setlist;
  const next = [...setlist];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function updateEntry(
  setlist: Setlist,
  songId: number,
  update: (entry: SetlistEntry) => SetlistEntry,
): Setlist {
  return setlist.map((e) => (e.songId === songId ? update(e) : e));
}

export function toggleSlide(setlist: Setlist, songId: number, index: number): Setlist {
  return updateEntry(setlist, songId, (e) => {
    const excluded = new Set(e.excluded);
    if (!excluded.delete(index)) excluded.add(index);
    return { ...e, excluded };
  });
}

export function includeAllSlides(setlist: Setlist, songId: number): Setlist {
  return updateEntry(setlist, songId, (e) => ({ ...e, excluded: new Set() }));
}

/** 그 곡의 슬라이드 번호 전부(`indices`)를 뺀다. */
export function excludeAllSlides(
  setlist: Setlist,
  songId: number,
  indices: readonly number[],
): Setlist {
  return updateEntry(setlist, songId, (e) => ({ ...e, excluded: new Set(indices) }));
}

export function setSongBackground(
  setlist: Setlist,
  songId: number,
  background: Background,
): Setlist {
  return updateEntry(setlist, songId, (e) => ({ ...e, background }));
}

export function clearSongBackground(setlist: Setlist, songId: number): Setlist {
  return updateEntry(setlist, songId, ({ songId, excluded }) => ({ songId, excluded }));
}

/**
 * 곡 목록을 불러온 뒤, 곡 목록에 없는 곡 목록 곡(`songId >= 0`)을 뺀다. 올린 곡은 남긴다.
 */
export function pruneMissing(setlist: Setlist, catalogIds: ReadonlySet<number>): Setlist {
  return setlist.filter((e) => isUploadedId(e.songId) || catalogIds.has(e.songId));
}

type StoredEntry = { songId: number; excludedSlideIndices: number[]; background?: Background };

/**
 * localStorage에 넣을 문자열. 올린 곡(`songId < 0`)은 뺀다 — 새로고침하면 슬라이드 데이터가
 * 없어 유령 항목이 되기 때문이다.
 */
export function serializeSetlist(setlist: Setlist): string {
  const stored: StoredEntry[] = setlist
    .filter((e) => !isUploadedId(e.songId))
    .map(({ songId, excluded, background }) => ({
      songId,
      excludedSlideIndices: [...excluded],
      ...(background && { background }),
    }));
  return JSON.stringify(stored);
}

function isStoredEntry(value: unknown): value is StoredEntry {
  if (typeof value !== "object" || value === null) return false;
  const { songId, excludedSlideIndices, background } = value as Record<string, unknown>;
  return (
    typeof songId === "number" &&
    Array.isArray(excludedSlideIndices) &&
    excludedSlideIndices.every((i) => typeof i === "number") &&
    (background === undefined || isBackground(background))
  );
}

/**
 * localStorage 값을 읽는다. 없거나 깨졌거나 모양이 틀리면 빈 셋리스트다. 같은 곡이 두 번
 * 있는 것도 틀린 모양이다 — 조작으로는 생기지 않는다.
 */
export function parseSetlist(raw: string | null): Setlist {
  if (!raw) return [];
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(value) || !value.every(isStoredEntry)) return [];
  if (new Set(value.map((e) => e.songId)).size !== value.length) return [];
  return value.map(({ songId, excludedSlideIndices, background }) => ({
    songId,
    excluded: new Set(excludedSlideIndices),
    ...(background && { background }),
  }));
}
