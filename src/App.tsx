import { useEffect, useMemo, useState } from 'react'
import TextPane from './TextPane'
import DiffView from './DiffView'
import { computeDiff, type Precision } from './diff'

export default function App() {
  const [oldText, setOldText] = useState('')
  const [newText, setNewText] = useState('')
  const [precision, setPrecision] = useState<Precision>('smart')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [wrap, setWrap] = useState(true)
  const [view, setView] = useState<'split' | 'unified'>('split')
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
    } catch {
      // localStorage unavailable (e.g. some file:// contexts) — fall through to system preference.
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    } catch {
      // localStorage unavailable — theme just won't persist.
    }
  }, [dark])

  const diff = useMemo(
    () => computeDiff(oldText, newText, precision, ignoreWhitespace),
    [oldText, newText, precision, ignoreWhitespace],
  )

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="flex items-center justify-between pb-4">
          <h1 className="text-xl font-semibold">Text Diff</h1>
          <button
            onClick={() => setDark((d) => !d)}
            className="rounded-md border border-neutral-300 px-3 py-1 text-sm dark:border-neutral-700"
          >
            {dark ? 'Light' : 'Dark'} mode
          </button>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row">
          <TextPane label="Original" value={oldText} onChange={setOldText} wrap={wrap} />
          <TextPane label="Changed" value={newText} onChange={setNewText} wrap={wrap} />
        </div>

        <div className="flex flex-wrap items-center gap-4 py-4 text-sm">
          <div className="flex items-center gap-1 rounded-md border border-neutral-300 p-0.5 dark:border-neutral-700">
            {(['split', 'unified'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded px-3 py-1 capitalize ${
                  view === v
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1">
            Precision
            <select
              value={precision}
              onChange={(e) => setPrecision(e.target.value as Precision)}
              className="rounded-md border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="smart">Smart</option>
              <option value="word">Word</option>
              <option value="char">Character</option>
            </select>
          </label>

          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} />
            Ignore whitespace
          </label>

          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={wrap} onChange={(e) => setWrap(e.target.checked)} />
            Wrap lines
          </label>

          <span className="ml-auto flex items-center gap-3 font-mono">
            <span className="text-green-600 dark:text-green-400">+{diff.additions}</span>
            <span className="text-red-600 dark:text-red-400">-{diff.removals}</span>
          </span>
        </div>

        <DiffView diff={diff} view={view} wrap={wrap} />
      </div>
    </div>
  )
}
