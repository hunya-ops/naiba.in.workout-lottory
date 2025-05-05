// 生成唯一ID
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 保存抽奖数据到本地存储
export function saveLotteryData(id: string, usernames: string, hexSeed: string): void {
  try {
    const lotteryData = {
      usernames,
      hexSeed,
      timestamp: Date.now(),
    }

    // 获取现有数据
    const existingDataStr = localStorage.getItem("lotteryData")
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : {}

    // 添加新数据
    existingData[id] = lotteryData

    // 保存回本地存储
    localStorage.setItem("lotteryData", JSON.stringify(existingData))
  } catch (error) {
    console.error("Error saving lottery data:", error)
  }
}

// 从本地存储获取抽奖数据
export function getLotteryData(id: string): { usernames: string; hexSeed: string } | null {
  try {
    const dataStr = localStorage.getItem("lotteryData")
    if (!dataStr) return null

    const data = JSON.parse(dataStr)
    return data[id] || null
  } catch (error) {
    console.error("Error retrieving lottery data:", error)
    return null
  }
}
