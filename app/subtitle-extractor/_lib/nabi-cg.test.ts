/**
 * 출력 층 — 담당자가 손으로 맞추던 변환이 정확히 이것이다.
 *
 * `corpus.test.ts`가 담당자의 실전 정답 파일과 바이트 대조를 하지만 **원고가 없으면
 * skip**이라, 클론한 곳에서는 규격을 지키는 코드가 하나도 검증되지 않는다. 여기서 원고
 * 없이 도는 눈을 하나 더 둔다 — BOM·CRLF·빈 줄·끝의 개행 없음은 hwp를 몰라도 확인된다.
 */
import { describe, expect, it } from "vitest";

import { downloadName, toNabiBody, toNabiTxt } from "./nabi-cg";

const BOM = [0xef, 0xbb, 0xbf];

async function bytes(subtitles: string[]): Promise<number[]> {
  return [...new Uint8Array(await toNabiTxt(subtitles).arrayBuffer())];
}

describe("나비CG 임포트 파일", () => {
  it("UTF-8 BOM으로 시작한다", async () => {
    expect((await bytes(["가"])).slice(0, 3)).toEqual(BOM);
  });

  it("자막 장을 빈 줄 하나로 가른다 — 개행은 CRLF다", async () => {
    // BOM + "A" + CRLF CRLF + "B". 빈 줄 하나가 나비CG의 페이지 구분이다
    expect(await bytes(["A", "B"])).toEqual([...BOM, 0x41, 0x0d, 0x0a, 0x0d, 0x0a, 0x42]);
  });

  it("끝에 개행이 없다 — 텍스트로 끝난다", async () => {
    const out = await bytes(["A", "B"]);
    expect(out.at(-1)).toBe(0x42);
  });

  it("한 장짜리는 BOM과 본문뿐이다", async () => {
    expect(await bytes(["A"])).toEqual([...BOM, 0x41]);
  });

  it("자막이 0장이면 BOM만 남는다 — 빈 결과도 파일은 나온다", async () => {
    expect(await bytes([])).toEqual(BOM);
  });

  it("자막 안의 공백과 문장부호를 손대지 않는다", async () => {
    const text = "“십자가의  도”가 —";
    // ignoreBOM이 없으면 디코더가 BOM을 먹어 규격의 절반이 조용히 사라진다
    const decoder = new TextDecoder("utf-8", { ignoreBOM: true });
    expect(decoder.decode(await toNabiTxt([text]).arrayBuffer())).toBe("﻿" + text);
  });
});

describe("미리보기가 띄우는 원문", () => {
  // 받기 전 마지막 확인이 파일과 다른 것을 보여주는 것은 확인이 아니다. 위의 규격 검사들은
  // 전부 `toNabiTxt`를 겨누므로, 미리보기가 그 파일에 매여 있다는 것은 여기서만 지켜진다
  it("파일 본문과 글자 하나까지 같다 — BOM만 없다", async () => {
    const subtitles = ["십자가의 도가 우리에게는", "하나님의 능력이라", "그러므로"];
    // ignoreBOM이 없으면 디코더가 BOM을 먹어 비교의 절반이 조용히 사라진다
    const decoder = new TextDecoder("utf-8", { ignoreBOM: true });
    const file = decoder.decode(await toNabiTxt(subtitles).arrayBuffer());

    expect(file).toBe("﻿" + toNabiBody(subtitles));
  });
});

describe("받는 파일 이름", () => {
  it("확장자를 떼고 `-자막.txt`를 붙인다", () => {
    expect(downloadName("0118-25고전20260531십자가의 도 하나님의 능력.hwp")).toBe(
      "0118-25고전20260531십자가의 도 하나님의 능력-자막.txt",
    );
  });

  it("대문자 확장자도 뗀다", () => {
    expect(downloadName("원고.HWP")).toBe("원고-자막.txt");
  });

  it("이름 가운데의 점은 확장자가 아니다", () => {
    expect(downloadName("2026.05.31 주일예배.hwp")).toBe("2026.05.31 주일예배-자막.txt");
  });

  it("확장자가 없으면 그대로 붙인다", () => {
    expect(downloadName("원고")).toBe("원고-자막.txt");
  });
});
