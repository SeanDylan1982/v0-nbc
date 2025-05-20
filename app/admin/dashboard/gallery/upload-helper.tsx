"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadHelperProps {
  onFileSelected: (file: File) => void
  accept?: string
  maxSizeMB?: number
}

export function UploadHelper({ onFileSelected, accept = "image/*", maxSizeMB = 5 }: UploadHelperProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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

    setSelectedFile(file)
  }

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelected(selectedFile)
      setSelectedFile(null)
      setPreview(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="image-upload">Upload Image</Label>
        <div className="flex items-center gap-2">
          <Input id="image-upload" type="file" accept={accept} onChange={handleFileChange} />
          <Button size="sm" className="flex items-center gap-1" onClick={handleUpload} disabled={!selectedFile}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
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
