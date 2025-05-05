import { Redis } from "@upstash/redis"

// 创建 Redis 客户端
export const redis = Redis.fromEnv()

// 抽奖数据 TTL (7天，单位：秒)
export const LOTTERY_DATA_TTL = 60 * 60 * 24 * 7

// 安全解析 JSON 的辅助函数
export function safeJsonParse<T>(data: unknown): T | null {
  if (!data) return null

  try {
    // 如果数据已经是对象，直接返回
    if (typeof data === "object" && data !== null) {
      return data as T
    }

    // 否则尝试解析为 JSON
    return JSON.parse(data as string) as T
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return null
  }
}
