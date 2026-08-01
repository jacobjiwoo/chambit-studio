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

/**
 * 「원고에서 보기 →」가 가리키는 원고의 자리 — **문단**이다.
 *
 * 걸러낸 조각도 모르는 색도 제가 나온 문단을 달고 나오고(`Dropped`·`UnknownColor`), 그 대부분은
 * 자막이 되지 못한 문단이라 장 번호로는 가리킬 자리가 없다.
 *
 * 같은 항목을 다시 눌러도 **새 객체**가 들어간다 — `Picked`와 같은 이유다.
 */
export type Revealed = { paragraph: number } | null;

/** 번호에 DOM 자리를 등록한다. 무엇의 번호인지는 부르는 쪽이 안다(자막 장 · 문단) */
export type RegisterMark = (key: number, el: HTMLElement | null) => void;

/** 번호 → DOM 자리 장부. 아래 두 통로가 각자 하나씩 든다. */
function useMarks() {
  const marks = useRef(new Map<number, HTMLElement>());

  const register = useCallback<RegisterMark>((key, el) => {
    if (el) marks.current.set(key, el);
    else marks.current.delete(key);
  }, []);

  return { marks, register };
}

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
  const { marks, register } = useMarks();

  useEffect(() => {
    if (!picked || picked.from === mine) return;
    marks.current.get(picked.subtitle)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [picked, mine, marks]);

  return register;
}

/**
 * 노란 깜빡임 — 두 번 번쩍이고 사라진다. (`#fef08a` = Tailwind `yellow-200`)
 *
 * 스크롤만으로는 **어느 줄을 보라는 것인지** 말하지 못한다. 화면 한가운데로 데려다 놓아도
 * 문단 100개짜리 원고에서는 비슷하게 생긴 줄이 위아래로 널려 있다. 색이 남지 않고 지나가는
 * 이유는 이것이 원고의 표기가 아니라 **부름**이기 때문이다 — 자국을 남기면 셋으로 갈린
 * 표기(취소선 · 물결 밑줄 · 원래 색)에 넷째가 끼어든다.
 */
const BLINK: Keyframe[] = [
  { backgroundColor: "#fef08a" },
  { backgroundColor: "transparent" },
  { backgroundColor: "#fef08a" },
  { backgroundColor: "transparent" },
];

/**
 * 칩에서 고른 항목이 나온 **원고의 문단**으로 데려가 노란 깜빡임으로 알린다.
 *
 * `useFollow`와 통로가 다르다. 저쪽은 두 패널이 서로를 따라가는 것이라 "자기가 누른 패널은
 * 건드리지 않는다"가 성립하지만, 이쪽은 부르는 쪽(칩)과 가는 쪽(원고)이 애초에 다른 자리라
 * 그런 사정이 없다. 대신 깜빡임이 필요하다 — 담당자가 칩을 눌렀을 때 원고 패널이 이미 그
 * 자리에 있으면 스크롤이 아무 일도 하지 않고, 그러면 눌러도 아무 반응이 없는 것처럼 보인다.
 *
 * **여기서만 스크롤이 부드럽지 않다.** 스펙이 "그 자리로 스크롤한 **뒤** 깜빡임"이라 못
 * 박았는데, 부드러운 스크롤은 끝나는 시각을 알려주지 않는다 — 문단 100개를 가로지르는 동안
 * 깜빡임이 혼자 끝나 버리면 담당자가 도착했을 때 화면에는 아무 표시도 남아 있지 않다. 즉시
 * 옮겨 놓고 그 자리에서 번쩍이면 순서가 어긋날 여지가 없다. `useFollow` 쪽이 부드러운 것은
 * 그쪽이 부름이 아니라 **따라가기**이고 도착한 자리에 강조가 계속 남아 있기 때문이다.
 */
export function useReveal(revealed: Revealed): RegisterMark {
  const { marks, register } = useMarks();

  useEffect(() => {
    if (!revealed) return;

    const el = marks.current.get(revealed.paragraph);
    if (!el) return;

    el.scrollIntoView({ block: "center" });
    el.animate(BLINK, { duration: 1100, easing: "ease-out" });
  }, [revealed, marks]);

  return register;
}
