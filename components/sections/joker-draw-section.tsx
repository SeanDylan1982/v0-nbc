"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getJokerDrawInfo, type JokerDrawInfo } from "@/app/actions/joker-draw"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils-extension"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function JokerDrawSection() {
  const [jokerInfo, setJokerInfo] = useState<JokerDrawInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [winnerImageUrl, setWinnerImageUrl] = useState<string | null>(null)

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const loadJokerInfo = async () => {
      try {
        const info = await getJokerDrawInfo()
        setJokerInfo(info)

        if (info?.winnerImagePath) {
          const { data } = supabase.storage.from("winners").getPublicUrl(info.winnerImagePath)
          setWinnerImageUrl(data.publicUrl)
        } else {
          setWinnerImageUrl(null)
        }

        if (!info) {
          setError("No joker draw information available")
        }
      } catch (err) {
        console.error("Error loading joker draw info:", err)
        setError("Failed to load joker draw information")
      } finally {
        setLoading(false)
      }
    }

    loadJokerInfo()
  }, [supabase])

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Joker Draw</h2>
        <p className="text-muted-foreground mt-2">Our weekly Joker Draw takes place every Friday at 7:00 PM</p>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col space-y-8">
          {/* Top Section - Current Status (50%) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Jackpot - Takes up left side */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Current Jackpot</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-6">
                {loading ? (
                  <Skeleton className="h-16 w-3/4 mx-auto" />
                ) : (
                  <div className="text-5xl font-bold text-primary">
                    {jokerInfo ? formatCurrency(jokerInfo.currentJackpot) : "R0"}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right side container for Last Winner and Last Win Amount */}
            <div className="space-y-6 md:space-y-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Last Winner Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-center">Last Winner</CardTitle>
                </CardHeader>
                <CardContent className="text-center flex flex-col items-center">
                  {loading ? (
                    <>
                      <Skeleton className="h-16 w-16 rounded-full mb-2" />
                      <Skeleton className="h-6 w-3/4" />
                    </>
                  ) : (
                    <>
                      {winnerImageUrl ? (
                        <div className="relative h-20 w-20 rounded-full overflow-hidden border mb-3">
                          <Image
                            src={winnerImageUrl || "/placeholder.svg"}
                            alt={jokerInfo?.lastWinner || "Winner"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-3">
                          <span className="text-3xl">🃏</span>
                        </div>
                      )}
                      <div className="text-xl font-medium">{jokerInfo?.lastWinner || "No winner yet"}</div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Last Win Amount Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-center">Last Win Amount</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  {loading ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <div className="text-xl font-medium">
                      {jokerInfo ? formatCurrency(jokerInfo.lastWinAmount) : "R0"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Section - How It Works (50%) */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
              <CardDescription>Join us every Friday for a chance to win big!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative h-64 md:h-80 rounded-md overflow-hidden">
                  <Image src="/images/joker-draw.gif" alt="Joker Draw" fill className="object-cover" />
                </div>

                <div className="space-y-4">
                  <h4 className="text-xl font-medium">Rules:</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Purchase tickets at the bar for R10 each</li>
                    <li>Draw takes place every Friday at 7:00 PM</li>
                    <li>If your ticket is drawn, you get to pick a card from the deck</li>
                    <li>Find the Joker to win the jackpot!</li>
                    <li>If the Joker isn't found, the jackpot rolls over to next week</li>
                    <li>Consolation prizes for Kings, Queens, and Aces</li>
                    <li>You must be present at the draw to claim your prize</li>
                    <li>The more tickets you buy, the better your chances!</li>
                  </ul>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Previous Big Winners</h4>
                <p>Our biggest jackpot winner took home R45,000 in June 2023!</p>
                <p className="mt-2">Join us this Friday - you could be our next big winner!</p>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground text-center">
            {jokerInfo && <p>Last updated: {new Date(jokerInfo.updatedAt).toLocaleDateString("en-ZA")}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
