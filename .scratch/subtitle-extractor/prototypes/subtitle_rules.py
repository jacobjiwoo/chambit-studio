"""빨간 조각 → 나비CG 자막 장으로 바꾸는 규칙의 참조 구현.

`빨간색 판정 규칙과 자막 쪼개는 단위` 티켓이 확정한 규칙을 그대로 구현하고,
담당자가 실전에 쓴 임포트 파일과 **바이트 단위로 대조**한다.

    python3 subtitle_rules.py <파일.hwp> [정답파일.txt]

`extract_red.py`가 파서 층(hwp 바이트 → 색 붙은 조각)이라면 이 파일은 규칙 층
(조각 → 자막 장)이다. 최종 구현에서 이 경계가 `parseHwp(bytes) => StyledRun[]`이
된다. 여기서는 대조를 돌리기 위해 파서를 같이 들고 있을 뿐이다.

## 규칙

1. 빨강 = #FF0000 정확히 일치
2. 한 문단의 (공백만인 조각을 뺀) 모든 조각이 빨강이면 → 그 문단이 자막 한 장
3. 조각을 순서대로 그대로 이어붙이고, 앞뒤 공백만 자른다
4. 남은 것 중 <...>로만 이루어진 자막은 버린다
5. 쪼개지 않는다. 중복을 제거하지 않는다. 등장 순서 그대로
6. 검정도 #FF0000도 아닌 색은 자막이 아니며, 화면에 알릴 대상이다

3번의 "그대로 이어붙인다"가 중요하다. 조각별로 strip한 뒤 join하면
`… 우리일까보냐 ` + `그러나 우리가 …`의 공백이 사라져 단어가 붙어버린다.

## 검증 상태

`0118-25고전…십자가의 도 하나님의 능력` 원고에 대해 담당자 최종 파일과
**바이트 완전 일치**(10구간 → 8장). 4번 규칙과 2번의 공백 예외는 보유한
원고 3편에서 **한 번도 발동하지 않는** 방어 조항이다 — 티켓의 Answer 참조.
"""

import re
import struct
import sys
import zlib

import olefile

HWPTAG_CHAR_SHAPE = 21
HWPTAG_PARA_TEXT = 67
HWPTAG_PARA_CHAR_SHAPE = 68

EXTENDED = {1, 2, 3, 11, 12, 14, 15, 16, 17, 18, 21, 22, 23}
INLINE = {4, 5, 6, 7, 8, 9, 19, 20}

RED = "#FF0000"
BLACK = "#000000"
DIRECTIVE = re.compile(r"<[^<>]*>\Z", re.S)


# ---------------------------------------------------------------- 파서 층
# 최종 구현에서 이 부분이 TypeScript `parseHwp(bytes) => StyledRun[]`이 된다.


def records(data):
    p = 0
    while p < len(data) - 3:
        header = struct.unpack("<I", data[p : p + 4])[0]
        tag, size = header & 0x3FF, (header >> 20) & 0xFFF
        p += 4
        if size == 0xFFF:
            size = struct.unpack("<I", data[p : p + 4])[0]
            p += 4
        yield tag, data[p : p + size]
        p += size


def char_shape_colors(ole):
    doc = zlib.decompress(ole.openstream("DocInfo").read(), -15)
    colors = []
    for tag, body in records(doc):
        if tag == HWPTAG_CHAR_SHAPE and len(body) >= 56:
            ref = struct.unpack("<I", body[52:56])[0]  # COLORREF = 0x00BBGGRR
            colors.append("#%02X%02X%02X" % (ref & 0xFF, (ref >> 8) & 0xFF, (ref >> 16) & 0xFF))
    return colors


def wchars(raw):
    out, i, n = [], 0, len(raw) // 2
    while i < n:
        code = struct.unpack("<H", raw[i * 2 : i * 2 + 2])[0]
        if code in EXTENDED or code in INLINE:
            out.append((i, None)); i += 8
        elif code < 32:
            out.append((i, "\n" if code in (10, 13) else None)); i += 1
        else:
            out.append((i, chr(code))); i += 1
    return out


def parse_hwp(path):
    """hwp → StyledRun 목록. 문서 등장 순서대로 담긴다.

    StyledRun = {text, color, paragraph}. text는 **원고 그대로** — trim도
    정규화도 하지 않는다. 앞뒤 공백이 병합에 필요하기 때문이다.
    """
    ole = olefile.OleFileIO(path)
    colors = char_shape_colors(ole)
    runs, para_no = [], 0
    for section in sorted(n for n in ole.listdir() if n[0] == "BodyText"):
        data = zlib.decompress(ole.openstream("/".join(section)).read(), -15)
        text = None
        for tag, raw in records(data):
            if tag == HWPTAG_PARA_TEXT:
                text = wchars(raw)
            elif tag == HWPTAG_PARA_CHAR_SHAPE and text is not None:
                marks = [struct.unpack("<II", raw[i : i + 8]) for i in range(0, len(raw) - 7, 8)]
                for k, (pos, shape_id) in enumerate(marks):
                    end = marks[k + 1][0] if k + 1 < len(marks) else float("inf")
                    runs.append({
                        "text": "".join(c for i, c in text if c and pos <= i < end),
                        "color": colors[shape_id] if shape_id < len(colors) else BLACK,
                        "paragraph": para_no,
                    })
                para_no += 1
                text = None
    return runs


# ---------------------------------------------------------------- 규칙 층
# hwp를 전혀 모른다. StyledRun 배열만 받는다.


def to_subtitles(runs):
    """StyledRun[] → (자막 장 목록, 걸러낸 빨간 조각, 모르는 색).

    뒤의 둘은 화면이 담당자에게 보여줄 것들이다 — 규칙이 틀린 날 알아챌
    유일한 통로이므로 조용히 버리지 않는다.
    """
    subtitles, dropped, unknown = [], [], []

    paragraphs = {}
    for run in runs:
        paragraphs.setdefault(run["paragraph"], []).append(run)
        if run["color"] not in (RED, BLACK) and run["text"].strip():
            unknown.append(run)

    for _, group in sorted(paragraphs.items()):
        meaningful = [r for r in group if r["text"].strip()]
        if not meaningful:
            continue

        # 규칙 2 — 공백만인 조각은 색을 따지지 않는다
        if not all(r["color"] == RED for r in meaningful):
            dropped += [r["text"].strip() for r in meaningful if r["color"] == RED]
            continue

        # 규칙 3 — 날것 그대로 concat 후 한 번만 strip
        line = "".join(r["text"] for r in group).strip()
        if not line:
            continue

        # 규칙 4 — 꺾쇠로만 이루어진 것은 연출 지시문
        if DIRECTIVE.fullmatch(line):
            dropped.append(line)
            continue

        subtitles.append(line)  # 규칙 5 — dedupe 없음, 분할 없음, 순서 그대로

    return subtitles, dropped, unknown


def to_nabi_txt(subtitles):
    """`나비CG 임포트 파일 규격 확정`이 정한 형식. UTF-8 BOM + CRLF, 장 사이 빈 줄."""
    return ("\r\n\r\n".join(subtitles)).encode("utf-8-sig")


# ---------------------------------------------------------------- 실행


def main():
    if len(sys.argv) < 2:
        sys.exit(f"usage: {sys.argv[0]} <파일.hwp> [정답파일.txt]")

    subtitles, dropped, unknown = to_subtitles(parse_hwp(sys.argv[1]))

    print(f"자막 {len(subtitles)}장")
    for i, s in enumerate(subtitles, 1):
        print(f"[{i:2}] ({len(s):3}자) {' '.join(s.split())}")

    if dropped:
        print(f"\n빨갛지만 뺀 것 {len(dropped)}개")
        for s in dropped:
            print(f"  - {' '.join(s.split())}")

    if unknown:
        print(f"\n모르는 색 {len(unknown)}개 — 자막으로 쓰지 않음")
        for r in unknown:
            print(f"  - {r['color']} {' '.join(r['text'].split())[:40]}")

    if len(sys.argv) > 2:
        want = open(sys.argv[2], "rb").read()
        got = to_nabi_txt(subtitles)
        print("\n=== 정답 파일 대조 ===")
        if got == want:
            print(f"바이트 완전 일치 ({len(got)}B)")
            return
        print(f"불일치: got {len(got)}B / want {len(want)}B")
        expected = want.decode("utf-8-sig").split("\r\n\r\n")
        for i in range(max(len(expected), len(subtitles))):
            a = subtitles[i] if i < len(subtitles) else "<없음>"
            b = expected[i] if i < len(expected) else "<없음>"
            if a != b:
                print(f"  [{i + 1}] got  = {a!r}\n       want = {b!r}")


if __name__ == "__main__":
    main()
