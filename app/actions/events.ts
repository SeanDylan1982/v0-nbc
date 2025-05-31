import { fetcher } from "@/lib/utils"

export type Event = {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  category: string
  imagePath?: string | null
  createdAt?: string
  updatedAt?: string
}

export type NewEvent = Omit<Event, "id" | "createdAt" | "updatedAt">

// Get all events
export async function getEvents() {
  const events = await fetcher("/api/events")
  return events
}

// Get events by category
export async function getEventsByCategory(category: string) {
  const events = await fetcher(`/api/events?category=${category}`)
  return events
}

// Get a single event by ID
export async function getEventById(id: string) {
  const event = await fetcher(`/api/events/${id}`)
  return event
}

// Create a new event
export async function createEvent(event: NewEvent, imageFile?: File) {
  let imagePath = null

  if (imageFile) {
    // Handle image upload to your storage solution
    // For now, we'll just store the file name
    imagePath = imageFile.name
  }

  const response = await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...event, imagePath }),
  })

  if (!response.ok) {
    throw new Error("Failed to create event")
  }

  return response.json()
}

// Update an existing event
export async function updateEvent(id: string, event: Partial<Event>, imageFile?: File) {
  let imagePath = event.imagePath

  if (imageFile) {
    // Handle image upload to your storage solution
    // For now, we'll just store the file name
    imagePath = imageFile.name
  }

  const response = await fetch(`/api/events/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...event, imagePath }),
  })

  if (!response.ok) {
    throw new Error("Failed to update event")
  }

  return response.json()
}

// Delete an event
export async function deleteEvent(id: string) {
  const response = await fetch(`/api/events/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete event")
  }

  return { success: true }
}

// Get image URL
export async function getImageUrl(path: string | null) {
  if (!path) return null
  // Return the full URL to your image storage
  return `/images/${path}`
}