"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

// Initialize storage buckets
export async function initializeStorage() {
  const supabase = createServerSupabaseClient()

  try {
    // Check if the images bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const imagesBucketExists = buckets?.some((bucket) => bucket.name === "images")

    // Create the images bucket if it doesn't exist
    if (!imagesBucketExists) {
      const { data, error } = await supabase.storage.createBucket("images", {
        public: true, // Make the bucket public so images can be accessed without authentication
      })

      if (error) {
        console.error("Error creating images bucket:", error)
        throw new Error("Failed to create images bucket")
      }

      console.log("Created images bucket:", data)
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing storage:", error)
    throw new Error("Failed to initialize storage")
  }
}
