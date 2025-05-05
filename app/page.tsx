import { Suspense } from "react"
import ClientWrapper from "@/components/client-wrapper"
import { Loader2 } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">抽奖应用</h1>
          <p className="text-gray-600">输入用户名列表和十六进制种子来确定获奖者</p>
        </header>
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>正在加载...</p>
            </div>
          }
        >
          <ClientWrapper />
        </Suspense>
      </div>
    </main>
  )
}
