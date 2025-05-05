import LotteryForm from "@/components/lottery-form"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">抽奖应用</h1>
          <p className="text-gray-600">输入用户名列表和十六进制种子来确定获奖者</p>
        </header>
        <LotteryForm />
      </div>
    </main>
  )
}
