import { fetcher } from "@/lib/utils"

export type GalleryImage = {
  id: string
  title: string
  alt: string
  description: string
  category: string
  storagePath: string
  createdAt?: string
  updatedAt?: string
}

export type NewGalleryImage = Omit<GalleryImage, "id" | "createdAt" | "updatedAt">

// Get all gallery images
export async function getGalleryImages() {
  const images = await fetcher("/api/gallery")
  return images
}

// Get gallery images by category
export async function getGalleryImagesByCategory(category: string) {
  const images = await fetcher(`/api/gallery?category=${category}`)
  return images
}

// Get a single gallery image by ID
export async function getGalleryImageById(id: string) {
  const image = await fetcher(`/api/gallery/${id}`)
  return image
}

// Upload an image and create a gallery image record
export async function uploadGalleryImage(file: File, metadata: Omit<NewGalleryImage, "storagePath">) {
  // Handle file upload to your storage solution
  const storagePath = `gallery/${metadata.category}/${file.name}`

  const response = await fetch("/api/gallery", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...metadata,
      storagePath,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create gallery image")
  }

  const data = await response.json()
  return { ...data, publicUrl: `/images/${storagePath}` }
}

// Update an existing gallery image
export async function updateGalleryImage(id: string, updates: Partial<GalleryImage>) {
  const response = await fetch(`/api/gallery/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error("Failed to update gallery image")
  }

  return response.json()
}

// Delete a gallery image
export async function deleteGalleryImage(id: string) {
  const response = await fetch(`/api/gallery/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete gallery image")
  }

  return { success: true }
}

// Get a signed URL for a gallery image
export async function getGalleryImageUrl(storagePath: string) {
  // Return the full URL to your image storage
  return `/images/${storagePath}`
}