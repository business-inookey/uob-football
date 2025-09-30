"use client";
import { useState } from "react";

type Row = { full_name: string; primary_position: string; current_team: string }

export default function ImportPlayersPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string>("")
  const [result, setResult] = useState<any>(null)

  function parse(csv: string) {
    const lines = csv.trim().split(/\r?\n/)
    const [h, ...data] = lines
    const headers = h.split(',').map(s => s.trim())
    const idx = {
      full_name: headers.indexOf('full_name'),
      primary_position: headers.indexOf('primary_position'),
      current_team: headers.indexOf('current_team'),
    }
    if (Object.values(idx).some(v => v === -1)) {
      setError('CSV must include headers: full_name, primary_position, current_team')
      return
    }
    const parsed: Row[] = data.map(line => {
      const parts = line.split(',')
      return {
        full_name: parts[idx.full_name]?.trim() || '',
        primary_position: parts[idx.primary_position]?.trim() || '',
        current_team: parts[idx.current_team]?.trim() || '',
      }
    })
    setError("")
    setRows(parsed)
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const text = await f.text()
    parse(text)
  }

  async function onImport() {
    setResult(null)
    const res = await fetch('/api/players/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows })
    })
    const j = await res.json().catch(() => null)
    setResult(j)
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Import Players</h1>
      <input type="file" accept=".csv" onChange={onUpload} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {rows.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">{rows.length} rows parsed</p>
          <button onClick={onImport} className="h-10 px-3 border rounded">Import</button>
        </>
      )}
      {result && (
        <div className="text-sm">
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}


