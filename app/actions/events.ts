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
  created_at?: string
  updated_at?: string
}

export type NewEvent = Omit<Event, "id" | "created_at" | "updated_at">

// Get all events
export async function getEvents() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching events:", error)
    throw new Error("Failed to fetch events")
  }

  return data as Event[]
}

// Get events by category
export async function getEventsByCategory(category: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching events by category:", error)
    throw new Error("Failed to fetch events by category")
  }

  return data as Event[]
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
export async function createEvent(event: NewEvent) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("events").insert([event]).select()

  if (error) {
    console.error("Error creating event:", error)
    throw new Error("Failed to create event")
  }

  revalidatePath("/admin/dashboard/events")
  revalidatePath("/")

  return data[0] as Event
}

// Update an existing event
export async function updateEvent(id: string, event: Partial<Event>) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("events")
    .update({ ...event, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating event:", error)
    throw new Error("Failed to update event")
  }

  revalidatePath("/admin/dashboard/events")
  revalidatePath("/")

  return data[0] as Event
}

// Delete an event
export async function deleteEvent(id: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) {
    console.error("Error deleting event:", error)
    throw new Error("Failed to delete event")
  }

  revalidatePath("/admin/dashboard/events")
  revalidatePath("/")

  return { success: true }
}
