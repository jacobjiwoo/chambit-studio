/**
 * 파서 층 — `.hwp` 바이트를 색 붙은 조각으로 바꾼다.
 *
 * 함수 하나다. 인터페이스도 팩토리도 포맷 레지스트리도 없다 — 구현체가 하나뿐인 추상화는
 * 추측이다. v1은 `.hwp` 전용이며 `.hwpx`는 받지 않는다. hwpx가 필요해지는 날 `parseHwpx`를
 * 새로 짜고 호출부에서 분기한다.
 *
 * "HWP 5.0을 구현한다"가 아니라 **스트림 2개와 레코드 3종을 읽는다**이다. 이미지·표 서식·
 * 수식·스타일·글머리표는 전부 태그가 달라 그냥 지나친다. 표 셀 안의 문단도 같은 `BodyText`
 * 스트림에 `PARA_TEXT`로 평평하게 들어오므로 순서대로 훑기만 하면 딸려온다.
 *
 * 근거는 `.scratch/subtitle-extractor/issues/05-input-format-policy.md`, 참조 구현은
 * `.scratch/subtitle-extractor/prototypes/subtitle_rules.py`의 파서 층이다. 그 구현이 원고
 * 3편에서 담당자 정답 파일과 **바이트 단위로 일치**함이 확인돼 있고, `corpus.test.ts`가
 * 이 TypeScript 구현으로 같은 일치를 다시 확인한다.
 */
import * as CFB from "cfb";
import { inflateSync } from "fflate";

import type { StyledRun } from "./rules";

/**
 * 거부 사유. 08이 이 값 그대로 사유별 안내 문구를 고른다 — 뭉뚱그리면 담당자가 무엇을
 * 고쳐야 할지 알 수 없다.
 */
export type RejectReason =
  /** hwp가 아니다. 확장자만 `.hwp`인 파일, 메신저가 뭉갠 파일이 여기로 온다 */
  | "not-hwp"
  /** 암호가 걸려 있다 */
  | "encrypted"
  /** 배포용 문서다 */
  | "distribution"
  /** DRM이 걸려 있다 */
  | "drm"
  /** hwp는 맞는데 읽다가 깨졌다. 버전 가드가 없으므로 이 자리가 실패를 보고하는 곳이다 */
  | "broken";

/**
 * **`runs`가 비어 있는 것은 실패가 아니다.** 빨간 글자 0개인 원고는 파싱에 성공했고 자막이
 * 0장인 것이며, 08이 실패와 다른 톤으로 안내한다. 그래서 빈 결과를 사유로 만들지 않고
 * 성공 안에 둔다 — 타입만 봐도 둘을 헷갈릴 수 없다.
 */
export type ParseResult =
  | { ok: true; runs: StyledRun[] }
  | { ok: false; reason: RejectReason };

/** OLE2 복합 파일 매직 8바이트 */
const OLE_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

/** `FileHeader` 오프셋 0의 32바이트 시그니처 */
const HWP_SIGNATURE = "HWP Document File";

const HWPTAG_CHAR_SHAPE = 21;
const HWPTAG_PARA_TEXT = 67;
const HWPTAG_PARA_CHAR_SHAPE = 68;

/**
 * 제어문자는 위치 계산에 포함된다 — extended(1·2·3·11·12·14~18·21~23)와 inline(4~9·19·20)이
 * 8 WCHAR, 나머지 제어문자는 1 WCHAR를 차지한다. 이걸 틀리면 색 경계가 통째로 어긋난다.
 */
const WIDE_CONTROL = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
]);

const BLACK = "#000000";

export function parseHwp(bytes: ArrayBuffer | Uint8Array): ParseResult {
  const file = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

  // 1단 — 이게 hwp인가. 확장자를 믿지 않고 내용으로 판정한다. 셋 다 통과해야 한다
  if (!OLE_MAGIC.every((b, i) => file[i] === b)) return { ok: false, reason: "not-hwp" };

  let container: CFB.CFB$Container;
  try {
    container = CFB.parse(file);
  } catch {
    // 매직은 맞는데 컨테이너를 열 수 없다 — `FileHeader`를 볼 방법조차 없으므로 1단 탈락이다
    return { ok: false, reason: "not-hwp" };
  }

  const header = findStream(container, "FileHeader");
  if (!header || header.length < 40) return { ok: false, reason: "not-hwp" };
  if (!ascii(header.subarray(0, 32)).startsWith(HWP_SIGNATURE)) {
    return { ok: false, reason: "not-hwp" };
  }

  // 2단 — 읽을 수 있는 hwp인가. 본문이 우리가 읽을 수 없는 형태인 셋을 파싱 전에 갈라낸다
  const flags = view(header).getUint32(36, true);
  if (flags & 0b0010) return { ok: false, reason: "encrypted" };
  if (flags & 0b0100) return { ok: false, reason: "distribution" };
  if (flags & 0b1_0000) return { ok: false, reason: "drm" };
  const compressed = (flags & 0b0001) !== 0; // 거부 아님 — ON이면 raw inflate, OFF면 그대로

  // 3단 — 버전 가드를 두지 않는다. major가 5면 minor와 무관하게 일단 시도하고, 실제로
  // 깨지면 그때 실패를 보고한다. 한글이 5.2를 내는 순간 읽을 수 있는데도 거부하는 일이
  // 없도록. major 3(한글 97)은 구조가 아예 달라 여기까지 오지도 못한다
  if (view(header).getUint32(32, true) >>> 24 !== 5) return { ok: false, reason: "not-hwp" };

  // 여기서부터 깨지는 것은 전부 `broken`이다. 버전 가드를 뺀 대가로 **이 자리가 실패를
  // 보고하는 유일한 곳**이 되므로, 조용히 반쯤 읽고 성공을 반환하는 길이 없어야 한다 —
  // 그러면 08이 깨진 파일을 "빈 결과"로 안내하게 된다
  try {
    const colors = charShapeColors(readStream(container, "DocInfo", compressed));

    const paths = sections(container);
    if (paths.length === 0) throw new Error("BodyText/Section*가 없다");

    const runs: StyledRun[] = [];
    let paragraph = 0;
    for (const path of paths) {
      // paragraph를 이어받아 이어 준다 — 섹션이 여럿이어도 문서 전체를 통틀어 단조 증가한다
      const section = readSection(readStream(container, path, compressed), colors, paragraph);
      runs.push(...section.runs);
      paragraph = section.paragraph;
    }
    return { ok: true, runs };
  } catch {
    return { ok: false, reason: "broken" };
  }
}

/**
 * `BodyText/Section0`, `Section1`, … 을 문서 순서대로.
 *
 * 참조 구현은 이름 그대로 정렬하지만 그러면 `Section10`이 `Section2`보다 앞선다. 뒤의
 * 숫자로 정렬한다 — 원고 3편이 전부 섹션 하나뿐이라 두 정렬의 차이가 드러난 적은 없다.
 */
function sections(container: CFB.CFB$Container): string[] {
  return container.FullPaths.filter((p) => /\/BodyText\/Section\d+$/.test(p)).sort(
    (a, b) => Number(a.match(/\d+$/)![0]) - Number(b.match(/\d+$/)![0]),
  );
}

function findStream(container: CFB.CFB$Container, path: string): Uint8Array | null {
  const entry = CFB.find(container, path);
  if (!entry || entry.type !== 2) return null; // 2 = stream
  const content =
    entry.content instanceof Uint8Array ? entry.content : Uint8Array.from(entry.content);
  // CFB는 섹터 크기에 맞춰 패딩을 남길 수 있다. 압축이 꺼진 원고에서 패딩이 가짜 레코드로
  // 읽히지 않도록 선언된 크기까지만 쓴다
  return entry.size < content.length ? content.subarray(0, entry.size) : content;
}

/** 스트림 하나를 읽어 필요하면 푼다. 없거나 풀리지 않으면 던진다 — 깨진 파일이다 */
function readStream(
  container: CFB.CFB$Container,
  path: string,
  compressed: boolean,
): Uint8Array {
  const raw = findStream(container, path);
  if (!raw) throw new Error(`${path}가 없다`);
  return compressed ? inflateSync(raw) : raw;
}

function view(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function ascii(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes);
}

/**
 * 레코드 헤더 4바이트 = tagID(10bit) | level(10bit) | size(12bit).
 *
 * 스트림이 남은 바이트보다 큰 레코드를 선언하면 **던진다.** 거기서 조용히 멈추면 반쯤 읽은
 * 원고가 성공으로 나가고, 08이 깨진 파일을 "자막 0장"이라 안내한다.
 */
function* records(data: Uint8Array): Generator<{ tag: number; body: Uint8Array }> {
  const at = view(data);
  let p = 0;
  while (p + 4 <= data.length) {
    const header = at.getUint32(p, true);
    const tag = header & 0x3ff;
    let size = (header >>> 20) & 0xfff;
    p += 4;
    if (size === 0xfff) {
      // 12비트에 담기지 않는 레코드는 이어지는 4바이트가 실제 크기다
      if (p + 4 > data.length) throw new Error("레코드 크기가 잘렸다");
      size = at.getUint32(p, true);
      p += 4;
    }
    if (p + size > data.length) throw new Error("레코드가 스트림 밖을 가리킨다");
    yield { tag, body: data.subarray(p, p + size) };
    p += size;
  }
}

/**
 * `DocInfo`의 문자 모양별 글자색. 배열 인덱스가 곧 charShapeID이므로 **짧은 레코드를 건너뛰지
 * 않는다** — 하나라도 빼면 그 뒤의 색이 전부 한 칸씩 밀린다.
 */
function charShapeColors(docInfo: Uint8Array): string[] {
  const colors: string[] = [];
  for (const { tag, body } of records(docInfo)) {
    if (tag !== HWPTAG_CHAR_SHAPE) continue;
    if (body.length < 56) {
      colors.push(BLACK);
      continue;
    }
    // COLORREF = 0x00BBGGRR
    const ref = view(body).getUint32(52, true);
    colors.push("#" + hex(ref & 0xff) + hex((ref >>> 8) & 0xff) + hex((ref >>> 16) & 0xff));
  }
  return colors;
}

function hex(byte: number): string {
  return byte.toString(16).toUpperCase().padStart(2, "0");
}

/** 본문의 한 자리. 제어문자는 `char`가 없지만 자리는 지킨다 */
type Wchar = {
  /** WCHAR 단위 위치. `PARA_CHAR_SHAPE`가 가리키는 좌표계다 */
  at: number;
  /** 글자로 나오는 것만. 제어문자는 `null`(개행만 예외) */
  char: string | null;
};

/**
 * 본문을 (WCHAR 인덱스, 문자) 목록으로 편다. 제어문자는 글자를 내놓지 않지만 **자리는
 * 차지한다** — 그 자리가 `PARA_CHAR_SHAPE`의 위치와 맞아야 색 경계가 맞는다.
 */
function wchars(raw: Uint8Array): Wchar[] {
  const at = view(raw);
  const out: Wchar[] = [];
  const n = raw.length >>> 1;
  let i = 0;
  while (i < n) {
    const code = at.getUint16(i * 2, true);
    if (WIDE_CONTROL.has(code)) {
      out.push({ at: i, char: null });
      i += 8;
    } else if (code < 32) {
      out.push({ at: i, char: code === 10 || code === 13 ? "\n" : null });
      i += 1;
    } else {
      out.push({ at: i, char: String.fromCharCode(code) });
      i += 1;
    }
  }
  return out;
}

/**
 * `PARA_TEXT`(본문)와 뒤따르는 `PARA_CHAR_SHAPE`(위치→모양ID)를 맞춰 조각을 만든다.
 *
 * 문단 번호를 `from`에서 이어받아 마지막 값을 돌려준다 — 호출부가 그것을 다음 섹션에 넘기면
 * `paragraph`가 문서 전체를 통틀어 단조 증가한다.
 */
function readSection(
  section: Uint8Array,
  colors: string[],
  from: number,
): { runs: StyledRun[]; paragraph: number } {
  const runs: StyledRun[] = [];
  let paragraph = from;
  let text: Wchar[] | null = null;

  for (const { tag, body } of records(section)) {
    if (tag === HWPTAG_PARA_TEXT) {
      text = wchars(body);
      continue;
    }
    if (tag !== HWPTAG_PARA_CHAR_SHAPE || text === null) continue;

    const mark = view(body);
    const marks: { pos: number; shape: number }[] = [];
    for (let i = 0; i + 8 <= body.length; i += 8) {
      marks.push({ pos: mark.getUint32(i, true), shape: mark.getUint32(i + 4, true) });
    }

    for (let k = 0; k < marks.length; k++) {
      const { pos, shape } = marks[k];
      const end = k + 1 < marks.length ? marks[k + 1].pos : Infinity;
      let chunk = "";
      for (const { at, char } of text) {
        if (char && at >= pos && at < end) chunk += char;
      }
      // text는 원고 그대로 넘어간다 — trim도 정규화도 없다. 조각별 trim은
      // `… 우리일까보냐 ` + `그러나 우리가 …`를 붙여 단어를 뭉갠다
      runs.push({ text: chunk, color: colors[shape] ?? BLACK, paragraph });
    }

    paragraph += 1;
    text = null;
  }
  return { runs, paragraph };
}
