import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText } from "lucide-react"

export default function DocumentsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Documents</h2>
        <p className="text-muted-foreground">Important documents and forms for Northmead Bowls Club members</p>
      </div>

      <Tabs defaultValue="club" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="club">Club Documents</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
        </TabsList>

        <TabsContent value="club" className="mt-6">
          <div className="grid gap-4">
            <DocumentCard
              title="Club Constitution"
              description="The official constitution of Northmead Bowls Club"
              fileType="PDF"
              fileSize="245 KB"
              downloadUrl="#"
            />

            <DocumentCard
              title="Club Rules"
              description="Rules and regulations for club members"
              fileType="PDF"
              fileSize="180 KB"
              downloadUrl="#"
            />

            <DocumentCard
              title="Committee Members"
              description="List of current committee members and their roles"
              fileType="PDF"
              fileSize="120 KB"
              downloadUrl="#"
            />

            <DocumentCard
              title="Club Calendar 2025"
              description="Calendar of events for the 2025 season"
              fileType="PDF"
              fileSize="350 KB"
              downloadUrl="#"
            />
          </div>
        </TabsContent>

        <TabsContent value="membership" className="mt-6">
          <div className="grid gap-4">
            <DocumentCard
              title="Membership Application Form"
              description="Form for new membership applications"
              fileType="PDF"
              fileSize="150 KB"
              downloadUrl="#"
            />

            <DocumentCard
              title="Membership Renewal Form"
              description="Form for annual membership renewal"
              fileType="PDF"
              fileSize="140 KB"
              downloadUrl="#"
            />

            <DocumentCard
              title="Membership Fees 2025"
              description="Schedule of membership fees for the 2025 season"
              fileType="PDF"
              fileSize="95 KB"
              downloadUrl="#"
            />
          </div>
        </TabsContent>

        <TabsContent value="competitions" className="mt-6">
          <div className="grid gap-4">
            <DocumentCard
              title="Competition Entry Form"
              description="Form for entering club competitions"
              fileType="PDF"
              fileSize="130 KB"
              downloadUrl="#"
            />

            <DocumentCard
              title="Competition Rules"
              description="Rules for club competitions"
              fileType="PDF"
              fileSize="210 KB"
              downloadUrl="#"
            />

            <DocumentCard
              title="League Schedule 2025"
              description="Schedule of league matches for the 2025 season"
              fileType="PDF"
              fileSize="180 KB"
              downloadUrl="#"
            />
          </div>
        </TabsContent>

        <TabsContent value="newsletters" className="mt-6">
          <div className="grid gap-4">
            <DocumentCard
              title="Newsletter - May 2025"
              description="Monthly newsletter for May 2025"
              fileType="PDF"
              fileSize="420 KB"
              downloadUrl="#"
            />

            <DocumentCard
              title="Newsletter - April 2025"
              description="Monthly newsletter for April 2025"
              fileType="PDF"
              fileSize="385 KB"
              downloadUrl="#"
            />

            <DocumentCard
              title="Newsletter - March 2025"
              description="Monthly newsletter for March 2025"
              fileType="PDF"
              fileSize="410 KB"
              downloadUrl="#"
            />

            <DocumentCard
              title="Newsletter Archive"
              description="Archive of past newsletters"
              fileType="ZIP"
              fileSize="4.2 MB"
              downloadUrl="#"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface DocumentCardProps {
  title: string
  description: string
  fileType: string
  fileSize: string
  downloadUrl: string
}

function DocumentCard({ title, description, fileType, fileSize, downloadUrl }: DocumentCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{fileType}</span>
            <span>•</span>
            <span>{fileSize}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <a href={downloadUrl} className="flex items-center gap-2 text-primary hover:underline">
          <Download className="h-4 w-4" />
          Download
        </a>
      </CardContent>
    </Card>
  )
}
