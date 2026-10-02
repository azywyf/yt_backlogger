import { useCallback, useEffect, useState } from 'react'
import * as api from './api'
import type { Video } from './api'

type Filter = 'unwatched' | 'watched' | 'all'
const filterValue = { all: undefined, unwatched: false, watched: true } as const
const filters: Filter[] = ['unwatched', 'watched', 'all']

export default function App() {
  const [videos, setVideos] = useState<Video[]>([])
  const [filter, setFilter] = useState<Filter>('unwatched')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const refresh = useCallback(async () => {
    setVideos(await api.listVideos(filterValue[filter]))
  }, [filter])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function onAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    const err = await api.addVideo(url.trim())
    setAdding(false)
    setError(err)
    if (!err) {
      setUrl('')
      refresh()
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 text-gray-900">
      <h1 className="mb-6 text-3xl font-bold">YT Backlogger</h1>

      <form onSubmit={onAdd} className="flex gap-2">
        <input
          className="flex-1 rounded border border-gray-300 px-3 py-2"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a YouTube link"
          required
        />
        <button
          disabled={adding}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {adding ? 'Adding…' : 'Add'}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <nav className="my-4 flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded px-3 py-1 capitalize ${
              f === filter ? 'bg-gray-900 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </nav>

      <ul className="space-y-3">
        {videos.map((v) => (
          <li key={v.id} className="rounded border border-gray-300 p-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!v.watched}
                onChange={async () => {
                  await api.toggleVideo(v.id)
                  refresh()
                }}
              />
              <a
                href={v.url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 font-medium text-blue-700 hover:underline"
              >
                {v.title}
              </a>
              <button
                onClick={async () => {
                  await api.deleteVideo(v.id)
                  refresh()
                }}
                className="text-sm text-gray-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
            <textarea
              className="mt-2 w-full rounded border border-gray-200 p-2 text-sm"
              defaultValue={v.notes}
              placeholder="Notes…"
              onBlur={(e) => e.target.value !== v.notes && api.saveNotes(v.id, e.target.value)}
            />
          </li>
        ))}
      </ul>
      {videos.length === 0 && <p className="text-gray-500">Nothing here.</p>}
    </main>
  )
}
