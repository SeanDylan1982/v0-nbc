import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check } from "lucide-react"

export default function MembersSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Membership</h2>
        <p className="text-muted-foreground">Join Northmead Bowls Club and become part of our friendly community</p>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Membership Info</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="join">How to Join</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Membership Categories</h3>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Full Playing Member</CardTitle>
                    <CardDescription>For active bowls players</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Annual Fee: R1,200</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Full access to bowling greens</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Eligible to enter all club competitions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Eligible for selection for league teams</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Full access to club facilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Voting rights at club meetings</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Social Member</CardTitle>
                    <CardDescription>For non-playing members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Annual Fee: R600</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Access to club facilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Participation in social events</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Limited bowling green access (social bowls only)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>No voting rights at club meetings</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Additional Information</h3>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>New to Bowls?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    New to the sport? No problem! We offer coaching for beginners and have equipment you can borrow
                    while you learn.
                  </p>
                  <p>
                    Our experienced coaches will teach you the basics and help you develop your skills in a friendly,
                    supportive environment.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Membership fees can be paid annually or in quarterly installments.</p>
                  <p className="mb-4">Payment can be made in person at the club or via bank transfer.</p>
                  <p>Pro-rata fees are available for members joining mid-season.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="benefits" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Member Benefits</h3>

              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Well-maintained Facilities</h4>
                        <p className="text-muted-foreground">
                          Access to our top-quality bowling greens and club facilities
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Coaching</h4>
                        <p className="text-muted-foreground">Free coaching sessions for members of all skill levels</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Social Events</h4>
                        <p className="text-muted-foreground">
                          Regular social events, including braais, dinners, and the weekly Joker Draw
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Competitions</h4>
                        <p className="text-muted-foreground">
                          Opportunity to participate in club, district, and national competitions
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Bar Facilities</h4>
                        <p className="text-muted-foreground">Access to our bar with competitive prices for members</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Community & Social</h3>

              <div className="relative h-48 rounded-lg overflow-hidden mb-6">
                <Image
                  src="/placeholder.svg?height=200&width=400"
                  alt="Club members socializing"
                  fill
                  className="object-cover"
                />
              </div>

              <Card>
                <CardContent className="pt-6">
                  <p className="mb-4">
                    Northmead Bowls Club is more than just a sports club - it's a community. Our members range from
                    competitive players to social bowlers and non-playing social members.
                  </p>
                  <p className="mb-4">
                    We pride ourselves on our friendly, welcoming atmosphere and the strong bonds formed between members
                    of all ages and backgrounds.
                  </p>
                  <p>
                    Whether you're looking to compete at a high level or simply enjoy a social game and make new
                    friends, Northmead Bowls Club has something for everyone.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="join" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-4">How to Join</h3>

              <Card>
                <CardContent className="pt-6">
                  <ol className="space-y-4 list-decimal pl-5">
                    <li>
                      <p className="font-medium">Visit the Club</p>
                      <p className="text-muted-foreground">
                        Come to the club during opening hours and speak to a committee member or the bar staff.
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Complete an Application Form</p>
                      <p className="text-muted-foreground">
                        Fill out a membership application form, which can be obtained at the club or downloaded from the
                        Documents section.
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Submit Your Application</p>
                      <p className="text-muted-foreground">
                        Return your completed form to the club secretary along with the appropriate membership fee.
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Approval Process</p>
                      <p className="text-muted-foreground">
                        Your application will be reviewed by the committee at their next meeting.
                      </p>
                    </li>
                    <li>
                      <p className="font-medium">Welcome to the Club!</p>
                      <p className="text-muted-foreground">
                        Once approved, you'll receive your membership card and welcome pack.
                      </p>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              <div className="mt-6">
                <h4 className="font-bold mb-2">Membership Enquiries</h4>
                <p>For more information about membership, please contact:</p>
                <p className="mt-2">
                  <span className="font-medium">Membership Secretary:</span> John Smith
                  <br />
                  <span className="font-medium">Phone:</span> 082 123 4567
                  <br />
                  <span className="font-medium">Email:</span> membership@northmeadbowls.co.za
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Try Before You Join</h3>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Free Introduction to Bowls</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Not sure if bowls is for you? We offer free introduction sessions where you can try the sport before
                    committing to membership.
                  </p>
                  <p>
                    These sessions are held every Saturday morning from 9:00 AM to 11:00 AM. All equipment is provided,
                    just wear flat-soled shoes.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Book an Introduction Session</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Do I need my own bowls?</h4>
                      <p className="text-muted-foreground">
                        No, we have club bowls available for beginners. Once you decide to continue with the sport, we
                        can advise on purchasing your own set.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">What should I wear?</h4>
                      <p className="text-muted-foreground">
                        For casual and social bowls, comfortable clothing and flat-soled shoes are sufficient. For
                        competitions, white or club colors are required.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Is there an age limit?</h4>
                      <p className="text-muted-foreground">
                        No, we welcome members of all ages. We have junior members as young as 12 and seniors well into
                        their 90s!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
