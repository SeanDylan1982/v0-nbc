"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export type Event = {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  category: string
  image_path?: string | null
  created_at?: string
  updated_at?: string
}

export type NewEvent = Omit<Event, "id" | "created_at" | "updated_at">

// Get all events
export async function getEvents() {
  const supabase = createServerSupabaseClient()

  try {
    console.log("Fetching events...")
    const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching events:", error)
      throw new Error(`Failed to fetch events: ${error.message}`)
    }

    console.log(`Successfully fetched ${data?.length || 0} events`)
    return data as Event[]
  } catch (error) {
    console.error("Exception in getEvents:", error)
    // Return empty array instead of throwing to prevent UI errors
    return [] as Event[]
  }
}

// Get events by category
export async function getEventsByCategory(category: string) {
  const supabase = createServerSupabaseClient()

  try {
    console.log(`Fetching events by category: ${category}`)
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching events by category:", error)
      throw new Error(`Failed to fetch events by category: ${error.message}`)
    }

    console.log(`Successfully fetched ${data?.length || 0} events for category ${category}`)
    return data as Event[]
  } catch (error) {
    console.error(`Exception in getEventsByCategory for ${category}:`, error)
    // Return empty array instead of throwing to prevent UI errors
    return [] as Event[]
  }
}

// Get a single event by ID
export async function getEventById(id: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("events").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching event:", error)
    throw new Error("Failed to fetch event")
  }

  return data as Event
}

// Create a new event
export async function createEvent(event: NewEvent, imageFile?: File) {
  const supabase = createServerSupabaseClient()
  const eventData = { ...event }

  // Upload image if provided
  if (imageFile) {
    try {
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `events/${fileName}`

      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, imageFile)

      if (uploadError) {
        console.error("Error uploading image:", uploadError)
        throw new Error("Failed to upload image")
      }

      // Try to add image_path to the event data
      eventData.image_path = filePath
    } catch (error) {
      console.error("Error handling image:", error)
      // Continue without the image if there's an error
    }
  }

  // Remove image_path if it's not supported by the database schema
  try {
    const { data, error } = await supabase.from("events").insert([eventData]).select()

    if (error) {
      // If error mentions image_path column, try again without it
      if (error.message.includes("image_path")) {
        delete eventData.image_path
        const { data: retryData, error: retryError } = await supabase.from("events").insert([eventData]).select()

        if (retryError) {
          console.error("Error creating event:", retryError)
          throw new Error("Failed to create event")
        }

        revalidatePath("/admin/dashboard/events")
        revalidatePath("/")

        return retryData[0] as Event
      } else {
        console.error("Error creating event:", error)
        throw new Error("Failed to create event")
      }
    }

    revalidatePath("/admin/dashboard/events")
    revalidatePath("/")

    return data[0] as Event
  } catch (error) {
    console.error("Error creating event:", error)
    throw new Error(`Failed to create event: ${error.message}`)
  }
}

// Update an existing event
export async function updateEvent(id: string, event: Partial<Event>, imageFile?: File) {
  const supabase = createServerSupabaseClient()
  const eventData = { ...event, updated_at: new Date().toISOString() }

  // Upload new image if provided
  if (imageFile) {
    try {
      // Delete old image if exists
      if (event.image_path) {
        await supabase.storage.from("images").remove([event.image_path])
      }

      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `events/${fileName}`

      const { error: uploadError } = await supabase.storage.from("images").upload(filePath, imageFile)

      if (uploadError) {
        console.error("Error uploading image:", uploadError)
        throw new Error("Failed to upload image")
      }

      eventData.image_path = filePath
    } catch (error) {
      console.error("Error handling image:", error)
      // Continue without the image if there's an error
    }
  }

  try {
    const { data, error } = await supabase.from("events").update(eventData).eq("id", id).select()

    if (error) {
      // If error mentions image_path column, try again without it
      if (error.message.includes("image_path")) {
        delete eventData.image_path
        const { data: retryData, error: retryError } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", id)
          .select()

        if (retryError) {
          console.error("Error updating event:", retryError)
          throw new Error("Failed to update event")
        }

        revalidatePath("/admin/dashboard/events")
        revalidatePath("/")

        return retryData[0] as Event
      } else {
        console.error("Error updating event:", error)
        throw new Error("Failed to update event")
      }
    }

    revalidatePath("/admin/dashboard/events")
    revalidatePath("/")

    return data[0] as Event
  } catch (error) {
    console.error("Error updating event:", error)
    throw new Error(`Failed to update event: ${error.message}`)
  }
}

// Delete an event
export async function deleteEvent(id: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Try to get the event to find the image path
    const { data: event, error: fetchError } = await supabase.from("events").select("*").eq("id", id).single()

    // If we can get the image_path, delete the image
    if (!fetchError && event && event.image_path) {
      await supabase.storage.from("images").remove([event.image_path])
    }

    const { error } = await supabase.from("events").delete().eq("id", id)

    if (error) {
      console.error("Error deleting event:", error)
      throw new Error("Failed to delete event")
    }

    revalidatePath("/admin/dashboard/events")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error in delete process:", error)
    throw new Error(`Failed to delete event: ${error.message}`)
  }
}

// Get image URL from path
export async function getImageUrl(path: string | null) {
  if (!path) return null

  const supabase = createServerSupabaseClient()
  const { data } = supabase.storage.from("images").getPublicUrl(path)
  return data.publicUrl
}
