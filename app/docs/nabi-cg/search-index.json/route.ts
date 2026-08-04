import { docs } from "../_lib/docs";

/**
 * 색인이 **정적 파일 한 장**으로 나가는 자리 — `/docs/nabi-cg/search-index.json`.
 *
 * 라우트인 이유는 색인이 `buildDocs()`에서 이미 구워져 나오기 때문이다. `public/`에 미리 써 두는
 * 길은 빌드 스크립트가 하나 늘고 **저장소에 생성물이 커밋된다** — 본문을 고칠 때마다 사람이
 * 다시 굽는 것을 잊으면 색인이 조용히 낡는다. 여기서는 그럴 수가 없다.
 *
 * `output: 'export'`라 이 핸들러는 빌드에서 한 번 돌고 그 결과가 파일로 굳는다. 브라우저는
 * **검색을 실제로 연 순간에만** 이 주소를 부른다(`_lib/search.ts`의 `INDEX_URL`).
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(docs.index, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
