import { PageLinkList } from "../../_components/page-link-list";
import { loadPages } from "../_lib/pages";

/**
 * 첫 페이지의 링크 목록. 사이드바와 같은 frontmatter에서 만들어 손으로 쓴 목록이 생기지
 * 않게 한다. 빌드 때 디스크를 읽으므로 서버 컴포넌트다. MDX 페이지가 import해서 쓴다.
 */
export function PageLinks() {
  return <PageLinkList links={loadPages()} />;
}
