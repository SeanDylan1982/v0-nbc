"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

// Check if storage buckets exist (read-only operation)
export async function checkStorageBuckets() {
  const supabase = createServerSupabaseClient()

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error("Error listing buckets:", error)
      return { success: false, error: error.message }
    }

    const imagesBucketExists = buckets?.some((bucket) => bucket.name === "images")
    const profilesBucketExists = buckets?.some((bucket) => bucket.name === "profiles")

    return {
      success: true,
      buckets: {
        images: imagesBucketExists,
        profiles: profilesBucketExists,
      },
    }
  } catch (error) {
    console.error("Error checking storage:", error)
    return { success: false, error: "Failed to check storage buckets" }
  }
}

// Simple bucket creation without RLS issues
export async function createStorageBucket(bucketName: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    })

    if (error) {
      console.error(`Error creating ${bucketName} bucket:`, error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error(`Error creating ${bucketName} bucket:`, error)
    return { success: false, error: "Failed to create bucket" }
  }
}
