"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Row = { full_name: string; primary_position: string; current_team: string }

export default function ImportPlayersPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string>("")
  const [result, setResult] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [dragActive, setDragActive] = useState(false)

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
    setIsUploading(true)
    try {
      const text = await f.text()
      parse(text)
    } finally {
      setIsUploading(false)
    }
  }

  async function onImport() {
    setResult(null)
    setIsImporting(true)
    try {
      const res = await fetch('/api/players/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      })
      const j = await res.json().catch(() => null)
      setResult(j)
    } finally {
      setIsImporting(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setIsUploading(true)
        try {
          const text = await file.text()
          parse(text)
        } finally {
          setIsUploading(false)
        }
      } else {
        setError('Please upload a CSV file')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Import Players
        </h1>
        <p className="text-lg text-muted-foreground">
          Upload a CSV file to import multiple players at once
        </p>
      </div>

      {/* Upload Section */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h2 className="text-xl font-semibold text-foreground">Upload CSV File</h2>
        </div>

        {/* Drag and Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-primary/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={onUpload}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {isUploading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto animate-spin rounded-full border-2 border-muted border-t-primary" />
              <p className="text-muted-foreground">Processing file...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-foreground mb-2">
                  Drop your CSV file here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV files with headers: full_name, primary_position, current_team
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="card p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Section */}
      {rows.length > 0 && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-foreground">Preview</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="badge badge-primary">{rows.length} players</span>
              <Button 
                onClick={onImport} 
                disabled={isImporting}
                className="w-full sm:w-auto"
                dataTitle="Import Players"
                dataText="Importing..."
                dataStart="Players Imported!"
              >
                <div className="flex items-center">
                  {isImporting ? (
                    <>
                      <span className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2 inline-block" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="truncate">Import Players</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold text-foreground">Name</th>
                  <th className="text-left p-3 font-semibold text-foreground">Position</th>
                  <th className="text-left p-3 font-semibold text-foreground">Team</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-foreground">{row.full_name}</td>
                    <td className="p-3">
                      <span className="badge badge-outline">{row.primary_position}</span>
                    </td>
                    <td className="p-3">
                      <span className="badge badge-primary">{row.current_team}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                ... and {rows.length - 10} more players
              </p>
            )}
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-foreground">Import Results</h2>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <pre className="text-sm text-foreground whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-2">
            <h3 className="font-medium text-blue-900">CSV Format Requirements</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>Your CSV file must include the following headers:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code className="bg-blue-100 px-1 rounded">full_name</code> - Player's full name</li>
                <li><code className="bg-blue-100 px-1 rounded">primary_position</code> - Player's position (e.g., GK, DEF, MID, FWD)</li>
                <li><code className="bg-blue-100 px-1 rounded">current_team</code> - Team code (e.g., 1s, 2s, 3s)</li>
              </ul>
              <p className="mt-2">Example CSV content:</p>
              <pre className="bg-blue-100 p-2 rounded text-xs mt-1">
{`full_name,primary_position,current_team
John Smith,GK,1s
Jane Doe,DEF,1s
Bob Johnson,MID,2s`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}