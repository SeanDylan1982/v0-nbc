"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Facebook, Mail, MapPin, Phone, CheckCircle } from "lucide-react"
import { createMessage } from "@/app/actions/messages"
import { toast } from "sonner"

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsSuccess(false)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await createMessage(formData)

      if (result.success) {
        toast.success(
          "Message sent successfully! Our administrator has been notified and will get back to you within 24-48 hours.",
        )

        // Clear form using multiple approaches to ensure it works
        if (formRef.current) {
          formRef.current.reset()

          // Explicitly clear each input and textarea
          const inputs = formRef.current.querySelectorAll("input, textarea")
          inputs.forEach((input: HTMLInputElement | HTMLTextAreaElement) => {
            input.value = ""
          })
        }

        // Show success message
        setIsSuccess(true)

        // Hide success message after 5 seconds
        setTimeout(() => {
          setIsSuccess(false)
        }, 5000)
      } else {
        toast.error(result.error || "Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Contact Us</h2>
        <p className="text-muted-foreground">Get in touch with Northmead Bowls Club</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <h4 className="font-medium text-green-800">Message Sent Successfully!</h4>
                    <p className="text-green-700 text-sm">
                      Thank you for contacting us. Our team will respond to your inquiry within 24-48 hours.
                    </p>
                  </div>
                </div>
              ) : null}

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      required
                      disabled={isSubmitting}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      required
                      disabled={isSubmitting}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required disabled={isSubmitting} autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" name="phone" type="tel" disabled={isSubmitting} autoComplete="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    disabled={isSubmitting}
                    placeholder="Please enter your message here..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-muted-foreground">011 849 7357</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-muted-foreground">
                      <a href="mailto:northmeadbowls@gmail.com" className="hover:underline">
                        northmeadbowls@gmail.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Address</h4>
                    <p className="text-muted-foreground">
                      Northmead Bowls Club
                      <br />
                      Cnr 8th Avenue & 3rd Street
                      <br />
                      Northmead, Benoni
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Facebook className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Social Media</h4>
                    <p className="text-muted-foreground">
                      <a
                        href="https://www.facebook.com/northmeadbowlsclub"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        facebook.com/northmeadbowlsclub
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opening Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>12:00 PM - 10:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday:</span>
                  <span>9:00 AM - 10:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday:</span>
                  <span>9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Public Holidays:</span>
                  <span>9:00 AM - 6:00 PM</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full-width Google Maps section */}
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Find Us</CardTitle>
            <CardDescription>Visit us at our location in Northmead, Benoni</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-96 w-full rounded-b-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3580.74078875561!2d28.3230499!3d-26.172570099999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e953da29acd7cd1%3A0x3459a38ab31a2210!2sNorthmead%20Bowling%20Club!5e0!3m2!1sen!2sza!4v1748882134560!5m2!1sen!2sza"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Northmead Bowls Club Location"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
