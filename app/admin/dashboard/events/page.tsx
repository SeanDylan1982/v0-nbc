"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Edit, ImageIcon, MapPin, Plus, Trash } from "lucide-react"
import {
  type Event,
  type NewEvent,
  createEvent,
  deleteEvent,
  getEvents,
  getImageUrl,
  updateEvent,
} from "@/app/actions/events"
import { useToast } from "@/hooks/use-toast"

export default function EventsAdminPage() {
  const [events, setEvents] = useState<(Event & { imageUrl?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<(Event & { imageUrl?: string }) | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    category: "social",
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEvents()

        // Check if image_path exists in the schema
        const hasImagePath = data.length > 0 ? "image_path" in data[0] : false

        // Get image URLs for all events if image_path exists
        const eventsWithImages = await Promise.all(
          data.map(async (event) => {
            let imageUrl = undefined
            if (hasImagePath && event.image_path) {
              try {
                imageUrl = await getImageUrl(event.image_path)
              } catch (error) {
                console.error("Error getting image URL:", error)
              }
            }
            return { ...event, imageUrl }
          }),
        )

        setEvents(eventsWithImages)
      } catch (error) {
        console.error("Failed to load events:", error)
        toast({
          title: "Error",
          description: "Failed to load events. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadEvents()
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditSelectedFile(e.target.files[0])
    }
  }

  const handleAddEvent = async () => {
    try {
      setIsLoading(true)
      const createdEvent = await createEvent(newEvent, selectedFile || undefined)

      // Get image URL for the new event
      let imageUrl = undefined
      if (createdEvent.image_path) {
        imageUrl = await getImageUrl(createdEvent.image_path)
      }

      setEvents([{ ...createdEvent, imageUrl }, ...events])
      setNewEvent({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        category: "social",
      })
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Event created successfully!",
      })
    } catch (error) {
      console.error("Failed to create event:", error)
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditEvent = (event: Event & { imageUrl?: string }) => {
    setSelectedEvent(event)
    setIsEditDialogOpen(true)
    setEditSelectedFile(null)
    if (editFileInputRef.current) {
      editFileInputRef.current.value = ""
    }
  }

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return

    try {
      setIsLoading(true)
      const updatedEvent = await updateEvent(
        selectedEvent.id,
        {
          title: selectedEvent.title,
          date: selectedEvent.date,
          time: selectedEvent.time,
          location: selectedEvent.location,
          description: selectedEvent.description,
          category: selectedEvent.category,
          image_path: selectedEvent.image_path,
        },
        editSelectedFile || undefined,
      )

      // Get image URL for the updated event
      let imageUrl = undefined
      if (updatedEvent.image_path) {
        imageUrl = await getImageUrl(updatedEvent.image_path)
      }

      setEvents(events.map((event) => (event.id === updatedEvent.id ? { ...updatedEvent, imageUrl } : event)))
      setIsEditDialogOpen(false)
      setEditSelectedFile(null)
      toast({
        title: "Success",
        description: "Event updated successfully!",
      })
    } catch (error) {
      console.error("Failed to update event:", error)
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      setIsLoading(true)
      await deleteEvent(id)
      setEvents(events.filter((event) => event.id !== id))
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      })
    } catch (error) {
      console.error("Failed to delete event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Manage upcoming events for Northmead Bowls Club</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={isLoading}>
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>Fill in the details for the new event</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  placeholder="e.g., June 15, 2025 or Every Friday"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  placeholder="e.g., 7:00 PM or 9:00 AM - 5:00 PM"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newEvent.category}
                  onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="competitions">Competitions</SelectItem>
                    <SelectItem value="joker">Joker Draw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Only show image upload if we have at least one event with image_path */}
              {events.some((event) => "image_path" in event) && (
                <div className="grid gap-2">
                  <Label htmlFor="image">Event Image (Optional)</Label>
                  <Input id="image" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                  {selectedFile && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleAddEvent} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p>Loading events...</p>}

      <div className="grid gap-6">
        {events.map((event) => (
          <Card key={event.id}>
            <div className="flex flex-col md:flex-row">
              {/* Only show image section if imageUrl exists or we're allowing image uploads */}
              {("image_path" in event || event.imageUrl) && (
                <div className="md:w-1/3 relative">
                  {event.imageUrl ? (
                    <div className="relative h-48 md:h-full">
                      <Image
                        src={event.imageUrl || "/placeholder.svg"}
                        alt={event.title}
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
              )}
              <div className={`${"image_path" in event || event.imageUrl ? "md:w-2/3" : "w-full"}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditEvent(event)} disabled={isLoading}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={isLoading}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{event.description}</p>
                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        event.category === "competitions"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : event.category === "social"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      }`}
                    >
                      {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                    </span>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update the details for this event</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Event Title</Label>
                <Input
                  id="edit-title"
                  value={selectedEvent.title}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  value={selectedEvent.date}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  value={selectedEvent.time}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, time: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={selectedEvent.location}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={selectedEvent.category}
                  onValueChange={(value) => setSelectedEvent({ ...selectedEvent, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="competitions">Competitions</SelectItem>
                    <SelectItem value="joker">Joker Draw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedEvent.description}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Only show image upload if we have image_path in the selected event */}
              {"image_path" in selectedEvent && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-image">Event Image</Label>
                  {selectedEvent.imageUrl && (
                    <div className="relative h-40 mb-2">
                      <Image
                        src={selectedEvent.imageUrl || "/placeholder.svg"}
                        alt={selectedEvent.title}
                        fill
                        className="object-contain rounded-md"
                      />
                    </div>
                  )}
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    ref={editFileInputRef}
                  />
                  {editSelectedFile && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Selected: {editSelectedFile.name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEvent} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
