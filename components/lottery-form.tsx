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
import { calculateLottery } from "@/lib/utils"
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
  const [results, setResults] = useState<ReturnType<typeof calculateLottery> | null>(null)
  const [shareUrl, setShareUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingResults, setIsLoadingResults] = useState(false)

  // Load data from server when component mounts with an ID
  useEffect(() => {
    // Set loading state based on whether we have an ID
    if (initialLotteryId) {
      setIsLoadingResults(true)

      async function fetchLotteryData() {
        try {
          const response = await getLotteryData(initialLotteryId)

          if (response.success && response.data) {
            // Validate the data structure
            if (!response.data.usernames || !response.data.hexSeed) {
              setError("抽奖数据格式无效")
              setIsLoadingResults(false)
              return
            }

            setUsernames(response.data.usernames)
            setHexSeed(response.data.hexSeed)

            // Calculate and display results
            const lotteryResults = calculateLottery(response.data.usernames, response.data.hexSeed)
            setResults(lotteryResults)

            // Set share URL
            if (typeof window !== "undefined") {
              setShareUrl(`${window.location.origin}/?id=${initialLotteryId}`)
            }
          } else {
            setError(response.error || "无法找到该抽奖结果，可能已过期或ID无效")
          }
        } catch (err) {
          console.error("Error in fetchLotteryData:", err)
          setError(`加载抽奖数据时出错: ${err.message || "未知错误"}`)
        } finally {
          setIsLoadingResults(false)
        }
      }

      fetchLotteryData()
    }
  }, [initialLotteryId])

  const handleCalculate = async () => {
    // Validate inputs
    if (!usernames.trim()) {
      setError("请输入至少一个用户名")
      return
    }

    if (!hexSeed.trim()) {
      setError("请输入十六进制种子")
      return
    }

    // Validate hex string
    const hexRegex = /^[0-9A-Fa-f]{8}$/
    if (!hexRegex.test(hexSeed)) {
      setError("十六进制种子必须是8个字符(0-9, A-F)")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // Calculate lottery results
      const lotteryResults = calculateLottery(usernames, hexSeed)
      setResults(lotteryResults)

      // Save data to server
      const response = await saveLotteryData(usernames, hexSeed)

      if (response.success && response.id) {
        // Update URL with ID
        router.push(`/?id=${response.id}`)

        // Set share URL
        if (typeof window !== "undefined") {
          setShareUrl(`${window.location.origin}/?id=${response.id}`)
        }
      } else {
        setError(response.error || "保存抽奖数据时出错")
      }
    } catch (err) {
      console.error("Error in handleCalculate:", err)
      setError(`处理抽奖时出错: ${err.message || "未知错误"}`)
    } finally {
      setIsLoading(false)
    }
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
              <Input
                id="hexSeed"
                placeholder="例如：1A2B3C4D"
                value={hexSeed}
                onChange={(e) => setHexSeed(e.target.value)}
                maxLength={8}
              />
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
                "计算获奖者"
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
    </div>
  )
}
