"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export type ResultItem = {
  id: string
  result_id: string
  position: string
  name: string
  created_at?: string
  updated_at?: string
}

export type Result = {
  id: string
  title: string
  date: string
  category: string
  image_path?: string | null
  created_at?: string
  updated_at?: string
  items?: ResultItem[]
}

export type NewResult = Omit<Result, "id" | "created_at" | "updated_at"> & {
  items: Omit<ResultItem, "id" | "result_id" | "created_at" | "updated_at">[]
}

// Helper function to check if image_path column exists
async function checkImagePathColumn() {
  const supabase = createServerSupabaseClient()

  try {
    // Try to query with image_path column
    const { data, error } = await supabase
      .from("results")
      .select("id, title, date, category, image_path, created_at, updated_at")
      .limit(1)

    return !error
  } catch {
    return false
  }
}

// Get all results with their items
export async function getResults() {
  const supabase = createServerSupabaseClient()

  // Check if image_path column exists
  const hasImagePath = await checkImagePathColumn()

  const selectFields = hasImagePath
    ? "id, title, date, category, image_path, created_at, updated_at"
    : "id, title, date, category, created_at, updated_at"

  const { data: results, error: resultsError } = await supabase
    .from("results")
    .select(selectFields)
    .order("created_at", { ascending: false })

  if (resultsError) {
    console.error("Error fetching results:", resultsError)
    throw new Error("Failed to fetch results")
  }

  // For each result, fetch its items
  const resultsWithItems = await Promise.all(
    results.map(async (result) => {
      const { data: items, error: itemsError } = await supabase
        .from("result_items")
        .select("*")
        .eq("result_id", result.id)
        .order("created_at", { ascending: true })

      if (itemsError) {
        console.error("Error fetching result items:", itemsError)
        return { ...result, items: [] }
      }

      return {
        ...result,
        items,
        image_path: hasImagePath ? result.image_path : null,
      }
    }),
  )

  return resultsWithItems as Result[]
}

// Get results by category
export async function getResultsByCategory(category: string) {
  const supabase = createServerSupabaseClient()

  // Check if image_path column exists
  const hasImagePath = await checkImagePathColumn()

  const selectFields = hasImagePath
    ? "id, title, date, category, image_path, created_at, updated_at"
    : "id, title, date, category, created_at, updated_at"

  const { data: results, error: resultsError } = await supabase
    .from("results")
    .select(selectFields)
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (resultsError) {
    console.error("Error fetching results by category:", resultsError)
    throw new Error("Failed to fetch results by category")
  }

  // For each result, fetch its items
  const resultsWithItems = await Promise.all(
    results.map(async (result) => {
      const { data: items, error: itemsError } = await supabase
        .from("result_items")
        .select("*")
        .eq("result_id", result.id)
        .order("created_at", { ascending: true })

      if (itemsError) {
        console.error("Error fetching result items:", itemsError)
        return { ...result, items: [] }
      }

      return {
        ...result,
        items,
        image_path: hasImagePath ? result.image_path : null,
      }
    }),
  )

  return resultsWithItems as Result[]
}

// Get a single result by ID with its items
export async function getResultById(id: string) {
  const supabase = createServerSupabaseClient()

  // Check if image_path column exists
  const hasImagePath = await checkImagePathColumn()

  const selectFields = hasImagePath
    ? "id, title, date, category, image_path, created_at, updated_at"
    : "id, title, date, category, created_at, updated_at"

  const { data: result, error: resultError } = await supabase.from("results").select(selectFields).eq("id", id).single()

  if (resultError) {
    console.error("Error fetching result:", resultError)
    throw new Error("Failed to fetch result")
  }

  const { data: items, error: itemsError } = await supabase
    .from("result_items")
    .select("*")
    .eq("result_id", id)
    .order("created_at", { ascending: true })

  if (itemsError) {
    console.error("Error fetching result items:", itemsError)
    return {
      ...result,
      items: [],
      image_path: hasImagePath ? result.image_path : null,
    }
  }

  return {
    ...result,
    items,
    image_path: hasImagePath ? result.image_path : null,
  } as Result
}

// Create a new result with its items
export async function createResult(result: NewResult, imageFile?: File) {
  const supabase = createServerSupabaseClient()

  // Check if image_path column exists
  const hasImagePath = await checkImagePathColumn()

  let image_path = result.image_path || null

  // Upload image if provided and column exists
  if (imageFile && hasImagePath) {
    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `results/${fileName}`

    const { error: uploadError } = await supabase.storage.from("images").upload(filePath, imageFile)

    if (uploadError) {
      console.error("Error uploading image:", uploadError)
      throw new Error("Failed to upload image")
    }

    image_path = filePath
  }

  // Prepare insert data based on available columns
  const insertData: any = {
    title: result.title,
    date: result.date,
    category: result.category,
  }

  if (hasImagePath) {
    insertData.image_path = image_path
  }

  const { data: newResult, error: resultError } = await supabase.from("results").insert([insertData]).select()

  if (resultError) {
    console.error("Error creating result:", resultError)
    throw new Error("Failed to create result")
  }

  const resultId = newResult[0].id

  // Insert all result items
  if (result.items && result.items.length > 0) {
    const itemsToInsert = result.items.map((item) => ({
      result_id: resultId,
      position: item.position,
      name: item.name,
    }))

    const { error: itemsError } = await supabase.from("result_items").insert(itemsToInsert)

    if (itemsError) {
      console.error("Error creating result items:", itemsError)
      // Delete the result if items failed to insert
      await supabase.from("results").delete().eq("id", resultId)
      throw new Error("Failed to create result items")
    }
  }

  revalidatePath("/admin/dashboard/results")
  revalidatePath("/")

  return await getResultById(resultId)
}

// Update an existing result and its items
export async function updateResult(
  id: string,
  result: Partial<Result> & { items?: Partial<ResultItem>[] },
  imageFile?: File,
) {
  const supabase = createServerSupabaseClient()

  // Check if image_path column exists
  const hasImagePath = await checkImagePathColumn()

  let image_path = result.image_path

  // Upload new image if provided and column exists
  if (imageFile && hasImagePath) {
    // Delete old image if exists
    if (result.image_path) {
      await supabase.storage.from("images").remove([result.image_path])
    }

    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `results/${fileName}`

    const { error: uploadError } = await supabase.storage.from("images").upload(filePath, imageFile)

    if (uploadError) {
      console.error("Error uploading image:", uploadError)
      throw new Error("Failed to upload image")
    }

    image_path = filePath
  }

  // Prepare update data based on available columns
  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  if (result.title) updateData.title = result.title
  if (result.date) updateData.date = result.date
  if (result.category) updateData.category = result.category
  if (hasImagePath && image_path !== undefined) updateData.image_path = image_path

  // Update the result
  if (Object.keys(updateData).length > 1) {
    // More than just updated_at
    const { error: resultError } = await supabase.from("results").update(updateData).eq("id", id)

    if (resultError) {
      console.error("Error updating result:", resultError)
      throw new Error("Failed to update result")
    }
  }

  // Update result items if provided
  if (result.items && result.items.length > 0) {
    // Delete existing items and insert new ones
    const { error: deleteError } = await supabase.from("result_items").delete().eq("result_id", id)

    if (deleteError) {
      console.error("Error deleting existing result items:", deleteError)
      throw new Error("Failed to update result items")
    }

    const itemsToInsert = result.items.map((item) => ({
      result_id: id,
      position: item.position,
      name: item.name,
    }))

    const { error: insertError } = await supabase.from("result_items").insert(itemsToInsert)

    if (insertError) {
      console.error("Error inserting updated result items:", insertError)
      throw new Error("Failed to update result items")
    }
  }

  revalidatePath("/admin/dashboard/results")
  revalidatePath("/")

  return await getResultById(id)
}

// Delete a result (will cascade delete its items)
export async function deleteResult(id: string) {
  const supabase = createServerSupabaseClient()

  // Check if image_path column exists
  const hasImagePath = await checkImagePathColumn()

  // Get the result to find the image path if column exists
  if (hasImagePath) {
    const { data: result, error: fetchError } = await supabase
      .from("results")
      .select("image_path")
      .eq("id", id)
      .single()

    if (!fetchError && result?.image_path) {
      await supabase.storage.from("images").remove([result.image_path])
    }
  }

  const { error } = await supabase.from("results").delete().eq("id", id)

  if (error) {
    console.error("Error deleting result:", error)
    throw new Error("Failed to delete result")
  }

  revalidatePath("/admin/dashboard/results")
  revalidatePath("/")

  return { success: true }
}
