"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export async function createUserProfile(userId: string, email: string, fullName: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase.from("users").select("id").eq("id", userId).single()

    if (existingProfile) {
      return { success: true, message: "Profile already exists" }
    }

    // Create the profile
    const { error } = await supabase.from("users").insert([
      {
        id: userId,
        email: email,
        full_name: fullName,
      },
    ])

    if (error) {
      console.error("Error creating user profile:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Profile created successfully" }
  } catch (error) {
    console.error("Exception creating user profile:", error)
    return { success: false, error: "Failed to create profile" }
  }
}

export async function getUserProfile(userId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Exception fetching user profile:", error)
    return null
  }
}
