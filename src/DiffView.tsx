import type { DiffResult, Segment } from './diff'

type Props = {
  diff: DiffResult
  view: 'split' | 'unified'
  wrap: boolean
}

const lineBg = {
  unchanged: '',
  removed: 'bg-red-50 dark:bg-red-950/40',
  added: 'bg-green-50 dark:bg-green-950/40',
  blank: 'bg-neutral-50 dark:bg-neutral-900/40',
}

const segBg = {
  removed: 'bg-red-200 dark:bg-red-800/70',
  added: 'bg-green-200 dark:bg-green-800/70',
}

function Segs({ segs, kind }: { segs: Segment[]; kind: 'removed' | 'added' }) {
  return (
    <>
      {segs.map((s, i) =>
        s.changed ? (
          <span key={i} className={segBg[kind]}>
            {s.text}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  )
}

const wrapCls = (wrap: boolean) => (wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre')

export default function DiffView({ diff, view, wrap }: Props) {
  const codeBase = 'font-mono text-sm leading-relaxed'

  if (view === 'unified') {
    return (
      <div className="overflow-x-auto rounded-md border border-neutral-300 dark:border-neutral-700">
        <table className="w-full border-collapse">
          <tbody>
            {diff.unified.map((row, i) => (
              <tr key={i} className={lineBg[row.type]}>
                <td className="select-none w-12 px-2 text-right text-neutral-400 dark:text-neutral-600">
                  {row.leftNum ?? ''}
                </td>
                <td className="select-none w-12 px-2 text-right text-neutral-400 dark:text-neutral-600 border-r border-neutral-200 dark:border-neutral-800">
                  {row.rightNum ?? ''}
                </td>
                <td className={`px-3 py-0.5 ${codeBase} ${wrapCls(wrap)}`}>
                  <Segs segs={row.segs} kind={row.type === 'removed' ? 'removed' : 'added'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-300 dark:border-neutral-700">
      <table className="w-full table-fixed border-collapse">
        <tbody>
          {diff.split.map((row, i) => (
            <tr key={i}>
              <td className={`select-none w-10 px-2 text-right text-neutral-400 dark:text-neutral-600 ${lineBg[row.leftType]}`}>
                {row.leftNum ?? ''}
              </td>
              <td className={`w-1/2 px-3 py-0.5 ${codeBase} ${wrapCls(wrap)} ${lineBg[row.leftType]} border-r border-neutral-200 dark:border-neutral-800`}>
                {row.leftSegs && <Segs segs={row.leftSegs} kind="removed" />}
              </td>
              <td className={`select-none w-10 px-2 text-right text-neutral-400 dark:text-neutral-600 ${lineBg[row.rightType]}`}>
                {row.rightNum ?? ''}
              </td>
              <td className={`w-1/2 px-3 py-0.5 ${codeBase} ${wrapCls(wrap)} ${lineBg[row.rightType]}`}>
                {row.rightSegs && <Segs segs={row.rightSegs} kind="added" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
