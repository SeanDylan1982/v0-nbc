"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface UploadHelperProps {
  onFileSelected: (file: File) => void
  accept?: string
  maxSizeMB?: number
}

export function UploadHelper({ onFileSelected, accept = "image/*", maxSizeMB = 5 }: UploadHelperProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (convert MB to bytes)
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSizeMB}MB`,
        variant: "destructive",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Pass the file to the parent component
    onFileSelected(file)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="image-upload">Select Image</Label>
        <Input id="image-upload" type="file" accept={accept} onChange={handleFileChange} />
      </div>

      {preview && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Preview:</p>
          <div className="relative h-48 rounded-md overflow-hidden border">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="object-contain w-full h-full" />
          </div>
        </div>
      )}
    </div>
  )
}
