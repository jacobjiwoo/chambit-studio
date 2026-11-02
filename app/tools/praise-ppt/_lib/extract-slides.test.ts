/**
 * 슬라이드 추출 — 파일이 들어가고 슬라이드 목록이나 추출 오류가 나온다.
 *
 * `.ppt`는 `cfb`로 `Pictures` 스트림을, `.pptx`는 `fflate`로 ZIP을 **손으로 지어서** 넣는다.
 * 실물 PPT는 블로그 저작물이라 커밋하지 않는다. 지은 이미지는 시그니처와 IHDR color type만
 * 맞춘 가짜 바이트다 — 추출은 이미지를 디코딩하지 않고 그 바이트를 그대로 data URL로 옮긴다.
 */
import * as CFB from "cfb";
import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { extractSlides, isPptName, titleFromFileName } from "./extract-slides";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** PNG 시그니처 + IHDR. 바이트 25가 color type이다(6 = RGBA, 2 = RGB) */
function png(colorType: number, mark: number): Uint8Array {
  const bytes = new Uint8Array(33);
  bytes.set(PNG_SIGNATURE, 0);
  bytes.set([0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52], 8);
  bytes[25] = colorType;
  bytes[32] = mark;
  return bytes;
}

function jpeg(mark: number): Uint8Array {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe0, mark]);
}

const EMF = new Uint8Array([0x01, 0x00, 0x00, 0x00, 0x6c]);

/** data URL로 바뀌었을 때의 모습 */
function dataUrl(mime: string, bytes: Uint8Array): string {
  return `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;
}

// ─── .ppt ─────────────────────────────────────────────────────────────────────

/** BLIP 레코드 — 헤더 8바이트(타입 offset 2, 길이 offset 4) + UID 16 + tag 1 + 이미지 */
function blip(type: number, image: Uint8Array): Uint8Array {
  const body = 17 + image.length;
  const out = new Uint8Array(8 + body);
  const view = new DataView(out.buffer);
  view.setUint16(2, type, true);
  view.setUint32(4, body, true);
  out.set(image, 8 + 17);
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

/** 스트림 목록을 OLE2 복합 파일 바이트로 */
function ole(streams: Record<string, Uint8Array>): Uint8Array<ArrayBuffer> {
  const container = CFB.utils.cfb_new();
  for (const [path, content] of Object.entries(streams)) {
    CFB.utils.cfb_add(container, path, content);
  }
  return Uint8Array.from(CFB.write(container, { type: "buffer" }));
}

function ppt(records: Uint8Array[], name = "곡.ppt"): File {
  const bytes = ole({ "PowerPoint Document": new Uint8Array(8), Pictures: concat(records) });
  return new File([bytes], name);
}

const PNG = 0xf01e;
const JPEG = 0xf01d;
const JPEG_CMYK = 0xf02a;
const EMF_TYPE = 0xf01a;

describe(".ppt", () => {
  it("RGBA PNG가 있으면 그것만 쓴다 — JPEG 배경과 RGB PNG는 버린다", async () => {
    const lyricA = png(6, 1);
    const lyricB = png(6, 2);
    const slides = await extractSlides(
      ppt([blip(JPEG, jpeg(9)), blip(PNG, lyricA), blip(PNG, png(2, 3)), blip(PNG, lyricB)]),
    );
    expect(slides).toEqual([
      { index: 0, image: dataUrl("image/png", lyricA) },
      { index: 1, image: dataUrl("image/png", lyricB) },
    ]);
  });

  it("RGBA PNG가 없으면 PNG·JPEG 전부를 차례로 쓰고 EMF는 버린다", async () => {
    const a = jpeg(1);
    const b = png(2, 2);
    const c = jpeg(3);
    const slides = await extractSlides(
      ppt([blip(JPEG, a), blip(EMF_TYPE, EMF), blip(PNG, b), blip(JPEG_CMYK, c)]),
    );
    expect(slides).toEqual([
      { index: 0, image: dataUrl("image/jpeg", a) },
      { index: 1, image: dataUrl("image/png", b) },
      { index: 2, image: dataUrl("image/jpeg", c) },
    ]);
  });

  it("레코드 타입과 시그니처가 어긋나면 버린다", async () => {
    const good = jpeg(1);
    const slides = await extractSlides(ppt([blip(PNG, jpeg(2)), blip(JPEG, png(6, 3)), blip(JPEG, good)]));
    expect(slides).toEqual([{ index: 0, image: dataUrl("image/jpeg", good) }]);
  });

  it("확장자는 대소문자를 가리지 않는다", async () => {
    const slides = await extractSlides(ppt([blip(JPEG, jpeg(1))], "곡.PPT"));
    expect(slides).toHaveLength(1);
  });

  it("OLE가 아니면 파싱 실패다", async () => {
    await expect(extractSlides(new File([strToU8("not ole")], "곡.ppt"))).rejects.toThrow(
      /^OLE 파싱 실패: /,
    );
  });

  it("Pictures 스트림이 없으면 그렇게 말한다", async () => {
    const file = new File([ole({ "PowerPoint Document": new Uint8Array(8) })], "곡.ppt");
    await expect(extractSlides(file)).rejects.toThrow(
      "Pictures 스트림을 찾을 수 없습니다 — 지원되는 PPT 형식이 아닙니다",
    );
  });

  it("PNG·JPEG가 하나도 없으면 슬라이드 0개다", async () => {
    await expect(extractSlides(ppt([blip(EMF_TYPE, EMF)]))).rejects.toThrow(
      "추출된 슬라이드가 없습니다 — Pictures 스트림에 인식 가능한 이미지 (PNG/JPEG) 가 없습니다",
    );
  });
});

// ─── .pptx ────────────────────────────────────────────────────────────────────

const REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

/** `.rels` XML. 관계 종류는 마지막 경로 조각(`slide`, `image` 등) */
function rels(entries: { id: string; type: string; target: string }[]): string {
  const items = entries
    .map((r) => `<Relationship Id="${r.id}" Type="${REL}/${r.type}" Target="${r.target}"/>`)
    .join("");
  return `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items}</Relationships>`;
}

/** 슬라이드 XML. `embeds`의 rId마다 그림 하나 */
function slideXml(...embeds: string[]): string {
  const pics = embeds
    .map((id) => `<p:pic><p:blipFill><a:blip r:embed="${id}"/></p:blipFill></p:pic>`)
    .join("");
  return `<p:sld><p:cSld><p:spTree><p:sp><a:t>가사</a:t></p:sp>${pics}</p:spTree></p:cSld></p:sld>`;
}

/** `presentation.xml`. 슬라이드 rId를 이 순서로 나열한다 */
function presentationXml(...ids: string[]): string {
  const list = ids.map((id, i) => `<p:sldId id="${256 + i}" r:id="${id}"/>`).join("");
  return `<p:presentation><p:sldIdLst>${list}</p:sldIdLst></p:presentation>`;
}

function pptx(files: Record<string, string | Uint8Array>, name = "곡.pptx"): File {
  const entries = Object.fromEntries(
    Object.entries(files).map(([path, content]) => [
      path,
      typeof content === "string" ? strToU8(content) : content,
    ]),
  );
  return new File([zipSync(entries)], name);
}

/** `ppt/slides/slide{n}.xml`과 그 `_rels` — 그림 하나가 `media/{image}`를 가리킨다 */
function slideWithImage(n: number, image: string): Record<string, string> {
  return {
    [`ppt/slides/slide${n}.xml`]: slideXml("rId2"),
    [`ppt/slides/_rels/slide${n}.xml.rels`]: rels([
      { id: "rId1", type: "slideLayout", target: "../slideLayouts/slideLayout1.xml" },
      { id: "rId2", type: "image", target: `../media/${image}` },
    ]),
  };
}

describe(".pptx", () => {
  it("presentation.xml 순서가 파일 이름 순서보다 우선한다", async () => {
    const one = png(6, 1);
    const two = jpeg(2);
    const slides = await extractSlides(
      pptx({
        "ppt/presentation.xml": presentationXml("rId8", "rId7"),
        "ppt/_rels/presentation.xml.rels": rels([
          { id: "rId7", type: "slide", target: "slides/slide1.xml" },
          { id: "rId8", type: "slide", target: "slides/slide2.xml" },
        ]),
        ...slideWithImage(1, "image1.png"),
        ...slideWithImage(2, "image2.jpeg"),
        "ppt/media/image1.png": one,
        "ppt/media/image2.jpeg": two,
      }),
    );
    expect(slides).toEqual([
      { index: 0, image: dataUrl("image/jpeg", two) },
      { index: 1, image: dataUrl("image/png", one) },
    ]);
  });

  it("presentation.xml이 없으면 slide{n}을 숫자 순으로 쓴다 — slide10이 slide2 뒤다", async () => {
    const files: Record<string, string | Uint8Array> = {};
    for (const n of [10, 2, 1]) {
      Object.assign(files, slideWithImage(n, `image${n}.png`));
      files[`ppt/media/image${n}.png`] = png(6, n);
    }
    const slides = await extractSlides(pptx(files));
    expect(slides.map((s) => s.image)).toEqual([
      dataUrl("image/png", png(6, 1)),
      dataUrl("image/png", png(6, 2)),
      dataUrl("image/png", png(6, 10)),
    ]);
  });

  it("슬라이드마다 첫 그림만 쓴다", async () => {
    const first = png(6, 1);
    const slides = await extractSlides(
      pptx({
        "ppt/slides/slide1.xml": slideXml("rId3", "rId2"),
        "ppt/slides/_rels/slide1.xml.rels": rels([
          { id: "rId2", type: "image", target: "../media/second.png" },
          { id: "rId3", type: "image", target: "../media/first.png" },
        ]),
        "ppt/media/first.png": first,
        "ppt/media/second.png": png(6, 2),
      }),
    );
    expect(slides).toEqual([{ index: 0, image: dataUrl("image/png", first) }]);
  });

  it("그림을 못 뽑은 슬라이드는 건너뛰고 번호를 빈틈없이 다시 매긴다", async () => {
    const one = png(6, 1);
    const five = jpeg(5);
    const slides = await extractSlides(
      pptx({
        ...slideWithImage(1, "image1.png"),
        // 글자만 있는 슬라이드
        "ppt/slides/slide2.xml": slideXml(),
        // 관계가 image가 아니다
        "ppt/slides/slide3.xml": slideXml("rId2"),
        "ppt/slides/_rels/slide3.xml.rels": rels([
          { id: "rId2", type: "hyperlink", target: "../media/image3.png" },
        ]),
        // 미디어 파일이 없다
        ...slideWithImage(4, "missing.png"),
        // 래스터가 아니다
        ...slideWithImage(5, "image5.emf"),
        ...slideWithImage(6, "image6.jpg"),
        "ppt/media/image1.png": one,
        "ppt/media/image3.png": png(6, 3),
        "ppt/media/image5.emf": EMF,
        "ppt/media/image6.jpg": five,
      }),
    );
    expect(slides).toEqual([
      { index: 0, image: dataUrl("image/png", one) },
      { index: 1, image: dataUrl("image/jpeg", five) },
    ]);
  });

  it("슬라이드 폴더 기준 상대 경로와 절대 경로를 푼다", async () => {
    const nested = png(6, 1);
    const absolute = jpeg(2);
    const slides = await extractSlides(
      pptx({
        "ppt/slides/slide1.xml": slideXml("rId2"),
        "ppt/slides/_rels/slide1.xml.rels": rels([
          { id: "rId2", type: "image", target: "./../media/./deep/../pic.png" },
        ]),
        "ppt/slides/slide2.xml": slideXml("rId2"),
        "ppt/slides/_rels/slide2.xml.rels": rels([
          { id: "rId2", type: "image", target: "/ppt/media/abs.jpeg" },
        ]),
        "ppt/media/pic.png": nested,
        "ppt/media/abs.jpeg": absolute,
      }),
    );
    expect(slides).toEqual([
      { index: 0, image: dataUrl("image/png", nested) },
      { index: 1, image: dataUrl("image/jpeg", absolute) },
    ]);
  });

  it("ZIP이 아니면 파싱 실패다", async () => {
    await expect(extractSlides(new File([strToU8("not zip")], "곡.pptx"))).rejects.toThrow(
      /^PPTX \(ZIP\) 파싱 실패: /,
    );
  });

  it("슬라이드가 없으면 손상된 파일일 수 있다고 말한다", async () => {
    await expect(extractSlides(pptx({ "ppt/presentation.xml": presentationXml() }))).rejects.toThrow(
      "슬라이드를 찾을 수 없습니다 — 손상된 PPTX 파일일 수 있습니다",
    );
  });

  it("슬라이드는 있는데 그림을 하나도 못 뽑으면 그렇게 말한다", async () => {
    await expect(extractSlides(pptx({ "ppt/slides/slide1.xml": slideXml() }))).rejects.toThrow(
      "추출된 슬라이드가 없습니다 — 슬라이드에 배경 이미지가 없거나 인식 불가능한 형식입니다",
    );
  });
});

describe("파일 형식", () => {
  it(".ppt·.pptx가 아니면 지원하지 않는 형식이다", async () => {
    await expect(extractSlides(new File([strToU8("x")], "곡.pdf"))).rejects.toThrow(
      "지원하지 않는 파일 형식입니다 (.ppt 또는 .pptx 만 가능)",
    );
  });

  it("이름으로 PPT인지 가린다", () => {
    expect(isPptName("a.ppt")).toBe(true);
    expect(isPptName("a.PPTX")).toBe(true);
    expect(isPptName("a.pptm")).toBe(false);
    expect(isPptName("ppt")).toBe(false);
  });

  it("제목은 파일 이름에서 .ppt/.pptx를 뗀 것이다", () => {
    expect(titleFromFileName("주님의 은혜.pptx")).toBe("주님의 은혜");
    expect(titleFromFileName("v1.2 찬양.PPT")).toBe("v1.2 찬양");
  });
});
