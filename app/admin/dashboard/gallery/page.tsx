"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Plus, Trash } from "lucide-react"
import { UploadHelper } from "./upload-helper"
import { useToast } from "@/hooks/use-toast"
import {
  type GalleryImage,
  deleteGalleryImage,
  getGalleryImageUrl,
  getGalleryImages,
  updateGalleryImage,
  uploadGalleryImage,
} from "@/app/actions/gallery"

export default function GalleryAdminPage() {
  const [activeTab, setActiveTab] = useState("club")
  const [isLoading, setIsLoading] = useState(true)
  const [images, setImages] = useState<(GalleryImage & { url?: string })[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<(GalleryImage & { url?: string }) | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newImage, setNewImage] = useState({
    title: "",
    alt: "",
    description: "",
    category: "club",
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadImages = async () => {
      try {
        const data = await getGalleryImages()

        // Get URLs for all images
        const imagesWithUrls = await Promise.all(
          data.map(async (image) => {
            const url = await getGalleryImageUrl(image.storage_path)
            return { ...image, url }
          }),
        )

        setImages(imagesWithUrls)
      } catch (error) {
        console.error("Failed to load gallery images:", error)
        toast({
          title: "Error",
          description: "Failed to load gallery images. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [toast])

  const handleFileSelected = (file: File) => {
    setSelectedFile(file)
  }

  const handleAddImage = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image file to upload.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const result = await uploadGalleryImage(selectedFile, newImage)
      setImages([{ ...result, url: result.publicUrl }, ...images])
      setNewImage({
        title: "",
        alt: "",
        description: "",
        category: "club",
      })
      setSelectedFile(null)
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      })
    } catch (error) {
      console.error("Failed to upload image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditImage = (image: GalleryImage & { url?: string }) => {
    setSelectedImage(image)
    setIsEditDialogOpen(true)
  }

  const handleUpdateImage = async () => {
    if (!selectedImage) return

    try {
      setIsLoading(true)
      const { id, title, alt, description, category } = selectedImage
      const updatedImage = await updateGalleryImage(id, { title, alt, description, category })
      setImages(images.map((img) => (img.id === updatedImage.id ? { ...updatedImage, url: img.url } : img)))
      setIsEditDialogOpen(false)
      toast({
        title: "Success",
        description: "Image updated successfully!",
      })
    } catch (error) {
      console.error("Failed to update image:", error)
      toast({
        title: "Error",
        description: "Failed to update image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      setIsLoading(true)
      await deleteGalleryImage(id)
      setImages(images.filter((img) => img.id !== id))
      toast({
        title: "Success",
        description: "Image deleted successfully!",
      })
    } catch (error) {
      console.error("Failed to delete image:", error)
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredImages = images.filter((img) => img.category === activeTab)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery Management</h1>
          <p className="text-muted-foreground">Manage images in the club gallery</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={isLoading}>
              <Plus className="h-4 w-4" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Image</DialogTitle>
              <DialogDescription>Upload a new image to the gallery</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <UploadHelper onFileSelected={handleFileSelected} />

              <div className="grid gap-2">
                <Label htmlFor="title">Image Title</Label>
                <Input
                  id="title"
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="alt">Alt Text</Label>
                <Input
                  id="alt"
                  value={newImage.alt}
                  onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newImage.category}
                  onValueChange={(value) => setNewImage({ ...newImage, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="club">Club</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="competitions">Competitions</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="historical">Historical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newImage.description}
                  onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleAddImage} disabled={isLoading || !selectedFile}>
                {isLoading ? "Uploading..." : "Upload Image"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="club" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="club">Club</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <p>Loading images...</p>
          ) : filteredImages.length === 0 ? (
            <p>No images found in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="relative h-48">
                    {image.url ? (
                      <Image src={image.url || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <p className="text-sm text-muted-foreground">Image not available</p>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate">{image.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">{image.description}</p>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditImage(image)} disabled={isLoading}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={isLoading}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Image Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="grid gap-4 py-4">
              <div className="relative h-48 rounded-md overflow-hidden">
                {selectedImage.url ? (
                  <Image
                    src={selectedImage.url || "/placeholder.svg"}
                    alt={selectedImage.alt}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <p className="text-sm text-muted-foreground">Image not available</p>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Image Title</Label>
                <Input
                  id="edit-title"
                  value={selectedImage.title}
                  onChange={(e) => setSelectedImage({ ...selectedImage, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-alt">Alt Text</Label>
                <Input
                  id="edit-alt"
                  value={selectedImage.alt}
                  onChange={(e) => setSelectedImage({ ...selectedImage, alt: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={selectedImage.category}
                  onValueChange={(value) => setSelectedImage({ ...selectedImage, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="club">Club</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="competitions">Competitions</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="historical">Historical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedImage.description}
                  onChange={(e) =>
                    setSelectedImage({
                      ...selectedImage,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateImage} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
