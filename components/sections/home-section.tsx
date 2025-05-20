import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Trophy, Users } from "lucide-react"
import { HeroCarousel } from "@/components/hero-carousel"

export default function HomeSection() {
  return (
    <div className="space-y-8">
      <HeroCarousel />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="border-b pb-2">
                <p className="font-medium">Joker Draw</p>
                <p className="text-sm text-muted-foreground">Every Friday @ 7:00 PM</p>
              </li>
              <li className="border-b pb-2">
                <p className="font-medium">Club Competition</p>
                <p className="text-sm text-muted-foreground">June 15, 2025 @ 9:00 AM</p>
              </li>
              <li>
                <p className="font-medium">Social Bowls</p>
                <p className="text-sm text-muted-foreground">Every Wednesday @ 2:00 PM</p>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#events">View All Events</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Latest Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="border-b pb-2">
                <p className="font-medium">Club Championships</p>
                <p className="text-sm text-muted-foreground">Winner: John Smith</p>
              </li>
              <li className="border-b pb-2">
                <p className="font-medium">District Tournament</p>
                <p className="text-sm text-muted-foreground">Northmead Team: 2nd Place</p>
              </li>
              <li>
                <p className="font-medium">Joker Draw Winner</p>
                <p className="text-sm text-muted-foreground">Last Week: R5,000 - Mary Johnson</p>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#results">View All Results</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Membership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Join our friendly club! We offer:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Full playing membership</li>
              <li>Social membership</li>
              <li>Coaching for beginners</li>
              <li>Club facilities access</li>
              <li>Regular social events</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#members">Membership Info</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-primary/10 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Weekly Joker Draw</h2>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="md:w-1/2">
            <Image
              src="/placeholder.svg?height=300&width=400"
              alt="Joker Draw"
              width={400}
              height={300}
              className="rounded-lg"
            />
          </div>
          <div className="md:w-1/2">
            <p className="mb-4">
              Join us every Friday night for our popular Joker Draw! The jackpot currently stands at{" "}
              <strong>R10,000</strong>.
            </p>
            <p className="mb-4">
              Purchase tickets at the bar, enjoy drinks and snacks, and be present at the 7:00 PM draw for your chance
              to win!
            </p>
            <Button asChild>
              <Link href="#events">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
