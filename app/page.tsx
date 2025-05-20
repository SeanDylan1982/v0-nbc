"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Calendar, Trophy, ImageIcon, FileText, Users, Info, Phone } from "lucide-react"
import HomeSection from "@/components/sections/home-section"
import EventsSection from "@/components/sections/events-section"
import CompetitionsSection from "@/components/sections/competitions-section"
import ResultsSection from "@/components/sections/results-section"
import GallerySection from "@/components/sections/gallery-section"
import DocumentsSection from "@/components/sections/documents-section"
import MembersSection from "@/components/sections/members-section"
import AboutSection from "@/components/sections/about-section"
import ContactSection from "@/components/sections/contact-section"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-9 mb-8">
          <TabsTrigger value="home" className="flex flex-col items-center gap-1 py-2">
            <Home className="h-4 w-4" />
            <span className="text-xs">Home</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex flex-col items-center gap-1 py-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Events</span>
          </TabsTrigger>
          <TabsTrigger value="competitions" className="flex flex-col items-center gap-1 py-2">
            <Trophy className="h-4 w-4" />
            <span className="text-xs">Competitions</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex flex-col items-center gap-1 py-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Results</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex flex-col items-center gap-1 py-2">
            <ImageIcon className="h-4 w-4" />
            <span className="text-xs">Gallery</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex flex-col items-center gap-1 py-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex flex-col items-center gap-1 py-2">
            <Users className="h-4 w-4" />
            <span className="text-xs">Members</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex flex-col items-center gap-1 py-2">
            <Info className="h-4 w-4" />
            <span className="text-xs">About</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex flex-col items-center gap-1 py-2">
            <Phone className="h-4 w-4" />
            <span className="text-xs">Contact</span>
          </TabsTrigger>
        </TabsList>
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-md p-6 min-h-[600px]">
          <TabsContent value="home">
            <HomeSection />
          </TabsContent>
          <TabsContent value="events">
            <EventsSection />
          </TabsContent>
          <TabsContent value="competitions">
            <CompetitionsSection />
          </TabsContent>
          <TabsContent value="results">
            <ResultsSection />
          </TabsContent>
          <TabsContent value="gallery">
            <GallerySection />
          </TabsContent>
          <TabsContent value="documents">
            <DocumentsSection />
          </TabsContent>
          <TabsContent value="members">
            <MembersSection />
          </TabsContent>
          <TabsContent value="about">
            <AboutSection />
          </TabsContent>
          <TabsContent value="contact">
            <ContactSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
