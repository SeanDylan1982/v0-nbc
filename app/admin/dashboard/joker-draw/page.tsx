"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getJokerDrawInfo, updateJokerDrawInfo, uploadWinnerImage, type JokerDrawInfo } from "@/app/actions/joker-draw"
import { formatCurrency } from "@/lib/utils-extension"
import Image from "next/image"
import { createClientSupabaseClient } from "@/lib/supabase"
import { AlertCircle, Loader2, Upload, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function JokerDrawAdminPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [currentInfo, setCurrentInfo] = useState<JokerDrawInfo | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [lastWinner, setLastWinner] = useState("")
  const [lastWinAmount, setLastWinAmount] = useState("")
  const [currentJackpot, setCurrentJackpot] = useState("")
  const [winnerImagePath, setWinnerImagePath] = useState<string | null>(null)
  const [winnerImagePreview, setWinnerImagePreview] = useState<string | null>(null)

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    const loadJokerInfo = async () => {
      try {
        const info = await getJokerDrawInfo()
        setCurrentInfo(info)

        if (info) {
          setLastWinner(info.lastWinner)
          setLastWinAmount(info.lastWinAmount.toString())
          setCurrentJackpot(info.currentJackpot.toString())
          setWinnerImagePath(info.winnerImagePath)

          // If there's an image path, get the public URL
          if (info.winnerImagePath) {
            const { data } = supabase.storage.from("winners").getPublicUrl(info.winnerImagePath)
            setWinnerImagePreview(data.publicUrl)
          }
        }
      } catch (error) {
        console.error("Error loading joker draw info:", error)
        toast({
          title: "Error",
          description: "Failed to load current joker draw information",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadJokerInfo()
  }, [toast, supabase])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    setUploadingImage(true)
    setUploadError(null)

    try {
      // Create a preview
      const objectUrl = URL.createObjectURL(file)
      setWinnerImagePreview(objectUrl)

      // Upload the file
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadWinnerImage(formData)

      if (result.error) {
        setUploadError(result.error)
        toast({
          title: "Upload Failed",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (result.path) {
        setWinnerImagePath(result.path)
        toast({
          title: "Success",
          description: "Winner image uploaded successfully",
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image"
      setUploadError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setWinnerImagePath(null)
    setWinnerImagePreview(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validate inputs
      if (!lastWinner.trim()) {
        toast({
          title: "Error",
          description: "Please enter the last winner's name",
          variant: "destructive",
        })
        setSubmitting(false)
        return
      }

      const winAmount = Number.parseFloat(lastWinAmount)
      const jackpot = Number.parseFloat(currentJackpot)

      if (isNaN(winAmount) || winAmount < 0) {
        toast({
          title: "Error",
          description: "Please enter a valid win amount",
          variant: "destructive",
        })
        setSubmitting(false)
        return
      }

      if (isNaN(jackpot) || jackpot < 0) {
        toast({
          title: "Error",
          description: "Please enter a valid jackpot amount",
          variant: "destructive",
        })
        setSubmitting(false)
        return
      }

      const result = await updateJokerDrawInfo(
        lastWinner.trim(),
        Math.round(winAmount),
        Math.round(jackpot),
        winnerImagePath,
      )

      if (result.success) {
        toast({
          title: "Success",
          description: "Joker draw information updated successfully",
        })

        // Refresh the current info
        const updatedInfo = await getJokerDrawInfo()
        setCurrentInfo(updatedInfo)
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update joker draw information",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating joker draw info:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Joker Draw Management</h2>
        <p className="text-muted-foreground">Update the weekly joker draw information here.</p>
      </div>

      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>
            {uploadError}
            {uploadError.includes("row-level security") && (
              <div className="mt-2 text-sm">
                <p>This is likely due to Supabase Storage permissions. Please check:</p>
                <ol className="list-decimal pl-4 mt-1 space-y-1">
                  <li>The "winners" bucket has the correct RLS policies</li>
                  <li>Your Supabase service role key has the correct permissions</li>
                  <li>The service role key is correctly set in your environment variables</li>
                </ol>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Information</CardTitle>
            <CardDescription>
              Last updated: {currentInfo ? new Date(currentInfo.updatedAt).toLocaleString() : "Never"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading current information...</p>
            ) : currentInfo ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">Last Winner:</div>
                  <div className="flex items-center gap-3">
                    {currentInfo.winnerImagePath ? (
                      <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                        <Image
                          src={
                            supabase.storage.from("winners").getPublicUrl(currentInfo.winnerImagePath).data.publicUrl ||
                            "/placeholder.svg" ||
                            "/placeholder.svg"
                          }
                          alt={currentInfo.lastWinner}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-2xl">🃏</span>
                      </div>
                    )}
                    <span>{currentInfo.lastWinner}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Last Win Amount:</span> {formatCurrency(currentInfo.lastWinAmount)}
                </div>
                <div>
                  <span className="font-medium">Current Jackpot:</span> {formatCurrency(currentInfo.currentJackpot)}
                </div>
              </div>
            ) : (
              <p>No joker draw information available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Information</CardTitle>
            <CardDescription>Update the joker draw information after each weekly draw</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lastWinner">Last Winner</Label>
                <Input
                  id="lastWinner"
                  value={lastWinner}
                  onChange={(e) => setLastWinner(e.target.value)}
                  placeholder="Enter winner's name"
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="winnerImage">Winner Image</Label>
                <div className="flex flex-col space-y-3">
                  {winnerImagePreview ? (
                    <div className="relative w-24 h-24 mx-auto">
                      <Image
                        src={winnerImagePreview || "/placeholder.svg"}
                        alt="Winner preview"
                        fill
                        className="object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        aria-label="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 mx-auto bg-muted rounded-md flex items-center justify-center">
                      <span className="text-3xl">🃏</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center">
                    <Input
                      ref={fileInputRef}
                      id="winnerImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage || submitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage || submitting}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {winnerImagePreview ? "Change Image" : "Upload Image"}
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Upload an image of the winner (optional). Max size: 5MB.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastWinAmount">Last Win Amount (R)</Label>
                <Input
                  id="lastWinAmount"
                  type="number"
                  min="0"
                  step="1"
                  value={lastWinAmount}
                  onChange={(e) => setLastWinAmount(e.target.value)}
                  placeholder="0"
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentJackpot">Current Jackpot (R)</Label>
                <Input
                  id="currentJackpot"
                  type="number"
                  min="0"
                  step="1"
                  value={currentJackpot}
                  onChange={(e) => setCurrentJackpot(e.target.value)}
                  placeholder="0"
                  disabled={submitting}
                />
              </div>

              <Button type="submit" disabled={submitting || uploadingImage}>
                {submitting ? "Updating..." : "Update Information"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
