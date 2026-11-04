"use client";

import * as React from "react";

import { CAMERAS, REST, layersOf, readoutOf, tourAt, type CgState } from "../_lib/cg-output-model";
import { IsoFigure } from "./anatomy/draw";
import { asksForStillness, useReadout } from "./anatomy/live";

/** DSK가 다 얹히는 데 걸리는 시간(초). 오려 내기와 채우기를 눈으로 따라갈 만큼 느리게 둔다 */
const KEYING = 1.1;
/** 카메라 전환의 짧은 크로스페이드(초) */
const CUT = 0.12;
/** 손을 뗀 뒤 투어가 다시 도는 데까지(밀리초) */
const TOUR_BACK = 4000;
const TOUR_FIRST = 1200;
const LONGEST_FRAME = 1 / 30;

interface Nodes {
  scenes: SVGGElement[];
  hole: SVGGElement | null;
  fill: SVGGElement | null;
  cams: SVGGElement[];
  dsk: SVGGElement | null;
}

const solidOf = (part: SVGGElement | null) => part?.querySelector(".iso-solid") ?? null;

function setLit(part: SVGGElement | null, on: boolean, press: string) {
  if (!part) return;
  const solid = solidOf(part);
  if (on) {
    part.setAttribute("transform", press);
    solid?.setAttribute("data-lit", "");
  } else {
    part.removeAttribute("transform");
    solid?.removeAttribute("data-lit");
  }
}

interface Props {
  width: number;
  height: number;
  label: string;
  /** 눌린 버튼이 내려가는 만큼의 transform */
  press: string;
  children: React.ReactNode;
}

export function CgOutputLive({ width, height, label, press, children }: Props) {
  const { anchor: anchorRef, say } = useReadout<HTMLDivElement>();
  const root = React.useRef<HTMLDivElement | null>(null);
  const nodes = React.useRef<Nodes>({ scenes: [], hole: null, fill: null, cams: [], dsk: null });
  const target = React.useRef<CgState>({ ...REST });
  const keyed = React.useRef(0);
  const shown = React.useRef<number[]>(Array.from({ length: CAMERAS }, (_, index) => (index === REST.camera ? 1 : 0)));
  const frame = React.useRef(0);
  const last = React.useRef(0);
  const clock = React.useRef(0);
  const touring = React.useRef(false);
  const [visible, setVisible] = React.useState(false);
  const [engaged, setEngaged] = React.useState(false);
  const [poke, setPoke] = React.useState(0);

  const draw = React.useCallback(() => {
    const { scenes, hole, fill, cams, dsk } = nodes.current;
    scenes.forEach((scene, index) => {
      const value = `${Math.round(shown.current[index] * 1000) / 1000}`;
      if (scene.style.opacity !== value) scene.style.opacity = value;
    });
    const layers = layersOf(keyed.current);
    if (hole) hole.style.opacity = `${layers.hole}`;
    if (fill) fill.style.opacity = `${layers.fill}`;
    cams.forEach((cam, index) => setLit(cam, index === target.current.camera, press));
    setLit(dsk, target.current.dsk, press);
    say(readoutOf(target.current));
  }, [press, say]);

  const step = React.useCallback((dt: number, calm: boolean) => {
    if (touring.current) {
      clock.current += dt;
      target.current = tourAt(clock.current);
    }
    const want = target.current.dsk ? 1 : 0;
    keyed.current = calm ? want : want > keyed.current ? Math.min(want, keyed.current + dt / KEYING) : Math.max(want, keyed.current - dt / KEYING);
    let moving = keyed.current !== want;
    shown.current = shown.current.map((value, index) => {
      const goal = index === target.current.camera ? 1 : 0;
      const next = calm ? goal : value + (goal - value) * (1 - Math.exp(-dt / CUT));
      const settled = Math.abs(goal - next) < 0.002 ? goal : next;
      if (settled !== goal) moving = true;
      return settled;
    });
    draw();
    return moving || touring.current;
  }, [draw]);

  const run = React.useCallback(() => {
    if (frame.current) return;
    last.current = 0;
    const tick = (now: number) => {
      const dt = last.current ? Math.min((now - last.current) / 1000, LONGEST_FRAME) : 1 / 60;
      last.current = now;
      frame.current = step(dt, asksForStillness()) ? requestAnimationFrame(tick) : 0;
    };
    frame.current = requestAnimationFrame(tick);
  }, [step]);

  const stop = React.useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
  }, []);

  React.useEffect(() => {
    const node = root.current;
    if (!node) return;
    nodes.current = {
      scenes: Array.from(node.querySelectorAll<SVGGElement>(".cg-scene")),
      hole: node.querySelector<SVGGElement>(".cg-hole"),
      fill: node.querySelector<SVGGElement>(".cg-fill"),
      cams: Array.from({ length: CAMERAS }, (_, index) => node.querySelector<SVGGElement>(`[data-part="cam-${index}"]`)).filter((cam): cam is SVGGElement => Boolean(cam)),
      dsk: node.querySelector<SVGGElement>('[data-part="dsk"]'),
    };
    draw();
    const observer = new IntersectionObserver((entries) => setVisible(Boolean(entries.at(-1)?.isIntersecting)));
    observer.observe(node);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [draw, stop]);

  React.useEffect(() => {
    if (!visible) {
      touring.current = false;
      stop();
      return;
    }
    if (engaged || asksForStillness()) {
      touring.current = false;
      return;
    }
    const timer = window.setTimeout(
      () => {
        clock.current = 0;
        touring.current = true;
        run();
      },
      poke ? TOUR_BACK : TOUR_FIRST,
    );
    return () => {
      window.clearTimeout(timer);
      touring.current = false;
    };
  }, [visible, engaged, poke, run, stop]);

  const steer = (next: Partial<CgState>) => {
    touring.current = false;
    setPoke((count) => count + 1);
    target.current = { ...target.current, ...next };
    run();
  };

  return (
    <div
      ref={(node) => {
        root.current = node;
        anchorRef.current = node;
      }}
      className="cg-live"
      role="group"
      tabIndex={0}
      aria-label="CG 출력 모형. Space로 DSK를 켜고 끄고, 1부터 4로 카메라를 고른다"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setEngaged(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setEngaged(false);
      }}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
      onClick={(event) => {
        const part = (event.target as Element).closest("[data-part]")?.getAttribute("data-part") ?? "";
        const camera = part.startsWith("cam-") ? Number(part.slice(4)) : -1;
        if (camera >= 0) steer({ camera });
        else steer({ dsk: !target.current.dsk });
      }}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          if (!event.repeat) steer({ dsk: !target.current.dsk });
          return;
        }
        const number = Number(event.key);
        if (Number.isInteger(number) && number >= 1 && number <= CAMERAS) {
          steer({ camera: number - 1 });
          return;
        }
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          const by = event.key === "ArrowRight" ? 1 : CAMERAS - 1;
          steer({ camera: (target.current.camera + by) % CAMERAS });
        }
      }}
    >
      <IsoFigure width={width} height={height} label={label}>
        {children}
      </IsoFigure>
    </div>
  );
}
