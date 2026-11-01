import type { Background } from "../_lib/background";
import type { Slide } from "../_lib/song";
import { backgroundStyle } from "./background-style";

/**
 * 슬라이드 한 장의 썸네일 — 적용 배경 위에 이미지와 번호. 뺀 장은 흐리다. 곡 카드와 슬라이드
 * 편집 서랍이 함께 쓴다.
 */
export function SlideThumb({
  slide,
  background,
  excluded,
}: {
  slide: Slide;
  background: Background;
  excluded: boolean;
}) {
  const number = slide.index + 1;
  return (
    <figure
      style={{
        ...backgroundStyle(background),
        margin: 0,
        width: 160,
        aspectRatio: "16 / 9",
        opacity: excluded ? 0.3 : 1,
      }}
    >
      {/* 정적 배포라 next/image 최적화를 쓰지 않는다. 이미지는 R2 URL이거나 data URL이다 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.image}
        alt={`${number}번 슬라이드`}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
      <figcaption>{number}</figcaption>
    </figure>
  );
}
