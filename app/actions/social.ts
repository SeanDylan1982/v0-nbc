"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Types
export type Like = {
  id: string
  event_id: string
  user_id: string
  created_at: string
}

export type Comment = {
  id: string
  event_id: string
  user_id: string
  content: string
  created_at: string
  user_name?: string
  user_avatar_url?: string
}

// Get likes for an event
export async function getLikesForEvent(eventId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error, count } = await supabase
      .from("event_likes")
      .select("*", { count: "exact" })
      .eq("event_id", eventId)

    if (error) {
      console.error("Error fetching likes:", error)
      return { likes: [], count: 0 }
    }

    return { likes: data as Like[], count: count || 0 }
  } catch (error) {
    console.error("Exception in getLikesForEvent:", error)
    return { likes: [], count: 0 }
  }
}

// Check if user has liked an event
export async function hasUserLikedEvent(eventId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user) {
      return false
    }

    const userId = session.session.user.id

    const { data, error } = await supabase
      .from("event_likes")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is expected
      console.error("Error checking if user liked event:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Exception in hasUserLikedEvent:", error)
    return false
  }
}

// Toggle like for an event
export async function toggleLikeEvent(eventId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user) {
      return { success: false, message: "You must be logged in to like events" }
    }

    const userId = session.session.user.id

    // Check if user already liked the event
    const { data: existingLike, error: checkError } = await supabase
      .from("event_likes")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing like:", checkError)
      return { success: false, message: "Failed to check existing like" }
    }

    if (existingLike) {
      // Unlike the event
      const { error: unlikeError } = await supabase.from("event_likes").delete().eq("id", existingLike.id)

      if (unlikeError) {
        console.error("Error unliking event:", unlikeError)
        return { success: false, message: "Failed to unlike event" }
      }

      revalidatePath("/")
      return { success: true, liked: false, message: "Event unliked successfully" }
    } else {
      // Like the event
      const { error: likeError } = await supabase.from("event_likes").insert([{ event_id: eventId, user_id: userId }])

      if (likeError) {
        console.error("Error liking event:", likeError)
        return { success: false, message: "Failed to like event" }
      }

      revalidatePath("/")
      return { success: true, liked: true, message: "Event liked successfully" }
    }
  } catch (error) {
    console.error("Exception in toggleLikeEvent:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Get comments for an event
export async function getCommentsForEvent(eventId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error, count } = await supabase
      .from("event_comments")
      .select(
        `
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `,
        { count: "exact" },
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching comments:", error)
      return { comments: [], count: 0 }
    }

    // Format comments with user information
    const formattedComments = data.map((comment) => ({
      id: comment.id,
      event_id: comment.event_id,
      user_id: comment.user_id,
      content: comment.content,
      created_at: comment.created_at,
      user_name: comment.profiles?.full_name || "Anonymous User",
      user_avatar_url: comment.profiles?.avatar_url || null,
    }))

    return { comments: formattedComments as Comment[], count: count || 0 }
  } catch (error) {
    console.error("Exception in getCommentsForEvent:", error)
    return { comments: [], count: 0 }
  }
}

// Add a comment to an event
export async function addCommentToEvent(eventId: string, content: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user) {
      return { success: false, message: "You must be logged in to comment" }
    }

    const userId = session.session.user.id

    if (!content.trim()) {
      return { success: false, message: "Comment cannot be empty" }
    }

    const { data, error } = await supabase
      .from("event_comments")
      .insert([{ event_id: eventId, user_id: userId, content }])
      .select()

    if (error) {
      console.error("Error adding comment:", error)
      return { success: false, message: "Failed to add comment" }
    }

    revalidatePath("/")
    return { success: true, comment: data[0], message: "Comment added successfully" }
  } catch (error) {
    console.error("Exception in addCommentToEvent:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

// Delete a comment
export async function deleteComment(commentId: string) {
  const supabase = createServerSupabaseClient()

  try {
    const { data: session } = await supabase.auth.getSession()
    if (!session.session?.user) {
      return { success: false, message: "You must be logged in to delete comments" }
    }

    const userId = session.session.user.id

    // Check if user owns the comment or is an admin
    const { data: userRoles } = await supabase.from("user_roles").select("*").eq("user_id", userId).eq("role", "admin")

    const isAdmin = userRoles && userRoles.length > 0

    if (!isAdmin) {
      // Check if user owns the comment
      const { data: comment, error: commentError } = await supabase
        .from("event_comments")
        .select("*")
        .eq("id", commentId)
        .single()

      if (commentError) {
        console.error("Error fetching comment:", commentError)
        return { success: false, message: "Failed to verify comment ownership" }
      }

      if (comment.user_id !== userId) {
        return { success: false, message: "You can only delete your own comments" }
      }
    }

    // Delete the comment
    const { error } = await supabase.from("event_comments").delete().eq("id", commentId)

    if (error) {
      console.error("Error deleting comment:", error)
      return { success: false, message: "Failed to delete comment" }
    }

    revalidatePath("/")
    return { success: true, message: "Comment deleted successfully" }
  } catch (error) {
    console.error("Exception in deleteComment:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}
