import { NextRequest } from 'next/server'
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as any
    console.log('PDF Export Request Body:', JSON.stringify(body, null, 2))
    
    const team = body?.team || '1s'
    const formation = body?.formation || { gk: 1, def: 4, mid: 3, wng: 0, st: 3 }
    let xi = body?.xi as Array<any>

    if (!body) {
      return new Response('No request body provided', { status: 400 })
    }

    // Normalize xi to required shape
    if (!Array.isArray(xi)) {
      const alt = body?.orderedXI || body?.xi?.orderedXI
      if (Array.isArray(alt)) xi = alt
    }
    if (!Array.isArray(xi)) {
      return new Response('Invalid XI payload', { status: 400 })
    }
    const normalized = xi
      .filter(Boolean)
      .map((p: any) => ({
        full_name: p.full_name ?? p.name ?? String(p.id ?? '').slice(0, 8),
        primary_position: p.primary_position ?? p.pos ?? 'MID',
      }))
      .filter((p: any) => typeof p.full_name === 'string' && typeof p.primary_position === 'string')
    if (normalized.length === 0) {
      return new Response('XI array is empty after normalization', { status: 400 })
    }

  const styles = StyleSheet.create({
    page: { padding: 24 },
    title: { fontSize: 18, marginBottom: 12 },
    row: { marginBottom: 6 },
    header: { fontSize: 12, marginBottom: 8 },
    item: { fontSize: 11 },
  })

  const Doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Best XI — Team {team}</Text>
        <Text style={styles.header}>Formation: GK {formation.gk} | DEF {formation.def} | MID {formation.mid} | WNG {formation.wng} | ST {formation.st}</Text>
        <View>
          {normalized.map((p, idx) => (
            <Text key={idx} style={styles.row}>
              {String(idx + 1).padStart(2, '0')}. {p.full_name} — {p.primary_position}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  )

    const stream = await pdf(Doc).toBlob()
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="best-xi.pdf"'
      }
    })
  } catch (error) {
    console.error('PDF Export Error:', error)
    return new Response(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 })
  }
}


