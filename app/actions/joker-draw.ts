"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export type JokerDrawInfo = {
  id: number
  lastWinner: string
  lastWinAmount: number
  currentJackpot: number
  winnerImagePath: string | null
  updatedAt: string
}

export async function getJokerDrawInfo(): Promise<JokerDrawInfo | null> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("joker_draw")
      .select("id, last_winner, last_win_amount, current_jackpot, winner_image_path, updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching joker draw info:", error)
      return null
    }

    // Map from snake_case DB columns to camelCase JS properties
    return {
      id: data.id,
      lastWinner: data.last_winner,
      lastWinAmount: data.last_win_amount,
      currentJackpot: data.current_jackpot,
      winnerImagePath: data.winner_image_path,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error("Error in getJokerDrawInfo:", error)
    return null
  }
}

export async function updateJokerDrawInfo(
  lastWinner: string,
  lastWinAmount: number,
  currentJackpot: number,
  winnerImagePath?: string | null,
): Promise<{ success: boolean; message: string }> {
  try {
    if (!lastWinner || lastWinAmount < 0 || currentJackpot < 0) {
      return {
        success: false,
        message: "Invalid input values",
      }
    }

    const supabase = createServerSupabaseClient()

    // Map from camelCase JS properties to snake_case DB columns
    const { error } = await supabase.from("joker_draw").insert({
      last_winner: lastWinner,
      last_win_amount: lastWinAmount,
      current_jackpot: currentJackpot,
      winner_image_path: winnerImagePath || null,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error updating joker draw info:", error)
      return {
        success: false,
        message: `Failed to update: ${error.message}`,
      }
    }

    revalidatePath("/")
    revalidatePath("/admin/dashboard/joker-draw")

    return {
      success: true,
      message: "Joker draw information updated successfully",
    }
  } catch (error) {
    console.error("Error in updateJokerDrawInfo:", error)
    return {
      success: false,
      message: `An unexpected error occurred: ${error}`,
    }
  }
}

export async function uploadWinnerImage(formData: FormData): Promise<{ path: string | null; error: string | null }> {
  try {
    const file = formData.get("file") as File

    if (!file) {
      return { path: null, error: "No file provided" }
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return { path: null, error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." }
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { path: null, error: "File size exceeds 5MB limit." }
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `joker-winner-${uuidv4()}.${fileExt}`
    const filePath = `joker-draw/${fileName}`

    // Convert File to ArrayBuffer for Supabase storage
    const arrayBuffer = await file.arrayBuffer()

    // Create a new server-side Supabase client with explicit service role key
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return { path: null, error: "Missing Supabase environment variables" }
    }

    // Import directly here to avoid issues with the client bundle
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // Upload to Supabase Storage with explicit content type
    const { error: uploadError } = await supabase.storage.from("winners").upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

    if (uploadError) {
      console.error("Error uploading winner image:", uploadError)

      // Check if it's an RLS policy error and provide more helpful message
      if (uploadError.message.includes("row-level security") || uploadError.message.includes("permission denied")) {
        return {
          path: null,
          error:
            "Permission denied. Please check the RLS policies for the 'winners' bucket in your Supabase dashboard.",
        }
      }

      return { path: null, error: `Upload failed: ${uploadError.message}` }
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from("winners").getPublicUrl(filePath)

    return { path: filePath, error: null }
  } catch (error) {
    console.error("Error in uploadWinnerImage:", error)
    return { path: null, error: `An unexpected error occurred: ${error}` }
  }
}
