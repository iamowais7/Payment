import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatMonth(month: number, year: number): string {
  return new Date(year, month - 1).toLocaleString('en-IE', { month: 'long', year: 'numeric' })
}

export function getMatchLabel(count: number): string {
  return `${count}-Number Match`
}

export function getPrizePoolShare(matchCount: number): number {
  if (matchCount === 5) return 0.4
  if (matchCount === 4) return 0.35
  return 0.25
}

export function calculatePrizePools(totalPoolCents: number, rolloverCents = 0) {
  return {
    fiveMatch: Math.floor(totalPoolCents * 0.4) + rolloverCents,
    fourMatch: Math.floor(totalPoolCents * 0.35),
    threeMatch: Math.floor(totalPoolCents * 0.25),
  }
}

export function runDrawRandom(): number[] {
  const numbers = new Set<number>()
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

export function runDrawAlgorithmic(scoreFrequency: Record<number, number>): number[] {
  const scores = Object.entries(scoreFrequency)
    .map(([score, freq]) => ({ score: Number(score), freq }))
    .sort((a, b) => b.freq - a.freq)

  const topScores = scores.slice(0, 10).map(s => s.score)
  const selected = new Set<number>()

  while (selected.size < 5 && topScores.length > selected.size) {
    const idx = Math.floor(Math.random() * Math.min(topScores.length, 10))
    if (topScores[idx]) selected.add(topScores[idx])
  }

  while (selected.size < 5) {
    selected.add(Math.floor(Math.random() * 45) + 1)
  }

  return Array.from(selected).sort((a, b) => a - b)
}

export function countMatches(userScores: number[], winningNumbers: number[]): number {
  const winSet = new Set(winningNumbers)
  return userScores.filter(s => winSet.has(s)).length
}

export function getMatchedNumbers(userScores: number[], winningNumbers: number[]): number[] {
  const winSet = new Set(winningNumbers)
  return userScores.filter(s => winSet.has(s))
}
