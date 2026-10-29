import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import checkFile from "eslint-plugin-check-file";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 프로젝트 구조 규칙. 근거는 .claude/rules/project-structure.md
  {
    plugins: { "check-file": checkFile },
    rules: {
      // 다른 라우트의 private folder를 import하지 않는다. 조상의 것만 된다
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(?:\\.\\.?/)+(?:[^_./][^/]*/)+_",
              message:
                "다른 라우트의 private folder다. 함께 쓰려면 가장 가까운 공통 조상의 _components·_lib로 올린다.",
            },
            {
              regex: "^@/app/(?:[^_/][^/]*/)+_",
              message:
                "라우트의 private folder는 상대 경로로 import한다. 별칭으로는 app/_components·app/_lib만 쓴다.",
            },
          ],
        },
      ],
      "check-file/filename-naming-convention": [
        "error",
        { "**/*": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": [
        "error",
        { "app/**/": "NEXT_JS_APP_ROUTER_CASE" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
