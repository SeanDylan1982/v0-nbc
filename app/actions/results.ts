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
  created_at?: string
  updated_at?: string
  items?: ResultItem[]
}

export type NewResult = Omit<Result, "id" | "created_at" | "updated_at"> & {
  items: Omit<ResultItem, "id" | "result_id" | "created_at" | "updated_at">[]
}

// Get all results with their items
export async function getResults() {
  const supabase = createServerSupabaseClient()

  const { data: results, error: resultsError } = await supabase
    .from("results")
    .select("*")
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

      return { ...result, items }
    }),
  )

  return resultsWithItems as Result[]
}

// Get results by category
export async function getResultsByCategory(category: string) {
  const supabase = createServerSupabaseClient()

  const { data: results, error: resultsError } = await supabase
    .from("results")
    .select("*")
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

      return { ...result, items }
    }),
  )

  return resultsWithItems as Result[]
}

// Get a single result by ID with its items
export async function getResultById(id: string) {
  const supabase = createServerSupabaseClient()

  const { data: result, error: resultError } = await supabase.from("results").select("*").eq("id", id).single()

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
    return { ...result, items: [] }
  }

  return { ...result, items } as Result
}

// Create a new result with its items
export async function createResult(result: NewResult) {
  const supabase = createServerSupabaseClient()

  // Start a transaction
  const { data: newResult, error: resultError } = await supabase
    .from("results")
    .insert([
      {
        title: result.title,
        date: result.date,
        category: result.category,
      },
    ])
    .select()

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
export async function updateResult(id: string, result: Partial<Result> & { items?: Partial<ResultItem>[] }) {
  const supabase = createServerSupabaseClient()

  // Update the result
  if (result.title || result.date || result.category) {
    const { error: resultError } = await supabase
      .from("results")
      .update({
        ...(result.title && { title: result.title }),
        ...(result.date && { date: result.date }),
        ...(result.category && { category: result.category }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

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

  const { error } = await supabase.from("results").delete().eq("id", id)

  if (error) {
    console.error("Error deleting result:", error)
    throw new Error("Failed to delete result")
  }

  revalidatePath("/admin/dashboard/results")
  revalidatePath("/")

  return { success: true }
}
