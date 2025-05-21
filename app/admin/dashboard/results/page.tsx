"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Calendar, Edit, ImageIcon, Plus, Trash, Trophy } from "lucide-react"
import {
  type Result,
  type NewResult,
  createResult,
  deleteResult,
  getResults,
  updateResult,
} from "@/app/actions/results"
import { getImageUrl } from "@/app/actions/events"
import { useToast } from "@/hooks/use-toast"

export default function ResultsAdminPage() {
  const [results, setResults] = useState<(Result & { imageUrl?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState<(Result & { imageUrl?: string }) | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const [newResult, setNewResult] = useState<NewResult>({
    title: "",
    date: "",
    category: "competitions",
    items: [{ position: "", name: "" }],
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadResults = async () => {
      try {
        const data = await getResults()

        // Get image URLs for all results
        const resultsWithImages = await Promise.all(
          data.map(async (result) => {
            let imageUrl = undefined
            if (result.image_path) {
              imageUrl = await getImageUrl(result.image_path)
            }
            return { ...result, imageUrl }
          }),
        )

        setResults(resultsWithImages)
      } catch (error) {
        console.error("Failed to load results:", error)
        toast({
          title: "Error",
          description: "Failed to load results. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditSelectedFile(e.target.files[0])
    }
  }

  const handleAddResult = async () => {
    try {
      setIsLoading(true)
      const createdResult = await createResult(newResult, selectedFile || undefined)

      // Get image URL for the new result
      let imageUrl = undefined
      if (createdResult.image_path) {
        imageUrl = await getImageUrl(createdResult.image_path)
      }

      setResults([{ ...createdResult, imageUrl }, ...results])
      setNewResult({
        title: "",
        date: "",
        category: "competitions",
        items: [{ position: "", name: "" }],
      })
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Result created successfully!",
      })
    } catch (error) {
      console.error("Failed to create result:", error)
      toast({
        title: "Error",
        description: "Failed to create result. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditResult = (result: Result & { imageUrl?: string }) => {
    setSelectedResult(result)
    setIsEditDialogOpen(true)
    setEditSelectedFile(null)
    if (editFileInputRef.current) {
      editFileInputRef.current.value = ""
    }
  }

  const handleUpdateResult = async () => {
    if (!selectedResult) return

    try {
      setIsLoading(true)
      const updatedResult = await updateResult(
        selectedResult.id,
        {
          title: selectedResult.title,
          date: selectedResult.date,
          category: selectedResult.category,
          image_path: selectedResult.image_path,
          items: selectedResult.items,
        },
        editSelectedFile || undefined,
      )

      // Get image URL for the updated result
      let imageUrl = undefined
      if (updatedResult.image_path) {
        imageUrl = await getImageUrl(updatedResult.image_path)
      }

      setResults(results.map((result) => (result.id === updatedResult.id ? { ...updatedResult, imageUrl } : result)))
      setIsEditDialogOpen(false)
      setEditSelectedFile(null)
      toast({
        title: "Success",
        description: "Result updated successfully!",
      })
    } catch (error) {
      console.error("Failed to update result:", error)
      toast({
        title: "Error",
        description: "Failed to update result. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteResult = async (id: string) => {
    if (!confirm("Are you sure you want to delete this result?")) return

    try {
      setIsLoading(true)
      await deleteResult(id)
      setResults(results.filter((result) => result.id !== id))
      toast({
        title: "Success",
        description: "Result deleted successfully!",
      })
    } catch (error) {
      console.error("Failed to delete result:", error)
      toast({
        title: "Error",
        description: "Failed to delete result. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addResultItem = () => {
    setNewResult({
      ...newResult,
      items: [...newResult.items, { position: "", name: "" }],
    })
  }

  const updateResultItem = (index: number, field: "position" | "name", value: string) => {
    const updatedItems = [...newResult.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setNewResult({ ...newResult, items: updatedItems })
  }

  const removeResultItem = (index: number) => {
    if (newResult.items.length <= 1) return
    const updatedItems = newResult.items.filter((_, i) => i !== index)
    setNewResult({ ...newResult, items: updatedItems })
  }

  const addEditResultItem = () => {
    if (!selectedResult) return
    setSelectedResult({
      ...selectedResult,
      items: [...(selectedResult.items || []), { id: "", result_id: selectedResult.id, position: "", name: "" }],
    })
  }

  const updateEditResultItem = (index: number, field: "position" | "name", value: string) => {
    if (!selectedResult || !selectedResult.items) return
    const updatedItems = [...selectedResult.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setSelectedResult({ ...selectedResult, items: updatedItems })
  }

  const removeEditResultItem = (index: number) => {
    if (!selectedResult || !selectedResult.items || selectedResult.items.length <= 1) return
    const updatedItems = selectedResult.items.filter((_, i) => i !== index)
    setSelectedResult({ ...selectedResult, items: updatedItems })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground">Manage results for Northmead Bowls Club</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={isLoading}>
              <Plus className="h-4 w-4" />
              Add Result
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Result</DialogTitle>
              <DialogDescription>Fill in the details for the new result</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Result Title</Label>
                <Input
                  id="title"
                  value={newResult.title}
                  onChange={(e) => setNewResult({ ...newResult, title: e.target.value })}
                  placeholder="e.g., Veterans Tournament"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  value={newResult.date}
                  onChange={(e) => setNewResult({ ...newResult, date: e.target.value })}
                  placeholder="e.g., March 15-16, 2025"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newResult.category}
                  onValueChange={(value) => setNewResult({ ...newResult, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="competitions">Competitions</SelectItem>
                    <SelectItem value="league">League Matches</SelectItem>
                    <SelectItem value="joker">Joker Draw</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Result Image (Optional)</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                {selectedFile && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Result Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addResultItem}>
                    Add Item
                  </Button>
                </div>

                {newResult.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
                    <Input
                      placeholder="Position"
                      value={item.position}
                      onChange={(e) => updateResultItem(index, "position", e.target.value)}
                    />
                    <Input
                      placeholder="Name/Result"
                      value={item.name}
                      onChange={(e) => updateResultItem(index, "name", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeResultItem(index)}
                      disabled={newResult.items.length <= 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleAddResult} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Result"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p>Loading results...</p>}

      <div className="grid gap-6">
        {results.map((result) => (
          <Card key={result.id}>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 relative">
                {result.imageUrl ? (
                  <div className="relative h-48 md:h-full">
                    <Image
                      src={result.imageUrl || "/placeholder.svg"}
                      alt={result.title}
                      fill
                      className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 md:h-full bg-muted rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="md:w-2/3">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{result.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>{result.date}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditResult(result)}
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteResult(result.id)}
                        disabled={isLoading}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        result.category === "competitions"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : result.category === "league"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      }`}
                    >
                      {result.category.charAt(0).toUpperCase() + result.category.slice(1)}
                    </span>
                    <Trophy className="h-5 w-5 text-amber-500" />
                  </div>

                  <ul className="space-y-2">
                    {result.items?.map((item, index) => (
                      <li key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                        <span className="font-medium">{item.position}</span>
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Result Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Result</DialogTitle>
            <DialogDescription>Update the details for this result</DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Result Title</Label>
                <Input
                  id="edit-title"
                  value={selectedResult.title}
                  onChange={(e) => setSelectedResult({ ...selectedResult, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  value={selectedResult.date}
                  onChange={(e) => setSelectedResult({ ...selectedResult, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={selectedResult.category}
                  onValueChange={(value) => setSelectedResult({ ...selectedResult, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="competitions">Competitions</SelectItem>
                    <SelectItem value="league">League Matches</SelectItem>
                    <SelectItem value="joker">Joker Draw</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-image">Result Image</Label>
                {selectedResult.imageUrl && (
                  <div className="relative h-40 mb-2">
                    <Image
                      src={selectedResult.imageUrl || "/placeholder.svg"}
                      alt={selectedResult.title}
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                )}
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  ref={editFileInputRef}
                />
                {editSelectedFile && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Selected: {editSelectedFile.name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Result Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addEditResultItem}>
                    Add Item
                  </Button>
                </div>

                {selectedResult.items?.map((item, index) => (
                  <div key={index} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
                    <Input
                      placeholder="Position"
                      value={item.position}
                      onChange={(e) => updateEditResultItem(index, "position", e.target.value)}
                    />
                    <Input
                      placeholder="Name/Result"
                      value={item.name}
                      onChange={(e) => updateEditResultItem(index, "name", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEditResultItem(index)}
                      disabled={selectedResult.items?.length <= 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateResult} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
