import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Trophy } from "lucide-react"

export default function ResultsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Results</h2>
        <p className="text-muted-foreground">Latest results from competitions and events at Northmead Bowls Club</p>
      </div>

      <Tabs defaultValue="competitions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="league">League Matches</TabsTrigger>
          <TabsTrigger value="joker">Joker Draw</TabsTrigger>
        </TabsList>

        <TabsContent value="competitions" className="mt-6">
          <div className="grid gap-6">
            <ResultCard
              title="Veterans Tournament"
              date="March 15-16, 2025"
              results={[
                { position: "1st", name: "John Smith & Mary Johnson" },
                { position: "2nd", name: "David Brown & Sarah Wilson" },
                { position: "3rd", name: "Michael Davis & Elizabeth Taylor" },
              ]}
            />

            <ResultCard
              title="Novice Singles"
              date="February 20-21, 2025"
              results={[
                { position: "1st", name: "James Wilson" },
                { position: "2nd", name: "Emma Thompson" },
                { position: "3rd", name: "Robert Johnson" },
              ]}
            />

            <ResultCard
              title="Club Championships 2024"
              date="November 10-15, 2024"
              results={[
                { position: "Singles Winner", name: "Peter Anderson" },
                { position: "Pairs Winners", name: "John Smith & Mary Johnson" },
                { position: "Fours Winners", name: "Team Wilson" },
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="league" className="mt-6">
          <div className="grid gap-6">
            <ResultCard
              title="League Match vs Benoni Country Club"
              date="April 20, 2025"
              results={[
                { position: "Final Score", name: "Northmead 72 - 68 Benoni" },
                { position: "Rink 1", name: "Northmead 21 - 15 Benoni" },
                { position: "Rink 2", name: "Northmead 18 - 20 Benoni" },
                { position: "Rink 3", name: "Northmead 16 - 18 Benoni" },
                { position: "Rink 4", name: "Northmead 17 - 15 Benoni" },
              ]}
            />

            <ResultCard
              title="League Match vs Boksburg"
              date="April 6, 2025"
              results={[
                { position: "Final Score", name: "Northmead 65 - 70 Boksburg" },
                { position: "Rink 1", name: "Northmead 18 - 16 Boksburg" },
                { position: "Rink 2", name: "Northmead 14 - 22 Boksburg" },
                { position: "Rink 3", name: "Northmead 17 - 15 Boksburg" },
                { position: "Rink 4", name: "Northmead 16 - 17 Boksburg" },
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="joker" className="mt-6">
          <div className="grid gap-6">
            <ResultCard
              title="Joker Draw - May 10, 2025"
              date="May 10, 2025"
              results={[
                { position: "Winner", name: "Mary Johnson - R5,000" },
                { position: "Card Drawn", name: "Jack of Hearts" },
                { position: "Jackpot Next Week", name: "R10,000" },
              ]}
            />

            <ResultCard
              title="Joker Draw - May 3, 2025"
              date="May 3, 2025"
              results={[
                { position: "Winner", name: "David Brown - R500" },
                { position: "Card Drawn", name: "10 of Clubs" },
                { position: "Jackpot Next Week", name: "R5,000" },
              ]}
            />

            <ResultCard
              title="Joker Draw - April 26, 2025"
              date="April 26, 2025"
              results={[
                { position: "Winner", name: "Sarah Wilson - R500" },
                { position: "Card Drawn", name: "2 of Diamonds" },
                { position: "Jackpot Next Week", name: "R4,500" },
              ]}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ResultCardProps {
  title: string
  date: string
  results: { position: string; name: string }[]
}

function ResultCard({ title, date, results }: ResultCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </div>
          </div>
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {results.map((result, index) => (
            <li key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
              <span className="font-medium">{result.position}</span>
              <span>{result.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
