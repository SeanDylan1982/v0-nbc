import { fetcher } from "@/lib/utils"

export type Competition = {
  id: string
  title: string
  date: string
  format: string
  entryDeadline: string
  description: string
  status: "Upcoming" | "In Progress" | "Completed"
  winner?: string | null
  imagePath?: string | null
  createdAt?: string
  updatedAt?: string
}

export type NewCompetition = Omit<Competition, "id" | "createdAt" | "updatedAt">

// Get all competitions
export async function getCompetitions() {
  const competitions = await fetcher("/api/competitions")
  return competitions
}

// Get competitions by status
export async function getCompetitionsByStatus(status: Competition["status"]) {
  const competitions = await fetcher(`/api/competitions?status=${status}`)
  return competitions
}

// Get a single competition by ID
export async function getCompetitionById(id: string) {
  const competition = await fetcher(`/api/competitions/${id}`)
  return competition
}

// Create a new competition
export async function createCompetition(competition: NewCompetition, imageFile?: File) {
  let imagePath = null

  if (imageFile) {
    // Handle image upload to your storage solution
    imagePath = imageFile.name
  }

  const response = await fetch("/api/competitions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...competition, imagePath }),
  })

  if (!response.ok) {
    throw new Error("Failed to create competition")
  }

  return response.json()
}

// Update an existing competition
export async function updateCompetition(id: string, competition: Partial<Competition>, imageFile?: File) {
  let imagePath = competition.imagePath

  if (imageFile) {
    // Handle image upload to your storage solution
    imagePath = imageFile.name
  }

  const response = await fetch(`/api/competitions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...competition, imagePath }),
  })

  if (!response.ok) {
    throw new Error("Failed to update competition")
  }

  return response.json()
}

// Delete a competition
export async function deleteCompetition(id: string) {
  const response = await fetch(`/api/competitions/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete competition")
  }

  return { success: true }
}