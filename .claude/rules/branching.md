# 브랜치 규칙

사람이든 에이전트든 예외 없이 따른다. 오타 한 줄도 같다.

## `main`에 직접 커밋하지 않는다

모든 변경은 작업 브랜치에서 하고 PR로 `main`에 들인다. `main`은 GitHub ruleset으로 막혀 있다 — PR 없이는 push가 안 되고, force-push와 삭제도 안 된다.

## 이름: `<종류>/<slug>`

CI의 `Branch name` step이 push와 PR마다 이 패턴을 검사한다.

| 종류 | 무엇 |
| - | - |
| `feat` | 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작은 그대로, 구조만 |
| `docs` | 문서. `.scratch/` 아래 조사·스펙·티켓도 여기다 |
| `chore` | 설정, 의존성, 도구 |

- slug는 영문 소문자, 숫자, `-`.
- 티켓에서 시작한 작업이면 slug를 `<feature>-<NN>-<slug>`로 짓는다. 예: `docs/dawn-prayer-ppt-03-pptx-generation`.
- 다섯 종류 밖의 접두어는 쓰지 않는다. `research/`도 마찬가지 — 조사는 `docs/`다.

## 티켓 여럿으로 한 기능을 만들 때: integration branch

한 기능을 티켓 여러 개로 나눠 구현하면 티켓 브랜치를 integration branch에 모으고, `main`에는 PR 하나로 들인다.

- 이름은 `<종류>/<feature>`다. `<feature>`는 `.scratch/<feature>/` 폴더 이름이다. 예: `feat/dawn-prayer-ppt`.
- `main`에서 만들고, 티켓 작성 커밋은 여기에 바로 올린다. 구현은 티켓 브랜치로만 들인다.
- 티켓 브랜치는 integration branch에서 만든다. 이름은 위 티켓 규칙을 따른다. 예: `feat/dawn-prayer-ppt-03-pptx-generation`.
- 티켓 브랜치는 PR 없이 `git merge --no-ff`로 integration branch에 들이고 바로 지운다.
- `main`의 변경은 integration branch에 merge로 받는다. 티켓 브랜치가 그 위에 있으니 rebase하지 않는다.
- 티켓이 모두 들어오면 integration branch에서 `main`으로 PR을 연다.

## Claude 앱 worktree 세션

앱은 `claude/<name>` 브랜치를 만든다. 첫 push 전에 이름을 바꾼다.

```bash
git branch -m <종류>/<slug>
```

## 들이기: PR + merge commit

- `main`으로는 PR을 열고 **merge commit**으로 머지한다. squash하지 않는다 — 커밋 하나하나가 기록이다.
- 머지하면 브랜치를 로컬과 원격에서 바로 지운다.
