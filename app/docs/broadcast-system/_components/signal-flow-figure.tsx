import { flowGraph } from "../_lib/flow";
import { layoutFlow } from "../_lib/flow-layout";
import { viewGraph, views, type ViewId } from "../_lib/flow-views";
import { connections, equipment, externals } from "../_lib/system";
import { SignalFlowViews, type ViewData } from "./signal-flow-views";

/**
 * 신호 흐름도 그림. 페이지가 `<SignalFlowFigure />`로 쓴다.
 *
 * 서버 컴포넌트라 빌드 때 그래프를 만들고, 연결의 `layers`로 그림(탭)마다 나눠 elkjs로 배치를
 * 따로 계산해 `SignalFlowViews`(클라이언트)에 넘긴다. 그림은 `_lib/system.ts` 데이터에서 나오니
 * 장비·연결을 고칠 때 이 파일은 손대지 않는다.
 */
export async function SignalFlowFigure() {
  // 전체 그래프는 한 번만 만든다. 선의 `index`가 `connections`의 자리라서 나눈 배열로 다시 만들지 않는다.
  const full = flowGraph(equipment, externals, connections);
  const entries = await Promise.all(
    views.map(async (v): Promise<[ViewId, ViewData]> => {
      const graph = viewGraph(full, connections, v.id);
      return [v.id, { graph, layout: await layoutFlow(graph) }];
    }),
  );
  const data = Object.fromEntries(entries) as Record<ViewId, ViewData>;
  return (
    <>
      <SignalFlowViews data={data} />
      <div className="sf-legend">
        <span className="sf-key">
          <span className="sf-swatch" data-mark="mid" />
          장비
        </span>
        <span className="sf-key">
          <span className="sf-swatch" data-mark="lit" />
          고른 장비와 경로 (영향 = 영향 받을 수 있음, 확인 = 여기부터 확인)
        </span>
        <span className="sf-key">
          <span className="sf-swatch" data-mark="dim" />
          흐린 톤, ? 배지 = 확인 필요
        </span>
      </div>
    </>
  );
}
