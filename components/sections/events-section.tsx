"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin } from "lucide-react"
import { type Event, getEvents } from "@/app/actions/events"

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEvents()
        setEvents(data)
      } catch (error) {
        console.error("Failed to load events:", error)
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

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="social">Social Events</TabsTrigger>
          <TabsTrigger value="joker">Joker Draw</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <p>Loading events...</p>
          ) : filteredEvents.length === 0 ? (
            <p>No events found.</p>
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
}

function EventCard({ title, date, time, location, description, category }: EventCardProps) {
  const categoryColors = {
    competitions: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    social: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    joker: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  }

  return (
    <Card>
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
    </Card>
  )
}
