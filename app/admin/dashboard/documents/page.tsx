"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Download, Edit, FileText, Plus, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadDocumentFile,
  type Document,
  type NewDocument,
} from "@/app/actions/documents"
import { createClientSupabaseClient } from "@/lib/supabase"

export default function DocumentsAdminPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [newDocument, setNewDocument] = useState<Omit<NewDocument, "file_path">>({
    title: "",
    description: "",
    filetype: "PDF",
    filesize: "",
    category: "club",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const data = await getDocuments()
        setDocuments(data)
      } catch (error) {
        console.error("Failed to load documents:", error)
        toast({
          title: "Error",
          description: "Failed to load documents. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDocuments()
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Update file type and size in the form
      const fileExt = file.name.split(".").pop()?.toUpperCase() || "PDF"
      const fileSizeKB = Math.round(file.size / 1024)
      setNewDocument({
        ...newDocument,
        filetype: fileExt,
        filesize: `${fileSizeKB} KB`,
      })
    }
  }

  const handleAddDocument = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Upload the file first
      const { file_path } = await uploadDocumentFile(selectedFile)

      // Then create the document record
      const createdDocument = await createDocument({
        ...newDocument,
        file_path,
      })

      setDocuments([createdDocument, ...documents])
      setNewDocument({
        title: "",
        description: "",
        filetype: "PDF",
        filesize: "",
        category: "club",
      })
      setSelectedFile(null)
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Document added successfully!",
      })
    } catch (error) {
      console.error("Failed to add document:", error)
      toast({
        title: "Error",
        description: "Failed to add document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document)
    setIsEditDialogOpen(true)
  }

  const handleUpdateDocument = async () => {
    if (!selectedDocument) return

    try {
      setIsLoading(true)

      // Handle file upload if a new file is selected
      if (selectedFile) {
        const { file_path } = await uploadDocumentFile(selectedFile)
        selectedDocument.file_path = file_path
      }

      const updatedDocument = await updateDocument(selectedDocument.id, selectedDocument)
      setDocuments(documents.map((doc) => (doc.id === updatedDocument.id ? updatedDocument : doc)))
      setIsEditDialogOpen(false)
      setSelectedFile(null)
      toast({
        title: "Success",
        description: "Document updated successfully!",
      })
    } catch (error) {
      console.error("Failed to update document:", error)
      toast({
        title: "Error",
        description: "Failed to update document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      setIsLoading(true)
      await deleteDocument(id)
      setDocuments(documents.filter((doc) => doc.id !== id))
      toast({
        title: "Success",
        description: "Document deleted successfully!",
      })
    } catch (error) {
      console.error("Failed to delete document:", error)
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDownloadUrl = (filePath: string) => {
    try {
      const supabase = createClientSupabaseClient()
      const { data } = supabase.storage.from("documents").getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error("Error getting download URL:", error)
      return "#"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage documents for Northmead Bowls Club</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={isLoading}>
              <Plus className="h-4 w-4" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Document</DialogTitle>
              <DialogDescription>Upload a new document to the club website</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">Upload File</Label>
                <Input id="file" type="file" onChange={handleFileChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newDocument.category}
                  onValueChange={(value) => setNewDocument({ ...newDocument, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="club">Club Documents</SelectItem>
                    <SelectItem value="membership">Membership</SelectItem>
                    <SelectItem value="competitions">Competitions</SelectItem>
                    <SelectItem value="newsletters">Newsletters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="filetype">File Type</Label>
                  <Input
                    id="filetype"
                    value={newDocument.filetype}
                    onChange={(e) => setNewDocument({ ...newDocument, filetype: e.target.value })}
                    disabled={!!selectedFile}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filesize">File Size</Label>
                  <Input
                    id="filesize"
                    value={newDocument.filesize}
                    onChange={(e) => setNewDocument({ ...newDocument, filesize: e.target.value })}
                    disabled={!!selectedFile}
                    placeholder="e.g., 245 KB"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleAddDocument} disabled={isLoading || (!selectedFile && !newDocument.title)}>
                {isLoading ? "Adding..." : "Add Document"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && documents.length === 0 && <p>Loading documents...</p>}

      <div className="grid gap-4">
        {documents.map((document) => (
          <Card key={document.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {document.title}
                  </CardTitle>
                  <CardDescription>{document.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>{document.filetype}</span>
                    <span>•</span>
                    <span>{document.filesize}</span>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditDocument(document)}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteDocument(document.id)}
                      disabled={isLoading}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    document.category === "club"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      : document.category === "membership"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : document.category === "competitions"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                  }`}
                >
                  {document.category.charAt(0).toUpperCase() + document.category.slice(1)}
                </span>
                <a
                  href={getDownloadUrl(document.file_path)}
                  className="flex items-center gap-2 text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>Update the details for this document</DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-file">Replace File (Optional)</Label>
                <Input id="edit-file" type="file" onChange={handleFileChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Document Title</Label>
                <Input
                  id="edit-title"
                  value={selectedDocument.title}
                  onChange={(e) => setSelectedDocument({ ...selectedDocument, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={selectedDocument.description}
                  onChange={(e) => setSelectedDocument({ ...selectedDocument, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={selectedDocument.category}
                  onValueChange={(value) => setSelectedDocument({ ...selectedDocument, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="club">Club Documents</SelectItem>
                    <SelectItem value="membership">Membership</SelectItem>
                    <SelectItem value="competitions">Competitions</SelectItem>
                    <SelectItem value="newsletters">Newsletters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-filetype">File Type</Label>
                  <Input
                    id="edit-filetype"
                    value={selectedDocument.filetype}
                    onChange={(e) => setSelectedDocument({ ...selectedDocument, filetype: e.target.value })}
                    disabled={!!selectedFile}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-filesize">File Size</Label>
                  <Input
                    id="edit-filesize"
                    value={selectedDocument.filesize}
                    onChange={(e) => setSelectedDocument({ ...selectedDocument, filesize: e.target.value })}
                    disabled={!!selectedFile}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDocument} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
