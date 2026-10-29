import * as Diff from 'diff'

export type Precision = 'smart' | 'word' | 'char'

export type Segment = { text: string; changed: boolean }

export type SplitRow = {
  leftNum: number | null
  leftSegs: Segment[] | null
  leftType: 'unchanged' | 'removed' | 'blank'
  rightNum: number | null
  rightSegs: Segment[] | null
  rightType: 'unchanged' | 'added' | 'blank'
}

export type UnifiedRow = {
  leftNum: number | null
  rightNum: number | null
  segs: Segment[]
  type: 'unchanged' | 'removed' | 'added'
}

export type DiffResult = {
  split: SplitRow[]
  unified: UnifiedRow[]
  additions: number
  removals: number
}

function intraline(a: string, b: string, precision: Precision) {
  const fn =
    precision === 'char' ? Diff.diffChars : precision === 'word' ? Diff.diffWords : Diff.diffWordsWithSpace
  const parts = fn(a, b)
  const leftSegs: Segment[] = []
  const rightSegs: Segment[] = []
  for (const part of parts) {
    if (part.added) rightSegs.push({ text: part.value, changed: true })
    else if (part.removed) leftSegs.push({ text: part.value, changed: true })
    else {
      leftSegs.push({ text: part.value, changed: false })
      rightSegs.push({ text: part.value, changed: false })
    }
  }
  return { leftSegs, rightSegs }
}

function splitLines(value: string) {
  // diffLines keeps trailing newlines on each entry; strip them for per-line text.
  const lines = value.split('\n')
  if (lines[lines.length - 1] === '') lines.pop()
  return lines
}

export function computeDiff(oldText: string, newText: string, precision: Precision, ignoreWhitespace: boolean): DiffResult {
  const parts = Diff.diffLines(oldText, newText, { ignoreWhitespace })

  const split: SplitRow[] = []
  const unified: UnifiedRow[] = []
  let leftNum = 1
  let rightNum = 1
  let additions = 0
  let removals = 0

  let i = 0
  while (i < parts.length) {
    const part = parts[i]

    if (!part.added && !part.removed) {
      for (const text of splitLines(part.value)) {
        const segs: Segment[] = [{ text, changed: false }]
        split.push({ leftNum, leftSegs: segs, leftType: 'unchanged', rightNum, rightSegs: segs, rightType: 'unchanged' })
        unified.push({ leftNum, rightNum, segs, type: 'unchanged' })
        leftNum++
        rightNum++
      }
      i++
      continue
    }

    // Group a removed part optionally followed by an added part into one change block.
    const removedLines = part.removed ? splitLines(part.value) : []
    const hasAdded = part.removed && parts[i + 1]?.added
    const addedLines = hasAdded ? splitLines(parts[i + 1].value) : part.added ? splitLines(part.value) : []
    i += part.removed ? (hasAdded ? 2 : 1) : 1

    removals += part.removed ? removedLines.length : 0
    additions += hasAdded ? addedLines.length : part.added ? addedLines.length : 0

    const pairCount = Math.max(removedLines.length, addedLines.length)
    for (let p = 0; p < pairCount; p++) {
      const l = removedLines[p]
      const r = addedLines[p]
      if (l !== undefined && r !== undefined) {
        const { leftSegs, rightSegs } = intraline(l, r, precision)
        split.push({ leftNum, leftSegs, leftType: 'removed', rightNum, rightSegs, rightType: 'added' })
        unified.push({ leftNum, rightNum: null, segs: leftSegs, type: 'removed' })
        unified.push({ leftNum: null, rightNum, segs: rightSegs, type: 'added' })
        leftNum++
        rightNum++
      } else if (l !== undefined) {
        const segs: Segment[] = [{ text: l, changed: true }]
        split.push({ leftNum, leftSegs: segs, leftType: 'removed', rightNum: null, rightSegs: null, rightType: 'blank' })
        unified.push({ leftNum, rightNum: null, segs, type: 'removed' })
        leftNum++
      } else if (r !== undefined) {
        const segs: Segment[] = [{ text: r, changed: true }]
        split.push({ leftNum: null, leftSegs: null, leftType: 'blank', rightNum, rightSegs: segs, rightType: 'added' })
        unified.push({ leftNum: null, rightNum, segs, type: 'added' })
        rightNum++
      }
    }
  }

  return { split, unified, additions, removals }
}
