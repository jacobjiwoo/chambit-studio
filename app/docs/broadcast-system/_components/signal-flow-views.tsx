"use client";

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";

import type { FlowGraph } from "../_lib/flow";
import type { FlowLayout } from "../_lib/flow-layout";
import {
  resolveEntry,
  selectionAfterSwitch,
  views,
  viewsWithNode,
  withViewParams,
  type Selection,
  type ViewGraphs,
  type ViewId,
} from "../_lib/flow-views";
import { SignalFlow } from "./signal-flow";

/**
 * 신호 흐름도의 탭. 그림마다 그래프와 배치를 빌드 때 따로 계산해 받는다. 고른 것과 보는 탭은
 * 여기서 들고 있어서 탭을 바꿔도 새 그림에 있는 장비는 계속 고른 상태다.
 *
 * 주소는 `?view=<탭>&device=<장비 id>`다. 사용자가 고르거나 탭을 바꾸면 그 뒤로는 주소보다
 * 그 선택을 따르고, 주소는 고른 대로 고쳐 쓴다.
 */
export type ViewData = { readonly graph: FlowGraph; readonly layout: FlowLayout };

/** 현재 주소의 쿼리. 서버에서는 비어 있다. 렌더 중에 `window`를 읽지 않으려고 store로 읽는다. */
function useSearch(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.search,
    () => "",
  );
}
function noopSubscribe() {
  return () => {};
}

function writeParams(view: ViewId, device: string | null) {
  const url = new URL(window.location.href);
  url.search = withViewParams(url.search, view, device);
  window.history.replaceState(window.history.state, "", url);
}

export function SignalFlowViews({ data }: { data: Readonly<Record<ViewId, ViewData>> }) {
  const search = useSearch();
  const graphs = useMemo(
    () => Object.fromEntries(views.map((v) => [v.id, data[v.id].graph])) as ViewGraphs,
    [data],
  );
  const entry = useMemo(() => resolveEntry(search, graphs), [search, graphs]);

  // 사용자가 고르기 전에는 주소를 따른다. `undefined`가 "아직 안 골랐다"다.
  const [pickedView, setPickedView] = useState<ViewId | undefined>(undefined);
  const [picked, setPicked] = useState<Selection | undefined>(undefined);
  const view = pickedView ?? entry.view;
  const selection = useMemo(
    (): Selection =>
      picked !== undefined ? picked : entry.device ? { kind: "node", id: entry.device } : null,
    [picked, entry.device],
  );
  const interacted = picked !== undefined || pickedView !== undefined;

  const pick = useCallback(
    (next: Selection) => {
      setPicked(next);
      writeParams(view, next?.kind === "node" ? next.id : null);
    },
    [view],
  );

  const open = useCallback(
    (next: ViewId) => {
      const kept = selectionAfterSwitch(selection, graphs[next]);
      setPickedView(next);
      setPicked(kept);
      writeParams(next, kept?.kind === "node" ? kept.id : null);
    },
    [selection, graphs],
  );

  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = views.length - 1;
    const to =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (to === null) return;
    e.preventDefault();
    const next = views[to].id;
    open(next);
    tabs.current[next]?.focus();
  };

  const nodeId = selection?.kind === "node" ? selection.id : null;
  const otherViews = nodeId === null ? [] : viewsWithNode(graphs, nodeId).filter((v) => v !== view);
  const index = views.findIndex((v) => v.id === view);

  return (
    <div className="sf-views">
      <div className="sf-tabs" role="tablist" aria-label="신호 흐름도 그림">
        {views.map((v, i) => (
          <button
            key={v.id}
            ref={(el) => {
              tabs.current[v.id] = el;
            }}
            type="button"
            role="tab"
            id={`sf-tab-${v.id}`}
            aria-selected={v.id === view}
            aria-controls="sf-panel"
            tabIndex={v.id === view ? 0 : -1}
            className="sf-tab"
            onClick={() => open(v.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="sf-panel" aria-labelledby={`sf-tab-${view}`}>
        <SignalFlow
          key={view}
          graph={data[view].graph}
          layout={data[view].layout}
          fig={`Fig ${index + 1}`}
          title={`신호 흐름 · ${views[index].label}`}
          selection={selection}
          onPick={pick}
          focusId={interacted ? null : entry.device}
          interacted={interacted}
          otherViews={otherViews}
          onOpenView={open}
        />
      </div>
    </div>
  );
}
