"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { importImageFromUrl } from "@/app/actions/import-images"
import { Loader2, Upload } from "lucide-react"

export default function ImportImagesPage() {
  const [imageUrls, setImageUrls] = useState<string>("")
  const [category, setCategory] = useState<string>("club")
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 })
  const { toast } = useToast()

  const handleImport = async () => {
    // Split the URLs by newline and filter out empty lines
    const urls = imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0)

    if (urls.length === 0) {
      toast({
        title: "No URLs provided",
        description: "Please enter at least one image URL to import.",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    setProgress({ current: 0, total: urls.length, success: 0, failed: 0 })

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      setProgress((prev) => ({ ...prev, current: i + 1 }))

      try {
        // Use the server action to import the image
        const result = await importImageFromUrl(url, category)

        if (result.success) {
          setProgress((prev) => ({ ...prev, success: prev.success + 1 }))
        } else {
          console.error(`Error importing image from ${url}:`, result.message)
          setProgress((prev) => ({ ...prev, failed: prev.failed + 1 }))
        }
      } catch (error) {
        console.error(`Error importing image from ${url}:`, error)
        setProgress((prev) => ({ ...prev, failed: prev.failed + 1 }))
      }
    }

    setIsImporting(false)
    toast({
      title: "Import completed",
      description: `Successfully imported ${progress.success} images. Failed: ${progress.failed}.`,
      variant: progress.failed > 0 ? "destructive" : "default",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Images</h1>
        <p className="text-muted-foreground">Import images from the Northmead Bowls Club website</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import from URLs</CardTitle>
          <CardDescription>
            Enter the URLs of images from the Northmead Bowls Club website, one per line
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Image Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="competitions">Competitions</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="historical">Historical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image-urls">Image URLs (one per line)</Label>
            <Textarea
              id="image-urls"
              placeholder="https://www.northmeadbowls.co.za/images/example.jpg"
              rows={10}
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              disabled={isImporting}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              {isImporting && (
                <div className="text-sm text-muted-foreground">
                  Importing {progress.current} of {progress.total} images...
                  <br />
                  Success: {progress.success}, Failed: {progress.failed}
                </div>
              )}
            </div>
            <Button onClick={handleImport} disabled={isImporting || !imageUrls.trim()}>
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Images
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">How to import images from the Northmead Bowls Club website:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Visit the Northmead Bowls Club website at{" "}
                <a
                  href="https://www.northmeadbowls.co.za/information.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  https://www.northmeadbowls.co.za/information.htm
                </a>
              </li>
              <li>Right-click on an image and select "Copy Image Address" or "Copy Image Link"</li>
              <li>Paste the URL into the text area above (one URL per line)</li>
              <li>Select the appropriate category for the images</li>
              <li>Click "Import Images" to start the import process</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Example URLs from the website:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>https://www.northmeadbowls.co.za/images/clubhouse.jpg</li>
              <li>https://www.northmeadbowls.co.za/images/green.jpg</li>
              <li>https://www.northmeadbowls.co.za/images/bar.jpg</li>
              <li>https://www.northmeadbowls.co.za/images/entrance.jpg</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Troubleshooting:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <strong>Image not found errors:</strong> Make sure the URL is correct and the image exists on the
                website. Try opening the URL directly in your browser to verify.
              </li>
              <li>
                <strong>CORS errors:</strong> Our server-side approach should handle CORS issues, but if you encounter
                problems, try using a proxy service or download the images manually and upload them through the Gallery
                management page.
              </li>
              <li>
                <strong>Timeout errors:</strong> If the image is very large or the server is slow to respond, the import
                might time out. Try importing fewer images at a time.
              </li>
              <li>
                <strong>Alternative approach:</strong> If you continue to have issues, you can download the images
                manually to your computer and then upload them through the Gallery management page.
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-md text-amber-800 dark:text-amber-300 text-sm">
            <p className="font-medium">Note:</p>
            <p>
              Make sure you have permission to use these images on your new website. Since you are rebuilding the
              Northmead Bowls Club website, this should be fine, but it's always good practice to ensure you have the
              rights to use any images.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
