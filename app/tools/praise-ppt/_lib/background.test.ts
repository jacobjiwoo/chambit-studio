import { describe, expect, it } from "vitest";

import { backgroundName, isColor } from "./background";

describe("배경 이름", () => {
  it("프리셋과 대소문자 무시로 맞으면 프리셋 이름이다", () => {
    expect(backgroundName({ type: "color", value: "FFFFFF" })).toBe("흰색");
    expect(backgroundName({ type: "color", value: "1a1a40" })).toBe("남색");
  });

  it("프리셋이 아니면 `#RRGGBB`다", () => {
    expect(backgroundName({ type: "color", value: "123ABC" })).toBe("#123ABC");
  });

  it("이미지면 업로드 이미지다", () => {
    expect(backgroundName({ type: "image", data: "data:image/png;base64,AAAA" })).toBe(
      "업로드 이미지",
    );
  });
});

describe("같은 색인지", () => {
  it("색 배경이면 hex를 대소문자 무시로 비교한다", () => {
    expect(isColor({ type: "color", value: "1a1a40" }, "1A1A40")).toBe(true);
    expect(isColor({ type: "color", value: "FFFFFF" }, "000000")).toBe(false);
  });

  it("이미지 배경은 어떤 색과도 같지 않다", () => {
    expect(isColor({ type: "image", data: "data:image/png;base64,AAAA" }, "FFFFFF")).toBe(false);
  });
});
