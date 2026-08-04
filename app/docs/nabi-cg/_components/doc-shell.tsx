import type { JSX } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { anchorOf } from "../_lib/anchor";
import { BADGE_HREF, type DocNavItem, type DocPage } from "../_lib/build-docs";
import "./doc-prose.css";
import { Footer } from "./footer";
import { Sidebar } from "./sidebar";

/**
 * `[추론]`이 04에서 `[확인 전](#unconfirmed)` 링크로 바뀌어 내려온다 — 이 컴포넌트가 그 한 자리만
 * 배지로 갈아 끼운다. 본문에 실제 링크가 생기면(08의 `/subtitle-extractor`) 나머지는 그대로 `<a>`다.
 */
// `node`는 react-markdown이 항상 끼워 넣는 hast 노드다. DOM `<a>`로 새지 않도록 걷어내기만 한다.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DocLink({ href, children, node, ...rest }: JSX.IntrinsicElements["a"] & { node?: unknown }) {
  if (href === BADGE_HREF) return <sup className="doc-badge">확인 전</sup>;
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

/** hast 노드 하나에서 글자만 걷어 온다 — 색인이 본 소제목과 **같은 문자열**이어야 앵커가 맞다. */
function textOf(node: unknown): string {
  const element = node as { value?: string; children?: unknown[] };
  if (typeof element?.value === "string") return element.value;
  return (element?.children ?? []).map(textOf).join("");
}

/**
 * 소제목에 앵커를 박는다. **검색 결과가 떨어지는 자리가 여기다** — `_lib/anchor.ts`의 함수
 * 하나를 색인 쪽과 나눠 쓰므로, 소제목을 고치면 `#`와 `id`가 **함께** 바뀐다.
 */
function heading(Tag: "h2" | "h3") {
  // `node`는 여기서 앵커를 뽑는 데 쓰고 DOM으로는 안 넘긴다
  return function Heading({
    children,
    node,
    ...rest
  }: JSX.IntrinsicElements["h2"] & { node?: unknown }) {
    return (
      <Tag id={anchorOf(textOf(node))} {...rest}>
        {children}
      </Tag>
    );
  };
}

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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{ a: DocLink, h2: heading("h2"), h3: heading("h3") }}
            >
              {page.body}
            </ReactMarkdown>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
