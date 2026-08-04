import Link from "next/link";

/**
 * 도구 목록.
 *
 * 방송실의 다음 도구가 가정이 아니라 예정이므로 목록은 미래 대비가 아니라 현재 요구다.
 *
 * **`도구`/`문서` 분류 헤딩은 안 만든다.** 각 묶음에 항목이 하나씩이라 정보가 0이다.
 * 셋째가 올 때 가른다.
 */
export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-neutral-50 px-6 py-24">
      <main className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold">참빛 스튜디오</h1>
        <p className="mt-2 text-neutral-500">참빛교회 방송부 도구</p>

        <ul className="mt-10 space-y-3">
          <li>
            <Link
              href="/subtitle-extractor"
              className="block rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400"
            >
              <span className="font-semibold">설교 자막 추출기</span>
              <p className="mt-1 text-sm text-neutral-500">
                한글 원고에서 빨간 글자를 뽑아 나비CG 임포트 파일로 만듭니다.
              </p>
            </Link>
          </li>
          <li>
            <Link
              href="/docs/nabi-cg"
              className="block rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400"
            >
              <span className="font-semibold">나비CG 문서</span>
              <p className="mt-1 text-sm text-neutral-500">
                방송부가 실제로 쓰는 범위만 다시 쓴 나비CG 사용 문서입니다.
              </p>
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
