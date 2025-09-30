"use client";

interface BarsProps {
  labels: string[];
  series: Array<{ name: string; values: number[]; color?: string }>;
}

export default function Bars({ labels, series }: BarsProps) {
  return (
    <div className="space-y-4">
      {labels.map((label, i) => (
        <div key={label} className="space-y-2">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="flex gap-2">
            {series.map((s) => (
              <div key={s.name} className="flex-1">
                <div className="h-2 bg-secondary rounded">
                  <div
                    className="h-2 rounded"
                    style={{ width: `${Math.round((s.values[i] ?? 0) * 100)}%`, backgroundColor: s.color ?? "var(--color-primary)" }}
                    title={`${s.name}: ${Math.round((s.values[i] ?? 0) * 100)}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


