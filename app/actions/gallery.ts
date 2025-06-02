"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export type GalleryImage = {
  id: string
  title: string
  alt: string
  description: string
  category: string
  storage_path: string
  created_at?: string
  updated_at?: string
}

export type NewGalleryImage = Omit<GalleryImage, "id" | "created_at" | "updated_at">

// Get all gallery images
export async function getGalleryImages() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("gallery_images").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching gallery images:", error)
    throw new Error("Failed to fetch gallery images")
  }

  return data as GalleryImage[]
}

// Get gallery images by category
export async function getGalleryImagesByCategory(category: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching gallery images by category:", error)
    throw new Error("Failed to fetch gallery images by category")
  }

  return data as GalleryImage[]
}

// Get a single gallery image by ID
export async function getGalleryImageById(id: string) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("gallery_images").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching gallery image:", error)
    throw new Error("Failed to fetch gallery image")
  }

  return data as GalleryImage
}

// Upload an image to Supabase Storage and create a gallery image record
export async function uploadGalleryImage(file: File, metadata: Omit<NewGalleryImage, "storage_path">) {
  const supabase = createServerSupabaseClient()

  // Create a unique filename
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  const filePath = `gallery/${metadata.category}/${fileName}`

  // Upload the file to Supabase Storage
  const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

  if (uploadError) {
    console.error("Error uploading image:", uploadError)
    throw new Error("Failed to upload image")
  }

  // Get the public URL for the uploaded file
  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(filePath)

  // Create a record in the gallery_images table
  const { data, error } = await supabase
    .from("gallery_images")
    .insert([
      {
        ...metadata,
        storage_path: filePath,
      },
    ])
    .select()

  if (error) {
    console.error("Error creating gallery image record:", error)
    // Delete the uploaded file if the record creation fails
    await supabase.storage.from("images").remove([filePath])
    throw new Error("Failed to create gallery image record")
  }

  revalidatePath("/admin/dashboard/gallery")
  revalidatePath("/")

  return { ...data[0], publicUrl } as GalleryImage & { publicUrl: string }
}

// Update an existing gallery image
export async function updateGalleryImage(id: string, updates: Partial<GalleryImage>) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("gallery_images")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating gallery image:", error)
    throw new Error("Failed to update gallery image")
  }

  revalidatePath("/admin/dashboard/gallery")
  revalidatePath("/")

  return data[0] as GalleryImage
}

// Delete a gallery image and its file from storage
export async function deleteGalleryImage(id: string) {
  const supabase = createServerSupabaseClient()

  // Get the image record to find the storage path
  const { data: image, error: fetchError } = await supabase
    .from("gallery_images")
    .select("storage_path")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Error fetching gallery image for deletion:", fetchError)
    throw new Error("Failed to fetch gallery image for deletion")
  }

  // Delete the image file from storage
  const { error: storageError } = await supabase.storage.from("images").remove([image.storage_path])

  if (storageError) {
    console.error("Error deleting image file from storage:", storageError)
    // Continue with deleting the record even if file deletion fails
  }

  // Delete the image record
  const { error: deleteError } = await supabase.from("gallery_images").delete().eq("id", id)

  if (deleteError) {
    console.error("Error deleting gallery image record:", deleteError)
    throw new Error("Failed to delete gallery image record")
  }

  revalidatePath("/admin/dashboard/gallery")
  revalidatePath("/")

  return { success: true }
}

// Get a signed URL for a gallery image
export async function getGalleryImageUrl(storagePath: string) {
  const supabase = createServerSupabaseClient()

  const { data } = supabase.storage.from("images").getPublicUrl(storagePath)

  return data.publicUrl
}
