"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export async function updateUserProfile(fullName: string) {
  const supabase = createServerSupabaseClient()

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
      },
    })

    if (error) {
      console.error("Error updating user profile:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Exception updating user profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function uploadProfileImage(file: File) {
  const supabase = createServerSupabaseClient()

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    // Create a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/avatar.${fileExt}`

    // Upload the file
    const { error: uploadError } = await supabase.storage.from("profiles").upload(fileName, file, {
      upsert: true,
    })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return { success: false, error: uploadError.message }
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profiles").getPublicUrl(fileName)

    // Update user metadata with the new avatar URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: publicUrl,
      },
    })

    if (updateError) {
      console.error("Error updating user metadata:", updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true, avatarUrl: publicUrl, message: "Profile image updated successfully" }
  } catch (error) {
    console.error("Exception uploading profile image:", error)
    return { success: false, error: "Failed to upload profile image" }
  }
}
