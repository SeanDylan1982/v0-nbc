"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Trophy, Users } from "lucide-react"
import { HeroCarousel } from "@/components/hero-carousel"
import { type Event, getEvents } from "@/app/actions/events"
import { useRouter } from "next/navigation"
import { getJokerDrawInfo, type JokerDrawInfo } from "@/app/actions/joker-draw"
import { formatCurrency } from "@/lib/utils-extension"
import { Skeleton } from "@/components/ui/skeleton"
import { type Competition, getCompetitions } from "@/app/actions/competitions"

export default function HomeSection() {
  const router = useRouter()
  const [recentEvents, setRecentEvents] = useState<Event[]>([])
  const [ongoingCompetitions, setOngoingCompetitions] = useState<Competition[]>([])
  const [jokerInfo, setJokerInfo] = useState<JokerDrawInfo | null>(null)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(true)
  const [isLoadingJoker, setIsLoadingJoker] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const allEvents = await getEvents()
        console.log("Fetched events:", allEvents.length)

        // Sort events by creation date (newest first)
        const sortedEvents = allEvents
          .filter((event) => {
            // Filter out joker events as they're shown separately
            return event.category !== "joker"
          })
          .sort((a, b) => {
            // Sort by created_at timestamp (newest first)
            const dateA = new Date(a.created_at || "").getTime()
            const dateB = new Date(b.created_at || "").getTime()
            return dateB - dateA
          })
          .slice(0, 3) // Take only the 3 most recent events

        console.log("Recent events:", sortedEvents.length)
        setRecentEvents(sortedEvents)
      } catch (error) {
        console.error("Failed to load events:", error)
      } finally {
        setIsLoadingEvents(false)
      }
    }

    // Load competitions
    const loadCompetitions = async () => {
      try {
        // Get all competitions
        const allCompetitions = await getCompetitions()
        console.log("Fetched competitions:", allCompetitions.length)

        // Filter for "In Progress" competitions
        const inProgressCompetitions = allCompetitions.filter((comp) => comp.status === "In Progress").slice(0, 3) // Take only the first 3 competitions

        // If no "In Progress" competitions, show "Upcoming" ones
        let competitionsToShow = inProgressCompetitions

        if (inProgressCompetitions.length === 0) {
          competitionsToShow = allCompetitions.filter((comp) => comp.status === "Upcoming").slice(0, 3)
        }

        // If still no competitions, just show the most recent ones
        if (competitionsToShow.length === 0) {
          competitionsToShow = allCompetitions.slice(0, 3)
        }

        console.log("Filtered competitions:", competitionsToShow.length)
        setOngoingCompetitions(competitionsToShow)
      } catch (error) {
        console.error("Failed to load competitions:", error)
      } finally {
        setIsLoadingCompetitions(false)
      }
    }

    // Load joker draw information
    const loadJokerInfo = async () => {
      try {
        const info = await getJokerDrawInfo()
        setJokerInfo(info)
      } catch (error) {
        console.error("Failed to load joker draw info:", error)
      } finally {
        setIsLoadingJoker(false)
      }
    }

    loadEvents()
    loadCompetitions()
    loadJokerInfo()
  }, [])

  // Function to navigate to a specific tab
  const navigateToTab = (tab: string) => {
    // Update URL with the tab name
    router.push(`/?tab=${tab}`)

    // Dispatch a custom event that the parent page component can listen for
    const event = new CustomEvent("changeTab", { detail: { tab } })
    window.dispatchEvent(event)
  }

  // Function to get status label with appropriate styling
  const getStatusLabel = (status: string) => {
    let bgColor = "bg-gray-100"

    if (status === "In Progress") {
      bgColor = "bg-green-100 text-green-800"
    } else if (status === "Upcoming") {
      bgColor = "bg-blue-100 text-blue-800"
    } else if (status === "Completed") {
      bgColor = "bg-amber-100 text-amber-800"
    }

    return <span className={`text-xs px-2 py-1 rounded-full ${bgColor}`}>{status}</span>
  }

  // Function to format date for display
  const formatDate = (dateString: string) => {
    // Assuming date format is DD/MM/YYYY
    const parts = dateString.split("/")
    if (parts.length !== 3) return dateString // Return original if not in expected format

    const [day, month, year] = parts
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Convert month number to short name (1 => Jan)
    const monthName = months[Number.parseInt(month) - 1] || month

    return `${day} ${monthName} ${year}`
  }

  return (
    <div className="space-y-8">
      <HeroCarousel />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Latest Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingEvents ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentEvents.length > 0 ? (
              <ul className="space-y-2">
                {recentEvents.map((event) => (
                  <li key={event.id} className="border-b pb-2 last:border-b-0">
                    <p className="font-medium">{event.title}</p>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatDate(event.date)}</span>
                      <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full">{event.category}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4 text-center text-muted-foreground">No events found</div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigateToTab("events")}>
              View All Events
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Competitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCompetitions ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : ongoingCompetitions.length > 0 ? (
              <ul className="space-y-2">
                {ongoingCompetitions.map((competition) => (
                  <li key={competition.id} className="border-b pb-2 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{competition.title}</p>
                      {getStatusLabel(competition.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">Format: {competition.format}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-4 text-center text-muted-foreground">No competitions found</div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigateToTab("competitions")}>
              View All Competitions
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
            <Button variant="outline" className="w-full" onClick={() => navigateToTab("members")}>
              Membership Info
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
              {isLoadingJoker ? (
                <Skeleton className="inline-block h-6 w-24" />
              ) : (
                <strong>{jokerInfo ? formatCurrency(jokerInfo.currentJackpot) : "R0"}</strong>
              )}
              .
            </p>
            <p className="mb-4">
              Purchase tickets at the bar for <strong>only R10</strong>, enjoy drinks and snacks, and be present at the
              7:00 PM draw for your chance to win!
            </p>
            <p className="mb-4 text-primary-foreground bg-primary/20 p-2 rounded">
              <strong>Important:</strong> Players MUST be at the club at the time of the draw to be eligible to win.
            </p>
            <Button onClick={() => navigateToTab("joker-draw")}>Learn More</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
