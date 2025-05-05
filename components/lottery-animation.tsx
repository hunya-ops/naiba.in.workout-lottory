"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "framer-motion"

interface LotteryAnimationProps {
  usernames: string[]
  hexSeed: string
  winningIndex: number
  onComplete: () => void
}

export default function LotteryAnimation({ usernames, hexSeed, winningIndex, onComplete }: LotteryAnimationProps) {
  const [phase, setPhase] = useState<"shuffle" | "slowdown" | "reveal" | "complete">("shuffle")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [speed, setSpeed] = useState(80) // ms between updates
  const [displayedUsernames, setDisplayedUsernames] = useState<string[]>([...usernames])
  const confettiRef = useRef<HTMLDivElement>(null)

  // 控制动画阶段
  useEffect(() => {
    if (usernames.length === 0) return

    let timer: NodeJS.Timeout

    if (phase === "shuffle") {
      // 快速洗牌阶段
      timer = setTimeout(() => {
        // 随机打乱显示的用户名
        const shuffled = [...displayedUsernames]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        setDisplayedUsernames(shuffled)

        // 2秒后进入减速阶段
        if (Date.now() % 10 === 0) {
          setCurrentIndex((prev) => (prev + 1) % usernames.length)
        }

        // 2秒后进入减速阶段
        if (Date.now() - startTime > 2000) {
          setPhase("slowdown")
          setSpeed(150)
        }
      }, speed)
    } else if (phase === "slowdown") {
      // 减速阶段
      timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % usernames.length)
        setSpeed((prev) => prev + 20) // 逐渐减速

        // 当速度足够慢时，进入揭示阶段
        if (speed > 500) {
          setPhase("reveal")
          setCurrentIndex(winningIndex)
        }
      }, speed)
    } else if (phase === "reveal") {
      // 揭示获奖者
      timer = setTimeout(() => {
        // 触发五彩纸屑效果
        if (confettiRef.current) {
          const rect = confettiRef.current.getBoundingClientRect()
          const x = rect.left + rect.width / 2
          const y = rect.top + rect.height / 2

          confetti({
            particleCount: 100,
            spread: 70,
            origin: {
              x: x / window.innerWidth,
              y: y / window.innerHeight,
            },
          })
        }

        setPhase("complete")
        setTimeout(onComplete, 2500) // 2.5秒后完成动画
      }, 1000)
    }

    const startTime = Date.now()

    return () => clearTimeout(timer)
  }, [displayedUsernames, phase, speed, currentIndex, usernames, winningIndex, onComplete])

  return (
    <Card className="overflow-hidden">
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="mb-6 text-center">
          <p className="text-lg font-medium mb-2">抽奖进行中...</p>
          <div className="text-sm text-muted-foreground">
            使用种子: <span className="font-mono">{hexSeed}</span>
          </div>
        </div>

        <div className="relative w-full max-w-md h-[150px] flex items-center justify-center">
          <AnimatePresence>
            {phase === "complete" ? (
              <motion.div
                ref={confettiRef}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-green-600 mb-2">恭喜!</div>
                <div className="text-3xl font-bold">{usernames[winningIndex]}</div>
                <div className="mt-2 text-sm text-muted-foreground">是本次抽奖的获奖者</div>
              </motion.div>
            ) : (
              <div className="relative w-full h-full">
                {/* 创建一个循环的用户名列表，当前选中的在中间 */}
                {displayedUsernames.map((name, idx) => {
                  const isActive = idx === currentIndex
                  const distance = Math.abs(idx - currentIndex)
                  const opacity = distance === 0 ? 1 : distance === 1 ? 0.7 : distance === 2 ? 0.4 : 0.2
                  const scale = distance === 0 ? 1 : distance === 1 ? 0.9 : distance === 2 ? 0.8 : 0.7
                  const yOffset = (idx - currentIndex) * 50

                  return (
                    <motion.div
                      key={`${name}-${idx}`}
                      initial={{ y: 0, opacity: 0, scale: 0.5 }}
                      animate={{
                        y: yOffset,
                        opacity,
                        scale,
                        color: isActive ? "#16a34a" : "#000000",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={cn(
                        "absolute left-0 right-0 text-center transition-all",
                        isActive ? "font-bold text-xl" : "font-normal",
                      )}
                      style={{
                        top: "50%",
                        transform: `translateY(-50%) translateY(${yOffset}px) scale(${scale})`,
                        zIndex: 100 - distance,
                      }}
                    >
                      {name}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {phase !== "complete" && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: phase === "shuffle" ? "30%" : phase === "slowdown" ? "70%" : "90%",
                }}
              ></div>
            </div>
            <div className="text-xs text-center mt-2 text-muted-foreground">
              {phase === "shuffle"
                ? "正在打乱用户名..."
                : phase === "slowdown"
                  ? "正在选择获奖者..."
                  : "即将揭晓结果..."}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
