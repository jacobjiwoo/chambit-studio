/**
 * 장비 생김새 그림 모음과, 그림 속 단자를 `system.ts`의 연결과 잇는 대조.
 *
 * 그림이 있는 장비의 연결에 `port`가 적혀 있으면 그 단자에 "무엇이 꽂혀 있는지"를 보인다.
 * `port`가 빈 연결은 보이지 않는다. 추정으로 꽂힌 자리를 그리지 않기 위해서다.
 */
import { AV_HS410_FIGURE } from "./av-hs410-figure";
import type { DeviceFigure } from "./device-figure";
import { RC_IP100_FIGURE } from "./rc-ip100-figure";
import { connections, type AnyEndpoint, type AnyLink } from "./system";

export const DEVICE_FIGURES: readonly DeviceFigure[] = [AV_HS410_FIGURE, RC_IP100_FIGURE];

/** 단자에 꽂힌 상대 하나 */
export interface Plugged {
  /** 이 장비로 들어오면 "in", 나가면 "out" */
  direction: "in" | "out";
  /** 상대 끝점 */
  other: string;
  signal?: string;
}

function nameOf(end: AnyEndpoint): string {
  if ("unknown" in end) return end.unknown;
  return [end.unit ?? end.id, end.port].filter(Boolean).join(" ");
}

/** 데이터의 단자 표기 → 매뉴얼의 단자 이름 */
export function portNameOf(figure: Pick<DeviceFigure, "aliases">, port: string): string {
  return figure.aliases[port] ?? port;
}

/** 그 장비의 연결 중 `port`가 적힌 끝점들의 단자 표기(데이터에 적힌 그대로) */
export function portsInData(id: string, links: readonly AnyLink[] = connections): string[] {
  const ports: string[] = [];
  for (const link of links) {
    for (const end of [link.from, link.to]) {
      if (!("unknown" in end) && end.id === id && end.port) ports.push(end.port);
    }
  }
  return ports;
}

/** 단자 이름 → 거기 꽂힌 상대들 */
export function pluggedInto(figure: Pick<DeviceFigure, "id" | "aliases">, links: readonly (AnyLink & { signal?: string })[] = connections): Record<string, Plugged[]> {
  const plugged: Record<string, Plugged[]> = {};
  for (const link of links) {
    const ends: Array<[AnyEndpoint, AnyEndpoint, Plugged["direction"]]> = [
      [link.to, link.from, "in"],
      [link.from, link.to, "out"],
    ];
    for (const [mine, other, direction] of ends) {
      if ("unknown" in mine || mine.id !== figure.id || !mine.port) continue;
      (plugged[portNameOf(figure, mine.port)] ??= []).push({ direction, other: nameOf(other), ...(link.signal ? { signal: link.signal } : {}) });
    }
  }
  return plugged;
}
