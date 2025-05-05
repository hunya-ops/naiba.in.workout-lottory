"use client"

import { useSearchParams } from "next/navigation"
import LotteryForm from "./lottery-form"

export default function ClientWrapper() {
  const searchParams = useSearchParams()
  const lotteryId = searchParams?.get("id") || null

  return <LotteryForm initialLotteryId={lotteryId} />
}
