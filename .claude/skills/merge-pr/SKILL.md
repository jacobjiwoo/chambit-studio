---
name: merge-pr
description: main을 바라보는 PR을 merge commit으로 머지하고 브랜치를 정리한다.
disable-model-invocation: true
argument-hint: "[PR 번호]"
---

# PR 머지

main을 바라보는 PR 하나를 머지하고, 로컬 `main`을 맞추고, 그 브랜치를 로컬과 원격에서 지운다. 머지 방식과 브랜치 삭제의 근거는 [branching.md](../../rules/branching.md)다. 검사는 CI의 `check`와 `main 보호` ruleset이 강제하니, 이 스킬은 GitHub가 보고하는 상태를 읽기만 한다.

## 1. 대상 PR을 정한다

- 인자로 번호를 받았으면 그 PR이다. base가 `main`인지 확인한다.
- 없으면 `gh pr list --base main --json number,title,headRefName,isDraft`로 찾는다. 0개면 알리고 끝낸다. 1개면 그것이다. 여러 개면 목록을 보여 주고 사용자가 고르게 한다.

PR 번호 하나와 head 브랜치 이름이 정해지면 끝난다.

## 2. 머지할 수 있는지 본다

```bash
gh pr view <N> --json isDraft,mergeStateStatus,headRefOid,statusCheckRollup
```

check가 아직 돌고 있으면 `gh pr checks <N> --watch`로 끝날 때까지 기다린 뒤 다시 본다. 그다음 `mergeStateStatus`로 가른다.

| 상태 | 할 일 |
| - | - |
| `CLEAN` | 다음 단계로 간다. 이때의 `headRefOid`를 적어 둔다 |
| `UNSTABLE` | 필수가 아닌 check(Cloudflare Pages 등)가 실패했다. 실패한 check를 보여 주고 머지할지 사용자에게 묻는다 |
| `UNKNOWN` | GitHub가 아직 계산 중이다. 잠시 뒤 다시 읽는다 |
| 그 밖(`BLOCKED`, `DIRTY`, draft 등) | 멈추고, 빨간 check나 충돌을 사용자에게 보고한다 |

막힌 PR은 멈추고 보고하는 것으로 끝낸다. `--admin`으로 ruleset을 넘지 않는다.

## 3. 머지한다

```bash
gh pr merge <N> --merge --delete-branch --match-head-commit <headRefOid>
```

`--match-head-commit`은 2단계에서 본 커밋 그대로일 때만 머지하게 한다. 그사이 push가 있어 실패하면 2단계로 돌아간다.

`gh pr view <N> --json state,mergeCommit`이 `MERGED`를 보이면 끝난다. 브랜치 삭제 에러는 5단계에서 처리한다.

## 4. 로컬 `main`을 맞춘다

`git worktree list`에서 `[main]`인 checkout을 찾아 `git -C <path> pull --ff-only`. 커밋하지 않은 변경이 있으면 pull하지 않고 보고한다.

5단계의 `git branch -d`가 브랜치를 머지된 것으로 알아보려면 이 단계가 먼저다.

## 5. 브랜치가 남지 않게 한다

`--delete-branch`는 head 브랜치가 다른 worktree에 체크아웃돼 있으면 로컬 삭제에 실패한다. 이 저장소는 앱 worktree(`.claude/worktrees/`)를 쓰니 자주 일어난다.

```bash
git fetch --prune
git ls-remote --heads origin <head>   # 원격
git branch --list <head>              # 로컬
git worktree list                     # 브랜치를 쥔 worktree
```

- 원격에 남았으면 `git push origin --delete <head>`.
- 로컬에 남았고 worktree가 쥐고 있으면, `git -C <path> status --porcelain`이 비어 있을 때만 `git worktree remove <path>` 후 `git branch -d <head>`. 변경이 남았거나 지금 세션이 그 worktree 안이면 지우지 않고 경로와 함께 보고한다.
- 로컬에만 남았으면 `git branch -d <head>`.

원격과 로컬 어디에도 그 브랜치가 없거나, 남은 것을 이유와 함께 적었으면 끝난다.

## 6. 보고한다

PR 번호와 제목, merge commit SHA, 지운 브랜치, 남긴 것과 그 이유를 한 번에 알린다.
