"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { X, Calendar, Clock, MapPin } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  date: string
  time: string
  location: string
  description: string
  category: string
  imageUrl?: string
}

export function EventModal({
  isOpen,
  onClose,
  title,
  date,
  time,
  location,
  description,
  category,
  imageUrl,
}: EventModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden" // Prevent scrolling behind modal
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "auto" // Restore scrolling
    }
  }, [isOpen, onClose])

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  if (!isOpen) return null

  const categoryColors = {
    competitions: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    social: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    joker: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  }

  const categoryColor =
    categoryColors[category as keyof typeof categoryColors] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div ref={modalRef} className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="modal-title" className="text-xl font-bold">
            {title}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-grow p-4">
          {imageUrl && (
            <div className="relative h-64 mb-4">
              <Image src={imageUrl || "/placeholder.svg"} alt={title} fill className="object-cover rounded-md" />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm ${categoryColor}`}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{location}</span>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p>{description}</p>
          </div>
        </div>

        <div className="p-4 border-t">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
