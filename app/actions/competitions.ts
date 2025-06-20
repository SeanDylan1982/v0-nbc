"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export type Competition = {
  id: string
  title: string
  date: string
  format: string
  entry_deadline: string
  description: string
  status: "Upcoming" | "In Progress" | "Completed"
  winner?: string | null
  image_path?: string | null
  created_at?: string
  updated_at?: string
}

export type NewCompetition = Omit<Competition, "id" | "created_at" | "updated_at">

// Get all competitions
export async function getCompetitions() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("competitions").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching competitions:", error)
    throw new Error("Failed to fetch competitions")
  }

  return data as Competition[]
}

// Get competitions by status
export async function getCompetitionsByStatus(status: Competition["status"]) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .eq("status", status)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching competitions by status:", error)
    throw new Error("Failed to fetch competitions by status")
  }

  return data as Competition[]
}

// Get a single competition by ID
export async function getCompetitionById(id: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("competitions").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching competition:", error)
    throw new Error("Failed to fetch competition")
  }

  return data as Competition
}

// Create a new competition
export async function createCompetition(competition: NewCompetition, imageFile?: File) {
  const supabase = createServerSupabaseClient()
  let image_path = competition.image_path || null

  // Upload image if provided
  if (imageFile) {
    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `competitions/${fileName}`

    const { error: uploadError } = await supabase.storage.from("images").upload(filePath, imageFile)

    if (uploadError) {
      console.error("Error uploading image:", uploadError)
      throw new Error("Failed to upload image")
    }

    image_path = filePath
  }

  const { data, error } = await supabase
    .from("competitions")
    .insert([{ ...competition, image_path }])
    .select()

  if (error) {
    console.error("Error creating competition:", error)
    throw new Error("Failed to create competition")
  }

  revalidatePath("/admin/dashboard/competitions")
  revalidatePath("/")

  return data[0] as Competition
}

// Update an existing competition
export async function updateCompetition(id: string, competition: Partial<Competition>, imageFile?: File) {
  const supabase = createServerSupabaseClient()
  let image_path = competition.image_path

  // Upload new image if provided
  if (imageFile) {
    // Delete old image if exists
    if (competition.image_path) {
      await supabase.storage.from("images").remove([competition.image_path])
    }

    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `competitions/${fileName}`

    const { error: uploadError } = await supabase.storage.from("images").upload(filePath, imageFile)

    if (uploadError) {
      console.error("Error uploading image:", uploadError)
      throw new Error("Failed to upload image")
    }

    image_path = filePath
  }

  const { data, error } = await supabase
    .from("competitions")
    .update({ ...competition, image_path, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating competition:", error)
    throw new Error("Failed to update competition")
  }

  revalidatePath("/admin/dashboard/competitions")
  revalidatePath("/")

  return data[0] as Competition
}

// Delete a competition
export async function deleteCompetition(id: string) {
  const supabase = createServerSupabaseClient()

  // Get the competition to find the image path
  const { data: competition, error: fetchError } = await supabase
    .from("competitions")
    .select("image_path")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Error fetching competition for deletion:", fetchError)
    throw new Error("Failed to fetch competition for deletion")
  }

  // Delete the image if it exists
  if (competition.image_path) {
    await supabase.storage.from("images").remove([competition.image_path])
  }

  const { error } = await supabase.from("competitions").delete().eq("id", id)

  if (error) {
    console.error("Error deleting competition:", error)
    throw new Error("Failed to delete competition")
  }

  revalidatePath("/admin/dashboard/competitions")
  revalidatePath("/")

  return { success: true }
}
