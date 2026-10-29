import { useRef, useState } from 'react'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  wrap: boolean
}

export default function TextPane({ label, value, onChange, wrap }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function loadFile(file: File) {
    onChange(await file.text())
  }

  return (
    <div className="flex flex-1 flex-col min-w-0">
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{label}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Upload file
          </button>
          <button
            onClick={() => onChange('')}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Clear
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void loadFile(file)
          e.target.value = ''
        }}
      />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files?.[0]
          if (file) void loadFile(file)
        }}
        spellCheck={false}
        placeholder="Paste text or drop a file here..."
        className={`resize-none rounded-md border p-3 font-mono text-sm outline-none
          bg-white text-neutral-900 border-neutral-300 placeholder:text-neutral-400 focus:border-neutral-400
          dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700 dark:placeholder:text-neutral-500
          ${expanded ? 'h-96' : 'h-48'}
          ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'}
          ${dragOver ? 'ring-2 ring-blue-400' : ''}`}
      />
      <button
        onClick={() => setExpanded((e) => !e)}
        className="mt-1 self-center text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        {expanded ? 'Collapse' : 'Expand'}
      </button>
    </div>
  )
}
