import { CG_FIGURE, HEIGHT, WIDTH } from "../_lib/cg-output-figure";
import { REST, readoutOf } from "../_lib/cg-output-model";
import { Plate } from "./anatomy/draw";
import "./anatomy/iso.css";
import "./cg-output.css";
import { CgOutputLive } from "./cg-output-live";

const LABEL =
  "작업대 위의 CG 출력 모형. 왼쪽 문자발생기 보드의 FILL·KEY 단자에서 케이블 두 가닥이 영상 스위처 뒤 단자대로 들어가고, 영상 스위처의 PGM 단자에서 모니터로 케이블이 이어진다. DSK 버튼을 켜면 모니터 화면의 PGM이 KEY 모양대로 오려지고 그 자리에 FILL이 채워진다. 카메라 버튼을 바꿔도 CG는 남는다.";

/** 장비 목록표 "CG 출력 원리" 절의 그림. 정적 그림은 여기(서버)서 만들고 움직임만 클라이언트가 맡는다 */
export function CgOutputFigure() {
  return (
    <div className="iso cg-output">
      <Plate
        fig="Fig 1"
        title="FILL + KEY → DSK"
        hint="눌러서 DSK 켜기·끄기"
        readout={readoutOf(REST)}
        keys={[
          { mark: "lit", label: "DSK ON과 KEY로 오려 낸 자리" },
          { mark: "raised", label: "PGM으로 고른 카메라 버튼" },
        ]}
        caption="문자발생기 보드는 FILL(CG의 색과 모양)과 KEY(CG 자리만 흰 오려낼 모양)를 케이블 두 가닥으로 따로 보낸다. 영상 스위처의 DSK는 KEY 모양대로 PGM을 오려 내고 그 자리에 FILL을 채운다. 카메라 버튼(키보드 1–4)을 바꿔도 CG는 남는다. 실제 DSK는 한 번에 얹히고, 그림은 두 단계를 나눠 천천히 보인다. 장비 생김새와 자리는 실제와 다르다."
      >
        <CgOutputLive width={WIDTH} height={HEIGHT} label={LABEL} press={CG_FIGURE.press}>
          <g key="cg-art" dangerouslySetInnerHTML={{ __html: CG_FIGURE.svg }} />
        </CgOutputLive>
      </Plate>
    </div>
  );
}
