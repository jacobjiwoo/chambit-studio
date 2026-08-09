"""대한성서공회 읽기 페이지에서 개역개정(GAE) 1,189장을 통째로 내려받아 캐시한다.

`.scratch/dawn-prayer-ppt/issues/11-which-printing.md`가 확정한 출처다 —
인터넷에 도는 "개역개정" JSON은 전부 같은 유포본이고, 믿을 수 있는 출처는 여기 하나뿐이다.

캐시(약 33 MB)는 저장소에 안 들어간다. 이 스크립트가 언제든 다시 만든다.
받은 캐시는 parse-bskorea.py가 bible.json으로 바꾼다.

    python3 fetch-bskorea.py            # ./cache 에 받는다. 이미 있는 장은 건너뛴다

⚠ 같은 URL이 나중에 다른 바이트를 줄 수 있다(공회가 페이지를 고치면). 그래서 산출물에는
SHA-256 게이트가 걸려 있다 — 티켓 05를 볼 것.
"""
import concurrent.futures as cf
import json
import os
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CANON = json.load(open(os.path.join(HERE, "canon.json"), encoding="utf-8"))
CACHE = os.path.join(HERE, "cache")

URL = ("https://www.bskorea.or.kr/bible/korbibReadpage.php"
       "?version=GAE&book={code}&chap={chap}&sec=1")


def get(job):
    code, chap = job
    fp = os.path.join(CACHE, f"{code}_{chap}.html")
    req = urllib.request.Request(URL.format(code=code, chap=chap),
                                 headers={"User-Agent": "Mozilla/5.0"})
    for attempt in range(4):
        try:
            d = urllib.request.urlopen(req, timeout=45).read().decode("utf-8", "replace")
            # 1장짜리 책(옵·몬·유·요이·요삼)에는 chapNum이 없다 — number로 확인한다
            if 'class="chapNum"' not in d and '<span class="number"' not in d:
                raise RuntimeError("본문 없음")
            open(fp, "w", encoding="utf-8").write(d)
            return None
        except Exception:
            time.sleep(1 + attempt * 2)
    return f"{code} {chap}"


def main():
    jobs = [(b["code"], c) for b in CANON for c in range(1, b["chapters"] + 1)]
    assert len(jobs) == 1189, len(jobs)
    os.makedirs(CACHE, exist_ok=True)
    todo = [j for j in jobs if not os.path.exists(os.path.join(CACHE, f"{j[0]}_{j[1]}.html"))]
    print(f"전체 {len(jobs)}장 / 받을 것 {len(todo)}장")

    fails = []
    # 남의 서버다. 동시 4개를 넘기지 말 것.
    with cf.ThreadPoolExecutor(max_workers=4) as ex:
        for n, r in enumerate(ex.map(get, todo), 1):
            if r:
                fails.append(r)
            if n % 100 == 0:
                print(f"  {n}/{len(todo)} 실패={len(fails)}", flush=True)
    print("실패:", fails or "없음")
    print("캐시:", len(os.listdir(CACHE)), "장")


if __name__ == "__main__":
    main()
