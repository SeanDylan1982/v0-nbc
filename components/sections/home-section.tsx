"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Trophy, Users } from "lucide-react"
import { HeroCarousel } from "@/components/hero-carousel"
import { type Event, getEvents } from "@/app/actions/events"
import { type Result, getResults } from "@/app/actions/results"

export default function HomeSection() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [latestResults, setLatestResults] = useState<Result[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [isLoadingResults, setIsLoadingResults] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const allEvents = await getEvents()

        // Sort events by date (this is a simple implementation - in a real app,
        // you'd want to parse dates properly and handle different date formats)
        const sortedEvents = allEvents
          .filter((event) => event.category !== "joker") // Filter out regular joker events since they're shown separately
          .sort((a, b) => {
            // Simple string comparison - assumes dates are in a consistent format
            // In a real app, you'd want to parse these properly
            return a.date.localeCompare(b.date)
          })
          .slice(0, 3) // Take only the first 3 events

        setUpcomingEvents(sortedEvents)
      } catch (error) {
        console.error("Failed to load events:", error)
      } finally {
        setIsLoadingEvents(false)
      }
    }

    // Update the loadResults function to filter for competition results only
    const loadResults = async () => {
      try {
        const allResults = await getResults()

        // Filter for competition results only and sort by date (most recent first)
        const sortedResults = allResults
          .filter((result) => result.category === "competitions") // Only show competition results
          .sort((a, b) => {
            // Sort in reverse order for results (newest first)
            return b.date.localeCompare(a.date)
          })
          .slice(0, 3) // Take only the first 3 results

        setLatestResults(sortedResults)
      } catch (error) {
        console.error("Failed to load results:", error)
      } finally {
        setIsLoadingResults(false)
      }
    }

    loadEvents()
    loadResults()
  }, [])

  return (
    <div className="space-y-8">
      <HeroCarousel />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingEvents ? (
              <div className="py-4 text-center text-muted-foreground">Loading events...</div>
            ) : upcomingEvents.length > 0 ? (
              <ul className="space-y-2">
                {upcomingEvents.map((event) => (
                  <li key={event.id} className="border-b pb-2 last:border-b-0">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.date} @ {event.time}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4 text-center text-muted-foreground">No upcoming events found</div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#events">View All Events</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Latest Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingResults ? (
              <div className="py-4 text-center text-muted-foreground">Loading results...</div>
            ) : latestResults.length > 0 ? (
              <ul className="space-y-2">
                {latestResults.map((result) => (
                  <li key={result.id} className="border-b pb-2 last:border-b-0">
                    <p className="font-medium">{result.title}</p>
                    {result.items && result.items.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {result.items[0].position}: {result.items[0].name}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4 text-center text-muted-foreground">No results found</div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#results">View All Results</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Membership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Join our friendly club! We offer:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Full playing membership</li>
              <li>Social membership</li>
              <li>Coaching for beginners</li>
              <li>Club facilities access</li>
              <li>Regular social events</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#members">Membership Info</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-primary/10 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Weekly Joker Draw</h2>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="md:w-1/2">
            <Image
              src="/images/joker-draw.gif"
              alt="Joker Draw"
              width={300}
              height={300}
              className="rounded-lg mx-auto"
            />
          </div>
          <div className="md:w-1/2">
            <p className="mb-4">
              Join us every Friday night for our popular Joker Draw! The jackpot currently stands at{" "}
              <strong>R10,000</strong>.
            </p>
            <p className="mb-4">
              Purchase tickets at the bar, enjoy drinks and snacks, and be present at the 7:00 PM draw for your chance
              to win!
            </p>
            <Button asChild>
              <Link href="#events">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
