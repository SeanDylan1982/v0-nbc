"use client"

import { useEffect, useState } from "react"
import { initializeStorage } from "@/app/actions/storage"
import { useToast } from "@/hooks/use-toast"

export function InitializeStorage() {
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeStorage()
        setIsInitialized(true)
      } catch (error) {
        console.error("Failed to initialize storage:", error)
        toast({
          title: "Storage Initialization Failed",
          description: "There was an error initializing the storage buckets. Some features may not work correctly.",
          variant: "destructive",
        })
      }
    }

    initialize()
  }, [toast])

  return null
}
