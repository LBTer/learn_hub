import type { Plugin } from 'vite'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const archiveFile = fileURLToPath(new URL('./archived.json', import.meta.url))

type NotePayload = {
  id: string
  page: string
  pageTitle: string
  quote: string
  prefix: string
  suffix: string
  note: string
  type: 'question' | 'important' | 'thought' | 'verify'
  createdAt: string
  updatedAt: string
}

function isNote(value: unknown): value is NotePayload {
  if (!value || typeof value !== 'object') return false
  const note = value as Record<string, unknown>
  return (
    typeof note.id === 'string' &&
    typeof note.page === 'string' &&
    typeof note.pageTitle === 'string' &&
    typeof note.quote === 'string' &&
    typeof note.prefix === 'string' &&
    typeof note.suffix === 'string' &&
    typeof note.note === 'string' &&
    ['question', 'important', 'thought', 'verify'].includes(String(note.type)) &&
    typeof note.createdAt === 'string' &&
    typeof note.updatedAt === 'string'
  )
}

export function noteArchivePlugin(): Plugin {
  return {
    name: 'learn-hub-note-archive',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.method !== 'POST' || !request.url?.endsWith('/__learn-hub/archive-notes')) {
          next()
          return
        }

        try {
          const chunks: Buffer[] = []
          for await (const chunk of request) chunks.push(Buffer.from(chunk))
          const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'))
          const incoming = Array.isArray(payload?.notes) ? payload.notes : []
          const deletedIds = Array.isArray(payload?.deletedIds)
            ? payload.deletedIds.filter((id: unknown): id is string => typeof id === 'string')
            : []

          if ((!incoming.length && !deletedIds.length) || !incoming.every(isNote)) {
            response.statusCode = 400
            response.setHeader('Content-Type', 'application/json; charset=utf-8')
            response.end(JSON.stringify({ message: '没有可归档的有效便签。' }))
            return
          }

          const existing = JSON.parse(await readFile(archiveFile, 'utf8')) as NotePayload[]
          const merged = new Map(existing.map((note) => [note.id, note]))
          for (const note of incoming) merged.set(note.id, note)
          for (const id of deletedIds) merged.delete(id)
          const notes = [...merged.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

          await writeFile(archiveFile, `${JSON.stringify(notes, null, 2)}\n`, 'utf8')
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({
            archivedIds: incoming.map((note: NotePayload) => note.id),
            deletedIds
          }))
        } catch (error) {
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.end(JSON.stringify({ message: error instanceof Error ? error.message : '归档失败。' }))
        }
      })
    }
  }
}
