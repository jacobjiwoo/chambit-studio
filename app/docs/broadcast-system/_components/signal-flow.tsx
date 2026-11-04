"use client";

import "@xyflow/react/dist/base.css";
import "./signal-flow.css";

import {
  BaseEdge,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import {
  confirmsOf,
  downstream,
  tracedEdges,
  upstream,
  type FlowGraph,
  type FlowNode,
} from "../_lib/flow";
import type { FlowLayout, Point } from "../_lib/flow-layout";
import { connectionText, connections, equipment } from "../_lib/system";

/**
 * 신호 흐름도의 움직이는 쪽. 그래프와 좌표는 서버 컴포넌트가 빌드 때 만들어 `graph`·`layout`으로
 * 넘긴다. 여기서 그래프를 다시 만들지 않아야 좌표와 그래프가 어긋나지 않는다.
 *
 * 장비를 누르면 하류를 "영향 받을 수 있음", 상류를 "여기부터 확인"으로 칠하고, 선을 누르면
 * 그 연결의 신호 종류·근거·확인할 거리를 보인다. `?device=<장비 id>`로 열면 그 장비를 고른
 * 채로 시작한다(확인 필요 목록 등에서 링크한다).
 */

/** 하류·상류에서 그 점이 맡는 역할. 아무것도 고르지 않으면 모두 `idle`이다. */
type Role = "idle" | "selected" | "down" | "up" | "rest";

type Selection = { readonly kind: "node" | "edge"; readonly id: string } | null;

// 누르기는 `onNodeClick`이 받는다. 버튼의 Enter·Space도 click으로 올라가 같은 길을 탄다.
type DeviceData = FlowNode & { role: Role };
type DeviceNode = Node<DeviceData, "device">;
type WireData = { points: Point[]; unconfirmed: boolean; lit: boolean; dim: boolean };
type WireEdge = Edge<WireData, "wire">;

const ROLE_TAG: Partial<Record<Role, string>> = { down: "영향", up: "확인" };

function DeviceView({ data }: NodeProps<DeviceNode>) {
  const tag = ROLE_TAG[data.role];
  return (
    <>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <button
        type="button"
        className="sf-device"
        data-kind={data.kind}
        data-role={data.role}
        data-unconfirmed={data.unconfirmed || undefined}
        aria-pressed={data.role === "selected"}
      >
        <span className="sf-device-label">{data.label}</span>
        {data.unconfirmed && (
          <span className="sf-badge" aria-label="확인 필요" title="확인 필요">
            ?
          </span>
        )}
        {tag && <span className="sf-tag">{tag}</span>}
      </button>
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </>
  );
}

function WireView({ id, data, interactionWidth }: EdgeProps<WireEdge>) {
  // 좌표가 없는 선은 넘어오지 않지만, 화살촉 계산이 두 점을 쓰니 한 번 더 막는다.
  if (!data || data.points.length < 2) return null;
  const { points } = data;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const end = points[points.length - 1];
  const before = points[points.length - 2];
  // 마지막 토막의 방향으로 작은 화살촉을 단다.
  const len = Math.hypot(end.x - before.x, end.y - before.y) || 1;
  const ux = (end.x - before.x) / len;
  const uy = (end.y - before.y) / len;
  const arrow = `M${end.x - 6 * ux - 3.5 * uy},${end.y - 6 * uy + 3.5 * ux} L${end.x},${end.y} L${end.x - 6 * ux + 3.5 * uy},${end.y - 6 * uy - 3.5 * ux}`;
  const mid = badgeAt(points);
  const state = data.lit ? "lit" : data.dim ? "dim" : "idle";
  return (
    <g className="sf-wire" data-state={state} data-unconfirmed={data.unconfirmed || undefined}>
      <BaseEdge id={id} path={path} interactionWidth={interactionWidth} />
      <path className="sf-arrow" d={arrow} />
      {data.unconfirmed && (
        <g className="sf-wire-badge" transform={`translate(${mid.x},${mid.y})`}>
          <circle r={6.5} />
          <text dy="0.35em">?</text>
        </g>
      )}
    </g>
  );
}

/** 선의 가장 긴 토막 가운데. 미확인 배지를 거기 둔다. */
function badgeAt(points: Point[]): Point {
  let best = { a: points[0], b: points[1], len: -1 };
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const len = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    if (len > best.len) best = { a, b, len };
  }
  return { x: (best.a.x + best.b.x) / 2, y: (best.a.y + best.b.y) / 2 };
}

const nodeTypes = { device: DeviceView };
// 왼쪽 위 확대 버튼과 겹치지 않게 왼쪽을 더 띄운다.
const FIT = { padding: { top: "8px", right: "8px", bottom: "8px", left: "44px" } } as const;
const edgeTypes = { wire: WireView };

/** 주소의 `?device=`. 서버에서는 없다. 렌더 중에 `window`를 읽지 않으려고 store로 읽는다. */
function useDeviceParam(): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get("device"),
    () => null,
  );
}
function noopSubscribe() {
  return () => {};
}

function writeDeviceParam(id: string | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("device", id);
  else url.searchParams.delete("device");
  window.history.replaceState(window.history.state, "", url);
}

type NodeById = ReadonlyMap<string, FlowNode>;

export function SignalFlow({
  graph,
  layout,
  fig,
  title,
}: {
  graph: FlowGraph;
  layout: FlowLayout;
  fig: string;
  title: string;
}) {
  const nodeById: NodeById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph]);
  const fromUrl = useDeviceParam();
  // 사용자가 한 번이라도 고르면 주소보다 그 선택을 따른다.
  const [picked, setPicked] = useState<Selection | undefined>(undefined);
  const selection: Selection =
    picked !== undefined
      ? picked
      : fromUrl && nodeById.has(fromUrl)
        ? { kind: "node", id: fromUrl }
        : null;
  const nodeId = selection?.kind === "node" ? selection.id : null;
  const edgeId = selection?.kind === "edge" ? selection.id : null;

  const pick = useCallback((next: Selection) => {
    setPicked(next);
    writeDeviceParam(next?.kind === "node" ? next.id : null);
  }, []);
  // 같은 것을 다시 누르면 고른 것을 푼다.
  const pickNode = useCallback(
    (id: string) => pick(nodeId === id ? null : { kind: "node", id }),
    [pick, nodeId],
  );
  const pickEdge = useCallback(
    (id: string) => pick(edgeId === id ? null : { kind: "edge", id }),
    [pick, edgeId],
  );

  const trace = useMemo(
    () =>
      nodeId === null
        ? null
        : {
            down: new Set(downstream(graph, nodeId)),
            up: new Set(upstream(graph, nodeId)),
            edges: new Set(tracedEdges(graph, nodeId)),
          },
    [graph, nodeId],
  );

  const nodes = useMemo((): DeviceNode[] => {
    // 선을 고르면 그 선의 양 끝 장비는 흐리게 하지 않는다.
    const pickedEdge = graph.edges.find((e) => e.id === edgeId);
    const ends = new Set(pickedEdge ? [pickedEdge.source, pickedEdge.target] : []);
    return graph.nodes.map((n) => {
      const box = layout.nodes[n.id];
      const role: Role =
        (nodeId === null && edgeId === null) || ends.has(n.id)
          ? "idle"
          : nodeId === n.id
            ? "selected"
            : trace?.down.has(n.id)
              ? "down"
              : trace?.up.has(n.id)
                ? "up"
                : "rest";
      return {
        id: n.id,
        type: "device",
        position: { x: box.x, y: box.y },
        width: box.width,
        height: box.height,
        data: { ...n, role },
      };
    });
  }, [graph, layout, nodeId, edgeId, trace]);

  const edges = useMemo(
    (): WireEdge[] =>
      graph.edges.flatMap((e) => {
        // ELK가 길을 내지 못한 선은 좌표가 없다. 그리지 않는다.
        const points = layout.edges[e.id];
        if (!points || points.length < 2) return [];
        const lit = edgeId !== null ? edgeId === e.id : (trace?.edges.has(e.id) ?? false);
        return [
          {
            id: e.id,
            source: e.source,
            target: e.target,
            type: "wire",
            interactionWidth: 14,
            ariaLabel: connectionText(connections[e.index]),
            data: {
              points,
              unconfirmed: e.unconfirmed,
              lit,
              dim: (nodeId !== null || edgeId !== null) && !lit,
            },
          },
        ];
      }),
    [graph, layout, nodeId, edgeId, trace],
  );

  // 처음에는 전체를 맞춰 보인다. 주소로 고른 장비가 있으면 그 장비를 읽을 수 있는 크기로
  // 가운데 둔다. 주소는 hydration 뒤에야 읽히고 그때 흐름도가 준비됐는지 모르니, 둘 다 갖춰진
  // 뒤에 맞춘다. `fitView` prop은 이 맞춤을 덮어써서 쓰지 않는다.
  const [flow, setFlow] = useState<ReactFlowInstance<DeviceNode, WireEdge> | null>(null);
  const framed = useRef<string | null>(null);
  const userPicked = picked !== undefined;
  useEffect(() => {
    // 사용자가 고르기 시작하면 보는 자리를 옮기지 않는다. 고를 때 주소도 바뀌기 때문이다.
    if (!flow || userPicked) return;
    const target = fromUrl && nodeById.has(fromUrl) ? fromUrl : "";
    if (framed.current === target) return;
    framed.current = target;
    if (target) {
      const box = layout.nodes[target];
      void flow.setCenter(box.x + box.width / 2, box.y + box.height / 2, { zoom: 1 });
    } else {
      void flow.fitView(FIT);
    }
  }, [flow, fromUrl, layout, nodeById, userPicked]);

  return (
    <figure className="sf-figure">
      <div className="sf-plate">
        <div className="sf-corner" data-corner="fig">{fig}</div>
        <div className="sf-corner" data-corner="title">{title}</div>
        <div className="sf-canvas">
        <ReactFlow<DeviceNode, WireEdge>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onInit={setFlow}
          onNodeClick={(_, node) => pickNode(node.id)}
          onEdgeClick={(_, edge) => pickEdge(edge.id)}
          onPaneClick={() => pick(null)}
          fitViewOptions={FIT}
          minZoom={0.15}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          elementsSelectable={false}
          // 문서 페이지라 휠은 페이지를 내린다. 확대는 버튼, 핀치, Ctrl+휠로 한다.
          zoomOnScroll={false}
          preventScrolling={false}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
        >
          <Controls showInteractive={false} position="top-left" />
        </ReactFlow>
        </div>
        <div className="sf-corner" data-corner="hint">장비·선을 누른다 · 끌어서 이동</div>
        <div className="sf-corner" data-corner="readout" aria-hidden>
          {readoutOf(graph, nodeById, selection, trace)}
        </div>
      </div>
      <Details graph={graph} nodeById={nodeById} selection={selection} trace={trace} />
    </figure>
  );
}

/** 카드 오른쪽 아래의 짧은 readout. 자세한 것은 카드 아래 `Details`가 읽어 준다. */
function readoutOf(
  graph: FlowGraph,
  nodeById: NodeById,
  selection: Selection,
  trace: { down: Set<string>; up: Set<string> } | null,
): string {
  if (selection === null) return `장비 ${equipment.length} · 연결 ${connections.length}`;
  if (selection.kind === "edge") {
    const edge = graph.edges.find((e) => e.id === selection.id);
    return edge ? `${nodeById.get(edge.source)?.label} → ${nodeById.get(edge.target)?.label}` : "";
  }
  return `${nodeById.get(selection.id)?.label} · 영향 ${trace?.down.size ?? 0} · 확인 ${trace?.up.size ?? 0}`;
}

function Details({
  graph,
  nodeById,
  selection,
  trace,
}: {
  graph: FlowGraph;
  nodeById: NodeById;
  selection: Selection;
  trace: { down: Set<string>; up: Set<string> } | null;
}) {
  return (
    <div className="sf-details" aria-live="polite">
      {selection === null && (
        <p className="sf-muted">
          장비를 누르면 그 장비가 꺼질 때 영향 받을 수 있는 곳과, 문제가 보일 때 거슬러 확인할 곳이
          칠해집니다. 선을 누르면 연결 정보가 보입니다.
        </p>
      )}
      {selection?.kind === "node" && (
        <NodeDetails graph={graph} nodeById={nodeById} id={selection.id} trace={trace} />
      )}
      {selection?.kind === "edge" && <EdgeDetails graph={graph} id={selection.id} />}
    </div>
  );
}

/** 고른 점의 자세히. 확인할 거리는 점 자신의 것과 그 점에 닿는 연결 모두의 것이다. */
function NodeDetails({
  graph,
  nodeById,
  id,
  trace,
}: {
  graph: FlowGraph;
  nodeById: NodeById;
  id: string;
  trace: { down: Set<string>; up: Set<string> } | null;
}) {
  const node = nodeById.get(id);
  const item = equipment.find((e) => e.id === id);
  const own = item ? item.toConfirm.map((t) => t.what) : [];
  const toConfirm = confirmsOf(graph, id, own, connections);
  return (
    <>
      <p className="sf-name">
        {node?.label}
        {item?.aside && <span className="sf-muted"> ({item.aside})</span>}
        {node?.kind === "external" && <span className="sf-muted"> (외부 지점)</span>}
        {node?.kind === "unknown" && <span className="sf-muted"> (끝점 미상)</span>}
      </p>
      {item && <p>{item.model || "제조사·모델 미상"}</p>}
      <p className="sf-counts">
        <span data-role="down">영향 받을 수 있음 {trace?.down.size ?? 0}곳</span>
        <span data-role="up">여기부터 확인 {trace?.up.size ?? 0}곳</span>
      </p>
      <ToConfirm items={toConfirm} />
    </>
  );
}

function EdgeDetails({ graph, id }: { graph: FlowGraph; id: string }) {
  const edge = graph.edges.find((e) => e.id === id);
  if (!edge) return null;
  const c = connections[edge.index];
  return (
    <>
      <p className="sf-name">{connectionText(c)}</p>
      <dl className="sf-facts">
        <dt>신호 종류</dt>
        <dd>{c.signal ?? "적힌 것 없음"}</dd>
        {c.detail && (
          <>
            <dt>내용</dt>
            <dd>{c.detail}</dd>
          </>
        )}
        <dt>근거</dt>
        <dd>{c.evidence ?? "적힌 것 없음"}</dd>
      </dl>
      {c.unconfirmed && <p className="sf-muted">연결이 있는지, 끝점이 맞는지부터 확인해야 하는 연결입니다.</p>}
      <ToConfirm items={c.toConfirm} />
    </>
  );
}

function ToConfirm({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="sf-confirm">
      <p>확인할 거리</p>
      <ul>
        {items.map((what) => (
          <li key={what}>{what}</li>
        ))}
      </ul>
    </div>
  );
}
