import { redis } from "@/lib/redis"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "No ID provided" }, { status: 400 })
  }

  try {
    // Get raw data from Redis
    const key = `lottery:${id}`
    const rawData = await redis.get(key)

    return NextResponse.json({
      key,
      rawData,
      type: typeof rawData,
      exists: rawData !== null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to retrieve data",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
