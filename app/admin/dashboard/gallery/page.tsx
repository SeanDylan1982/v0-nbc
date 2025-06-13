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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Plus, Trash, ImageIcon } from "lucide-react"
import { UploadHelper } from "./upload-helper"
import { useToast } from "@/hooks/use-toast"
import {
  type Album,
  type GalleryImage,
  createAlbum,
  deleteAlbum,
  deleteGalleryImage,
  getAlbums,
  getGalleryImagesByAlbum,
  getGalleryImageUrl,
  setAlbumCoverImage,
  updateAlbum,
  updateGalleryImage,
  uploadGalleryImage,
} from "@/app/actions/gallery"

export default function GalleryAdminPage() {
  const [activeTab, setActiveTab] = useState("albums")
  const [isLoading, setIsLoading] = useState(true)
  const [albums, setAlbums] = useState<(Album & { coverUrl?: string })[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<(Album & { coverUrl?: string }) | null>(null)
  const [images, setImages] = useState<(GalleryImage & { url?: string })[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddAlbumDialogOpen, setIsAddAlbumDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<(GalleryImage & { url?: string }) | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditAlbumDialogOpen, setIsEditAlbumDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newImage, setNewImage] = useState({
    title: "",
    alt: "",
    description: "",
    album_id: "",
  })
  const [newAlbum, setNewAlbum] = useState({
    title: "",
    description: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const data = await getAlbums()

        // Get cover URLs for all albums
        const albumsWithUrls = await Promise.all(
          data.map(async (album) => {
            if (album.cover_image) {
              const coverUrl = await getGalleryImageUrl(album.cover_image)
              return { ...album, coverUrl }
            }
            return album
          }),
        )

        setAlbums(albumsWithUrls)
      } catch (error) {
        console.error("Failed to load albums:", error)
        toast({
          title: "Error",
          description: "Failed to load albums. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAlbums()
  }, [toast])

  const loadAlbumImages = async (albumId: string) => {
    try {
      setIsLoading(true)
      const data = await getGalleryImagesByAlbum(albumId)

      // Get URLs for all images
      const imagesWithUrls = await Promise.all(
        data.map(async (image) => {
          const url = await getGalleryImageUrl(image.storage_path)
          return { ...image, url }
        }),
      )

      setImages(imagesWithUrls)
    } catch (error) {
      console.error("Failed to load album images:", error)
      toast({
        title: "Error",
        description: "Failed to load album images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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

    // Ensure album_id is set from the selected album
    const albumId = selectedAlbum?.id
    if (!albumId) {
      toast({
        title: "No album selected",
        description: "Please select an album for this image.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Set the album_id explicitly
      const imageData = {
        ...newImage,
        album_id: albumId,
      }

      console.log("Uploading image with data:", imageData)
      const result = await uploadGalleryImage(selectedFile, imageData)
      console.log("Upload result:", result)

      // If we're currently viewing the album this image was added to, update the images list
      if (selectedAlbum && selectedAlbum.id === albumId) {
        setImages([{ ...result, url: result.publicUrl }, ...images])
      }

      setNewImage({
        title: "",
        alt: "",
        description: "",
        album_id: albumId,
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
        description: `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAlbum = async () => {
    if (!newAlbum.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the album.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const result = await createAlbum(newAlbum)
      setAlbums([...albums, result])
      setNewAlbum({
        title: "",
        description: "",
      })
      setIsAddAlbumDialogOpen(false)
      toast({
        title: "Success",
        description: "Album created successfully!",
      })
    } catch (error) {
      console.error("Failed to create album:", error)
      toast({
        title: "Error",
        description: "Failed to create album. Please try again.",
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

  const handleEditAlbum = (album: Album & { coverUrl?: string }) => {
    setSelectedAlbum(album)
    setIsEditAlbumDialogOpen(true)
  }

  const handleUpdateImage = async () => {
    if (!selectedImage) return

    try {
      setIsLoading(true)
      const { id, title, alt, description, album_id } = selectedImage
      const updatedImage = await updateGalleryImage(id, { title, alt, description, album_id })
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

  const handleUpdateAlbum = async () => {
    if (!selectedAlbum) return

    try {
      setIsLoading(true)
      const { id, title, description } = selectedAlbum
      const updatedAlbum = await updateAlbum(id, { title, description })
      setAlbums(
        albums.map((album) => (album.id === updatedAlbum.id ? { ...updatedAlbum, coverUrl: album.coverUrl } : album)),
      )
      setIsEditAlbumDialogOpen(false)
      toast({
        title: "Success",
        description: "Album updated successfully!",
      })
    } catch (error) {
      console.error("Failed to update album:", error)
      toast({
        title: "Error",
        description: "Failed to update album. Please try again.",
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

  const handleDeleteAlbum = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this album? All images will be unassigned from this album but not deleted.",
      )
    )
      return

    try {
      setIsLoading(true)
      await deleteAlbum(id)
      setAlbums(albums.filter((album) => album.id !== id))

      // If we were viewing this album, go back to albums view
      if (selectedAlbum && selectedAlbum.id === id) {
        setSelectedAlbum(null)
        setImages([])
        setActiveTab("albums")
      }

      toast({
        title: "Success",
        description: "Album deleted successfully!",
      })
    } catch (error) {
      console.error("Failed to delete album:", error)
      toast({
        title: "Error",
        description: "Failed to delete album. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetAlbumCover = async (imageId: string, storagePath: string) => {
    if (!selectedAlbum) return

    try {
      setIsLoading(true)
      const updatedAlbum = await setAlbumCoverImage(selectedAlbum.id, storagePath)

      // Update the cover URL in the albums list
      const imageUrl = await getGalleryImageUrl(storagePath)
      setAlbums(albums.map((album) => (album.id === updatedAlbum.id ? { ...updatedAlbum, coverUrl: imageUrl } : album)))

      // Update the selected album if it's the one we just updated
      if (selectedAlbum && selectedAlbum.id === updatedAlbum.id) {
        setSelectedAlbum({ ...updatedAlbum, coverUrl: imageUrl })
      }

      toast({
        title: "Success",
        description: "Album cover set successfully!",
      })
    } catch (error) {
      console.error("Failed to set album cover:", error)
      toast({
        title: "Error",
        description: "Failed to set album cover. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAlbumClick = async (album: Album & { coverUrl?: string }) => {
    setSelectedAlbum(album)
    setActiveTab("images")
    await loadAlbumImages(album.id)
  }

  const handleBackToAlbums = () => {
    setSelectedAlbum(null)
    setImages([])
    setActiveTab("albums")
  }

  // Reset the new image form when opening the dialog
  const handleOpenAddImageDialog = () => {
    setNewImage({
      title: "",
      alt: "",
      description: "",
      album_id: selectedAlbum?.id || "",
    })
    setSelectedFile(null)
    setIsAddDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery Management</h1>
          <p className="text-muted-foreground">Manage albums and images in the club gallery</p>
        </div>
        {activeTab === "albums" ? (
          <Dialog open={isAddAlbumDialogOpen} onOpenChange={setIsAddAlbumDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" disabled={isLoading}>
                <Plus className="h-4 w-4" />
                Add Album
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Album</DialogTitle>
                <DialogDescription>Create a new album to organize your gallery images</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Album Title</Label>
                  <Input
                    id="title"
                    value={newAlbum.title}
                    onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newAlbum.description}
                    onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddAlbumDialogOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleAddAlbum} disabled={isLoading || !newAlbum.title.trim()}>
                  {isLoading ? "Creating..." : "Create Album"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBackToAlbums} disabled={isLoading}>
              Back to Albums
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  disabled={isLoading || !selectedAlbum}
                  onClick={handleOpenAddImageDialog}
                >
                  <Plus className="h-4 w-4" />
                  Add Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Image</DialogTitle>
                  <DialogDescription>Upload a new image to the album</DialogDescription>
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
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newImage.description}
                      onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Uploading to album: <span className="font-medium">{selectedAlbum?.title}</span>
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
        )}
      </div>

      <Tabs defaultValue="albums" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="images" disabled={!selectedAlbum}>
            {selectedAlbum ? `Images in "${selectedAlbum.title}"` : "Images"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="albums" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : albums.length === 0 ? (
            <p>No albums found. Create your first album to get started.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {albums.map((album) => (
                <Card key={album.id} className="overflow-hidden">
                  <div className="relative h-48 cursor-pointer" onClick={() => handleAlbumClick(album)}>
                    {album.coverUrl ? (
                      <Image
                        src={album.coverUrl || "/placeholder.svg"}
                        alt={album.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className="font-medium truncate cursor-pointer hover:underline"
                        onClick={() => handleAlbumClick(album)}
                      >
                        {album.title}
                      </h3>
                      <div className="flex gap-2 ml-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditAlbum(album)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteAlbum(album.id)}
                          disabled={isLoading}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {album.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 h-10">{album.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          {!selectedAlbum ? (
            <p>Please select an album to view its images.</p>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : images.length === 0 ? (
            <p>No images found in this album. Add your first image to get started.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetAlbumCover(image.id, image.storage_path)}
                        disabled={isLoading || selectedAlbum?.cover_image === image.storage_path}
                        className="text-xs"
                      >
                        {selectedAlbum?.cover_image === image.storage_path ? "Current Cover" : "Set as Cover"}
                      </Button>
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

      {/* Edit Album Dialog */}
      <Dialog open={isEditAlbumDialogOpen} onOpenChange={setIsEditAlbumDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Album</DialogTitle>
          </DialogHeader>
          {selectedAlbum && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-album-title">Album Title</Label>
                <Input
                  id="edit-album-title"
                  value={selectedAlbum.title}
                  onChange={(e) => setSelectedAlbum({ ...selectedAlbum, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-album-description">Description</Label>
                <Textarea
                  id="edit-album-description"
                  value={selectedAlbum.description || ""}
                  onChange={(e) =>
                    setSelectedAlbum({
                      ...selectedAlbum,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAlbumDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAlbum} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
