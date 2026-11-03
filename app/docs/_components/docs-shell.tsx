/**
 * 문서 레이아웃 껍데기 — 왼쪽 사이드바와 본문. 사이드바 내용은 라우트마다 달라서 넘겨 받는다.
 */
export function DocsShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-6 py-6 md:sticky md:top-0 md:h-screen md:w-64 md:overflow-y-auto md:border-r md:border-b-0">
        {sidebar}
      </aside>
      <article className="min-w-0 max-w-3xl flex-1 px-6 py-10 md:px-12">{children}</article>
    </div>
  );
}
