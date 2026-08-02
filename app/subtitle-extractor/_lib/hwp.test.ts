/**
 * 파서가 **무엇을 어떤 사유로 거부하는지** — 원고 없이 도는 테스트.
 *
 * `corpus.test.ts`는 잘 돌아가는 날을 원고 실물로 덮지만 원고가 없으면 통째로 skip이고, 잘
 * 안 되는 날은 애초에 덮지 않는다(원고 3편이 전부 멀쩡한 파일이다). 사유가 뭉개지는 것은
 * 화면에서 눈에 띄지 않는다 — 안내는 여전히 그럴듯하게 나오고 문구만 틀리므로, 담당자는
 * 고칠 수 없는 것을 붙잡는다.
 *
 * 그래서 `.hwp`를 **손으로 지어서** 넣는다. 우리가 읽는 것이 스트림 2개와 레코드 3종뿐이라
 * 지을 수 있고, 지어 보는 것 자체가 파서가 읽는 구조를 코드에 박아 둔다.
 */
import * as CFB from "cfb";
import { describe, expect, it } from "vitest";

import { parseHwp } from "./hwp";
import { toSubtitles } from "./rules";

const HWPTAG_CHAR_SHAPE = 21;
const HWPTAG_PARA_TEXT = 67;
const HWPTAG_PARA_CHAR_SHAPE = 68;

/** 레코드 하나 — tagID(10bit) | level(10bit) | size(12bit) + 본문 */
function record(tag: number, body: Uint8Array): Uint8Array {
  const out = new Uint8Array(4 + body.length);
  new DataView(out.buffer).setUint32(0, (tag & 0x3ff) | (body.length << 20), true);
  out.set(body, 4);
  return out;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/**
 * `FileHeader` 256바이트. 시그니처 32 + 버전 4 + 플래그 4.
 *
 * 플래그 비트 0은 압축인데 여기서는 늘 꺼 둔다 — 압축을 켜면 테스트가 파서의 관심사가 아닌
 * deflate 구현까지 함께 검증하게 된다.
 */
function fileHeader({ major = 5, flags = 0 } = {}): Uint8Array {
  const header = new Uint8Array(256);
  const signature = "HWP Document File";
  for (let i = 0; i < signature.length; i++) header[i] = signature.charCodeAt(i);
  const at = new DataView(header.buffer);
  at.setUint32(32, major << 24, true);
  at.setUint32(36, flags, true);
  return header;
}

/** `DocInfo` — 문자 모양 목록. 배열 인덱스가 곧 charShapeID다 */
function docInfo(colors: string[]): Uint8Array {
  return concat(
    colors.map((color) => {
      const shape = new Uint8Array(72);
      // COLORREF = 0x00BBGGRR
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
      new DataView(shape.buffer).setUint32(52, r | (g << 8) | (b << 16), true);
      return record(HWPTAG_CHAR_SHAPE, shape);
    }),
  );
}

/** 문단 하나 — 글과, 그 글이 어느 문자 모양으로 칠해졌는지 */
type Paragraph = { text: string; shape: number }[];

/** `BodyText/Section0` — 문단마다 `PARA_TEXT` + `PARA_CHAR_SHAPE` 한 쌍 */
function section(paragraphs: Paragraph[]): Uint8Array {
  return concat(
    paragraphs.flatMap((runs) => {
      const line = runs.map((run) => run.text).join("");
      const text = new Uint8Array(line.length * 2);
      const chars = new DataView(text.buffer);
      for (let i = 0; i < line.length; i++) chars.setUint16(i * 2, line.charCodeAt(i), true);

      const marks = new Uint8Array(runs.length * 8);
      const mark = new DataView(marks.buffer);
      let at = 0;
      runs.forEach((run, i) => {
        mark.setUint32(i * 8, at, true);
        mark.setUint32(i * 8 + 4, run.shape, true);
        at += run.text.length;
      });

      return [record(HWPTAG_PARA_TEXT, text), record(HWPTAG_PARA_CHAR_SHAPE, marks)];
    }),
  );
}

/** 스트림 목록을 OLE2 복합 파일 바이트로. 스트림을 빼면 그 스트림이 없는 문서가 나온다 */
function ole(streams: Record<string, Uint8Array>): Uint8Array {
  const container = CFB.utils.cfb_new();
  for (const [path, content] of Object.entries(streams)) {
    CFB.utils.cfb_add(container, path, content);
  }
  return new Uint8Array(CFB.write(container, { type: "buffer" }));
}

/** 온전한 한글 원고 하나 */
function hwp(colors: string[], paragraphs: Paragraph[], flags = 0): Uint8Array {
  return ole({
    "/FileHeader": fileHeader({ flags }),
    "/DocInfo": docInfo(colors),
    "/BodyText/Section0": section(paragraphs),
  });
}

const RED = "#FF0000";
const BLACK = "#000000";

describe("거부 — hwp가 아니다", () => {
  it("확장자만 .hwp인 파일이 내용으로 걸러진다", () => {
    // 메신저가 파일을 뭉개거나 담당자가 다른 파일을 잘못 올린 날이다. 이름은 .hwp다
    const notHwp = new TextEncoder().encode("이건 그냥 텍스트입니다");

    expect(parseHwp(notHwp)).toEqual({ ok: false, reason: "not-hwp" });
  });

  it("OLE 매직만 맞고 컨테이너가 깨진 파일도 걸러진다", () => {
    const magic = new Uint8Array(512);
    magic.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

    expect(parseHwp(magic)).toEqual({ ok: false, reason: "not-hwp" });
  });

  it("OLE 문서지만 FileHeader가 없으면 걸러진다 — .doc이 여기로 온다", () => {
    expect(parseHwp(ole({ "/WordDocument": new Uint8Array(64) }))).toEqual({
      ok: false,
      reason: "not-hwp",
    });
  });

  it("FileHeader 시그니처가 다르면 걸러진다", () => {
    const wrong = fileHeader();
    wrong.set(new TextEncoder().encode("XWP"));

    expect(parseHwp(ole({ "/FileHeader": wrong }))).toEqual({ ok: false, reason: "not-hwp" });
  });

  it("한글 97(major 3)은 구조가 아예 달라 걸러진다", () => {
    const old = ole({ "/FileHeader": fileHeader({ major: 3 }) });

    expect(parseHwp(old)).toEqual({ ok: false, reason: "not-hwp" });
  });
});

describe("거부 — 읽을 수 없는 hwp다", () => {
  // 셋이 각자 다른 사유로 나와야 화면이 서로 다른 문구를 고를 수 있다. 뭉뚱그리면
  // 암호 문서를 든 담당자에게 "한글 원고가 맞는지 확인하세요"가 나간다
  it.each([
    ["암호 설정", 0b0010, "encrypted"],
    ["배포용 문서", 0b0100, "distribution"],
    ["DRM 보안", 0b1_0000, "drm"],
  ])("%s → %s", (_label, flag, reason) => {
    const locked = ole({ "/FileHeader": fileHeader({ flags: flag }) });

    expect(parseHwp(locked)).toEqual({ ok: false, reason });
  });

  it("압축은 거부가 아니다 — 비트 0이 켜져 있어도 사유가 되지 않는다", () => {
    // 실물 원고 3편이 전부 압축 ON이다. 이걸 거부로 세면 정상 원고가 전부 막힌다
    const compressedOnly = ole({ "/FileHeader": fileHeader({ flags: 0b0001 }) });
    const result = parseHwp(compressedOnly);

    // DocInfo가 없어 결국은 깨지지만, 사유가 플래그 셋 중 하나가 아니어야 한다
    expect(result).toEqual({ ok: false, reason: "broken" });
  });
});

describe("거부 — 읽다가 깨졌다", () => {
  it("본문 스트림이 없으면 깨진 것이다", () => {
    const noBody = ole({ "/FileHeader": fileHeader(), "/DocInfo": docInfo([BLACK]) });

    expect(parseHwp(noBody)).toEqual({ ok: false, reason: "broken" });
  });

  it("레코드가 스트림 밖을 가리키면 반쯤 읽고 성공하지 않는다", () => {
    // 여기서 조용히 멈추고 `ok: true`를 내면 화면이 깨진 파일을 "자막 0장"이라 안내한다.
    // 담당자는 원고의 색 표시를 고치러 가고, 고칠 것이 없으므로 영영 돌아오지 못한다
    const truncated = concat([
      record(HWPTAG_PARA_TEXT, new Uint8Array(8)),
      new Uint8Array([0x43, 0x00, 0x00, 0x40]), // 1KB짜리 레코드를 선언하고 끝난다
    ]);
    const broken = ole({
      "/FileHeader": fileHeader(),
      "/DocInfo": docInfo([BLACK]),
      "/BodyText/Section0": truncated,
    });

    expect(parseHwp(broken)).toEqual({ ok: false, reason: "broken" });
  });
});

describe("성공", () => {
  it("온전한 원고에서 색 붙은 조각이 나온다", () => {
    // 거부 테스트들이 **엉뚱한 이유로** 통과하고 있지 않은지 보는 대조군이다. 이게 없으면
    // 파서가 무엇이든 거부하도록 망가져도 위의 테스트가 전부 초록으로 남는다
    const doc = hwp(
      [BLACK, RED],
      [
        [{ text: "그때 감독은 이런 말을 했습니다.", shape: 0 }],
        [{ text: "우리는 하나다", shape: 1 }],
      ],
    );

    const result = parseHwp(doc);

    expect(result).toEqual({
      ok: true,
      runs: [
        { text: "그때 감독은 이런 말을 했습니다.", color: BLACK, paragraph: 0 },
        { text: "우리는 하나다", color: RED, paragraph: 1 },
      ],
    });
  });

  it("빨간 글자가 하나도 없는 원고는 **거부가 아니라** 자막 0장이다", () => {
    // 08이 세우는 갈림길의 뿌리다. 여기서 `ok: false`가 나오면 화면은 아무리 잘 만들어도
    // 멀쩡한 원고를 빨간 실패 화면으로 맞이한다
    const noRed = hwp([BLACK], [[{ text: "검은 글만 있는 원고입니다", shape: 0 }]]);

    const result = parseHwp(noRed);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.runs).not.toEqual([]);
    expect(toSubtitles(result.runs).subtitles).toEqual([]);
  });
});
