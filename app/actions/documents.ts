"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export interface Document {
  id: string
  title: string
  description: string
  filetype: string
  filesize: string
  category: string
  file_path: string
  created_at: string
}

export interface NewDocument {
  title: string
  description: string
  filetype: string
  filesize: string
  category: string
  file_path: string
}

export async function getDocuments() {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Error fetching documents: ${error.message}`)
    }

    return data as Document[]
  } catch (error) {
    console.error("Error in getDocuments:", error)
    throw error
  }
}

export async function getDocumentsByCategory(category: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Error fetching documents by category: ${error.message}`)
    }

    return data as Document[]
  } catch (error) {
    console.error("Error in getDocumentsByCategory:", error)
    throw error
  }
}

export async function createDocument(document: NewDocument) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("documents").insert([document]).select()

    if (error) {
      throw new Error(`Error creating document: ${error.message}`)
    }

    return data[0] as Document
  } catch (error) {
    console.error("Error in createDocument:", error)
    throw error
  }
}

export async function updateDocument(id: string, document: Partial<Document>) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("documents").update(document).eq("id", id).select()

    if (error) {
      throw new Error(`Error updating document: ${error.message}`)
    }

    return data[0] as Document
  } catch (error) {
    console.error("Error in updateDocument:", error)
    throw error
  }
}

export async function deleteDocument(id: string) {
  const supabase = createServerSupabaseClient()

  try {
    // First get the document to find the file path
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("file_path")
      .eq("id", id)
      .single()

    if (fetchError) {
      throw new Error(`Error fetching document for deletion: ${fetchError.message}`)
    }

    // Delete the file from storage if it exists
    if (document?.file_path) {
      const { error: storageError } = await supabase.storage.from("documents").remove([document.file_path])

      if (storageError) {
        console.error(`Error deleting document file: ${storageError.message}`)
        // Continue with deletion even if file removal fails
      }
    }

    // Delete the document record
    const { error } = await supabase.from("documents").delete().eq("id", id)

    if (error) {
      throw new Error(`Error deleting document: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteDocument:", error)
    throw error
  }
}

export async function uploadDocumentFile(file: File) {
  const supabase = createServerSupabaseClient()

  try {
    // Create a unique file name
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // Upload the file
    const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, file)

    if (uploadError) {
      throw new Error(`Error uploading document file: ${uploadError.message}`)
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath)

    return {
      file_path: filePath,
      publicUrl,
    }
  } catch (error) {
    console.error("Error in uploadDocumentFile:", error)
    throw error
  }
}
