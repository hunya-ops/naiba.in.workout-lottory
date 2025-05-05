import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Generate a unique ID
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Fisher-Yates shuffle algorithm with a deterministic seed
export function seedShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array]
  const seedNumber = Number.parseInt(seed, 16)

  // Create a simple deterministic random number generator
  const seededRandom = (max: number) => {
    // Using a simple LCG (Linear Congruential Generator)
    let x = seedNumber
    // These values are commonly used in LCGs
    const a = 1664525
    const c = 1013904223
    const m = Math.pow(2, 32)

    // Generate next value
    x = (a * x + c) % m

    // Return a value between 0 and max-1
    return (x / m) * max
  }

  // Fisher-Yates shuffle with our seeded random function
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

export function calculateLottery(usernamesInput: string, hexSeed: string) {
  // Parse usernames from input (one per line)
  const usernamesList = usernamesInput
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name.length > 0)

  // Shuffle usernames with the hex seed
  const shuffled = seedShuffle(usernamesList, hexSeed)

  // Convert hex to decimal
  const decimalValue = Number.parseInt(hexSeed, 16)

  // Calculate winning position (1-based index)
  const totalUsernames = shuffled.length
  const winningPosition = (decimalValue % totalUsernames) + 1

  // Get winning username
  const winningUsername = shuffled[winningPosition - 1]

  // Create indexed list of shuffled usernames
  const shuffledUsernames = shuffled.map((username, i) => ({
    username,
    index: i + 1,
  }))

  return {
    shuffledUsernames,
    hexValue: hexSeed,
    decimalValue,
    totalUsernames,
    winningPosition,
    winningUsername,
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
