/**
 * 대조 테스트 — 파일이 들어가고 파일이 나오는 **가장 높은 seam**을 본다.
 *
 * `.hwp` 바이트 → 파서 → 규칙 → 나비CG 임포트 파일. 이 하나가 파이프라인 전부를 덮으므로
 * 파서 전용 테스트를 따로 두지 않는다 — 기대값이 원고 조각이 되어 커밋 범위만 늘어난다.
 *
 * **바이트 일치가 이 프로젝트에서 가장 값진 테스트다.** BOM·CRLF·빈 줄 구분까지 포함해
 * 담당자가 실제로 예배에 쓴 파일과 같다는 뜻이며, 규칙이 여전히 **사람의 판단을 재현하는지**를
 * 본다. 자막 장 수만 세는 테스트는 이 사실을 증명하지 못한다.
 *
 * 원고는 목사님의 미공개 저작물이라 이 저장소(public)에 들어갈 수 없다. gitignore된
 * `fixtures/`에서 읽고, 없으면 **실패가 아니라 skip**이다.
 *
 *     fixtures/
 *       0118-25고전20260531십자가의 도 하나님의 능력.hwp
 *       0118-25고전20260531십자가의 도 하나님의 능력-nabi.txt   ← 담당자 정답
 *       0401-09잠20260510지혜와 명철을 얻으라.hwp
 *       0919-27고전20260614복음을 위하여.hwp
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { parseHwp } from "./hwp";
import { toNabiTxt } from "./nabi-cg";
import { toSubtitles } from "./rules";

const FIXTURES = fileURLToPath(new URL("../../../fixtures/", import.meta.url));

const CROSS = "0118-25고전20260531십자가의 도 하나님의 능력";
const WISDOM = "0401-09잠20260510지혜와 명철을 얻으라";
const GOSPEL = "0919-27고전20260614복음을 위하여";

const present = [`${CROSS}.hwp`, `${CROSS}-nabi.txt`, `${WISDOM}.hwp`, `${GOSPEL}.hwp`].every(
  (name) => existsSync(FIXTURES + name),
);

/** 원고 하나를 끝까지 태운다 — 앱이 담당자에게 넘겨줄 바이트가 그대로 나온다. */
async function extract(name: string) {
  const result = parseHwp(readFileSync(FIXTURES + name));
  if (!result.ok) throw new Error(`파싱 거부: ${result.reason}`);

  const { subtitles, dropped, unknownColors } = toSubtitles(result.runs);
  const nabi = new Uint8Array(await toNabiTxt(subtitles).arrayBuffer());
  return { subtitles, dropped, unknownColors, nabi };
}

const suite = present ? describe : describe.skip;

suite("원고 대조", () => {
  it("십자가의 도 하나님의 능력 — 담당자 정답 파일과 바이트 완전 일치", async () => {
    const { subtitles, dropped, unknownColors, nabi } = await extract(`${CROSS}.hwp`);
    const answer = new Uint8Array(readFileSync(FIXTURES + `${CROSS}-nabi.txt`));

    expect(nabi).toEqual(answer);

    // 바이트가 맞았다는 것만으로는 규칙 층이 무엇을 걸러냈는지 알 수 없다. 화면의 노출
    // 의무가 살아 있는지 함께 본다 — 여기가 비면 담당자가 규칙의 실수를 영영 못 본다
    expect(subtitles).toHaveLength(8);
    expect(dropped).toHaveLength(2);
    expect(unknownColors).toEqual([]);
  });

  it("지혜와 명철을 얻으라 — 자막 16장", async () => {
    const { subtitles, dropped, unknownColors } = await extract(`${WISDOM}.hwp`);

    expect(subtitles).toHaveLength(16);
    expect(dropped).toHaveLength(3);
    expect(unknownColors).toEqual([]);
  });

  it("복음을 위하여 — 자막 19장", async () => {
    const { subtitles, dropped, unknownColors } = await extract(`${GOSPEL}.hwp`);

    expect(subtitles).toHaveLength(19);
    expect(dropped).toEqual([]);
    expect(unknownColors).toEqual([]);
  });
});
