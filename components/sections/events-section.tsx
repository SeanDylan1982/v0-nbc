"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, ImageIcon, MapPin, AlertCircle } from "lucide-react"
import { type Event, getEvents, getImageUrl } from "@/app/actions/events"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EventsSection() {
  const [events, setEvents] = useState<(Event & { imageUrl?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("EventsSection: Loading events...")
        const data = await getEvents()

        if (!data || data.length === 0) {
          console.log("EventsSection: No events found or empty array returned")
        }

        // Get image URLs for all events
        const eventsWithImages = await Promise.all(
          data.map(async (event) => {
            let imageUrl = undefined
            if (event.image_path) {
              try {
                imageUrl = await getImageUrl(event.image_path)
              } catch (err) {
                console.error("Error getting image URL:", err)
              }
            }
            return { ...event, imageUrl }
          }),
        )

        setEvents(eventsWithImages)
        console.log(`EventsSection: Loaded ${eventsWithImages.length} events`)
      } catch (err) {
        console.error("Failed to load events:", err)
        setError("Failed to load events. Please try refreshing the page.")
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [])

  const filteredEvents = activeTab === "all" ? events : events.filter((event) => event.category === activeTab)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Upcoming Events</h2>
        <p className="text-muted-foreground">Join us for these exciting events at Northmead Bowls Club</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="social">Social Events</TabsTrigger>
          <TabsTrigger value="joker">Joker Draw</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 bg-muted h-48"></div>
                      <div className="md:w-2/3 p-6">
                        <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                        <div className="h-20 bg-muted rounded"></div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events found.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back later for upcoming events.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  date={event.date}
                  time={event.time}
                  location={event.location}
                  description={event.description}
                  category={event.category as "competitions" | "social" | "joker"}
                  imageUrl={event.imageUrl}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface EventCardProps {
  title: string
  date: string
  time: string
  location: string
  description: string
  category: "competitions" | "social" | "joker"
  imageUrl?: string
}

function EventCard({ title, date, time, location, description, category, imageUrl }: EventCardProps) {
  const categoryColors = {
    competitions: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    social: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    joker: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
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
                    <Clock className="h-4 w-4" />
                    <span>{time}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                  </div>
                </CardDescription>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${categoryColors[category]}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p>{description}</p>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
