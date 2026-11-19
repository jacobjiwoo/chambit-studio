import { existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import * as A from "./anatomy/audit.mjs";
import { settleView, type StoredOrder } from "./device-figure";
import { figureFileName, figureSvgs } from "./device-figure-files";
import { DEVICE_FIGURE_IDS } from "./device-figure-ids";
import { DEVICE_FIGURES, pluggedInto, portNameOf, portsInData } from "./device-figures";
import { equipment } from "./system";

describe("장비 생김새 그림", () => {
  it("그림이 있는 장비 id 목록이 그림 모음과 같다", () => {
    expect(DEVICE_FIGURES.map((figure) => figure.id)).toEqual([...DEVICE_FIGURE_IDS]);
  });

  it("그림의 장비 id가 모두 장비 데이터에 있다", () => {
    const ids = equipment.map((item) => item.id);
    for (const figure of DEVICE_FIGURES) expect(ids).toContain(figure.id);
  });

  it("그림 파일 이름이 겹치지 않고 모듈 이름 `<slug>-figure.ts`와 같다", () => {
    const names = DEVICE_FIGURES.map(figureFileName);
    expect(new Set(names).size).toBe(names.length);
    for (const figure of DEVICE_FIGURES) {
      expect(figure.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(existsSync(fileURLToPath(new URL(`./${figure.slug}-figure.ts`, import.meta.url))), figure.slug).toBe(true);
    }
  });

  it.each(DEVICE_FIGURES.map((figure) => [figure.id, figure] as const))("%s: 그림 파일에 시점마다 SVG가 있다", (_, figure) => {
    const svgs = figureSvgs(figure);
    for (const view of figure.views) expect(svgs[view.key]).toBe(view.svg);
  });

  it.each(DEVICE_FIGURES.map((figure) => [figure.id, figure] as const))("%s: 앞·뒤 두 시점이 있고 처음은 앞이다", (_, figure) => {
    expect(figure.views.map((view) => view.key)).toEqual(["front", "back"]);
  });

  // 단자는 대개 뒤 그림에 있지만, 두 끝에 나뉜 장비(Mini Converter)는 앞·뒤에 나눠 그린다
  it.each(DEVICE_FIGURES.map((figure) => [figure.id, figure] as const))("%s: 매뉴얼의 단자가 모두 그림에 이름과 함께 그려져 있다", (_, figure) => {
    const names = figure.views.flatMap((view) => view.spots.filter((spot) => spot.kind === "port").map((spot) => spot.name));
    expect(names).toEqual(figure.ports);
    for (const view of figure.views) {
      for (const spot of view.spots.filter((entry) => entry.kind === "port")) expect(view.svg).toContain(`data-spot="${spot.name.replace(/&/g, "&amp;")}"`);
    }
  });

  it.each(DEVICE_FIGURES.map((figure) => [figure.id, figure] as const))("%s: 이름 목록의 구역·단자가 모두 그림 속에 있다", (_, figure) => {
    for (const view of figure.views) {
      for (const spot of view.spots) expect(view.svg, `${view.key}: ${spot.name}`).toContain(`data-spot="${spot.name.replace(/&/g, "&amp;")}"`);
    }
  });

  it.each(DEVICE_FIGURES.map((figure) => [figure.id, figure] as const))("%s: 연결 데이터의 port가 모두 매뉴얼의 단자 이름이다", (_, figure) => {
    for (const port of portsInData(figure.id)) expect(figure.ports, `port "${port}"`).toContain(portNameOf(figure, port));
  });

  it.each(DEVICE_FIGURES.map((figure) => [figure.id, figure] as const))("%s: 표기 대응표는 매뉴얼의 단자만 가리킨다", (_, figure) => {
    for (const name of Object.values(figure.aliases)) expect(figure.ports).toContain(name);
  });

  // 시점 하나에 1분쯤 걸려 평소에는 건너뛴다. 그림을 고친 뒤 `ANATOMY_AUDIT=1 pnpm test`로 돌린다
  it.skipIf(!process.env.ANATOMY_AUDIT).each(DEVICE_FIGURES.flatMap((figure) => figure.views.map((view) => [`${figure.id} ${view.key}`, view] as const)))(
    "%s: anatomy audit을 통과한다",
    (_, view) => {
      settleView(view);
      const result = A.auditOrExit(view.recorder as never, view.P as never, { argv: ["--audit"] });
      expect(result ? A.failures(result as never) : 1).toBe(0);
    },
    600_000,
  );

  // 그림을 고치면 저장된 순서가 낡는다. 그대로 두면 틀리지는 않지만 불러올 때마다 다시 재느라 느리다
  it("저장해 둔 그리는 순서가 그림과 맞는다. 어긋나면 `UPDATE_FIGURE_ORDER=1 pnpm test`로 고친다", () => {
    const views = DEVICE_FIGURES.flatMap((figure) => figure.views);
    if (process.env.UPDATE_FIGURE_ORDER) {
      const stored: Record<string, StoredOrder> = Object.fromEntries(views.map((view) => [view.order.name, { hash: view.order.hash, order: view.order.order }]));
      const lines = Object.entries(stored).map(([name, value]) => `  ${JSON.stringify(name)}: ${JSON.stringify(value)}`);
      writeFileSync(fileURLToPath(new URL("./device-figure-order.json", import.meta.url)), `{\n${lines.join(",\n")}\n}\n`);
      return;
    }
    expect(views.filter((view) => !view.order.stored).map((view) => view.order.name)).toEqual([]);
  });

  it("port가 적힌 연결만 단자에 꽂힌 것으로 보인다", () => {
    const figure = { id: "스위처", aliases: { "SDI IN1": "SDI INPUTS 1" } };
    const plugged = pluggedInto(figure, [
      { from: { id: "CAM1" }, to: { id: "스위처", port: "SDI IN1" }, signal: "SDI" },
      { from: { id: "스위처", port: "DVI-D OUT" }, to: { unknown: "모니터" } },
      { from: { id: "스위처" }, to: { id: "변환기" } },
    ]);
    expect(plugged).toEqual({
      "SDI INPUTS 1": [{ direction: "in", other: "CAM1", signal: "SDI" }],
      "DVI-D OUT": [{ direction: "out", other: "모니터" }],
    });
  });
});
