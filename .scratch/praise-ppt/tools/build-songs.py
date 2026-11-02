"""원격 D1 export(SQL)를 읽어 곡 목록 JSON `public/praise-ppt/songs.json`을 쓴다.

    python3 build-songs.py <d1-export.sql>

export는 SQLite 문법이라 메모리 DB에 그대로 실행해 읽는다. 자격증명은 쓰지 않는다.
"""

import gzip
import json
import sqlite3
import sys
from pathlib import Path

OUTPUT = Path(__file__).resolve().parents[3] / "public" / "praise-ppt" / "songs.json"


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("사용법: python3 build-songs.py <d1-export.sql>")

    database = sqlite3.connect(":memory:")
    database.executescript(Path(sys.argv[1]).read_text(encoding="utf-8"))

    posts = database.execute("SELECT id, title FROM posts ORDER BY id").fetchall()
    slides: dict[int, list[tuple[int, str]]] = {}
    for post_id, slide_index, image_path in database.execute(
        "SELECT post_id, slide_index, image_path FROM slide_images ORDER BY post_id, slide_index"
    ):
        slides.setdefault(post_id, []).append((slide_index, image_path))

    songs = []
    empty = 0
    broken = []
    for post_id, title in posts:
        rows = slides.get(post_id, [])
        if not rows:
            empty += 1
            continue
        # 화면이 주소를 `images/{id}/{n}.png`, n = 0..장수-1로 다시 만든다. 어긋나면 그 곡은 깨진다.
        expected = [(n, f"images/{post_id}/{n}.png") for n in range(len(rows))]
        if rows != expected:
            broken.append(post_id)
            continue
        songs.append({"id": post_id, "title": title, "slideCount": len(rows)})

    orphans = slides.keys() - {post_id for post_id, _ in posts}
    if broken or orphans:
        sys.exit(f"주소 규칙에 어긋나는 곡 {broken[:20]}, 곡 없는 슬라이드 {sorted(orphans)[:20]}")

    data = json.dumps(songs, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_bytes(data + b"\n")

    gzipped = len(gzip.compress(data, mtime=0))
    print(f"곡 {len(songs):,} | 걸러 낸 곡(슬라이드 0장) {empty:,} | {len(data):,} B | gzip {gzipped:,} B")


if __name__ == "__main__":
    main()
