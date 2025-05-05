"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import LotteryResults from "@/components/lottery-results"
import LotteryAnimation from "@/components/lottery-animation"
import { calculateLottery, type LotteryResult } from "@/lib/utils"
import { saveLotteryData, getLotteryData } from "@/app/actions"
import { Loader2 } from "lucide-react"

interface LotteryFormProps {
  initialLotteryId: string | null
}

export default function LotteryForm({ initialLotteryId }: LotteryFormProps) {
  const router = useRouter()

  const [usernames, setUsernames] = useState("")
  const [hexSeed, setHexSeed] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<LotteryResult | null>(null)
  const [shareUrl, setShareUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationData, setAnimationData] = useState<{
    usernames: string[]
    hexSeed: string
    winningIndex: number
  } | null>(null)

  // 当组件挂载且有 ID 时，从服务器加载数据
  useEffect(() => {
    if (!initialLotteryId) return

    async function fetchLotteryData() {
      setIsLoadingResults(true)
      setError(null)

      try {
        const response = await getLotteryData(initialLotteryId)

        if (response.success && response.data) {
          const { usernames, hexSeed } = response.data

          // 验证数据结构
          if (!usernames || !hexSeed) {
            setError("抽奖数据格式无效")
            return
          }

          setUsernames(usernames)
          setHexSeed(hexSeed)

          // 计算并显示结果
          const lotteryResults = calculateLottery(usernames, hexSeed)
          setResults(lotteryResults)

          // 设置分享 URL
          setShareUrl(`${window.location.origin}/?id=${initialLotteryId}`)
        } else {
          setError(response.error || "无法找到该抽奖结果，可能已过期或ID无效")
        }
      } catch (err) {
        console.error("Error in fetchLotteryData:", err)
        setError(`加载抽奖数据时出错: ${err instanceof Error ? err.message : "未知错误"}`)
      } finally {
        setIsLoadingResults(false)
      }
    }

    fetchLotteryData()
  }, [initialLotteryId])

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
  const handleCalculate = async () => {
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
      setShowAnimation(true)

      // 保存数据到服务器
      const response = await saveLotteryData(usernames, hexSeed)

      if (response.success && response.id) {
        // 更新 URL，包含 ID
        router.push(`/?id=${response.id}`)

        // 设置分享 URL
        setShareUrl(`${window.location.origin}/?id=${response.id}`)

        // 保存结果，但不立即显示（等动画完成后显示）
        setResults(lotteryResults)
      } else {
        setError(response.error || "保存抽奖数据时出错")
        setShowAnimation(false)
      }
    } catch (err) {
      console.error("Error in handleCalculate:", err)
      setError(`处理抽奖时出错: ${err instanceof Error ? err.message : "未知错误"}`)
      setShowAnimation(false)
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

  if (isLoadingResults) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>正在加载抽奖结果...</p>
      </div>
    )
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

          {shareUrl && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-medium mb-2">分享结果</h3>
              <p className="text-sm text-gray-600 mb-2">分享此URL给他人，他们可以在任何设备上查看相同的抽奖结果：</p>
              <div className="flex">
                <Input readOnly value={shareUrl} className="flex-1" />
                <Button
                  className="ml-2"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl)
                    alert("URL已复制到剪贴板！")
                  }}
                >
                  复制
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
