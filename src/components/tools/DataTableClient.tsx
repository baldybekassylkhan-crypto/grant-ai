import { cn } from "@/lib/cn";

/** Same styling as the server DataTable, usable from client components, with an optional highlighted row. */
export function DataTableClient({
  head,
  rows,
  className,
  highlight,
}: {
  head: string[];
  rows: string[][];
  className?: string;
  highlight?: number;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-[20px] bg-card ring-line", className)}>
      <table className="w-full min-w-[560px] border-collapse text-left text-[16px] leading-[24.65px] md:text-[17px]">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-5 pb-3 pt-4 text-[13px] font-extrabold uppercase tracking-[1px] text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={cn("border-t border-line", i === highlight && "bg-info-bg")} aria-current={i === highlight ? "true" : undefined}>
              {r.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="px-5 py-4 font-bold text-ink">
                    {c}
                  </th>
                ) : (
                  <td key={j} className="px-5 py-4 text-body">
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
