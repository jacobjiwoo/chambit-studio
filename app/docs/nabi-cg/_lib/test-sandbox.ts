/**
 * 소스 폴더 하나를 손으로 짓는 헬퍼 — 실물 `_content`나 `_meta`를 안 건드리고 소스 사고를
 * 재현한다. `build-docs.test.ts`와 `_meta/nabi-build.test.ts`가 같이 쓴다.
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const made: string[] = [];

export function sandbox(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "nabi-docs-"));
  made.push(dir);
  for (const [name, body] of Object.entries(files)) {
    writeFileSync(join(dir, name), body);
  }
  return dir;
}

/** 각 테스트 파일의 `afterAll`에서 부른다 — 이 모듈이 만든 임시 폴더를 전부 지운다. */
export function cleanupSandboxes(): void {
  for (const dir of made) rmSync(dir, { recursive: true, force: true });
}
