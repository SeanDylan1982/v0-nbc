import { fetcher } from "@/lib/utils"

export type Document = {
  id: string
  title: string
  description: string
  category: string
  filePath: string
  fileType: string
  fileSize: string
  createdAt?: string
  updatedAt?: string
}

export type NewDocument = Omit<Document, "id" | "createdAt" | "updatedAt">

// Get all documents
export async function getDocuments() {
  const documents = await fetcher("/api/documents")
  return documents
}

// Get documents by category
export async function getDocumentsByCategory(category: string) {
  const documents = await fetcher(`/api/documents?category=${category}`)
  return documents
}

// Get a single document by ID
export async function getDocumentById(id: string) {
  const document = await fetcher(`/api/documents/${id}`)
  return document
}

// Create a new document
export async function createDocument(document: NewDocument, file: File) {
  // Handle file upload to your storage solution
  const filePath = `documents/${document.category}/${file.name}`

  const response = await fetch("/api/documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...document,
      filePath,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create document")
  }

  return response.json()
}

// Update an existing document
export async function updateDocument(id: string, document: Partial<Document>, file?: File) {
  let filePath = document.filePath

  if (file) {
    // Handle file upload to your storage solution
    filePath = `documents/${document.category}/${file.name}`
  }

  const response = await fetch(`/api/documents/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...document, filePath }),
  })

  if (!response.ok) {
    throw new Error("Failed to update document")
  }

  return response.json()
}

// Delete a document
export async function deleteDocument(id: string) {
  const response = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete document")
  }

  return { success: true }
}