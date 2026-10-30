import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 앱 전부가 브라우저 안에 있어 서버가 없다. 순수 정적 파일 뭉치가 나오고 호스트를
   * 갈아타는 비용이 거의 0인 열린 문이다. 배포는 Cloudflare Pages.
   */
  output: "export",
  pageExtensions: ["ts", "tsx", "mdx"],
};

/**
 * 플러그인은 문자열 이름으로 넘긴다. Turbopack은 함수를 Rust로 넘기지 못하므로 옵션도
 * 직렬화할 수 있는 값만 된다. 근거는 .scratch/nabi-manual/research/mdx-foundation.md
 */
const withMDX = createMDX({
  options: {
    remarkPlugins: [
      "remark-gfm",
      "remark-frontmatter",
      // YAML frontmatter를 `export const metadata`로 바꾼다. Next.js는 title·description만 쓴다
      ["remark-mdx-frontmatter", { name: "metadata" }],
    ],
    rehypePlugins: ["rehype-slug"],
  },
});

export default withMDX(nextConfig);
