"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, ImageIcon, Trophy, Users } from "lucide-react"
import { type Competition, getCompetitionsByStatus } from "@/app/actions/competitions"
import { getImageUrl } from "@/app/actions/events"

export default function CompetitionsSection() {
  const [upcomingCompetitions, setUpcomingCompetitions] = useState<(Competition & { imageUrl?: string })[]>([])
  const [ongoingCompetitions, setOngoingCompetitions] = useState<(Competition & { imageUrl?: string })[]>([])
  const [pastCompetitions, setPastCompetitions] = useState<(Competition & { imageUrl?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        // Load competitions by status
        const loadCompetitionsByStatus = async (status: Competition["status"]) => {
          const competitions = await getCompetitionsByStatus(status)

          // Get image URLs for all competitions
          return await Promise.all(
            competitions.map(async (competition) => {
              let imageUrl = undefined
              if (competition.image_path) {
                imageUrl = await getImageUrl(competition.image_path)
              }
              return { ...competition, imageUrl }
            }),
          )
        }

        const [upcoming, ongoing, past] = await Promise.all([
          loadCompetitionsByStatus("Upcoming"),
          loadCompetitionsByStatus("In Progress"),
          loadCompetitionsByStatus("Completed"),
        ])

        setUpcomingCompetitions(upcoming)
        setOngoingCompetitions(ongoing)
        setPastCompetitions(past)
      } catch (error) {
        console.error("Failed to load competitions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCompetitions()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Competitions</h2>
        <p className="text-muted-foreground">
          Information about upcoming and ongoing competitions at Northmead Bowls Club
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <p>Loading competitions...</p>
          ) : upcomingCompetitions.length === 0 ? (
            <p>No upcoming competitions found.</p>
          ) : (
            <div className="grid gap-6">
              {upcomingCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  title={competition.title}
                  date={competition.date}
                  format={competition.format}
                  entryDeadline={competition.entry_deadline}
                  description={competition.description}
                  status="Upcoming"
                  imageUrl={competition.imageUrl}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ongoing" className="mt-6">
          {isLoading ? (
            <p>Loading competitions...</p>
          ) : ongoingCompetitions.length === 0 ? (
            <p>No ongoing competitions found.</p>
          ) : (
            <div className="grid gap-6">
              {ongoingCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  title={competition.title}
                  date={competition.date}
                  format={competition.format}
                  entryDeadline={competition.entry_deadline}
                  description={competition.description}
                  status="In Progress"
                  imageUrl={competition.imageUrl}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {isLoading ? (
            <p>Loading competitions...</p>
          ) : pastCompetitions.length === 0 ? (
            <p>No past competitions found.</p>
          ) : (
            <div className="grid gap-6">
              {pastCompetitions.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  title={competition.title}
                  date={competition.date}
                  format={competition.format}
                  entryDeadline={competition.entry_deadline}
                  description={competition.description}
                  status="Completed"
                  winner={competition.winner || undefined}
                  imageUrl={competition.imageUrl}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface CompetitionCardProps {
  title: string
  date: string
  format: string
  entryDeadline: string
  description: string
  status: "Upcoming" | "In Progress" | "Completed"
  winner?: string
  imageUrl?: string
}

function CompetitionCard({
  title,
  date,
  format,
  entryDeadline,
  description,
  status = "Upcoming",
  winner,
  imageUrl,
}: CompetitionCardProps) {
  const statusColors = {
    Upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "In Progress": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  }

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
                <CardDescription className="mt-1">
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>{date}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-4 w-4" />
                    <span>Format: {format}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>Entry Deadline: {entryDeadline}</span>
                  </div>
                </CardDescription>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>{status}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{description}</p>
            {winner && (
              <div className="mt-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="font-medium">Winner: {winner}</span>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
