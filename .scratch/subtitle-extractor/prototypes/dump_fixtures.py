"""원고 3편을 UI 프로토타입용 JSON 픽스처로 떨군다. 던져버릴 코드.

    python3 dump_fixtures.py > ../../../app/prototype/subtitle-screen/fixtures.json

자막·걸러낸 것·모르는 색에 더해 **문단 전문**까지 담는다. 갈래 C(원고 대조)가
원고를 그대로 그려야 하기 때문이다.
"""

import json
import os
import sys

from subtitle_rules import BLACK, DIRECTIVE, RED, parse_hwp

FILES = [
    "0118-25고전20260531십자가의 도 하나님의 능력.hwp",
    "0401-09잠20260510지혜와 명철을 얻으라.hwp",
    "0919-27고전20260614복음을 위하여.hwp",
]


def analyse(runs):
    """subtitle_rules.to_subtitles와 같은 규칙 — 다만 문단 단위 판정을 다 내놓는다."""
    paragraphs, order = {}, []
    for run in runs:
        if run["paragraph"] not in paragraphs:
            paragraphs[run["paragraph"]] = []
            order.append(run["paragraph"])
        paragraphs[run["paragraph"]].append(run)

    out, index = [], 0
    for no in sorted(order):
        group = paragraphs[no]
        meaningful = [r for r in group if r["text"].strip()]
        text = "".join(r["text"] for r in group).strip()
        unknown = [r["color"] for r in meaningful if r["color"] not in (RED, BLACK)]

        if not meaningful or not text:
            verdict = "empty"
        elif not all(r["color"] == RED for r in meaningful):
            verdict = "mixed" if any(r["color"] == RED for r in meaningful) else "black"
        elif DIRECTIVE.fullmatch(text):
            verdict = "directive"
        else:
            verdict = "subtitle"

        if verdict == "empty":
            continue

        entry = {
            "paragraph": no,
            "text": text,
            "verdict": verdict,
            "runs": [
                {"text": r["text"], "color": r["color"]}
                for r in group
                if r["text"].strip()
            ],
        }
        if unknown:
            entry["unknownColors"] = sorted(set(unknown))
        if verdict == "subtitle":
            index += 1
            entry["index"] = index
        if verdict == "mixed":
            # 규칙이 실제로 버린 것은 문단 전체가 아니라 그 안의 빨간 조각이다.
            # 화면은 조각을 보여주되 문단을 맥락으로 깔아줘야 판단이 선다.
            entry["redFragments"] = [
                r["text"].strip() for r in meaningful if r["color"] == RED
            ]
        out.append(entry)
    return out


def main():
    downloads = os.path.expanduser("~/Downloads")
    docs = []
    for name in FILES:
        blocks = analyse(parse_hwp(os.path.join(downloads, name)))
        docs.append({
            "filename": name,
            "blocks": blocks,
            "subtitles": [b["text"] for b in blocks if b["verdict"] == "subtitle"],
            "dropped": [
                {"fragment": f, "paragraph": b["text"]}
                for b in blocks
                if b["verdict"] in ("directive", "mixed")
                for f in b.get("redFragments", [b["text"]])
            ],
        })
    json.dump(docs, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
