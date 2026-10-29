# 개역개정 데이터를 만드는 것들

`bible.json`이 어디서 왔는지가 파일 자체에는 안 적혀 있다. 여기 적혀 있다.

```
fetch-bskorea.py   공회 읽기 페이지 1,189장 → ./cache  (약 33 MB, 커밋 안 함)
parse-bskorea.py   ./cache → ../bible.json             (평면 구조, 5,057,258 B)
canon.json         66권의 약칭·정식 이름·공회 코드·장 수  (1,189장)
```

```bash
python3 fetch-bskorea.py     # 6분쯤. 이미 받은 장은 건너뛴다
python3 parse-bskorea.py     # 항목 31,088 | 소제목 경계 2,424 | 결함 0
```

**출처는 대한성서공회 하나뿐이다.** 인터넷에 도는 "개역개정" JSON(hangl.net·nocr.net,
`4판` 이름표가 붙은 것까지)은 **전부 같은 유포본**이고 정본과 300절이 다르다. YouVersion의
한국어 `KRV`는 개역개정이 아니라 개역한글이다. 근거는
[`issues/11-which-printing.md`](../issues/11-which-printing.md).

## 알아둘 것

**캐시 33 MB는 커밋하지 않는다.** `fetch-bskorea.py`가 언제든 다시 만든다. 대신 같은 URL이
나중에 다른 바이트를 줄 수 있으므로(공회가 페이지를 고치면) **산출물에 SHA-256 게이트가
걸린다** — [`issues/05-where-bible-data-lives.md`](../issues/05-where-bible-data-lives.md).

현재 산출물의 해시:

```
48b859ae50b4b68cdd6af781100586f39abf4ac5e2d7f146bbd9f556f3368bc5
```

**`bible.json`은 중간 형태다.** 실제로 배포되는 모양은 티켓 05가 정한 **책 중첩 배열 + trim +
소제목 플래그 + 병합절 예외표**(`public/bible.<해시8자>.json`)이고, 그 변환은 아직
구현되지 않았다. 구현은 `/to-spec` → `/implement`가 맡는다.

**소제목 경계는 선행 공백 한 칸으로 실려 있다** — 2,424절. 공회 HTML에서 소제목이 앞 절의
꼬리에 붙어 나오는 것을 한 칸 밀어 귀속시킨 것이고, 조사가 오탐 0/28,660으로 검증했다
([`research/bible-json.md`](../research/bible-json.md)). 배포본에서는 이걸 trim하고 별도
플래그로 명시한다 — 보이지 않는 문자에 의미가 실려 있으면 어느 파이프라인에서든 한 번
trim되는 순간 **에러 없이 조용히** 사라지기 때문이다.

**병합절 11개는 키가 `신6:18-19` 꼴이다.** 정본 표기이고 결함이 아니다. 배열로 바꾸는
순간 `arr[i]`의 `i+1`이 절 번호라는 가정이 이 11곳에서 깨지므로 예외표가 따로 실린다.
