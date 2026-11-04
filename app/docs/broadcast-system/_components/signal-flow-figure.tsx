import { flowGraph } from "../_lib/flow";
import { layoutFlow } from "../_lib/flow-layout";
import { connections, equipment, externals } from "../_lib/system";
import { SignalFlow } from "./signal-flow";

/**
 * 신호 흐름도 그림. 페이지가 `<SignalFlowFigure />`로 쓴다.
 *
 * 서버 컴포넌트라 빌드 때 elkjs로 배치를 계산하고 좌표만 `SignalFlow`(클라이언트)에 넘긴다.
 * 그림은 `_lib/system.ts` 데이터에서 나오니 장비·연결을 고칠 때 이 파일은 손대지 않는다.
 */
export async function SignalFlowFigure() {
  const layout = await layoutFlow(flowGraph(equipment, externals, connections));
  return (
    <>
      <SignalFlow layout={layout} fig="Fig 1" title="신호 흐름" />
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
