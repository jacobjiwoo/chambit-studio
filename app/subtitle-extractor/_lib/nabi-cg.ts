/**
 * 나비CG 임포트 파일 — 컬럼도 헤더도 순번도 시간 필드도 없는 순수 `.txt`.
 *
 * 담당자가 실전에 쓴 파일의 바이트를 직접 검사해 확정한 규격이며, 손으로 하던 변환이
 * 정확히 이것이다. 근거는 `.scratch/subtitle-extractor/issues/01-nabi-cg-import-format.md`.
 *
 *   인코딩      UTF-8 with BOM
 *   개행        CRLF
 *   자막 장 구분 빈 줄 하나
 *   파일 끝     개행 없이 텍스트로 끝남
 */

/**
 * 파일의 **본문** — BOM 앞의 그 글자들이다.
 *
 * 미리보기 모달이 이것을 띄운다. 받기 전 마지막 확인이 파일과 다른 것을 보여주면 확인이
 * 아니므로, 장을 이어 붙이는 자리는 여기 **하나뿐이다** — 화면이 제 나름대로 이어 붙이면
 * 규격이 바뀌는 날 미리보기만 옛 모습으로 남는다.
 */
export function toNabiBody(subtitles: string[]): string {
  return subtitles.join("\r\n\r\n");
}

/** 본문 앞에 BOM을 세워 실제로 떨굴 파일을 만든다. */
export function toNabiTxt(subtitles: string[]): Blob {
  return new Blob(["﻿" + toNabiBody(subtitles)], {
    type: "text/plain;charset=utf-8",
  });
}

/** 원고 파일명에서 확장자를 떼고 `-자막.txt`를 붙인다. */
export function downloadName(filename: string): string {
  return filename.replace(/\.hwpx?$/i, "") + "-자막.txt";
}

export function downloadNabiTxt(subtitles: string[], name: string) {
  const url = URL.createObjectURL(toNabiTxt(subtitles));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
