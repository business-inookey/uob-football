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
  const [selected, setSelected] = useState<string[]>(initialSelected.slice(0, 4));
  const [team, setTeam] = useState<string>(teamCode);

  const onToggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 4) {
        return prev; // cap
      }
      return [...prev, id];
    });
  };

  const disabledSet = useMemo(() => new Set(selected.length >= 4 ? selected : []), [selected]);

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
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full h-10 border rounded px-3"
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t.code} value={t.code}>{t.code} - {t.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-[2]">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Players (max 4)</label>
          <select
            multiple
            value={selected}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions).map(o => o.value);
              setSelected(options.slice(0, 4));
            }}
            size={Math.min(8, Math.max(4, players.length))}
            className="w-full border rounded px-3 py-2"
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <button onClick={apply} className="h-10 px-3 border rounded bg-white">Apply</button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground">Select up to 4 players. Selection is shareable via URL.</div>
    </div>
  );
}


