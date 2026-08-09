"""공회 캐시 1,189장 → bible.json (평면 구조: "창1:1" → 본문).

fetch-bskorea.py가 받아 둔 캐시를 읽는다. 산출물은 `.scratch/dawn-prayer-ppt/bible.json`이며,
소제목 경계는 **선행 공백 한 칸**으로 남긴다 — 조사가 오탐 0/28,660으로 검증한 신호다
(`research/bible-json.md`).

    python3 parse-bskorea.py

⚠ 이건 중간 형태다. 실제로 배포되는 모양은 티켓 05가 정한 **책 중첩 배열 + trim + 소제목
플래그 + 병합절 예외표**이고, 그 변환은 아직 구현되지 않았다. 티켓 05의 ## Answer를 볼 것.
"""
import collections
import html
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
CANON = json.load(open(os.path.join(HERE, "canon.json"), encoding="utf-8"))
CACHE = os.path.join(HERE, "cache")
OUT = os.path.join(HERE, "..", "bible.json")

ABBR = {b["code"]: b["abbr"] for b in CANON}
ORDER = {b["abbr"]: i for i, b in enumerate(CANON)}


def parse(s):
    """[(절번호, 본문, 이 절 앞에 소제목이 있었나)]

    공회 HTML에서 소제목은 **앞 절의 꼬리에 붙어** 나온다. 그래서 한 칸 밀어 다음 절에 귀속시킨다.
    """
    i = s.find('class="chapNum"')
    if i < 0:  # 1장짜리 책(옵·몬·유·요이·요삼)에는 chapNum이 없다
        i = s.find('<span class="number"')
    j = s.find('<div style="width:100%;text-align: center">', i)
    body = s[i:j if j > i else len(s)]
    body = re.sub(r'<font class="smallTitle">.*?</font>', "\x01SUB\x01", body, flags=re.S)
    parts = re.split(r'<span class="number">', body)
    head_sub = "\x01SUB\x01" in parts[0]  # 장 첫 절의 소제목만은 절 번호 앞에 온다

    rows = []
    for p in parts[1:]:
        m = re.match(r"(.*?)&nbsp;&nbsp;&nbsp;</span>(.*)", p, re.S)
        if not m:
            continue
        num = html.unescape(re.sub("<[^>]+>", "", m.group(1))).strip()
        t = m.group(2)
        tail_sub = "\x01SUB\x01" in t  # 이 절 뒤 = 다음 절 앞
        t = re.sub(r"<div id='D_[^']*'.*?</div>", "", t, flags=re.S)  # 난하주 본문
        t = re.sub(r"<a class=comment.*?</a>", "", t, flags=re.S)     # 난하주 마커
        t = t.replace("\x01SUB\x01", " ")
        t = re.sub("<[^>]+>", "", t)
        t = html.unescape(t).replace("\xa0", " ")
        rows.append([num, re.sub(r"\s+", " ", t).strip(), tail_sub])

    return [(num, text, rows[i - 1][2] if i > 0 else head_sub)
            for i, (num, text, _) in enumerate(rows)]


def sortkey(k):
    m = re.match(r"([가-힣]+)(\d+):(\d+)", k)
    return (ORDER[m.group(1)], int(m.group(2)), int(m.group(3)))


def main():
    # 캐시를 훑지 않고 **정경이 있어야 한다고 말하는 파일만** 읽는다.
    # 옛 시도가 남긴 잔재(요나의 jon_*)에 면역이고, 빠진 장이 있으면 여기서 걸린다.
    data, nsub = {}, 0
    for b in CANON:
        for chap in range(1, b["chapters"] + 1):
            fp = os.path.join(CACHE, f'{b["code"]}_{chap}.html')
            if not os.path.exists(fp):
                raise SystemExit(f"캐시에 없음: {b['name']} {chap}장 — fetch-bskorea.py를 먼저 돌릴 것")
            for num, text, lead in parse(open(fp, encoding="utf-8", errors="replace").read()):
                data[f'{b["abbr"]}{chap}:{num}'] = (" " + text) if lead else text
                nsub += lead

    data = {k: data[k] for k in sorted(data, key=sortkey)}  # 책·장·절 순 — 결정적 순서
    print(f"항목 {len(data):,} | 소제목 경계 {nsub:,}")

    bad = collections.Counter()
    for v in data.values():
        s = v.strip()
        if "?" in s: bad["?"] += 1
        if "\x00" in s: bad["NUL"] += 1
        if re.search(r"\d\)", s): bad["난하주"] += 1
        if "." in s: bad["마침표"] += 1
        if "  " in v: bad["이중공백"] += 1
        if not s: bad["빈값"] += 1
    print("결함:", dict(bad) or "0")  # 공회 본문에서는 전부 0이어야 한다

    open(OUT, "w", encoding="utf-8").write(json.dumps(data, ensure_ascii=False, indent=1))
    print(f"wrote {os.path.abspath(OUT)} {os.path.getsize(OUT):,} B")


if __name__ == "__main__":
    main()
