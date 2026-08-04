/**
 * 06 — 버전 추적 게이트 셋. **시간 기반 장치가 하나도 없다** — 셋 다 사람이 `NABI_BUILD`나
 * `nabi-history.md`를 바꾸는 순간에만 깨진다. 달력이 넘어가도 이 파일은 조용하다.
 *
 * 추적 대상은 compix의 최신이 아니라 방송실 PC 한 대다 — 사람이 그 PC를 업데이트하는 순간이
 * 신호이고, 이 세 게이트가 그 순간에 저장소가 따라오도록 강제한다. 각 게이트는 실물 소스로
 * 통과하는지(위쪽) 손으로 지은 나쁜 소스로 실제로 걸리는지(아래쪽)를 같은 판정 함수로 본다.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { buildDocs, CONTENT_DIR, type SidecarEntry, type SidecarTag } from "../_lib/build-docs";
import { type HistoryEntry, parseHistory } from "../_lib/history";
import { cleanupSandboxes, sandbox } from "../_lib/test-sandbox";
import { NABI_BUILD } from "./nabi-build";

const HISTORY_FILE = join(process.cwd(), "app/docs/nabi-cg/_meta/nabi-history.md");
const history = parseHistory(readFileSync(HISTORY_FILE, "utf8"));
const docs = buildDocs(CONTENT_DIR);

/** 게이트 4 — History 최신(맨 위) 항목의 날짜가 `NABI_BUILD`와 같다. */
function assertLatestMatchesBuild(entries: HistoryEntry[], build: string): void {
  if (entries[0]?.date !== build) {
    throw new Error(
      `NABI_BUILD(${build})가 nabi-history.md 최신 항목(${entries[0]?.date ?? "없음"})과 다르다 — ` +
        `① History에 항목과 \`영향:\` 추가 ② NABI_BUILD 변경`,
    );
  }
}

type ScreenTag = SidecarEntry & { tag: Extract<SidecarTag, { kind: "화면" }> };

/** 게이트 5 — 모든 `[화면 YYYY.MM]` 태그의 빌드가 `NABI_BUILD`와 같다. */
function assertScreenTagsMatchBuild(sidecar: SidecarEntry[], build: string): void {
  const isStale = (e: SidecarEntry): e is ScreenTag => e.tag.kind === "화면" && e.tag.build !== build;
  const stale = sidecar.filter(isStale);
  if (stale.length === 0) return;

  const list = stale.map((e) => `   - ${e.slug} : ${e.sentence}`).join("\n");
  throw new Error(
    [
      "① History에 항목과 `영향:` 추가",
      "② NABI_BUILD 변경",
      `③ 아래 ${stale.length}줄의 [화면] 태그를 화면에서 재확인하고 날짜를 올린다`,
      list,
    ].join("\n"),
  );
}

/** 게이트 6 — History 모든 항목에 `영향:` 줄이 있다. */
function assertEveryItemHasImpact(entries: HistoryEntry[]): void {
  for (const entry of entries) {
    for (const item of entry.items) {
      if (!item.impact) {
        throw new Error(`nabi-history.md ${entry.date} — "${item.text}"에 \`영향:\` 줄이 없다.`);
      }
    }
  }
}

describe("게이트 4 — NABI_BUILD가 History 최신 항목 날짜와 같다", () => {
  it("실물 — NABI_BUILD와 History 최신 항목이 지금 일치한다", () => {
    expect(() => assertLatestMatchesBuild(history, NABI_BUILD)).not.toThrow();
  });

  it("소스가 잘못되면 걸린다 — History가 상수보다 낡았을 때", () => {
    const stale = parseHistory("## 2025.01\n- 항목\n  영향: 없음\n");
    expect(() => assertLatestMatchesBuild(stale, NABI_BUILD)).toThrow(/NABI_BUILD/);
  });
});

describe("게이트 5 — 모든 [화면 YYYY.MM] 태그가 NABI_BUILD와 같다", () => {
  it("실물 — 모든 [화면] 태그가 지금 NABI_BUILD와 일치한다", () => {
    expect(() => assertScreenTagsMatchBuild(docs.sidecar, NABI_BUILD)).not.toThrow();
  });

  it("소스가 잘못되면 걸린다 — [화면] 태그의 빌드가 상수와 다를 때, 실패 메시지가 3단계와 재확인 줄을 담는다", () => {
    const dir = sandbox({
      "index.md": "랜딩",
      "text-attributes.md": "화면에서 본 사실이다.[화면 2020.01]",
    });
    const { sidecar } = buildDocs(dir);

    let error: Error | undefined;
    try {
      assertScreenTagsMatchBuild(sidecar, NABI_BUILD);
    } catch (e) {
      error = e as Error;
    }

    expect(error?.message).toContain("① History에 항목과 `영향:` 추가");
    expect(error?.message).toContain("② NABI_BUILD 변경");
    expect(error?.message).toContain("③ 아래 1줄의 [화면] 태그를 화면에서 재확인하고 날짜를 올린다");
    expect(error?.message).toContain("text-attributes : 화면에서 본 사실이다.");
  });

  it("**뒤집힐 조건** — [화면] 태그가 40줄을 넘으면 안 된다(넘으면 06 재설계)", () => {
    const screenTagCount = docs.sidecar.filter((e) => e.tag.kind === "화면").length;
    expect(screenTagCount).toBeLessThanOrEqual(40);
  });
});

describe("게이트 6 — History 모든 항목에 `영향:` 줄이 있다", () => {
  it("실물 — 15개 항목 전부에 `영향:` 판정이 있다", () => {
    expect(() => assertEveryItemHasImpact(history)).not.toThrow();
  });

  it("소스가 잘못되면 걸린다 — `영향:` 줄이 없는 항목이 있을 때", () => {
    const missing = parseHistory("## 2026.02\n- 항목만 있고 영향 판정이 없다\n");
    expect(() => assertEveryItemHasImpact(missing)).toThrow(/영향/);
  });
});

afterAll(cleanupSandboxes);
