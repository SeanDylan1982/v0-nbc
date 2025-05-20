import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AboutSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">About Us</h2>
        <p className="text-muted-foreground">Learn more about Northmead Bowls Club, our history, and our committee</p>
      </div>

      <Tabs defaultValue="club" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="club">Our Club</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="committee">Committee</TabsTrigger>
        </TabsList>

        <TabsContent value="club" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="relative h-64 rounded-lg overflow-hidden mb-6">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  alt="Northmead Bowls Club"
                  fill
                  className="object-cover"
                />
              </div>

              <Card>
                <CardContent className="pt-6">
                  <p className="mb-4">
                    Northmead Bowls Club is a friendly, community-oriented lawn bowls club located in Benoni, Gauteng.
                    Established in 1952, we have a long history of promoting the sport of lawn bowls in the East Rand.
                  </p>
                  <p className="mb-4">
                    Our club features two well-maintained bowling greens, a comfortable clubhouse with bar facilities,
                    and a function hall that can be hired for private events.
                  </p>
                  <p>
                    We pride ourselves on our welcoming atmosphere and cater to bowlers of all ages and skill levels,
                    from beginners to competitive players.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Club Facilities</h3>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Bowling Greens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Two high-quality bowling greens, maintained to excellent standards. Our greens are open for play
                      throughout the year, weather permitting.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Clubhouse & Bar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Our clubhouse features a well-stocked bar with competitive prices, comfortable seating areas, and
                      changing facilities. The bar is open daily from 12:00 PM to late.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Function Hall</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Our function hall is available for hire for private events, including birthdays, anniversaries,
                      and corporate functions. The hall can accommodate up to 100 people.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Parking & Security</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Ample secure parking is available on the premises, with security personnel on duty during club
                      operating hours.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Our History</h3>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Founding Years (1952-1960)</h4>
                      <p className="text-muted-foreground">
                        Northmead Bowls Club was established in 1952 by a group of local bowls enthusiasts. The club
                        initially had one green and a small clubhouse. The founding members worked tirelessly to
                        establish the club as a fixture in the local community.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium">Growth Period (1960-1980)</h4>
                      <p className="text-muted-foreground">
                        During this period, the club experienced significant growth in membership. A second green was
                        added in 1965, and the clubhouse was expanded in 1972 to accommodate the growing membership. The
                        club began to make its mark in district competitions.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium">Modern Era (1980-Present)</h4>
                      <p className="text-muted-foreground">
                        The club continued to evolve, with major renovations to the clubhouse in 1995 and again in 2010.
                        The greens were upgraded to modern standards in 2005. Today, Northmead Bowls Club is a thriving
                        community with a mix of competitive and social bowlers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Club Achievements</h3>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    <li className="border-b pb-2">
                      <p className="font-medium">District Champions</p>
                      <p className="text-muted-foreground">Men's Fours: 1975, 1982, 1998, 2010, 2018</p>
                    </li>
                    <li className="border-b pb-2">
                      <p className="font-medium">District Champions</p>
                      <p className="text-muted-foreground">Women's Pairs: 1980, 1995, 2005, 2015</p>
                    </li>
                    <li className="border-b pb-2">
                      <p className="font-medium">League Champions</p>
                      <p className="text-muted-foreground">Men's Saturday League: 2000, 2005, 2012, 2020</p>
                    </li>
                    <li>
                      <p className="font-medium">National Representatives</p>
                      <p className="text-muted-foreground">John Smith (1985-1990), Mary Johnson (2000-2005)</p>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  alt="Historical photo of Northmead Bowls Club"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="committee" className="mt-6">
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Current Committee (2025)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CommitteeMemberCard
                name="John Smith"
                position="President"
                image="/placeholder.svg?height=200&width=200"
                contact="president@northmeadbowls.co.za"
                phone="082 123 4567"
              />

              <CommitteeMemberCard
                name="Mary Johnson"
                position="Vice President"
                image="/placeholder.svg?height=200&width=200"
                contact="vicepresident@northmeadbowls.co.za"
                phone="083 234 5678"
              />

              <CommitteeMemberCard
                name="David Brown"
                position="Secretary"
                image="/placeholder.svg?height=200&width=200"
                contact="secretary@northmeadbowls.co.za"
                phone="084 345 6789"
              />

              <CommitteeMemberCard
                name="Sarah Wilson"
                position="Treasurer"
                image="/placeholder.svg?height=200&width=200"
                contact="treasurer@northmeadbowls.co.za"
                phone="085 456 7890"
              />

              <CommitteeMemberCard
                name="Michael Davis"
                position="Club Captain (Men)"
                image="/placeholder.svg?height=200&width=200"
                contact="mencaptain@northmeadbowls.co.za"
                phone="086 567 8901"
              />

              <CommitteeMemberCard
                name="Elizabeth Taylor"
                position="Club Captain (Women)"
                image="/placeholder.svg?height=200&width=200"
                contact="womencaptain@northmeadbowls.co.za"
                phone="087 678 9012"
              />

              <CommitteeMemberCard
                name="Robert Johnson"
                position="Greens Manager"
                image="/placeholder.svg?height=200&width=200"
                contact="greens@northmeadbowls.co.za"
                phone="088 789 0123"
              />

              <CommitteeMemberCard
                name="Emma Thompson"
                position="Social Coordinator"
                image="/placeholder.svg?height=200&width=200"
                contact="social@northmeadbowls.co.za"
                phone="089 890 1234"
              />

              <CommitteeMemberCard
                name="James Wilson"
                position="Bar Manager"
                image="/placeholder.svg?height=200&width=200"
                contact="bar@northmeadbowls.co.za"
                phone="080 901 2345"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface CommitteeMemberCardProps {
  name: string
  position: string
  image: string
  contact: string
  phone: string
}

function CommitteeMemberCard({ name, position, image, contact, phone }: CommitteeMemberCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
            <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
          </div>
          <h4 className="font-bold text-lg">{name}</h4>
          <p className="text-primary font-medium mb-2">{position}</p>
          <p className="text-sm text-muted-foreground">{contact}</p>
          <p className="text-sm text-muted-foreground">{phone}</p>
        </div>
      </CardContent>
    </Card>
  )
}
