"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { extractSlides, isPptName, titleFromFileName } from "../_lib/extract-slides";
import type { Slide } from "../_lib/song";

/** PPT 올리기(06). 슬라이드 추출 `_lib`과 올리기 상태는 06이 둔다. */
export type PptUploadProps = {
  /**
   * 추출이 끝난 올린 곡을 넘긴다. 루트가 음수 id를 배정해 올린 곡 목록에 더하고 셋리스트 맨
   * 뒤에 담는다. `title`은 파일 이름에서 `.ppt`/`.pptx`를 뗀 것, `slides`는 번호 0부터에 이미지
   * data URL이다.
   */
  onAddSong: (title: string, slides: Slide[]) => void;
};

type Status = { kind: "idle" } | { kind: "extracting" } | { kind: "error"; message: string };

export function PptUpload({ onAddSong }: PptUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const extracting = status.kind === "extracting";

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 골라도 change가 일어나게 비운다
    event.target.value = "";
    if (!file) return;

    if (!isPptName(file.name)) {
      setStatus({ kind: "error", message: "PPT 파일 (.ppt 또는 .pptx) 만 업로드 가능합니다" });
      return;
    }

    setStatus({ kind: "extracting" });
    try {
      const slides = await extractSlides(file);
      onAddSong(titleFromFileName(file.name), slides);
      setStatus({ kind: "idle" });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "PPT 추출 실패",
      });
    }
  }

  return (
    <section>
      <h2>PPT 올리기</h2>
      <input
        ref={inputRef}
        type="file"
        accept=".ppt,.pptx"
        onChange={handleChange}
        disabled={extracting}
        hidden
      />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={extracting}>
        {extracting ? "PPT 추출 중…" : "PPT 파일 직접 올리기"}
      </button>
      {status.kind === "error" && <p role="alert">{status.message}</p>}
      <p>
        라이브러리에 없는 곡은 PPT 파일을 직접 올려 셋리스트에 합칠 수 있어요. 새로고침 시
        사라져요.
      </p>
    </section>
  );
}
