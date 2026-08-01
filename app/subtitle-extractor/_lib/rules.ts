/**
 * 규칙 층 — 색 붙은 조각을 자막 장으로 바꾼다.
 *
 * 이 파일은 hwp를 전혀 모른다. OLE도 레코드 태그도 zlib도 여기 없다. 파서가 무엇으로
 * 바뀌든 규칙은 그대로 서 있고, 테스트도 원고 파일 없이 돈다.
 *
 * 근거는 `.scratch/subtitle-extractor/issues/04-red-text-rules.md`. 담당자가 실전에 쓴
 * 임포트 파일과 **바이트 단위로 일치**하는 것이 확인된 규칙이며, 참조 구현은
 * `.scratch/subtitle-extractor/prototypes/subtitle_rules.py`다.
 *
 *   1. 빨강 = #FF0000 정확히 일치. 그 외의 색은 자막이 아니다
 *   2. 한 문단의 (공백만인 조각을 뺀) 모든 조각이 빨강이면 → 그 문단이 자막 한 장
 *   3. 그 문단의 조각을 전부 순서대로 이어붙이고, 앞뒤 공백만 자른다. 안쪽은 원고 그대로
 *   4. 남은 것 중 <...>로만 이루어진 자막은 버린다
 *   5. 쪼개지 않는다. 중복을 제거하지 않는다. 원고 등장 순서가 곧 자막 순서다
 *   6. 검정도 #FF0000도 아닌 색이 원고에 있으면 화면에 알린다 (자막으로는 쓰지 않는다)
 */

/** 파서가 넘겨주는 것. 문서 등장 순서대로 담긴다. */
export type StyledRun = {
  /** 원고 그대로. trim·정규화 없음 — 앞뒤 공백이 병합에 필요하다 */
  text: string;
  /** "#RRGGBB" 대문자 6자리 */
  color: string;
  /** 0부터. 문서 전체를 통틀어 단조 증가 */
  paragraph: number;
};

/**
 * 자막 한 장. **제가 나온 문단을 달고 다닌다.**
 *
 * 규칙 2가 "그 문단이 자막 한 장"이라 했으므로 문단이 곧 한 장의 신원이고, 걸러낸 것·모르는
 * 색이 이미 그렇게 달고 나오는 것과 같은 모양이다. 화면 사정으로 붙인 것이 아니다 — 규칙 5가
 * dedupe를 금지하는 이상 **문구로는 어느 문단에서 왔는지 되찾을 수 없다.**
 */
export type Subtitle = {
  /** 나비CG 파일에 그대로 들어갈 한 줄 */
  text: string;
  paragraph: number;
};

/** 빨갛지만 자막이 되지 못한 조각. 왜 빠졌는지는 문단을 봐야 알 수 있다. */
export type Dropped = {
  fragment: string;
  paragraph: number;
  /** 그 조각이 있던 문단 전문 */
  context: string;
};

/** 검정도 빨강도 아닌 색 — 자막으로 쓰지 않되 침묵하지도 않는다. */
export type UnknownColor = {
  text: string;
  color: string;
  paragraph: number;
};

/**
 * 뒤의 둘은 화면이 담당자에게 보여줄 것들이다. 규칙이 틀린 날 알아챌 유일한 통로이므로
 * 조용히 버리지 않는다.
 */
export type Extraction = {
  subtitles: Subtitle[];
  dropped: Dropped[];
  unknownColors: UnknownColor[];
};

const RED = "#FF0000";
const BLACK = "#000000";

/** 규칙이 색을 보는 눈. 규칙 1과 6이 색으로 가르는 것은 이 셋뿐이다. */
export type Ink = "red" | "black" | "unknown";

/**
 * 색값 하나를 규칙의 눈으로 읽는다.
 *
 * **내보내는 이유는 원고 패널의 표기가 이 판정 위에 서기 때문이다.** 걸러낸 빨강의 취소선과
 * 모르는 색의 물결 밑줄은 조각의 잉크가 무엇인지를 알아야 그을 수 있는데, 화면이 `#FF0000`을
 * 제 손으로 다시 비교하면 규칙이 두 벌이 된다 — 규칙 1이 흔들리는 날 칩은 "모르는 색 2곳"이라
 * 말하는데 원고에는 밑줄이 하나만 그어지고, 담당자는 나머지 한 곳을 영영 찾지 못한다.
 */
export function inkOf(color: string): Ink {
  return color === RED ? "red" : color === BLACK ? "black" : "unknown";
}

/** 꺾쇠로만 이루어진 줄은 자막이 아니라 담당자가 자신에게 남긴 연출 지시문이다. */
const DIRECTIVE = /^<[^<>]*>$/;

export function toSubtitles(runs: StyledRun[]): Extraction {
  const subtitles: Subtitle[] = [];
  const dropped: Dropped[] = [];
  const unknownColors: UnknownColor[] = [];

  const paragraphs = new Map<number, StyledRun[]>();
  for (const run of runs) {
    const group = paragraphs.get(run.paragraph);
    if (group) group.push(run);
    else paragraphs.set(run.paragraph, [run]);

    // 규칙 6 — 엄격한 빨강 판정의 실패 방식은 자막이 소리 없이 사라지는 것이다
    if (inkOf(run.color) === "unknown" && run.text.trim()) {
      unknownColors.push({
        text: run.text.trim(),
        color: run.color,
        paragraph: run.paragraph,
      });
    }
  }

  for (const [paragraph, group] of [...paragraphs].sort(([a], [b]) => a - b)) {
    // 규칙 2 — 공백만인 조각은 색을 따지지 않는다. 이 예외가 없으면 문단 끝의 검은 공백
    // 하나에 자막이 통째로 사라진다
    const meaningful = group.filter((run) => run.text.trim());
    if (meaningful.length === 0) continue;

    // 규칙 3 — 날것 그대로 이어붙인 뒤 전체를 한 번만 자른다. 조각별로 자르면
    // `… 우리일까보냐 ` + `그러나 우리가 …`가 붙어 단어가 뭉개진다
    const line = group.map((run) => run.text).join("").trim();

    if (!meaningful.every((run) => inkOf(run.color) === "red")) {
      for (const run of meaningful) {
        if (inkOf(run.color) === "red") {
          dropped.push({ fragment: run.text.trim(), paragraph, context: line });
        }
      }
      continue;
    }

    // 규칙 4 — 2번이 구조를 보고 3편에서 지시문을 전부 잡아냈으므로 이 조항은 아직 한 번도
    // 발동한 적이 없다. 문단 하나를 통째로 차지한 지시문이 오는 날을 위해 겹쳐 건다
    if (DIRECTIVE.test(line)) {
      dropped.push({ fragment: line, paragraph, context: line });
      continue;
    }

    // 규칙 5 — 쪼개지 않고, 중복을 지우지 않고, 순서 그대로
    subtitles.push({ text: line, paragraph });
  }

  return { subtitles, dropped, unknownColors };
}
