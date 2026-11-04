/**
 * 장비·연결 데이터 — 데이터를 고칠 때 생기는 실수를 잡는다.
 *
 * 봉사자가 에이전트와 함께 고치는 파일이라, 연결 끝점의 오타나 용어집과 다른 이름이
 * 화면에 그럴듯하게 나와 버리면 알아챌 길이 없다. 여기서 멈추게 한다.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  connectionText,
  connections,
  equipment,
  externals,
  unconnectedEquipment,
} from "./system";

/** 용어집 페이지의 굵은 표제어. `**영상 데스크**:`처럼 줄 첫머리에 있다. */
function glossaryTerms(): Set<string> {
  const file = path.join(process.cwd(), "app/docs/broadcast-system/glossary/page.mdx");
  const source = readFileSync(file, "utf8");
  return new Set([...source.matchAll(/^\*\*(.+?)\*\*:/gm)].map((m) => m[1]));
}

/**
 * 용어집에 표제어로 없고 장비 목록표에만 나오는 정식 이름. 용어집에 표제어가 생기면 여기서 뺀다.
 * CAM 행은 용어집에서 `CAM1~CAM6`로 한데 묶여 있다.
 */
const ONLY_IN_EQUIPMENT_LIST = [
  "전압조정기",
  "음향 UPS",
  "음향 파워 컨디셔너",
  "영상 전원 시퀀서",
  "영상 스위처",
  "CAM1·CAM2",
  "CAM3·CAM4",
  "CAM5·CAM6",
  "송출 PC",
  "CG PC",
  "CG PC 문자발생기 보드",
  "NABI USB 동글",
  "백업 송출 장비",
  "LED 프로세서",
  "LED 스크린 전원 버튼",
  "연결 패널",
  "공유기",
  "네트워크 스위치",
  "오디오 분배기",
  "무선 마이크 수신기 1~4",
  "무선 마이크 수신기 5~6",
  "안테나 분배기 A",
  "안테나 분배기 B",
  "CD/USB 플레이어",
  "DVD 레코더",
];

/** 정식 이름이 아직 없는 가칭. 확인 후 이름이 정해지면 용어집에 올리고 여기서 뺀다. */
const PROVISIONAL = ["영상 hub"];

describe("장비·연결 데이터", () => {
  it("연결의 양 끝은 장비, 외부 지점, 또는 후보가 장비인 미상이다", () => {
    const known = new Set<string>([...equipment.map((e) => e.id), ...externals.map((x) => x.id)]);
    const equipmentIds = new Set<string>(equipment.map((e) => e.id));

    const bad = connections.flatMap((c) =>
      [c.from, c.to].filter((end) =>
        "id" in end
          ? !known.has(end.id)
          : (end.candidates ?? []).some((id) => !equipmentIds.has(id)),
      ),
    );

    expect(bad).toEqual([]);
  });

  it("장비 id는 용어집 표제어이거나 허용 목록에 있다", () => {
    const allowed = new Set([...glossaryTerms(), ...ONLY_IN_EQUIPMENT_LIST, ...PROVISIONAL]);

    expect(equipment.map((e) => e.id).filter((id) => !allowed.has(id))).toEqual([]);
  });

  it("허용 목록 이름은 용어집에 없고 데이터에서 쓰인다", () => {
    const terms = glossaryTerms();
    const ids = new Set<string>(equipment.map((e) => e.id));
    const listed = [...ONLY_IN_EQUIPMENT_LIST, ...PROVISIONAL];

    expect(listed.filter((name) => terms.has(name))).toEqual([]);
    expect(listed.filter((name) => !ids.has(name))).toEqual([]);
  });

  it("장비 id와 외부 지점 id는 겹치지 않는다", () => {
    const ids = [...equipment.map((e) => e.id), ...externals.map((x) => x.id)];

    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it("미확인 연결과 끝점이 미상인 연결에는 확인할 거리가 있다", () => {
    const missing = connections.filter(
      (c) =>
        (c.unconfirmed || !("id" in c.from) || !("id" in c.to)) && c.toConfirm.length === 0,
    );

    expect(missing).toEqual([]);
  });

  it("아무 연결에도 없는 장비는 아래 목록뿐이다", () => {
    // 장비 목록표에서 연결 칸이 "—"이거나 단자 목록뿐인 장비다. 연결이 밝혀지면 여기서 뺀다.
    expect(unconnectedEquipment(equipment, connections)).toEqual([
      "음향 파워 컨디셔너",
      "NABI USB 동글",
      "LED 스크린 전원 버튼",
      "연결 패널",
      "방송실 스피커",
      "DVD 레코더",
    ]);
  });
});

describe("unconnectedEquipment", () => {
  it("끝점이나 미상의 후보로 나오지 않는 장비 id를 장비 순서대로 낸다", () => {
    const list = [
      { id: "가" },
      { id: "나" },
      { id: "다" },
      { id: "라" },
    ];
    const links = [
      { from: { id: "가" }, to: { id: "바깥" } },
      { from: { unknown: "미상", candidates: ["다"] }, to: { id: "바깥" } },
    ];

    expect(unconnectedEquipment(list, links)).toEqual(["나", "라"]);
  });
});

describe("connectionText", () => {
  it("출발 → 도착 (신호, 덧붙임, 근거)로 적는다", () => {
    expect(
      connectionText({
        from: { id: "오디오 임베더", port: "SDI OUT" },
        to: { id: "백업 송출 장비", port: "SDI IN" },
        signal: "SDI",
        detail: "영상+소리",
        evidence: "선임 설명",
      }),
    ).toBe("오디오 임베더 SDI OUT → 백업 송출 장비 SDI IN (SDI, 영상+소리, 선임 설명)");
  });

  it("괄호에 넣을 것이 없으면 괄호를 쓰지 않는다", () => {
    expect(connectionText({ from: { id: "영상 스위처", port: "AUX4" }, to: { id: "방송실 TV" } })).toBe(
      "영상 스위처 AUX4 → 방송실 TV",
    );
  });

  it("묶인 장비는 장비 이름 대신 그중 하나의 이름을 쓴다", () => {
    expect(
      connectionText({
        from: { id: "CAM5·CAM6", unit: "CAM5" },
        to: { id: "영상 스위처", port: "SDI IN5" },
      }),
    ).toBe("CAM5 → 영상 스위처 SDI IN5");
  });

  it("미상은 그 말을 쓰고 후보가 있으면 덧붙인다", () => {
    expect(
      connectionText({
        from: { unknown: "음향 소리", candidates: ["음향 콘솔", "오디오 분배기"] },
        to: { id: "오디오 임베더", port: "CH1·CH2" },
        signal: "XLR ×2",
      }),
    ).toBe("음향 소리(후보: 음향 콘솔, 오디오 분배기) → 오디오 임베더 CH1·CH2 (XLR ×2)");
  });
});
