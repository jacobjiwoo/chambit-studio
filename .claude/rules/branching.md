# 브랜치 규칙

사람이든 에이전트든 예외 없이 따른다. 오타 한 줄도 같다.

## `main`에 직접 커밋하지 않는다

모든 변경은 작업 브랜치에서 하고 PR로 `main`에 들인다. `main`은 GitHub ruleset으로 막혀 있다 — PR 없이는 push가 안 되고, force-push와 삭제도 안 된다.

## 이름: `<종류>/<slug>`

| 종류 | 무엇 |
| - | - |
| `feat` | 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작은 그대로, 구조만 |
| `docs` | 문서. `.scratch/` 아래 조사·스펙·티켓도 여기다 |
| `chore` | 설정, 의존성, 도구 |

- slug는 영문 소문자와 `-`.
- 티켓에서 시작한 작업이면 slug를 `<feature>-<NN>-<slug>`로 짓는다. 예: `docs/dawn-prayer-ppt-03-pptx-generation`.
- 다섯 종류 밖의 접두어는 쓰지 않는다. `research/`도 마찬가지 — 조사는 `docs/`다.

## Claude 앱 worktree 세션

앱은 `claude/<name>` 브랜치를 만든다. 첫 push 전에 이름을 바꾼다.

```bash
git branch -m <종류>/<slug>
```

## 들이기: PR + merge commit

- PR을 열고 **merge commit**으로 머지한다. squash하지 않는다 — 커밋 하나하나가 기록이다.
- 머지하면 브랜치를 로컬과 원격에서 바로 지운다.
