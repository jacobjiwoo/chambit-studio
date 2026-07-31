"""HWP 5.0 파일에서 빨간색 글자 구간을 추출하는 참조 구현.

`설교 원고 실물 확보 및 파일 포맷 판별` 티켓을 해소하면서, hwp 바이너리에서
색상 포함 텍스트를 뽑아낼 수 있는지 실증하기 위해 작성했다. 실제 설교 원고
한 편에서 빨간 구간 22개를 정상 추출하는 것을 확인했다.

이 스크립트 자체는 제품이 아니다(파이썬이고, 최종 구현은 브라우저에서 돌아야
한다). **알고리즘의 참조 구현**으로 남긴다 — 브라우저 구현이 무엇을 해야 하는지
이 코드가 정확히 보여준다.

    python3 extract_red.py <파일.hwp>

## 알고리즘

1. hwp는 OLE 복합 파일. `DocInfo`와 `BodyText/SectionN` 스트림을 꺼낸다
2. 두 스트림 모두 zlib raw deflate로 압축돼 있다 (wbits=-15)
3. 레코드 스트림 구조: 4바이트 헤더 = tagID(10bit) | level(10bit) | size(12bit).
   size가 0xFFF이면 이어지는 4바이트가 실제 크기
4. `DocInfo`의 CHAR_SHAPE(tag 21) 레코드 offset 52에 글자색이 COLORREF(0x00BBGGRR)로 들어있다
5. `BodyText`의 PARA_TEXT(tag 67)가 UTF-16LE 본문, PARA_CHAR_SHAPE(tag 68)가
   (문자위치, charShapeID) 쌍의 배열. 둘을 맞추면 각 구간의 색을 알 수 있다
6. 제어문자는 위치 계산에 포함된다 — extended/inline은 8 WCHAR, 나머지는 1 WCHAR를 차지

## 알려진 한계

같은 빨간색이라도 문자 모양 ID가 다르면 구간이 갈라진다. 실제 원고에서 한 문장이
2~3조각으로 쪼개지는 경우가 관찰됐으므로, 실제 구현은 **인접한 빨간 구간을 병합**해야
한다. 자세한 내용은 `빨간색 판정 규칙과 자막 쪼개는 단위` 티켓 참조.
"""

import struct
import sys
import zlib

import olefile

HWPTAG_CHAR_SHAPE = 21
HWPTAG_PARA_TEXT = 67
HWPTAG_PARA_CHAR_SHAPE = 68

# 제어문자 중 8 WCHAR를 차지하는 것들
EXTENDED = {1, 2, 3, 11, 12, 14, 15, 16, 17, 18, 21, 22, 23}
INLINE = {4, 5, 6, 7, 8, 9, 19, 20}


def records(data):
    """레코드 스트림을 (tag, body)로 순회한다."""
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
    """DocInfo에서 문자 모양별 글자색 목록을 읽는다."""
    doc = zlib.decompress(ole.openstream("DocInfo").read(), -15)
    colors = []
    for tag, body in records(doc):
        if tag == HWPTAG_CHAR_SHAPE and len(body) >= 56:
            ref = struct.unpack("<I", body[52:56])[0]  # COLORREF = 0x00BBGGRR
            colors.append((ref & 0xFF, (ref >> 8) & 0xFF, (ref >> 16) & 0xFF))
    return colors


def wchars(raw):
    """본문을 (WCHAR 인덱스, 문자) 목록으로 편다. 제어문자는 자리만 차지한다."""
    out, i, n = [], 0, len(raw) // 2
    while i < n:
        code = struct.unpack("<H", raw[i * 2 : i * 2 + 2])[0]
        if code in EXTENDED or code in INLINE:
            out.append((i, None))
            i += 8
        elif code < 32:
            out.append((i, "\n" if code in (10, 13) else None))
            i += 1
        else:
            out.append((i, chr(code)))
            i += 1
    return out


def segments(ole, colors):
    """(rgb, 텍스트) 구간 목록을 만든다."""
    found, text = [], None
    for section in [n for n in ole.listdir() if n[0] == "BodyText"]:
        data = zlib.decompress(ole.openstream("/".join(section)).read(), -15)
        for tag, raw in records(data):
            if tag == HWPTAG_PARA_TEXT:
                text = wchars(raw)
            elif tag == HWPTAG_PARA_CHAR_SHAPE and text is not None:
                marks = [
                    struct.unpack("<II", raw[i : i + 8])
                    for i in range(0, len(raw) - 7, 8)
                ]
                for k, (pos, shape_id) in enumerate(marks):
                    end = marks[k + 1][0] if k + 1 < len(marks) else float("inf")
                    rgb = colors[shape_id] if shape_id < len(colors) else (0, 0, 0)
                    chunk = "".join(c for i, c in text if c and pos <= i < end)
                    if chunk.strip():
                        found.append((rgb, chunk.strip()))
                text = None
    return found


def is_red(rgb):
    r, g, b = rgb
    return r > 120 and g < 100 and b < 100


def main():
    if len(sys.argv) < 2:
        sys.exit(f"usage: {sys.argv[0]} <파일.hwp>")

    ole = olefile.OleFileIO(sys.argv[1])
    colors = char_shape_colors(ole)
    found = segments(ole, colors)
    red = [t for rgb, t in found if is_red(rgb)]

    print(f"전체 구간 {len(found)}개 중 빨간 구간 {len(red)}개\n")
    for i, chunk in enumerate(red, 1):
        print(f"[{i:2}] {' '.join(chunk.split())}")


if __name__ == "__main__":
    main()
