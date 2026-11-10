/** 사이트 푸터. 한 줄로 짧게 둔다. 긴 문서 끝에서 방해가 되지 않게 한다. */
export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-1.5 text-[13px] text-neutral-600 md:px-6">
        <span>
          <span className="font-bold text-neutral-900">참빛 스튜디오</span> · 참빛교회 방송부
        </span>
        <a
          href="https://github.com/jacobjiwoo/chambit-studio"
          className="py-2 hover:text-neutral-900 hover:underline"
        >
          GitHub 저장소
        </a>
      </div>
    </footer>
  );
}
