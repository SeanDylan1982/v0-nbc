"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type GalleryImage, getGalleryImagesByCategory, getGalleryImageUrl } from "@/app/actions/gallery"

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<(GalleryImage & { url: string }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [clubImages, setClubImages] = useState<(GalleryImage & { url: string })[]>([])
  const [eventsImages, setEventsImages] = useState<(GalleryImage & { url: string })[]>([])
  const [competitionsImages, setCompetitionsImages] = useState<(GalleryImage & { url: string })[]>([])
  const [socialImages, setSocialImages] = useState<(GalleryImage & { url: string })[]>([])
  const [historicalImages, setHistoricalImages] = useState<(GalleryImage & { url: string })[]>([])

  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load images for each category
        const loadCategoryImages = async (
          category: string,
          setter: React.Dispatch<React.SetStateAction<(GalleryImage & { url: string })[]>>,
        ) => {
          const images = await getGalleryImagesByCategory(category)
          const imagesWithUrls = await Promise.all(
            images.map(async (image) => {
              const url = await getGalleryImageUrl(image.storage_path)
              return { ...image, url }
            }),
          )
          setter(imagesWithUrls)
        }

        await Promise.all([
          loadCategoryImages("club", setClubImages),
          loadCategoryImages("events", setEventsImages),
          loadCategoryImages("competitions", setCompetitionsImages),
          loadCategoryImages("social", setSocialImages),
          loadCategoryImages("historical", setHistoricalImages),
        ])
      } catch (error) {
        console.error("Failed to load gallery images:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Gallery</h2>
        <p className="text-muted-foreground">Photos from events and activities at Northmead Bowls Club</p>
      </div>

      <Tabs defaultValue="club" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="club">Club</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
        </TabsList>

        <TabsContent value="club" className="mt-6">
          {isLoading ? (
            <p>Loading images...</p>
          ) : clubImages.length === 0 ? (
            <p>No club images available.</p>
          ) : (
            <GalleryGrid images={clubImages} onImageClick={setSelectedImage} />
          )}
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          {isLoading ? (
            <p>Loading images...</p>
          ) : eventsImages.length === 0 ? (
            <p>No event images available.</p>
          ) : (
            <GalleryGrid images={eventsImages} onImageClick={setSelectedImage} />
          )}
        </TabsContent>

        <TabsContent value="competitions" className="mt-6">
          {isLoading ? (
            <p>Loading images...</p>
          ) : competitionsImages.length === 0 ? (
            <p>No competition images available.</p>
          ) : (
            <GalleryGrid images={competitionsImages} onImageClick={setSelectedImage} />
          )}
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          {isLoading ? (
            <p>Loading images...</p>
          ) : socialImages.length === 0 ? (
            <p>No social images available.</p>
          ) : (
            <GalleryGrid images={socialImages} onImageClick={setSelectedImage} />
          )}
        </TabsContent>

        <TabsContent value="historical" className="mt-6">
          {isLoading ? (
            <p>Loading images...</p>
          ) : historicalImages.length === 0 ? (
            <p>No historical images available.</p>
          ) : (
            <GalleryGrid images={historicalImages} onImageClick={setSelectedImage} />
          )}
        </TabsContent>
      </Tabs>

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

interface GalleryGridProps {
  images: (GalleryImage & { url: string })[]
  onImageClick: (image: GalleryImage & { url: string }) => void
}

function GalleryGrid({ images, onImageClick }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="relative h-48 cursor-pointer rounded-lg overflow-hidden transition-transform hover:scale-[1.02] shadow-md"
          onClick={() => onImageClick(image)}
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
  )
}
