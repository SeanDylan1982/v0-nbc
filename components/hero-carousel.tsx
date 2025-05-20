"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

interface HeroCarouselProps {
  className?: string
}

export function HeroCarousel({ className }: HeroCarouselProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  const images = [
    {
      src: "/images/carousel/nbc-1.png",
      alt: "Northmead Bowls Club patio area overlooking the green",
    },
    {
      src: "/images/carousel/nbc-2.png",
      alt: "Beautiful flowers with the bowling green in the background",
    },
    {
      src: "/images/carousel/nbc-3.png",
      alt: "Well-maintained bowling green at Northmead Bowls Club",
    },
    {
      src: "/images/carousel/nbc-4.png",
      alt: "Northmead Bowls Club building and green",
    },
    {
      src: "/images/carousel/nbc-5.png",
      alt: "Illustration of people playing lawn bowls",
    },
  ]

  const plugin = Autoplay({ delay: 5000, stopOnInteraction: true })

  return (
    <div className={`relative w-full overflow-hidden rounded-lg ${className}`}>
      {/* Static overlay with logo and welcome message */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white p-4 text-center">
        <div className="mb-4">
          <Image src="/logo.png" alt="Northmead Bowls Club Logo" width={80} height={80} className="rounded-full" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Northmead Bowls Club</h1>
        <p className="text-lg md:text-xl max-w-2xl">
          Join us for lawn bowls, social events, and a friendly community atmosphere
        </p>
      </div>

      {/* Semi-transparent overlay to ensure text readability */}
      <div className="absolute inset-0 z-[5] bg-black/40"></div>

      {/* Carousel */}
      <Carousel
        className="w-full"
        plugins={[plugin]}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[300px] md:h-[400px] w-full">
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex z-20" />
        <CarouselNext className="hidden md:flex z-20" />
      </Carousel>
    </div>
  )
}
