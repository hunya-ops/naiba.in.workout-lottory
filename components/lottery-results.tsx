"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type LotteryResult = {
  shuffledUsernames: { username: string; index: number }[]
  hexValue: string
  decimalValue: number
  totalUsernames: number
  winningPosition: number
  winningUsername: string
}

export default function LotteryResults({ results }: { results: LotteryResult }) {
  const { shuffledUsernames, hexValue, decimalValue, totalUsernames, winningPosition, winningUsername } = results

  // Function to export results as text
  const exportResults = () => {
    const lines = [
      "抽奖结果",
      "=".repeat(30),
      `获奖者: ${winningUsername} (位置 #${winningPosition})`,
      "",
      "计算过程:",
      `1. 打乱了 ${totalUsernames} 个用户名`,
      `2. 十六进制种子 ${hexValue} 转换为十进制: ${decimalValue}`,
      `3. 计算获奖位置: (${decimalValue} % ${totalUsernames}) + 1 = ${winningPosition}`,
      `4. 选择位置 ${winningPosition} 的用户名: ${winningUsername}`,
      "",
      "打乱后的用户名列表:",
    ]

    shuffledUsernames.forEach(({ username, index }) => {
      lines.push(`${index}. ${username}${index === winningPosition ? " (获奖者)" : ""}`)
    })

    const text = lines.join("\n")

    // Create a blob and download
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "lottery-results.txt"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>抽奖结果</CardTitle>
          <Button variant="outline" size="sm" onClick={exportResults}>
            <Download className="h-4 w-4 mr-2" />
            导出结果
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-xl font-bold text-green-800 mb-2">获奖者: {winningUsername}</h3>
              <p className="text-green-700">位置 #{winningPosition} 在打乱后的列表中</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">计算过程</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>打乱了 {totalUsernames} 个用户名的列表</li>
                <li>
                  将十六进制种子 <span className="font-mono">{hexValue}</span> 转换为十进制: {decimalValue}
                </li>
                <li>
                  计算获奖位置: ({decimalValue} % {totalUsernames}) + 1 = {winningPosition}
                </li>
                <li>
                  选择位置 {winningPosition} 的用户名: <strong>{winningUsername}</strong>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">打乱后的用户名</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">位置</TableHead>
                      <TableHead>用户名</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shuffledUsernames.map(({ username, index }) => (
                      <TableRow key={index} className={index === winningPosition ? "bg-green-50" : ""}>
                        <TableCell className="font-medium">{index}</TableCell>
                        <TableCell>
                          {username}
                          {index === winningPosition && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              获奖者
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
