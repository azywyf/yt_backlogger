export type Video = {
  id: number
  title: string
  url: string
  watched: 0 | 1
  notes: string
}

const send = (method: string, path: string, body?: unknown) =>
  fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

export async function listVideos(watched?: boolean): Promise<Video[]> {
  const q = watched === undefined ? '' : `?watched=${watched}`
  return (await fetch(`/videos${q}`)).json()
}

// Resolves to null on success, or the server's error message on failure.
export async function addVideo(url: string): Promise<string | null> {
  const res = await send('POST', '/videos', { url })
  if (res.ok) return null
  try {
    return (await res.json()).message ?? 'Something went wrong.'
  } catch {
    return 'Something went wrong.'
  }
}

export const toggleVideo = (id: number) => send('POST', `/videos/${id}/toggle`)
export const saveNotes = (id: number, notes: string) => send('PATCH', `/videos/${id}`, { notes })
export const deleteVideo = (id: number) => send('DELETE', `/videos/${id}`)
