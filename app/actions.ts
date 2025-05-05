"use server"

import { redis, LOTTERY_DATA_TTL, safeJsonParse } from "@/lib/redis"
import { generateUniqueId } from "@/lib/utils"

// 抽奖数据类型
interface LotteryData {
  usernames: string
  hexSeed: string
  timestamp: number
}

// 操作响应类型
type ActionResponse<T = undefined> = { success: true; id: string; data?: T } | { success: false; error: string }

// 将抽奖数据保存到 Redis
export async function saveLotteryData(usernames: string, hexSeed: string): Promise<ActionResponse> {
  try {
    const id = generateUniqueId()

    const lotteryData: LotteryData = {
      usernames,
      hexSeed,
      timestamp: Date.now(),
    }

    // 保存到 Redis，设置 TTL
    await redis.set(`lottery:${id}`, JSON.stringify(lotteryData), {
      ex: LOTTERY_DATA_TTL,
    })

    return { success: true, id }
  } catch (error) {
    console.error("Error saving lottery data:", error)
    return {
      success: false,
      error: error instanceof Error ? `保存抽奖数据失败: ${error.message}` : "保存抽奖数据失败",
    }
  }
}

// 从 Redis 获取抽奖数据
export async function getLotteryData(id: string): Promise<ActionResponse<LotteryData>> {
  try {
    // 获取 Redis 中的原始数据
    const rawData = await redis.get(`lottery:${id}`)

    if (!rawData) {
      return { success: false, error: "抽奖数据未找到" }
    }

    // 安全解析 JSON 数据
    const parsedData = safeJsonParse<LotteryData>(rawData)

    if (!parsedData) {
      return { success: false, error: "抽奖数据格式无效" }
    }

    return {
      success: true,
      id,
      data: parsedData,
    }
  } catch (error) {
    console.error("Error retrieving lottery data:", error)
    return {
      success: false,
      error: error instanceof Error ? `获取抽奖数据失败: ${error.message}` : "获取抽奖数据失败",
    }
  }
}
