"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_BACKGROUND, type Background } from "../_lib/background";
import { planSlides } from "../_lib/plan";
import { appliedBackground } from "../_lib/setlist";
import { catalogSong, isUploadedId, type FindSong, type Slide, type Song } from "../_lib/song";
import { BackgroundDrawer } from "./background-drawer";
import { Build } from "./build";
import { useCatalog } from "./catalog";
import { CommonBackgroundBar } from "./common-background-bar";
import { PptUpload } from "./ppt-upload";
import { Search } from "./search";
import { SetlistDetail } from "./setlist-detail";
import { SetlistOrder } from "./setlist-order";
import { setlistActions, useSetlist } from "./setlist-state";
import { SlideEditor } from "./slide-editor";

/** 열린 서랍. 한 번에 하나만 열린다. */
type Drawer =
  | { kind: "slides"; songId: number }
  | { kind: "common-background" }
  | { kind: "song-background"; songId: number }
  | null;

/**
 * 찬양 PPT 루트. 셋리스트·곡 목록·올린 곡·공통 배경·열린 서랍을 한곳에 들고 각 구역에
 * props로 나눠 준다. 구역은 루트를 고치지 않고 props만으로 끝낼 수 있어야 한다.
 */
export function PraisePpt() {
  const catalog = useCatalog();
  const setlist = useSetlist();
  const [uploaded, setUploaded] = useState<Song[]>([]);
  // 올린 곡 id. 곡 목록의 id(양수)와 겹치지 않게 -1부터 하나씩 줄인다
  const nextUploadId = useRef(-1);
  const [commonBackground, setCommonBackground] = useState<Background>(DEFAULT_BACKGROUND);
  const [drawer, setDrawer] = useState<Drawer>(null);

  const catalogById = useMemo(
    () =>
      catalog.status === "success"
        ? new Map(catalog.songs.map((s) => [s.id, s]))
        : new Map<number, never>(),
    [catalog],
  );

  // 불러온 곡 목록에 없는 곡을 셋리스트에서 뺀다. 실패면 손대지 않는다
  useEffect(() => {
    if (catalog.status === "success") setlistActions.pruneMissing(new Set(catalogById.keys()));
  }, [catalog, catalogById]);

  const findSong: FindSong = useCallback(
    (id) => {
      if (isUploadedId(id)) return uploaded.find((s) => s.id === id);
      const entry = catalogById.get(id);
      return entry && catalogSong(entry);
    },
    [catalogById, uploaded],
  );

  const plan = useMemo(
    () => planSlides(setlist, findSong, commonBackground),
    [setlist, findSong, commonBackground],
  );
  const slideTotal = plan.ok ? plan.slides.length : 0;

  const isInSetlist = (songId: number) => setlist.some((e) => e.songId === songId);

  const addUploadedSong = (title: string, slides: Slide[]) => {
    const id = nextUploadId.current--;
    setUploaded((songs) => [...songs, { id, title, slides }]);
    setlistActions.add(id);
  };

  const closeDrawer = () => setDrawer(null);

  return (
    <main>
      <header>
        <h1>찬양 PPT</h1>
        <Build songCount={setlist.length} plan={plan} />
      </header>

      <Search catalog={catalog} isInSetlist={isInSetlist} onToggleSong={setlistActions.toggle} />
      <PptUpload onAddSong={addUploadedSong} />

      <SetlistOrder
        setlist={setlist}
        findSong={findSong}
        onRemove={setlistActions.remove}
        onMove={setlistActions.move}
      />

      <SetlistDetail
        setlist={setlist}
        findSong={findSong}
        commonBackground={commonBackground}
        slideTotal={slideTotal}
        commonBackgroundBar={
          <CommonBackgroundBar
            background={commonBackground}
            onOpen={() => setDrawer({ kind: "common-background" })}
          />
        }
        onClearAll={setlistActions.clear}
        onOpenSlideEditor={(songId) => setDrawer({ kind: "slides", songId })}
        onOpenSongBackground={(songId) => setDrawer({ kind: "song-background", songId })}
      />

      {renderDrawer()}
    </main>
  );

  function renderDrawer() {
    if (drawer === null) return null;

    if (drawer.kind === "common-background") {
      return (
        <BackgroundDrawer
          key="common"
          target={{ scope: "common" }}
          background={commonBackground}
          onChange={setCommonBackground}
          onClose={closeDrawer}
        />
      );
    }

    // 곡에 대한 서랍은 그 곡이 셋리스트에 있고 찾을 수 있을 때만 그린다. 범위나 곡이 바뀌면
    // `key`가 바뀌어 서랍을 새로 연다 — 앞 서랍의 내부 상태가 이어지지 않는다
    const { songId } = drawer;
    const entry = setlist.find((e) => e.songId === songId);
    const song = findSong(songId);
    if (!entry || !song) return null;

    if (drawer.kind === "slides") {
      return (
        <SlideEditor
          key={song.id}
          song={song}
          entry={entry}
          commonBackground={commonBackground}
          onToggleSlide={(index) => setlistActions.toggleSlide(song.id, index)}
          onIncludeAll={() => setlistActions.includeAll(song.id)}
          onExcludeAll={() =>
            setlistActions.excludeAll(
              song.id,
              song.slides.map((s) => s.index),
            )
          }
          onClose={closeDrawer}
        />
      );
    }

    return (
      <BackgroundDrawer
        key={song.id}
        target={{
          scope: "song",
          title: song.title,
          hasSongBackground: entry.background !== undefined,
          onResetToCommon: () => setlistActions.clearBackground(song.id),
        }}
        background={appliedBackground(entry, commonBackground)}
        onChange={(background) => setlistActions.setBackground(song.id, background)}
        onClose={closeDrawer}
      />
    );
  }
}
