"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft } from "lucide-react"
import {
  type Album,
  type GalleryImage,
  getAlbums,
  getGalleryImagesByAlbum,
  getGalleryImageUrl,
} from "@/app/actions/gallery"

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<(GalleryImage & { url: string }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [albums, setAlbums] = useState<(Album & { coverUrl?: string })[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<(Album & { coverUrl?: string }) | null>(null)
  const [albumImages, setAlbumImages] = useState<(GalleryImage & { url: string })[]>([])
  const [loadingAlbumImages, setLoadingAlbumImages] = useState(false)

  useEffect(() => {
    const loadAlbums = async () => {
      try {
        setIsLoading(true)
        const albumsData = await getAlbums()

        // Get cover image URLs for albums
        const albumsWithCoverUrls = await Promise.all(
          albumsData.map(async (album) => {
            if (album.cover_image) {
              const coverUrl = await getGalleryImageUrl(album.cover_image)
              return { ...album, coverUrl }
            }
            return album
          }),
        )

        setAlbums(albumsWithCoverUrls)
      } catch (error) {
        console.error("Failed to load albums:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAlbums()
  }, [])

  const loadAlbumImages = async (albumId: string) => {
    try {
      setLoadingAlbumImages(true)
      const images = await getGalleryImagesByAlbum(albumId)

      // Get image URLs
      const imagesWithUrls = await Promise.all(
        images.map(async (image) => {
          const url = await getGalleryImageUrl(image.storage_path)
          return { ...image, url }
        }),
      )

      setAlbumImages(imagesWithUrls)
    } catch (error) {
      console.error("Failed to load album images:", error)
    } finally {
      setLoadingAlbumImages(false)
    }
  }

  const handleAlbumClick = async (album: Album & { coverUrl?: string }) => {
    setSelectedAlbum(album)
    await loadAlbumImages(album.id)
  }

  const handleBackToAlbums = () => {
    setSelectedAlbum(null)
    setAlbumImages([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Gallery</h2>
        <p className="text-muted-foreground">Photos from events and activities at Northmead Bowls Club</p>
      </div>

      {selectedAlbum ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBackToAlbums}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Albums
            </Button>
            <h3 className="text-xl font-semibold">{selectedAlbum.title}</h3>
          </div>

          {selectedAlbum.description && <p className="text-muted-foreground">{selectedAlbum.description}</p>}

          {loadingAlbumImages ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="relative h-48 rounded-lg overflow-hidden">
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
            </div>
          ) : albumImages.length === 0 ? (
            <p>No images found in this album.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albumImages.map((image) => (
                <div
                  key={image.id}
                  className="relative h-48 cursor-pointer rounded-lg overflow-hidden transition-transform hover:scale-[1.02] shadow-md"
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white font-medium">{image.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="relative h-48">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : albums.length === 0 ? (
            <p>No albums available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {albums.map((album) => (
                <Card
                  key={album.id}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAlbumClick(album)}
                >
                  <div className="relative h-48">
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
                        <p className="text-sm text-muted-foreground">No cover image</p>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg">{album.title}</h3>
                    {album.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{album.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
            <DialogDescription>{selectedImage?.description}</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="relative h-[600px] w-full">
              <Image
                src={selectedImage.url || "/placeholder.svg"}
                alt={selectedImage.alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
