import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

import type { Plan } from "../_lib/plan";
import { pptxFileName, writePptx } from "../_lib/pptx";

/**
 * 만들기 버튼과 만들기 창(10). 창의 상태(진행 중·성공·실패)와 `.pptx` 쓰기 모듈은 10이 이
 * 컴포넌트 아래에 둔다.
 */
export type BuildProps = {
  /** "PPT 만들기 · N곡". 0이면 버튼을 막는다 */
  songCount: number;
  /**
   * 지금 셋리스트의 생성 계획. 실패면 사유를 실패 창에 그대로 보인다. "다시 시도"도 이 계획으로
   * 다시 만든다
   */
  plan: Plan;
};

/** 만들기 창의 상태. `null`이면 창이 닫혀 있다. */
type BuildState =
  | { kind: "progress" }
  | { kind: "success"; blob: Blob; fileName: string; songCount: number; slideCount: number }
  | { kind: "error"; message: string }
  | null;

export function Build({ songCount, plan }: BuildProps) {
  const [state, setState] = useState<BuildState>(null);

  const build = async () => {
    if (!plan.ok) {
      setState({ kind: "error", message: plan.error });
      return;
    }
    setState({ kind: "progress" });
    try {
      const blob = await writePptx(plan.slides);
      setState({
        kind: "success",
        blob,
        fileName: pptxFileName(new Date()),
        songCount,
        slideCount: plan.slides.length,
      });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "PPT를 만들지 못했습니다",
      });
    }
  };

  return (
    <>
      <button type="button" disabled={songCount === 0} onClick={build}>
        PPT 만들기 · {songCount}곡
      </button>
      {state && <BuildDialog state={state} onClose={() => setState(null)} onRetry={build} />}
    </>
  );
}

/**
 * 만들기 창. 진행 중에는 닫기 버튼이 없고 Esc·바깥 클릭도 막는다. 성공·실패 창은 Esc, 바깥 클릭,
 * 닫기로 닫힌다.
 */
function BuildDialog({
  state,
  onClose,
  onRetry,
}: {
  state: NonNullable<BuildState>;
  onClose: () => void;
  onRetry: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closable = state.kind !== "progress";

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  // Esc 닫기 요청은 keydown의 기본 동작이라, 진행 중에는 여기서 막는다. `cancel`만 막으면 Chrome은
  // 두 번째 Esc에서 막지 못하게 한다
  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape" && !closable) event.preventDefault();
  };

  // 바깥(backdrop)을 누르면 target이 dialog 자신이다. 안쪽 내용은 감싼 div가 받는다
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget && closable) onClose();
  };

  return (
    <dialog
      ref={ref}
      className="p-0"
      aria-busy={!closable}
      onKeyDown={onKeyDown}
      onCancel={(event) => {
        if (!closable) event.preventDefault();
      }}
      onClose={onClose}
      onClick={onClick}
    >
      <div className="p-4">{renderBody()}</div>
    </dialog>
  );

  function renderBody() {
    switch (state.kind) {
      case "progress":
        return <p role="status">PPT를 만드는 중…</p>;
      case "success":
        return (
          <>
            <h2>PPT를 만들었어요</h2>
            <dl>
              <dt>파일 이름</dt>
              <dd>{state.fileName}</dd>
              <dt>곡 수</dt>
              <dd>{state.songCount}곡</dd>
              <dt>슬라이드 수</dt>
              <dd>{state.slideCount}장</dd>
              <dt>크기</dt>
              <dd>{(state.blob.size / 1024 / 1024).toFixed(2)} MB</dd>
            </dl>
            <button type="button" onClick={onClose}>
              새로 만들기
            </button>
            <button type="button" onClick={() => download(state.blob, state.fileName)}>
              다운로드
            </button>
          </>
        );
      case "error":
        return (
          <>
            <h2>PPT를 만들지 못했어요</h2>
            <p role="alert">{state.message}</p>
            <button type="button" onClick={onClose}>
              닫기
            </button>
            <button type="button" onClick={onRetry}>
              다시 시도
            </button>
          </>
        );
    }
  }
}

/** Blob의 object URL을 가진 링크를 눌러 받고, 받은 뒤 URL을 해제한다. */
function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // 같은 틱에 해제하면 내려받기가 시작되기 전에 URL이 사라질 수 있다
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
