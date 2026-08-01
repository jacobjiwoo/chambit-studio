"use client";

import { useCallback, useEffect, useRef } from "react";

/** 두 패널의 이름. 선택이 어느 쪽에서 왔는지 가리는 데만 쓴다 */
export type Pane = "script" | "subtitle";

/**
 * 담당자가 지금 짝을 맞춰 보고 있는 자막 장.
 *
 * **어느 패널에서 골랐는지를 함께 든다** — 건너편만 그 자리로 데려가고 방금 손댄 패널은
 * 가만히 두기 위해서다.
 */
export type Picked = { subtitle: number; from: Pane } | null;

/** 자막 장 번호에 DOM 자리를 등록한다. 두 패널이 같은 손잡이를 쓴다 */
export type RegisterMark = (subtitle: number, el: HTMLElement | null) => void;

/**
 * 건너편에서 고른 자막 장을 화면 안으로 데려온다.
 *
 * 두 패널이 각각 스크롤하므로 짝이 화면 밖에 있는 것이 예사다. 강조만 하고 데려오지 않으면
 * 담당자는 아무 일도 일어나지 않았다고 본다. 다만 **자기가 누른 패널은 건드리지 않는다** —
 * 방금 손댄 자리가 발밑에서 움직이면 어디를 보고 있었는지 잃는다.
 *
 * `picked`를 통째로 받는 이유는 **같은 장을 다시 누르는 것이 무의미한 클릭이 아니기**
 * 때문이다. 3번을 누른 뒤 손으로 스크롤해 3번을 화면 밖으로 밀어냈다면, 3번을 다시 누르는
 * 것은 "거기로 다시 데려다 달라"는 뜻이다. 장 번호만 보면 값이 그대로라 아무 일도 일어나지
 * 않는다 — 이 기능이 있어야 할 바로 그 자리에서 없는 것처럼 군다.
 */
export function useFollow(picked: Picked, mine: Pane): RegisterMark {
  const marks = useRef(new Map<number, HTMLElement>());

  const register = useCallback<RegisterMark>((subtitle, el) => {
    if (el) marks.current.set(subtitle, el);
    else marks.current.delete(subtitle);
  }, []);

  useEffect(() => {
    if (!picked || picked.from === mine) return;
    marks.current.get(picked.subtitle)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [picked, mine]);

  return register;
}
