import { fetcher } from "@/lib/utils"

export type ResultItem = {
  id: string
  position: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export type Result = {
  id: string
  title: string
  date: string
  category: string
  imagePath?: string | null
  createdAt?: string
  updatedAt?: string
  items?: ResultItem[]
}

export type NewResult = Omit<Result, "id" | "createdAt" | "updatedAt"> & {
  items: Omit<ResultItem, "id" | "createdAt" | "updatedAt">[]
}

// Get all results
export async function getResults() {
  const results = await fetcher("/api/results")
  return results
}

// Get results by category
export async function getResultsByCategory(category: string) {
  const results = await fetcher(`/api/results?category=${category}`)
  return results
}

// Get a single result by ID
export async function getResultById(id: string) {
  const result = await fetcher(`/api/results/${id}`)
  return result
}

// Create a new result
export async function createResult(result: NewResult, imageFile?: File) {
  let imagePath = null

  if (imageFile) {
    // Handle image upload to your storage solution
    imagePath = imageFile.name
  }

  const response = await fetch("/api/results", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...result, imagePath }),
  })

  if (!response.ok) {
    throw new Error("Failed to create result")
  }

  return response.json()
}

// Update an existing result
export async function updateResult(id: string, result: Partial<Result>, imageFile?: File) {
  let imagePath = result.imagePath

  if (imageFile) {
    // Handle image upload to your storage solution
    imagePath = imageFile.name
  }

  const response = await fetch(`/api/results/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...result, imagePath }),
  })

  if (!response.ok) {
    throw new Error("Failed to update result")
  }

  return response.json()
}

// Delete a result
export async function deleteResult(id: string) {
  const response = await fetch(`/api/results/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete result")
  }

  return { success: true }
}