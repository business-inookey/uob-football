"use client";
import { useMemo } from "react";

interface RadarProps {
  labels: string[];
  series: Array<{ name: string; values: number[]; color?: string }>;
  size?: number;
}

export default function Radar({ labels, series, size = 260 }: RadarProps) {
  const center = size / 2;
  const radius = size * 0.38;
  const angle = (2 * Math.PI) / Math.max(1, labels.length);

  const points = useMemo(() => {
    return series.map((s) =>
      s.values.map((v, i) => {
        const r = radius * (v ?? 0);
        const a = i * angle - Math.PI / 2;
        const x = center + r * Math.cos(a);
        const y = center + r * Math.sin(a);
        return `${x},${y}`;
      })
    );
  }, [series, angle, center, radius]);

  return (
    <div className="w-full overflow-x-auto">
      <svg width={size} height={size} className="touch-pan-y">
        {/* Grid */}
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <circle key={g} cx={center} cy={center} r={radius * g} className="stroke-gray-300 fill-none" />
        ))}
        {labels.map((l, i) => {
          const a = i * angle - Math.PI / 2;
          const x = center + (radius + 10) * Math.cos(a);
          const y = center + (radius + 10) * Math.sin(a);
          return (
            <g key={l}>
              <line x1={center} y1={center} x2={x - 10 * Math.cos(a)} y2={y - 10 * Math.sin(a)} className="stroke-gray-300" />
              <text x={x} y={y} fontSize={10} textAnchor="middle" dominantBaseline="middle" className="fill-current text-foreground">
                {l}
              </text>
            </g>
          );
        })}

        {/* Series */}
        {points.map((p, idx) => (
          <polygon
            key={idx}
            points={p.join(" ")}
            className="fill-primary/20 stroke-primary"
            style={{ stroke: series[idx].color, fill: `${series[idx].color ?? "var(--color-primary)"}33` }}
          />
        ))}
      </svg>
    </div>
  );
}


