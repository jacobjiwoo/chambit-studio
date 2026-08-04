import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { DocNavItem, DocPage } from "../_lib/build-docs";
import "./doc-prose.css";
import { Footer } from "./footer";
import { Sidebar } from "./sidebar";

/**
 * 문서 페이지 한 장의 틀 — 사이드바 일곱 줄, 본문, 푸터 네 줄.
 *
 * `layout.tsx`가 아니라 **컴포넌트**인 이유는 사이드바가 지금 열린 페이지를 알아야 하기
 * 때문이다. 레이아웃은 자기 아래 어느 경로가 열렸는지 서버에서 알 수 없어서 `usePathname()`
 * 이 필요해지고, 그 순간 **모든 본문 페이지에 클라이언트 JS가 내려간다.** 페이지가 슬러그를
 * 알고 있으므로 넘겨주면 그만이다.
 *
 * **반응형 전용 설계가 없다.** 좁은 화면에서 한 컬럼으로 접히기만 한다(`md:flex-row` 하나).
 * 방송실 PC 한 대뿐이고 폰 경로가 0개다 — 모바일 내비·터치 타깃·인쇄 CSS·오프라인 전부 없다.
 */
export function DocShell({ page, nav }: { page: DocPage; nav: DocNavItem[] }) {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
        <Sidebar nav={nav} current={page.slug} />

        <main className="min-w-0 flex-1 px-6 py-10 md:px-10">
          <h1 className="text-2xl font-bold text-neutral-900">{page.title}</h1>
          {/* 사이드바에서 이 페이지를 고르게 만든 그 한 줄이 그대로 여기 다시 선다 */}
          <p className="mt-1 text-neutral-500">{page.lede}</p>

          <div className="doc-prose mt-8">
            {/* 빌드 타임에 HTML로 구워진다 — `react-markdown`은 브라우저로 안 간다 */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{page.body}</ReactMarkdown>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
