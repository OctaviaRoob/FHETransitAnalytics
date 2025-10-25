import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatDate(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleString()
}

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function getTimeWindowMessage(currentHour: number, isOddHour: boolean): string {
  if (isOddHour) {
    return 'Data submission window is OPEN (odd hour)'
  } else {
    return 'Analysis window is OPEN (even hour)'
  }
}

export function getNextWindowTime(currentHour: number, isOddHour: boolean): string {
  const nextHour = isOddHour ? currentHour + 1 : currentHour + 1
  const adjustedNextHour = nextHour % 24
  return `Next window opens at ${adjustedNextHour}:00 UTC+3`
}
