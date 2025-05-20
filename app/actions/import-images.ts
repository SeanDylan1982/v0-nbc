"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

// Function to fetch an image from a URL on the server side
async function fetchImageFromUrl(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        // Add a user agent to mimic a browser request
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get("content-type") || "image/jpeg"

    return { buffer, contentType }
  } catch (error) {
    console.error("Error fetching image:", error)
    return null
  }
}

// Function to extract filename from URL
function getFilenameFromUrl(url: string): string {
  // Get the last part of the URL (after the last slash)
  const parts = url.split("/")
  const filenameWithQuery = parts[parts.length - 1]

  // Remove any query parameters
  const filename = filenameWithQuery.split("?")[0]

  // If filename is empty, generate a random one
  if (!filename) {
    return `image-${Date.now()}.jpg`
  }

  return filename
}

// Server action to import an image from a URL
export async function importImageFromUrl(
  url: string,
  category: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // Fetch the image
    const imageData = await fetchImageFromUrl(url)
    if (!imageData) {
      return { success: false, message: `Failed to fetch image from ${url}` }
    }

    // Extract filename from URL
    const filename = getFilenameFromUrl(url)

    // Generate a title from the filename
    const title = filename
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[-_]/g, " ") // Replace dashes and underscores with spaces
      .replace(/\b\w/g, (c) => c.toUpperCase()) // Capitalize first letter of each word

    // Determine file extension from content type
    let extension = "jpg"
    if (imageData.contentType === "image/png") extension = "png"
    else if (imageData.contentType === "image/gif") extension = "gif"
    else if (imageData.contentType === "image/webp") extension = "webp"

    // Create a unique filename
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`

    // Upload directly to Supabase storage
    const supabase = createServerSupabaseClient()
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(`gallery/${category}/${uniqueFilename}`, imageData.buffer, {
        contentType: imageData.contentType,
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading to Supabase:", uploadError)
      return { success: false, message: `Failed to upload image: ${uploadError.message}` }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(`gallery/${category}/${uniqueFilename}`)

    // Create a record in the gallery_images table
    const { data, error } = await supabase
      .from("gallery_images")
      .insert([
        {
          title,
          alt: title,
          description: `Imported from ${url}`,
          category,
          storage_path: `gallery/${category}/${uniqueFilename}`,
        },
      ])
      .select()

    if (error) {
      console.error("Error creating gallery image record:", error)
      // Try to delete the uploaded file if the record creation fails
      await supabase.storage.from("images").remove([`gallery/${category}/${uniqueFilename}`])
      return { success: false, message: `Failed to create database record: ${error.message}` }
    }

    return { success: true, message: "Image imported successfully" }
  } catch (error) {
    console.error("Error importing image:", error)
    return {
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
