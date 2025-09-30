"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface PlayerOption {
  id: string;
  full_name: string;
}

export default function CompareSelector({
  players,
  initialSelected,
  teamCode,
  teams,
}: {
  players: PlayerOption[];
  initialSelected: string[];
  teamCode: string;
  teams: { code: string; name: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initialSelected.slice(0, 5));
  const [team, setTeam] = useState<string>(teamCode);

  const onToggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 5) {
        return prev; // cap
      }
      return [...prev, id];
    });
  };

  const disabledSet = useMemo(() => new Set(selected.length >= 5 ? selected : []), [selected]);

  const apply = () => {
    const idsParam = selected.join(",");
    const q = new URLSearchParams();
    q.set("team", team);
    if (idsParam) q.set("ids", idsParam);
    router.push(`/compare?${q.toString()}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Team</label>
          <div className="flex gap-2 items-center">
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="h-10 border rounded px-3 flex-1"
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                const q = new URLSearchParams();
                q.set('team', team);
                if (selected.length >= 2 && selected.length <= 5) {
                  q.set('ids', selected.join(','));
                }
                router.push(`/compare?${q.toString()}`);
              }}
              className="h-10 px-3 border rounded bg-white"
            >
              Load
            </button>
          </div>
        </div>
        <div className="flex-[2]">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Players (min 2, max 5)</label>
          <div className="max-h-72 overflow-auto border rounded divide-y">
            {players.map((p) => {
              const checked = selected.includes(p.id);
              const disableNew = !checked && selected.length >= 5;
              return (
                <label key={p.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    disabled={disableNew}
                    onChange={() => onToggle(p.id)}
                  />
                  <span className={disableNew ? "opacity-50" : ""}>{p.full_name}</span>
                </label>
              );
            })}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Selected {selected.length} / 5</div>
        </div>
        <div>
          <button onClick={apply} disabled={selected.length < 2 || selected.length > 5} className="h-10 px-3 border rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed">Apply</button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">Select between 2 and 5 players. Selection is shareable via URL.</div>
    </div>
  );
}


