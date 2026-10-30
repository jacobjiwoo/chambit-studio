import type { MDXComponents } from "mdx/types";

/**
 * 모든 MDX 페이지에 적용되는 요소 매핑. `@next/mdx`가 App Router에서 이 파일을 루트에서만
 * 찾는다.
 *
 * 본문 스타일을 여기서 요소마다 준다. 절 페이지는 마크다운만 쓰고 class를 달지 않는다.
 * `rehype-slug`가 단 `id`는 `props`로 넘어오니 그대로 펼친다.
 *
 * `img`는 `next/image`로 바꾸지 않는다. 정적 export가 기본 loader를 지원하지 않고,
 * 마크다운 이미지에는 width·height가 없다.
 */
const components: MDXComponents = {
  h1: (props) => <h1 className="text-3xl font-bold" {...props} />,
  h2: (props) => (
    <h2
      className="mt-12 scroll-mt-6 border-b border-neutral-200 pb-2 text-2xl font-bold"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="mt-8 scroll-mt-6 text-xl font-semibold" {...props} />
  ),
  p: (props) => <p className="mt-4 leading-7" {...props} />,
  a: (props) => <a className="text-blue-700 underline" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-1 pl-6" {...props} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-1 pl-6" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-4 border-l-4 border-neutral-300 pl-4 text-neutral-600"
      {...props}
    />
  ),
  hr: (props) => <hr className="my-8 border-neutral-200" {...props} />,
  table: (props) => (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="border border-neutral-300 bg-neutral-100 px-3 py-2 text-left font-semibold"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border border-neutral-300 px-3 py-2 align-top" {...props} />
  ),
  code: (props) => (
    <code
      className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9em]"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-4 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-100 [&>code]:bg-transparent [&>code]:p-0"
      {...props}
    />
  ),
  img: ({ alt = "", ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element -- 위 주석대로 next/image를 쓰지 않는다
    <img className="mt-4 max-w-full" alt={alt} {...props} />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
