import { Fragment } from "react";

import { Unconfirmed } from "@/app/_components/unconfirmed";

import { DeviceFigureButton } from "./device-figure-button";
import {
  connectionText,
  connections,
  connectionsOf,
  equipment,
  type Cell,
  type Equipment,
  type Part,
} from "../_lib/system";

/**
 * 장비 목록표의 파트 하나를 `_lib/system.ts` 데이터에서 그린다. 페이지가
 * `<EquipmentTable part="전원" />`처럼 쓰고, H2는 페이지에 둔다.
 *
 * 확인할 거리는 그 칸 글 뒤에 `Unconfirmed` 배지로 붙는다. 연결 칸에는 단자 목록, 그 장비가
 * 끝점이거나 미상의 후보인 연결, 연결 칸의 확인할 거리를 차례로 둔다.
 *
 * MDX 표가 아니라서 `mdx-components.tsx`의 표 스타일이 닿지 않는다. 같은 class를 쓴다.
 */
export function EquipmentTable({ part }: { part: Part }) {
  const rows = equipment.filter((e) => e.part === part);
  // "기타" 파트는 용도가 밝혀지지 않은 장비라 용도·연결 칸이 없다.
  const full = part !== "기타";

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <Th>장비명</Th>
            <Th>제조사·모델명</Th>
            <Th>위치</Th>
            {full && <Th>용도</Th>}
            {full && <Th>입력/출력 연결</Th>}
            <Th>비고</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id} id={equipmentRowId(e.id)} className="scroll-mt-6 target:bg-yellow-50">
              <Td>{e.aside ? `${e.id} (${e.aside})` : e.id}</Td>
              <Td>
                <Text item={e} cell="model" text={e.model} />
                <DeviceFigureButton id={e.id} />
              </Td>
              <Td>
                <Text item={e} cell="location" text={e.location} />
              </Td>
              {full && (
                <Td>
                  <Text item={e} cell="purpose" text={e.purpose} />
                </Td>
              )}
              {full && (
                <Td>
                  <ConnectionCell item={e} />
                </Td>
              )}
              <Td>
                <Text item={e} cell="notes" text={e.notes} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 장비 행의 앵커. 확인 필요 목록 등이 `#장비-영상-스위처`처럼 그 행으로 건다. 장비 id에서
 * 만들므로 id가 바뀌지 않는 한 그대로다.
 */
export function equipmentRowId(id: string): string {
  return `장비-${id.replace(/\s+/g, "-")}`;
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border border-neutral-300 bg-neutral-100 px-3 py-2 text-left font-semibold">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="border border-neutral-300 px-3 py-2 align-top">{children}</td>;
}

/** 글 뒤에 확인할 거리 배지를 붙인다. 둘 다 없으면 "—"다. */
function WithBadges({ text, toConfirm }: { text?: string; toConfirm: readonly string[] }) {
  if (!text && toConfirm.length === 0) return <>—</>;
  return (
    <>
      {text}
      {toConfirm.map((what, i) => (
        <Fragment key={what}>
          {text || i > 0 ? " " : null}
          <Unconfirmed>{what}</Unconfirmed>
        </Fragment>
      ))}
    </>
  );
}

function badgesFor(item: Equipment, cell: Cell): string[] {
  return item.toConfirm.filter((t) => t.cell === cell).map((t) => t.what);
}

function Text({ item, cell, text }: { item: Equipment; cell: Cell; text?: string }) {
  return <WithBadges text={text} toConfirm={badgesFor(item, cell)} />;
}

function ConnectionCell({ item }: { item: Equipment }) {
  const lines = [
    ...(item.ports ?? []).map((text) => <WithBadges key={text} text={text} toConfirm={[]} />),
    ...connectionsOf(item.id, connections).map((c) => {
      const text = connectionText(c);
      return <WithBadges key={text} text={text} toConfirm={c.toConfirm} />;
    }),
  ];
  const rest = badgesFor(item, "connections");
  if (rest.length > 0) {
    lines.push(<WithBadges key="toConfirm" toConfirm={rest} />);
  }
  if (lines.length === 0) return <>—</>;

  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}
