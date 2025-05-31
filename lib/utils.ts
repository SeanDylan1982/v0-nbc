import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// MongoDB helper functions
export async function fetcher(url: string, options?: RequestInit) {
  const response = await fetch(url, options)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred')
  }

  return data
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}