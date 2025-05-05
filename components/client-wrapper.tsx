"use client"

import { useSearchParams } from "next/navigation"
import LotteryForm from "./lottery-form"

export default function ClientWrapper() {
  // This component's sole purpose is to safely use useSearchParams()
  const searchParams = useSearchParams()
  const lotteryId = searchParams?.get("id") || null

  return <LotteryForm initialLotteryId={lotteryId} />
}
