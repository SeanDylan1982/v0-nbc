"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, X, ExternalLink, Eye } from "lucide-react"
import { getDocumentsByCategory, type Document } from "@/app/actions/documents"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function DocumentsSection() {
  const [clubDocuments, setClubDocuments] = useState<Document[]>([])
  const [membershipDocuments, setMembershipDocuments] = useState<Document[]>([])
  const [competitionsDocuments, setCompetitionsDocuments] = useState<Document[]>([])
  const [newslettersDocuments, setNewslettersDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState({
    club: true,
    membership: true,
    competitions: true,
    newsletters: true,
  })
  const [activeTab, setActiveTab] = useState("club")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  useEffect(() => {
    async function loadDocuments(category: string) {
      try {
        const documents = await getDocumentsByCategory(category)

        switch (category) {
          case "club":
            setClubDocuments(documents)
            setLoading((prev) => ({ ...prev, club: false }))
            break
          case "membership":
            setMembershipDocuments(documents)
            setLoading((prev) => ({ ...prev, membership: false }))
            break
          case "competitions":
            setCompetitionsDocuments(documents)
            setLoading((prev) => ({ ...prev, competitions: false }))
            break
          case "newsletters":
            setNewslettersDocuments(documents)
            setLoading((prev) => ({ ...prev, newsletters: false }))
            break
        }
      } catch (error) {
        console.error(`Error loading ${category} documents:`, error)
        setLoading((prev) => ({ ...prev, [category]: false }))
      }
    }

    // Load documents for the active tab first
    loadDocuments(activeTab)

    // Then load the rest
    const categories = ["club", "membership", "competitions", "newsletters"]
    categories
      .filter((cat) => cat !== activeTab)
      .forEach((category) => {
        loadDocuments(category)
      })
  }, [activeTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
    setIsViewerOpen(true)
  }

  const handleCloseViewer = () => {
    setIsViewerOpen(false)
    setSelectedDocument(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Documents</h2>
        <p className="text-muted-foreground">Important documents and forms for Northmead Bowls Club members</p>
      </div>

      <Tabs defaultValue="club" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="club">Club Documents</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
        </TabsList>

        <TabsContent value="club" className="mt-6">
          <div className="grid gap-4">
            {loading.club ? (
              Array(3)
                .fill(0)
                .map((_, i) => <DocumentCardSkeleton key={i} />)
            ) : clubDocuments.length > 0 ? (
              clubDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} onView={() => handleViewDocument(document)} />
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground">No club documents available.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="membership" className="mt-6">
          <div className="grid gap-4">
            {loading.membership ? (
              Array(3)
                .fill(0)
                .map((_, i) => <DocumentCardSkeleton key={i} />)
            ) : membershipDocuments.length > 0 ? (
              membershipDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} onView={() => handleViewDocument(document)} />
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground">No membership documents available.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="competitions" className="mt-6">
          <div className="grid gap-4">
            {loading.competitions ? (
              Array(3)
                .fill(0)
                .map((_, i) => <DocumentCardSkeleton key={i} />)
            ) : competitionsDocuments.length > 0 ? (
              competitionsDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} onView={() => handleViewDocument(document)} />
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground">No competition documents available.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="newsletters" className="mt-6">
          <div className="grid gap-4">
            {loading.newsletters ? (
              Array(3)
                .fill(0)
                .map((_, i) => <DocumentCardSkeleton key={i} />)
            ) : newslettersDocuments.length > 0 ? (
              newslettersDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} onView={() => handleViewDocument(document)} />
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground">No newsletter documents available.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Viewer Modal */}
      <DocumentViewerModal document={selectedDocument} isOpen={isViewerOpen} onClose={handleCloseViewer} />
    </div>
  )
}

interface DocumentCardProps {
  document: Document
  onView: () => void
}

function DocumentCard({ document, onView }: DocumentCardProps) {
  const [downloadUrl, setDownloadUrl] = useState<string>("")

  useEffect(() => {
    async function getDownloadUrl() {
      try {
        const supabase = createClientSupabaseClient()
        const { data } = supabase.storage.from("documents").getPublicUrl(document.file_path)
        setDownloadUrl(data.publicUrl)
      } catch (error) {
        console.error("Error getting download URL:", error)
      }
    }

    if (document.file_path) {
      getDownloadUrl()
    }
  }, [document.file_path])

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle
              className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
              onClick={onView}
            >
              <FileText className="h-5 w-5 text-primary" />
              {document.title}
            </CardTitle>
            <CardDescription>{document.description}</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{document.filetype}</span>
            <span>•</span>
            <span>{document.filesize}</span>
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
          <div className="flex items-center gap-3">
            <button
              onClick={onView}
              className="flex items-center gap-2 text-primary hover:underline"
              aria-label={`View ${document.title}`}
            >
              <Eye className="h-4 w-4" />
              View
            </button>
            <a
              href={downloadUrl}
              className="flex items-center gap-2 text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Download ${document.title}`}
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DocumentViewerModalProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
}

function DocumentViewerModal({ document, isOpen, onClose }: DocumentViewerModalProps) {
  const [documentUrl, setDocumentUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function getDocumentUrl() {
      if (!document) return

      try {
        const supabase = createClientSupabaseClient()
        const { data } = supabase.storage.from("documents").getPublicUrl(document.file_path)
        setDocumentUrl(data.publicUrl)
        setIsLoading(true)
        // Reset loading after a short delay to allow viewers to initialize
        const timer = setTimeout(() => setIsLoading(false), 1500)
        return () => clearTimeout(timer)
      } catch (error) {
        console.error("Error getting document URL:", error)
        setIsLoading(false)
      }
    }

    if (document && isOpen) {
      getDocumentUrl()
    }
  }, [document, isOpen])

  if (!document) return null

  // Get file extension from filetype or from file path
  const fileExt = document.filetype.toLowerCase()

  // Determine file type categories
  const isPDF = fileExt === "pdf"
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExt)
  const isText = ["txt", "md", "csv"].includes(fileExt)
  const isOffice = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExt)

  // Choose the best viewer based on file type
  let viewerUrl = documentUrl

  // For office documents, use Google Docs Viewer
  if (isOffice) {
    viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {document.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
                Open in new tab
              </a>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{document.description}</p>
        </DialogHeader>

        <div className="flex-1 min-h-0 p-6 pt-2">
          {/* Loading indicator */}
          {isLoading && (
            <div className="w-full h-[70vh] flex flex-col items-center justify-center border rounded-lg bg-muted/50">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading document preview...</p>
            </div>
          )}

          {/* Document viewer */}
          {!isLoading && (
            <div className="w-full h-[70vh] border rounded-lg overflow-hidden">
              {/* PDF Viewer */}
              {isPDF && (
                <iframe
                  src={`${documentUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full"
                  title={document.title}
                />
              )}

              {/* Image Viewer */}
              {isImage && (
                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                  <img
                    src={documentUrl || "/placeholder.svg"}
                    alt={document.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              {/* Text Viewer */}
              {isText && <iframe src={documentUrl} className="w-full h-full" title={document.title} />}

              {/* Office Documents - Use Google Docs Viewer */}
              {isOffice && <iframe src={viewerUrl} className="w-full h-full" title={document.title} />}

              {/* Fallback for unsupported file types */}
              {!isPDF && !isImage && !isText && !isOffice && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Preview not available</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    This file type ({document.filetype}) cannot be previewed in the browser.
                  </p>
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    Download to view
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DocumentCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="w-full">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  )
}
