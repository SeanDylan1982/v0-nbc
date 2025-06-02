"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, Upload, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface ProfileImageUploadProps {
  user: User
  onImageUpdate?: (imageUrl: string) => void
}

export function ProfileImageUpload({ user, onImageUpdate }: ProfileImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const currentImageUrl = user.user_metadata?.avatar_url
  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() || "U"

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 5MB",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Create unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("profiles").upload(fileName, file, {
        upsert: true,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles").getPublicUrl(fileName)

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        },
      })

      if (updateError) {
        throw updateError
      }

      toast({
        title: "Profile image updated",
        description: "Your profile image has been successfully updated.",
      })

      // Call callback if provided
      onImageUpdate?.(publicUrl)

      // Close dialog and reset state
      setIsOpen(false)
      setPreviewUrl(null)
      setUploadProgress(0)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    try {
      setUploading(true)

      // Update user metadata to remove avatar
      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: null,
        },
      })

      if (error) {
        throw error
      }

      toast({
        title: "Profile image removed",
        description: "Your profile image has been removed.",
      })

      onImageUpdate?.("")
      setIsOpen(false)
    } catch (error: any) {
      console.error("Error removing image:", error)
      toast({
        variant: "destructive",
        title: "Failed to remove image",
        description: error.message || "Failed to remove image. Please try again.",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
            <AvatarImage
              src={currentImageUrl || "/placeholder.svg"}
              alt={user.user_metadata?.full_name || user.email || ""}
            />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Current/Preview Image */}
          <div className="flex justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={previewUrl || currentImageUrl || "/placeholder.svg"} alt="Profile preview" />
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>
          </div>

          {/* File Input */}
          <div className="space-y-4">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Image
            </Button>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {/* File Info */}
            {fileInputRef.current?.files?.[0] && (
              <div className="text-sm text-muted-foreground text-center">
                Selected: {fileInputRef.current.files[0].name}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {previewUrl && (
              <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                {uploading ? "Uploading..." : "Upload Image"}
              </Button>
            )}

            {currentImageUrl && (
              <Button onClick={handleRemoveImage} variant="outline" disabled={uploading} className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>

          {/* Guidelines */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Supported formats: JPG, PNG, GIF</p>
            <p>• Maximum file size: 5MB</p>
            <p>• Recommended: Square images work best</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
