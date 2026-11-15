"use client";

import * as React from "react";

import type { Spot, ViewKey } from "../_lib/device-figure";
import { OPEN_DEVICE_FIGURE } from "../_lib/device-figure-ids";
import type { Plugged } from "../_lib/device-figures";

export interface DialogSpot extends Spot {
  plugged: Plugged[];
}
export interface DialogView {
  key: ViewKey;
  width: number;
  height: number;
  label: string;
  spots: DialogSpot[];
  /** 서버에서 만든 그림 본문 */
  art: React.ReactNode;
}
export interface DialogFigure {
  id: string;
  model: string;
  caption: string;
  views: DialogView[];
}

const VIEW_LABEL: Record<ViewKey, string> = { front: "앞", back: "뒤" };

const spotOf = (target: EventTarget | null) => (target instanceof Element ? (target.closest("[data-spot]")?.getAttribute("data-spot") ?? null) : null);

/**
 * 장비 생김새 dialog. 앞·뒤 그림을 버튼으로 넘기고, 그림 속 단자·구역이나 아래 이름 목록을 누르면
 * 그 자리가 켜지고 이름이 보인다. 움직임은 없다.
 */
export function DeviceFigureDialog({ figures }: { figures: DialogFigure[] }) {
  const dialog = React.useRef<HTMLDialogElement | null>(null);
  const stage = React.useRef<HTMLDivElement | null>(null);
  const [id, setId] = React.useState<string | null>(null);
  const [viewKey, setViewKey] = React.useState<ViewKey>("front");
  const [picked, setPicked] = React.useState<string | null>(null);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const [large, setLarge] = React.useState(false);

  const figure = figures.find((entry) => entry.id === id) ?? null;
  const view = figure?.views.find((entry) => entry.key === viewKey) ?? figure?.views[0] ?? null;
  const active = hovered ?? picked;
  const activeSpot = view?.spots.find((spot) => spot.name === active) ?? null;

  React.useEffect(() => {
    const open = (event: Event) => {
      const wanted = (event as CustomEvent<string>).detail;
      if (!figures.some((entry) => entry.id === wanted)) return;
      setId(wanted);
      setViewKey("front");
      setPicked(null);
      setHovered(null);
      setLarge(false);
      if (!dialog.current?.open) dialog.current?.showModal();
    };
    window.addEventListener(OPEN_DEVICE_FIGURE, open);
    return () => window.removeEventListener(OPEN_DEVICE_FIGURE, open);
  }, [figures]);

  // 켜진 이름의 부품만 밝힌다. 그림은 서버가 만든 SVG라 속성으로 켠다
  React.useEffect(() => {
    const root = stage.current;
    if (!root) return;
    for (const part of root.querySelectorAll<SVGGElement>("[data-spot]")) {
      const on = active !== null && part.getAttribute("data-spot") === active;
      part.toggleAttribute("data-on", on);
      for (const solid of part.querySelectorAll(".iso-solid")) solid.toggleAttribute("data-lit", on);
    }
  }, [active, view]);

  // 고른 자리가 옆으로 밀려 안 보이면(휴대폰, 크게 보기) 그림을 그쪽으로 민다
  React.useEffect(() => {
    const root = stage.current;
    if (!root || picked === null || root.scrollWidth <= root.clientWidth) return;
    const part = [...root.querySelectorAll<SVGGElement>("[data-spot]")].find((entry) => entry.getAttribute("data-spot") === picked);
    if (!part) return;
    const [box, frame] = [part.getBoundingClientRect(), root.getBoundingClientRect()];
    if (box.left >= frame.left && box.right <= frame.right) return;
    root.scrollLeft += box.left + box.width / 2 - (frame.left + frame.width / 2);
  }, [picked, view, large]);

  const show = (key: ViewKey) => {
    setViewKey(key);
    setPicked(null);
    setHovered(null);
  };

  return (
    <dialog ref={dialog} className="iso device-dialog" aria-label={figure ? `${figure.id} 생김새` : "장비 생김새"} onClose={() => setId(null)} onClick={(event) => event.target === dialog.current && dialog.current?.close()}>
      {figure && view ? (
        <div className="device-body">
          <header className="device-head">
            <p className="device-title">
              {figure.id} <span className="device-model">{figure.model}</span>
            </p>
            <button type="button" className="device-close" onClick={() => dialog.current?.close()}>
              닫기
            </button>
          </header>

          <div className="device-bar">
            <div className="device-tabs" role="tablist" aria-label="보는 방향">
              {figure.views.map((entry) => (
                <button key={entry.key} type="button" role="tab" className="device-tab" aria-selected={entry.key === view.key} onClick={() => show(entry.key)}>
                  {VIEW_LABEL[entry.key]}
                </button>
              ))}
            </div>
            <button type="button" className="device-zoom" aria-pressed={large} onClick={() => setLarge((value) => !value)}>
              {large ? "맞춰 보기" : "크게 보기"}
            </button>
          </div>

          <div className="iso-plate device-plate">
            <div className="iso-plate-corners" aria-hidden="true">
              <span className="iso-plate-corner" data-corner="fig">
                {VIEW_LABEL[view.key]}
              </span>
              <span className="iso-plate-corner" data-corner="title">
                {figure.model}
              </span>
              <span className="iso-plate-corner" data-corner="readout">
                {active ?? "눌러서 이름 보기"}
              </span>
            </div>
            <div ref={stage} className="device-stage" data-large={large ? "" : undefined}>
              <svg
                className="iso-svg"
                viewBox={`0 0 ${view.width} ${view.height}`}
                role="img"
                aria-label={view.label}
                focusable="false"
                onClick={(event) => {
                  const name = spotOf(event.target);
                  setPicked((current) => (name === current ? null : name));
                }}
                onPointerOver={(event) => event.pointerType === "mouse" && setHovered(spotOf(event.target))}
                onPointerLeave={() => setHovered(null)}
              >
                {view.art}
              </svg>
            </div>
          </div>

          <p className="device-active" aria-live="polite">
            {activeSpot ? (
              <>
                <span className="device-name">{activeSpot.name}</span>
                {activeSpot.note ? <span className="device-note"> {activeSpot.note}</span> : null}
              </>
            ) : (
              <span className="device-note">그림이나 아래 이름을 누르면 그 자리가 켜진다.</span>
            )}
          </p>

          <ul className="device-spots">
            {view.spots.map((spot) => (
              <li key={spot.name}>
                <button type="button" className="device-spot" aria-pressed={spot.name === picked} onClick={() => setPicked((current) => (current === spot.name ? null : spot.name))}>
                  <span className="device-name">{spot.name}</span>
                  {spot.plugged.map((entry) => (
                    <span key={`${entry.direction}-${entry.other}`} className="device-plugged">
                      {entry.direction === "in" ? "들어옴" : "나감"}: {entry.other}
                    </span>
                  ))}
                </button>
              </li>
            ))}
          </ul>

          <p className="device-caption">{figure.caption}</p>
        </div>
      ) : null}
    </dialog>
  );
}
