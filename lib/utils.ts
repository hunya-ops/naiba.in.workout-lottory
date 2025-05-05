import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// 生成唯一 ID
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 使用确定性种子的 Fisher-Yates 洗牌算法
export function seedShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array]
  const seedNumber = Number.parseInt(seed, 16) || 0 // 添加回退值以防解析失败

  // 创建一个简单的确定性随机数生成器
  const seededRandom = (max: number): number => {
    // 使用线性同余生成器 (LCG)
    let x = seedNumber
    const a = 1664525
    const c = 1013904223
    const m = 2 ** 32

    // 生成下一个值
    x = (a * x + c) % m

    // 返回 0 到 max-1 之间的值
    return (x / m) * max
  }

  // Fisher-Yates 洗牌算法，使用我们的种子随机函数
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

// 抽奖结果类型定义
export interface LotteryResult {
  shuffledUsernames: { username: string; index: number }[]
  hexValue: string
  decimalValue: number
  totalUsernames: number
  winningPosition: number
  winningUsername: string
}

// 计算抽奖结果
export function calculateLottery(usernamesInput: string, hexSeed: string): LotteryResult {
  // 解析用户名（每行一个）
  const usernamesList = usernamesInput
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name.length > 0)

  // 使用十六进制种子打乱用户名
  const shuffled = seedShuffle(usernamesList, hexSeed)

  // 将十六进制转换为十进制
  const decimalValue = Number.parseInt(hexSeed, 16)

  // 计算获奖位置（基于 1 的索引）
  const totalUsernames = shuffled.length
  const winningPosition = (decimalValue % totalUsernames) + 1

  // 获取获奖用户名
  const winningUsername = shuffled[winningPosition - 1]

  // 创建打乱后的用户名索引列表
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

// 用于合并 Tailwind 类名的工具函数
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
