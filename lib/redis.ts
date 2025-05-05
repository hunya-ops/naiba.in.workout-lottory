import { Redis } from "@upstash/redis"

// Create Redis client using environment variables
export const redis = Redis.fromEnv()

// TTL for lottery data (7 days in seconds)
export const LOTTERY_DATA_TTL = 60 * 60 * 24 * 7

// Helper function to safely parse JSON
export function safeJsonParse(data: any) {
  if (!data) return null

  try {
    // If data is already an object, return it
    if (typeof data === "object" && data !== null) {
      return data
    }

    // Otherwise try to parse it as JSON
    return JSON.parse(data)
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return null
  }
}
