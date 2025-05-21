"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, ImageIcon, Trophy } from "lucide-react"
import { type Result, getResultsByCategory } from "@/app/actions/results"
import { getImageUrl } from "@/app/actions/events"

export default function ResultsSection() {
  const [competitionResults, setCompetitionResults] = useState<(Result & { imageUrl?: string })[]>([])
  const [leagueResults, setLeagueResults] = useState<(Result & { imageUrl?: string })[]>([])
  const [jokerResults, setJokerResults] = useState<(Result & { imageUrl?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadResults = async () => {
      try {
        // Load results by category
        const loadResultsByCategory = async (category: string) => {
          const results = await getResultsByCategory(category)

          // Get image URLs for all results
          return await Promise.all(
            results.map(async (result) => {
              let imageUrl = undefined
              if (result.image_path) {
                imageUrl = await getImageUrl(result.image_path)
              }
              return { ...result, imageUrl }
            }),
          )
        }

        const [competitions, league, joker] = await Promise.all([
          loadResultsByCategory("competitions"),
          loadResultsByCategory("league"),
          loadResultsByCategory("joker"),
        ])

        setCompetitionResults(competitions)
        setLeagueResults(league)
        setJokerResults(joker)
      } catch (error) {
        console.error("Failed to load results:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Results</h2>
        <p className="text-muted-foreground">Latest results from competitions and events at Northmead Bowls Club</p>
      </div>

      <Tabs defaultValue="competitions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="league">League Matches</TabsTrigger>
          <TabsTrigger value="joker">Joker Draw</TabsTrigger>
        </TabsList>

        <TabsContent value="competitions" className="mt-6">
          {isLoading ? (
            <p>Loading results...</p>
          ) : competitionResults.length === 0 ? (
            <p>No competition results found.</p>
          ) : (
            <div className="grid gap-6">
              {competitionResults.map((result) => (
                <ResultCard
                  key={result.id}
                  title={result.title}
                  date={result.date}
                  results={result.items || []}
                  imageUrl={result.imageUrl}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="league" className="mt-6">
          {isLoading ? (
            <p>Loading results...</p>
          ) : leagueResults.length === 0 ? (
            <p>No league match results found.</p>
          ) : (
            <div className="grid gap-6">
              {leagueResults.map((result) => (
                <ResultCard
                  key={result.id}
                  title={result.title}
                  date={result.date}
                  results={result.items || []}
                  imageUrl={result.imageUrl}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="joker" className="mt-6">
          {isLoading ? (
            <p>Loading results...</p>
          ) : jokerResults.length === 0 ? (
            <p>No joker draw results found.</p>
          ) : (
            <div className="grid gap-6">
              {jokerResults.map((result) => (
                <ResultCard
                  key={result.id}
                  title={result.title}
                  date={result.date}
                  results={result.items || []}
                  imageUrl={result.imageUrl}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ResultCardProps {
  title: string
  date: string
  results: { id?: string; position: string; name: string }[]
  imageUrl?: string
}

function ResultCard({ title, date, results, imageUrl }: ResultCardProps) {
  return (
    <Card>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 relative">
          {imageUrl ? (
            <div className="relative h-48 md:h-full">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={title}
                fill
                className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 md:h-full bg-muted rounded-t-lg md:rounded-l-lg md:rounded-t-none">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="md:w-2/3">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{title}</CardTitle>
                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{date}</span>
                </div>
              </div>
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.map((result, index) => (
                <li key={result.id || index} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <span className="font-medium">{result.position}</span>
                  <span>{result.name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
