import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 앱 전부가 브라우저 안에 있어 서버가 없다. 순수 정적 파일 뭉치가 나오고 호스트를
   * 갈아타는 비용이 거의 0인 열린 문이다. 배포는 Cloudflare Pages.
   */
  output: "export",
};

export default nextConfig;
