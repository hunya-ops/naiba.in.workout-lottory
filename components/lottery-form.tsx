"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import LotteryResults from "@/components/lottery-results"
import LotteryAnimation from "@/components/lottery-animation"
import { calculateLottery, type LotteryResult } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export default function LotteryForm() {
  const [usernames, setUsernames] = useState("")
  const [hexSeed, setHexSeed] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<LotteryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationData, setAnimationData] = useState<{
    usernames: string[]
    hexSeed: string
    winningIndex: number
  } | null>(null)

  // 验证输入
  const validateInputs = (): boolean => {
    if (!usernames.trim()) {
      setError("请输入至少一个用户名")
      return false
    }

    if (!hexSeed.trim()) {
      setError("请输入十六进制种子")
      return false
    }

    // 验证十六进制字符串
    const hexRegex = /^[0-9A-Fa-f]{8}$/
    if (!hexRegex.test(hexSeed)) {
      setError("十六进制种子必须是8个字符(0-9, A-F)")
      return false
    }

    return true
  }

  // 处理计算按钮点击
  const handleCalculate = () => {
    if (!validateInputs()) return

    setError(null)
    setIsLoading(true)

    try {
      // 计算抽奖结果
      const lotteryResults = calculateLottery(usernames, hexSeed)

      // 准备动画数据
      const usernamesList = usernames
        .split("\n")
        .map((name) => name.trim())
        .filter((name) => name.length > 0)

      // 设置动画数据并显示动画
      setAnimationData({
        usernames: usernamesList,
        hexSeed,
        winningIndex: lotteryResults.winningPosition - 1, // 转换为0基索引
      })

      // 保存结果，但不立即显示（等动画完成后显示）
      setResults(lotteryResults)
      setShowAnimation(true)
    } catch (err) {
      console.error("Error in handleCalculate:", err)
      setError(`处理抽奖时出错: ${err instanceof Error ? err.message : "未知错误"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 动画完成后的回调
  const handleAnimationComplete = () => {
    setShowAnimation(false)
  }

  // 生成随机十六进制种子
  const generateRandomHexSeed = () => {
    const randomHex = [...Array(8)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("")
      .toUpperCase()

    setHexSeed(randomHex)
  }

  return (
    <div className="space-y-8">
      {showAnimation && animationData ? (
        <LotteryAnimation
          usernames={animationData.usernames}
          hexSeed={animationData.hexSeed}
          winningIndex={animationData.winningIndex}
          onComplete={handleAnimationComplete}
        />
      ) : (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usernames">用户名列表（每行一个）</Label>
                  <Textarea
                    id="usernames"
                    placeholder="输入用户名，每行一个"
                    rows={6}
                    value={usernames}
                    onChange={(e) => setUsernames(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hexSeed">十六进制种子（8个字符）</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hexSeed"
                      placeholder="例如：1A2B3C4D"
                      value={hexSeed}
                      onChange={(e) => setHexSeed(e.target.value.toUpperCase())}
                      maxLength={8}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={generateRandomHexSeed} type="button">
                      随机生成
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button onClick={handleCalculate} className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    "开始抽奖"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {results && <LotteryResults results={results} />}
        </>
      )}
    </div>
  )
}
