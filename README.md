# 참빛 스튜디오

참빛교회 방송부의 내부 사이트다. 방송 장비와 프로그램 문서, 예배를 준비하는 도구를 한곳에 모은다.

**https://chambitstudio.com**

## 무엇이 있나

| 도구 | 하는 일 |
| - | - |
| [자막 추출](https://chambitstudio.com/subtitle-extractor) | 설교 원고(`.hwp`)에서 빨간 글자를 뽑아 나비CG 임포트 파일로 만든다 |
| [찬양 PPT](https://chambitstudio.com/tools/praise-ppt) | 곡을 골라 셋리스트를 짜고 예배용 PPT로 내려받는다 |
| [NABI 매뉴얼](https://chambitstudio.com/docs/nabi) | Compix NABI 매뉴얼을 웹 문서로 옮긴 것 |
| [방송 시스템](https://chambitstudio.com/docs/broadcast-system) | 방송실 장비, 연결, 운영 문서. 이 저장소가 유일한 원천이다 |

## 전제

- **서버가 없다.** Next.js의 `output: "export"`로 정적 파일만 만들고, `main`에 머지하면 Cloudflare Pages가 빌드해 배포한다.
- **파일 파싱과 생성은 모두 브라우저에서 한다.** 원고와 PPT는 사용자 컴퓨터 밖으로 나가지 않는다.
- **저장소와 사이트가 public이다.** 실제 설교 원고는 커밋하지 않는다. 테스트용 원고는 gitignore된 `fixtures/`에만 둔다.

## 로컬에서 돌리기

Node 26과 pnpm 11이 필요하다.

```bash
pnpm install
pnpm dev
```

변경을 마치면 CI와 같은 검사를 돌린다.

```bash
pnpm lint && pnpm typecheck && pnpm test
```

`fixtures/`에 원고가 없으면 원고를 읽는 테스트는 실패하지 않고 skip된다.

## 기여하기

- 기능을 고치기 전에 그 기능의 `.scratch/<feature>/`에 있는 `map.md`나 `spec.md`를 읽는다. 결정과 이유가 거기 있다.
- `main`에 직접 커밋하지 않는다. 브랜치 이름과 머지 방식은 [branching.md](.claude/rules/branching.md)를 따른다.
- 파일을 어디에 둘지는 [project-structure.md](.claude/rules/project-structure.md)를 따른다.
- 문서, 커밋, PR, 주석은 한국어로 쓴다. 자세한 내용은 [language.md](.claude/rules/language.md)에 있다.

## 제3자 콘텐츠

- NABI 문서는 Compix의 서면 허락을 받아 매뉴얼을 웹 문서로 옮긴 것이다. 권리는 Compix에 있다.
- 찬양 슬라이드 이미지는 원 블로그([cwy0675.tistory.com](https://cwy0675.tistory.com)) 운영자의 허락을 받아 제공한다. 권리는 원저작자에게 있다. 저장소에는 곡 제목과 장수만 담는다.
