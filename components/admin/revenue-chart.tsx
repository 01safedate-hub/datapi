import { formatNaira } from "@/lib/utils";

/** Lightweight server-rendered bar chart: no client JS. */
export function RevenueChart({ data }: { data: { date: string; revenueKobo: number; orders: number }[] }) {
  const W = 720, H = 200, pad = 28;
  const max = Math.max(...data.map((d) => d.revenueKobo));
  const step = (W - pad) / data.length;
  const bw = Math.max(4, step - 6);
  const ticks = [0, 0.5, 1].map((t) => Math.round((max * t) / 100_000_00) * 100_000_00);

  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} className="h-auto w-full" role="img" aria-label="Daily revenue, last 30 days">
      {ticks.map((t) => {
        const y = H - (t / max) * (H - 10);
        return (
          <g key={t}>
            <line x1={pad} x2={W} y1={y} y2={y} stroke="#e5e7eb" />
            <text x={0} y={y + 4} fontSize="10" fill="#6b7280">{t ? `₦${Math.round(t / 100 / 1_000_000)}m` : "0"}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.revenueKobo / max) * (H - 10);
        const x = pad + i * step + (step - bw) / 2;
        const last = i === data.length - 1;
        return (
          <g key={d.date}>
            <rect x={x} y={H - h} width={bw} height={h} rx="3" fill={last ? "#ff7a00" : "#0a1a52"} opacity={last ? 1 : 0.85}>
              <title>{`${d.date}: ${formatNaira(d.revenueKobo)} · ${d.orders} orders`}</title>
            </rect>
            {i % 7 === 0 && (
              <text x={x + bw / 2} y={H + 16} fontSize="10" fill="#6b7280" textAnchor="middle">
                {new Date(d.date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
