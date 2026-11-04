import { Fragment } from "react";

import { connections, equipment, priorities, type Priority } from "../_lib/system";
import { collectToConfirm } from "../_lib/to-confirm";
import { equipmentRowId } from "./equipment-table";

/**
 * 장비 목록표의 "확인 필요 목록" 절. `_lib/system.ts`의 `toConfirm`을 모아 그린다.
 *
 * 먼저 쓰이는 우선순위 번호와 이름을 보이고, 그 아래에 파트별로 확인할 거리를 우선순위 순서로
 * 늘어놓는다. 각 줄의 장비 이름은 장비 목록표의 그 행으로 가는 링크다.
 *
 * MDX가 아니라서 `mdx-components.tsx`의 스타일이 닿지 않는다. 같은 class를 쓴다.
 */
export function ToConfirmList() {
  const groups = collectToConfirm(equipment, connections);
  const used = new Set(groups.flatMap((g) => g.items.map((i) => i.priority)));
  const ranks = (Object.keys(priorities).map(Number) as Priority[]).filter((r) => used.has(r));

  return (
    <>
      <h3 className="mt-8 text-xl font-semibold">우선순위</h3>
      <ol className="mt-4 list-decimal space-y-1 pl-6">
        {ranks.map((rank) => {
          const p: { title: string; note?: string; deferred?: true } = priorities[rank];
          return (
            <li key={rank} value={rank}>
              {p.deferred && "(보류) "}
              {p.title}
              {p.note && ` — ${p.note}`}
            </li>
          );
        })}
      </ol>
      {groups.map((g) => (
        <Fragment key={g.part}>
          <h3 className="mt-8 text-xl font-semibold">{g.part}</h3>
          <ul className="mt-4 list-disc space-y-1 pl-6">
            {g.items.map((item) => (
              <li key={`${item.subjects.join()}|${item.connection ?? ""}|${item.what}`}>
                {item.priority && <Rank rank={item.priority} />}
                {item.subjects.map((id, i) => (
                  <Fragment key={id}>
                    {i > 0 && " · "}
                    <a className="text-blue-700 underline" href={`#${equipmentRowId(id)}`}>
                      {id}
                    </a>
                  </Fragment>
                ))}
                : {item.connection && `${item.connection} — `}
                {item.what}
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </>
  );
}

/** 우선순위 번호 표. 보류면 함께 적는다. */
function Rank({ rank }: { rank: Priority }) {
  const deferred = "deferred" in priorities[rank];
  return (
    <span
      title={priorities[rank].title}
      className="mr-1.5 inline-block rounded bg-neutral-800 px-1.5 align-[0.1em] text-xs leading-5 whitespace-nowrap text-white"
    >
      {rank}
      {deferred && " 보류"}
    </span>
  );
}
