# Callout 컴포넌트

Type: task
Status: resolved
Blocked by: 04, 05

## Question

`Callout 종류와 원문 표현`이 정한 종류대로 `Callout` 컴포넌트를 만들고 `mdx-components.tsx`에 등록한다. 샘플 페이지에서 종류마다 렌더되는지 확인하고, `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과해야 끝난다.

## Answer

- `app/_components/callout.tsx`의 `Callout`이 `type: "warning" | "danger"`를 받는다. 아이콘(warning 삼각형, danger 팔각형)과 테두리·배경색만 넣고 글자 라벨은 넣지 않는다. 시각 라벨이 없으므로 `role="note"`만 달고 아이콘은 `aria-hidden`이다.
- **위치는 `app/_components`다.** 컴포넌트를 쓰는 곳이 루트 `mdx-components.tsx`라서다. `@/app/docs/nabi/_components/...`도 `./app/docs/nabi/_components/...`도 `no-restricted-imports`(라우트 private folder를 밖에서 import하지 않는다)에 걸린다. 쓰는 곳과 가장 가까운 공통 조상이 루트이므로 [project-structure.md](../../../.claude/rules/project-structure.md)의 "가장 가까운 공통 조상" 규칙대로 `app/_components`다.
- `mdx-components.tsx`의 `components`에 `Callout`을 더했다. 절 페이지는 import 없이 쓴다.

```mdx
<Callout type="warning">
**주의 :** 문단 그대로.
</Callout>
```

- 여는 태그 다음 줄부터 마크다운으로 읽힌다. 문단이 여럿이면 빈 줄로 나눈다. 안쪽 첫 문단의 위 여백은 지운다.
- 샘플 페이지에서 두 종류가 렌더되는 것을 개발 서버와 빌드 HTML로 확인했다. `pnpm lint`, `pnpm typecheck`, `pnpm build`가 통과한다.
