"use server"

import { redis, LOTTERY_DATA_TTL, safeJsonParse } from "@/lib/redis"
import { generateUniqueId } from "@/lib/utils"

// Save lottery data to Redis
export async function saveLotteryData(usernames: string, hexSeed: string) {
  try {
    const id = generateUniqueId()

    const lotteryData = {
      usernames,
      hexSeed,
      timestamp: Date.now(),
    }

    // Save to Redis with TTL
    await redis.set(`lottery:${id}`, JSON.stringify(lotteryData), {
      ex: LOTTERY_DATA_TTL,
    })

    return { success: true, id }
  } catch (error) {
    console.error("Error saving lottery data:", error)
    return { success: false, error: "Failed to save lottery data" }
  }
}

// Get lottery data from Redis
export async function getLotteryData(id: string) {
  try {
    // Log the ID we're looking for to help with debugging
    console.log(`Retrieving lottery data for ID: lottery:${id}`)

    // Get raw data from Redis
    const rawData = await redis.get(`lottery:${id}`)

    // Log the raw data for debugging
    console.log("Raw data from Redis:", rawData)

    if (!rawData) {
      return { success: false, error: "Lottery data not found" }
    }

    // Safely parse the JSON data
    const parsedData = safeJsonParse(rawData)

    if (!parsedData) {
      return { success: false, error: "Invalid lottery data format" }
    }

    return {
      success: true,
      data: parsedData,
    }
  } catch (error) {
    console.error("Error retrieving lottery data:", error)
    return { success: false, error: `Failed to retrieve lottery data: ${error.message}` }
  }
}
