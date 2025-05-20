import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Trophy, Users } from "lucide-react"

export default function CompetitionsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Competitions</h2>
        <p className="text-muted-foreground">
          Information about upcoming and ongoing competitions at Northmead Bowls Club
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid gap-6">
            <CompetitionCard
              title="Club Championships"
              date="June 15-20, 2025"
              format="Singles, Pairs, Fours"
              entryDeadline="June 1, 2025"
              description="Annual club championships to determine the best players in singles, pairs, and fours formats."
            />

            <CompetitionCard
              title="District Tournament"
              date="July 10-12, 2025"
              format="Fours"
              entryDeadline="June 25, 2025"
              description="District-level tournament with teams from various clubs competing."
            />

            <CompetitionCard
              title="Northmead Open"
              date="August 5-7, 2025"
              format="Pairs"
              entryDeadline="July 20, 2025"
              description="Open tournament welcoming players from all clubs. Cash prizes for winners."
            />
          </div>
        </TabsContent>

        <TabsContent value="ongoing" className="mt-6">
          <div className="grid gap-6">
            <CompetitionCard
              title="League Matches"
              date="April - September 2025"
              format="Fours"
              entryDeadline="Closed"
              description="Ongoing league matches against other clubs in the district."
              status="In Progress"
            />
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="grid gap-6">
            <CompetitionCard
              title="Veterans Tournament"
              date="March 15-16, 2025"
              format="Pairs"
              entryDeadline="Closed"
              description="Tournament for veteran players (60+ years)."
              status="Completed"
              winner="John Smith & Mary Johnson"
            />

            <CompetitionCard
              title="Novice Singles"
              date="February 20-21, 2025"
              format="Singles"
              entryDeadline="Closed"
              description="Tournament for players with less than 3 years of experience."
              status="Completed"
              winner="James Wilson"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface CompetitionCardProps {
  title: string
  date: string
  format: string
  entryDeadline: string
  description: string
  status?: "Upcoming" | "In Progress" | "Completed"
  winner?: string
}

function CompetitionCard({
  title,
  date,
  format,
  entryDeadline,
  description,
  status = "Upcoming",
  winner,
}: CompetitionCardProps) {
  const statusColors = {
    Upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "In Progress": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Users className="h-4 w-4" />
                <span>Format: {format}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4" />
                <span>Entry Deadline: {entryDeadline}</span>
              </div>
            </CardDescription>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>{status}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-2">{description}</p>
        {winner && (
          <div className="mt-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="font-medium">Winner: {winner}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
