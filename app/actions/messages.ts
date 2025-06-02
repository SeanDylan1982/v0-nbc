"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface Message {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  message: string
  status: "unread" | "read" | "replied"
  created_at: string
  updated_at: string
}

export async function createMessage(formData: FormData) {
  try {
    const supabase = createServerSupabaseClient()

    const messageData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      message: formData.get("message") as string,
      status: "unread" as const,
    }

    // Validate required fields
    if (!messageData.first_name || !messageData.last_name || !messageData.email || !messageData.message) {
      return { success: false, error: "Please fill in all required fields." }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(messageData.email)) {
      return { success: false, error: "Please enter a valid email address." }
    }

    const { data, error } = await supabase.from("messages").insert([messageData]).select().single()

    if (error) {
      console.error("Error creating message:", error)
      return { success: false, error: "Failed to send message. Please try again." }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in createMessage:", error)
    return { success: false, error: "An unexpected error occurred. Please try again." }
  }
}

export async function getMessages() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching messages:", error)
      return { success: false, error: "Failed to fetch messages." }
    }

    return { success: true, data: data as Message[] }
  } catch (error) {
    console.error("Error in getMessages:", error)
    return { success: false, error: "An unexpected error occurred." }
  }
}

export async function updateMessageStatus(id: string, status: "unread" | "read" | "replied") {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("messages")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating message status:", error)
      return { success: false, error: "Failed to update message status." }
    }

    revalidatePath("/admin/dashboard/messages")
    return { success: true, data }
  } catch (error) {
    console.error("Error in updateMessageStatus:", error)
    return { success: false, error: "An unexpected error occurred." }
  }
}

export async function deleteMessage(id: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("messages").delete().eq("id", id)

    if (error) {
      console.error("Error deleting message:", error)
      return { success: false, error: "Failed to delete message." }
    }

    revalidatePath("/admin/dashboard/messages")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteMessage:", error)
    return { success: false, error: "An unexpected error occurred." }
  }
}
