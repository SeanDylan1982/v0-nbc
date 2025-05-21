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
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Edit, ImageIcon, Plus, Trash, Trophy, Users } from "lucide-react"
import {
  type Competition,
  type NewCompetition,
  createCompetition,
  deleteCompetition,
  getCompetitions,
  updateCompetition,
} from "@/app/actions/competitions"
import { getImageUrl } from "@/app/actions/events"
import { useToast } from "@/hooks/use-toast"

export default function CompetitionsAdminPage() {
  const [competitions, setCompetitions] = useState<(Competition & { imageUrl?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<(Competition & { imageUrl?: string }) | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const [newCompetition, setNewCompetition] = useState<NewCompetition>({
    title: "",
    date: "",
    format: "",
    entry_deadline: "",
    description: "",
    status: "Upcoming",
    winner: null,
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        const data = await getCompetitions()

        // Get image URLs for all competitions
        const competitionsWithImages = await Promise.all(
          data.map(async (competition) => {
            let imageUrl = undefined
            if (competition.image_path) {
              imageUrl = await getImageUrl(competition.image_path)
            }
            return { ...competition, imageUrl }
          }),
        )

        setCompetitions(competitionsWithImages)
      } catch (error) {
        console.error("Failed to load competitions:", error)
        toast({
          title: "Error",
          description: "Failed to load competitions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCompetitions()
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

  const handleAddCompetition = async () => {
    try {
      setIsLoading(true)
      const createdCompetition = await createCompetition(newCompetition, selectedFile || undefined)

      // Get image URL for the new competition
      let imageUrl = undefined
      if (createdCompetition.image_path) {
        imageUrl = await getImageUrl(createdCompetition.image_path)
      }

      setCompetitions([{ ...createdCompetition, imageUrl }, ...competitions])
      setNewCompetition({
        title: "",
        date: "",
        format: "",
        entry_deadline: "",
        description: "",
        status: "Upcoming",
        winner: null,
      })
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Competition created successfully!",
      })
    } catch (error) {
      console.error("Failed to create competition:", error)
      toast({
        title: "Error",
        description: "Failed to create competition. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCompetition = (competition: Competition & { imageUrl?: string }) => {
    setSelectedCompetition(competition)
    setIsEditDialogOpen(true)
    setEditSelectedFile(null)
    if (editFileInputRef.current) {
      editFileInputRef.current.value = ""
    }
  }

  const handleUpdateCompetition = async () => {
    if (!selectedCompetition) return

    try {
      setIsLoading(true)
      const updatedCompetition = await updateCompetition(
        selectedCompetition.id,
        {
          title: selectedCompetition.title,
          date: selectedCompetition.date,
          format: selectedCompetition.format,
          entry_deadline: selectedCompetition.entry_deadline,
          description: selectedCompetition.description,
          status: selectedCompetition.status,
          winner: selectedCompetition.winner,
          image_path: selectedCompetition.image_path,
        },
        editSelectedFile || undefined,
      )

      // Get image URL for the updated competition
      let imageUrl = undefined
      if (updatedCompetition.image_path) {
        imageUrl = await getImageUrl(updatedCompetition.image_path)
      }

      setCompetitions(
        competitions.map((competition) =>
          competition.id === updatedCompetition.id ? { ...updatedCompetition, imageUrl } : competition,
        ),
      )
      setIsEditDialogOpen(false)
      setEditSelectedFile(null)
      toast({
        title: "Success",
        description: "Competition updated successfully!",
      })
    } catch (error) {
      console.error("Failed to update competition:", error)
      toast({
        title: "Error",
        description: "Failed to update competition. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCompetition = async (id: string) => {
    if (!confirm("Are you sure you want to delete this competition?")) return

    try {
      setIsLoading(true)
      await deleteCompetition(id)
      setCompetitions(competitions.filter((competition) => competition.id !== id))
      toast({
        title: "Success",
        description: "Competition deleted successfully!",
      })
    } catch (error) {
      console.error("Failed to delete competition:", error)
      toast({
        title: "Error",
        description: "Failed to delete competition. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
          <p className="text-muted-foreground">Manage competitions for Northmead Bowls Club</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={isLoading}>
              <Plus className="h-4 w-4" />
              Add Competition
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Competition</DialogTitle>
              <DialogDescription>Fill in the details for the new competition</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Competition Title</Label>
                <Input
                  id="title"
                  value={newCompetition.title}
                  onChange={(e) => setNewCompetition({ ...newCompetition, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  value={newCompetition.date}
                  onChange={(e) => setNewCompetition({ ...newCompetition, date: e.target.value })}
                  placeholder="e.g., June 15-20, 2025"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="format">Format</Label>
                <Input
                  id="format"
                  value={newCompetition.format}
                  onChange={(e) => setNewCompetition({ ...newCompetition, format: e.target.value })}
                  placeholder="e.g., Singles, Pairs, Fours"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entry_deadline">Entry Deadline</Label>
                <Input
                  id="entry_deadline"
                  value={newCompetition.entry_deadline}
                  onChange={(e) => setNewCompetition({ ...newCompetition, entry_deadline: e.target.value })}
                  placeholder="e.g., June 1, 2025"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newCompetition.status}
                  onValueChange={(value: "Upcoming" | "In Progress" | "Completed") =>
                    setNewCompetition({ ...newCompetition, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newCompetition.status === "Completed" && (
                <div className="grid gap-2">
                  <Label htmlFor="winner">Winner</Label>
                  <Input
                    id="winner"
                    value={newCompetition.winner || ""}
                    onChange={(e) => setNewCompetition({ ...newCompetition, winner: e.target.value })}
                    placeholder="e.g., John Smith & Mary Johnson"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCompetition.description}
                  onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Competition Image (Optional)</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                {selectedFile && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleAddCompetition} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Competition"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p>Loading competitions...</p>}

      <div className="grid gap-6">
        {competitions.map((competition) => (
          <Card key={competition.id}>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 relative">
                {competition.imageUrl ? (
                  <div className="relative h-48 md:h-full">
                    <Image
                      src={competition.imageUrl || "/placeholder.svg"}
                      alt={competition.title}
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
                      <CardTitle>{competition.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>{competition.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="h-4 w-4" />
                          <span>Format: {competition.format}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>Entry Deadline: {competition.entry_deadline}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditCompetition(competition)}
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteCompetition(competition.id)}
                        disabled={isLoading}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{competition.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        competition.status === "Upcoming"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : competition.status === "In Progress"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {competition.status}
                    </span>
                    {competition.winner && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        <span className="font-medium">Winner: {competition.winner}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Competition Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Competition</DialogTitle>
            <DialogDescription>Update the details for this competition</DialogDescription>
          </DialogHeader>
          {selectedCompetition && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Competition Title</Label>
                <Input
                  id="edit-title"
                  value={selectedCompetition.title}
                  onChange={(e) => setSelectedCompetition({ ...selectedCompetition, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  value={selectedCompetition.date}
                  onChange={(e) => setSelectedCompetition({ ...selectedCompetition, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-format">Format</Label>
                <Input
                  id="edit-format"
                  value={selectedCompetition.format}
                  onChange={(e) => setSelectedCompetition({ ...selectedCompetition, format: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-entry_deadline">Entry Deadline</Label>
                <Input
                  id="edit-entry_deadline"
                  value={selectedCompetition.entry_deadline}
                  onChange={(e) => setSelectedCompetition({ ...selectedCompetition, entry_deadline: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={selectedCompetition.status}
                  onValueChange={(value: "Upcoming" | "In Progress" | "Completed") =>
                    setSelectedCompetition({ ...selectedCompetition, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedCompetition.status === "Completed" && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-winner">Winner</Label>
                  <Input
                    id="edit-winner"
                    value={selectedCompetition.winner || ""}
                    onChange={(e) => setSelectedCompetition({ ...selectedCompetition, winner: e.target.value })}
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedCompetition.description}
                  onChange={(e) => setSelectedCompetition({ ...selectedCompetition, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Competition Image</Label>
                {selectedCompetition.imageUrl && (
                  <div className="relative h-40 mb-2">
                    <Image
                      src={selectedCompetition.imageUrl || "/placeholder.svg"}
                      alt={selectedCompetition.title}
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCompetition} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
