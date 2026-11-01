import { useSyncExternalStore } from "react";

import type { Background } from "../_lib/background";
import {
  SETLIST_STORAGE_KEY,
  addSong,
  clearSongBackground,
  excludeAllSlides,
  includeAllSlides,
  moveSong,
  parseSetlist,
  pruneMissing,
  removeSong,
  serializeSetlist,
  setSongBackground,
  toggleSlide,
  toggleSong,
  type Setlist,
} from "../_lib/setlist";

/**
 * 셋리스트를 React와 localStorage에 잇는다. 조작은 `_lib/setlist`의 순수 함수가 다 하고,
 * 여기서는 지금 값을 들고 바뀔 때마다 저장만 한다.
 *
 * 메모리의 값이 기준이고 localStorage는 사본이다 — 올린 곡은 저장하지 않지만 세션 안에서는
 * 셋리스트에 있어야 하고, 저장이 실패해도(private 모드, 용량 초과) 화면은 계속 돌아야 한다.
 *
 * 정적 export라 서버에서 그린 HTML은 빈 셋리스트다. `useSyncExternalStore`가 hydration 때
 * 서버 값을 쓰고 그 뒤에 localStorage 값으로 다시 그린다.
 */
let current: Setlist | null = null;
const listeners = new Set<() => void>();
const EMPTY: Setlist = [];

function read(): Setlist {
  if (current === null) {
    try {
      current = parseSetlist(window.localStorage.getItem(SETLIST_STORAGE_KEY));
    } catch {
      current = EMPTY;
    }
  }
  return current;
}

function write(update: (setlist: Setlist) => Setlist) {
  const before = read();
  const next = update(before);
  if (next === before) return;
  current = next;
  try {
    window.localStorage.setItem(SETLIST_STORAGE_KEY, serializeSetlist(next));
  } catch {
    // 저장만 실패한다. 메모리의 셋리스트는 그대로 쓴다
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 셋리스트 조작. 곡 하나에 대한 것은 `songId`를 받는다. */
export const setlistActions = {
  add: (songId: number) => write((s) => addSong(s, songId)),
  remove: (songId: number) => write((s) => removeSong(s, songId)),
  toggle: (songId: number) => write((s) => toggleSong(s, songId)),
  move: (from: number, to: number) => write((s) => moveSong(s, from, to)),
  toggleSlide: (songId: number, index: number) => write((s) => toggleSlide(s, songId, index)),
  includeAll: (songId: number) => write((s) => includeAllSlides(s, songId)),
  excludeAll: (songId: number, indices: readonly number[]) =>
    write((s) => excludeAllSlides(s, songId, indices)),
  setBackground: (songId: number, background: Background) =>
    write((s) => setSongBackground(s, songId, background)),
  clearBackground: (songId: number) => write((s) => clearSongBackground(s, songId)),
  pruneMissing: (catalogIds: ReadonlySet<number>) => write((s) => pruneMissing(s, catalogIds)),
  clear: () => write(() => EMPTY),
};

export function useSetlist(): Setlist {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
