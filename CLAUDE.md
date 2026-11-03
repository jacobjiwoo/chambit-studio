# 참빛 스튜디오

참빛교회 방송부 내부 사이트다. 방송 장비·프로그램 문서와 예배 준비 도구를 모은다. 쓰는 사람은 방송부 봉사자라 개발자가 아니다.

## 무엇이 있나

| 라우트 | 무엇 | 결정과 이유 |
| - | - | - |
| `/subtitle-extractor` | 설교 원고(`.hwp`)의 빨간 글자를 나비CG 임포트 파일로 만든다 | `.scratch/subtitle-extractor/` |
| `/tools/praise-ppt` | 곡을 골라 셋리스트를 짜고 예배용 PPT로 내려받는다 | `.scratch/praise-ppt/` |
| `/docs/nabi` | Compix NABI 매뉴얼을 옮긴 웹 문서 | `.scratch/nabi-manual/` |
| `/docs/broadcast-system` | 방송실 장비·연결·운영 문서. 이 저장소가 유일한 원천이다 | `.scratch/broadcast-system/` |

기능을 손대기 전에 그 폴더의 `map.md`나 `spec.md`를 읽는다.

## 지켜야 할 전제

- **서버가 없다.** `output: "export"`로 정적 파일만 내고 Cloudflare Pages에 올린다. 파일 파싱과 생성은 모두 브라우저에서 한다. Server Action, 동적 Route Handler, 요청 시점 렌더링은 쓸 수 없다.
- **Next.js 16이다.** 학습한 지식보다 새로울 수 있으니 API가 헷갈리면 `node_modules/next/dist/docs/`를 읽는다.
- **저장소와 사이트가 public이다.** 한 번 커밋하면 히스토리에 남는다. 실제 원고는 gitignore된 `fixtures/`에만 둔다.

## 검증

패키지 매니저는 pnpm이다. 변경을 마치면 CI와 같은 세 가지를 돌린다.

```bash
pnpm lint && pnpm typecheck && pnpm test
```

## Agent skills

`docs/agents/`는 mattpocock-skills 1.3.1의 `/setup-matt-pocock-skills`가 만들었다. skill의 base directory에 다른 버전이 보이면 그 skill을 다시 돌려 템플릿과 맞춘다.

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), used as-is. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
