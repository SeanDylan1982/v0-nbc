"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
})

export default function AccountSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  })

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
        return
      }

      setUser(user)
      form.reset({
        fullName: user.user_metadata?.full_name || "",
        email: user.email || "",
      })
      setLoading(false)
    }

    getUser()
  }, [router, supabase.auth, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return

    setIsSaving(true)
    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: values.fullName,
        },
      })

      if (updateError) {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: updateError.message,
        })
        return
      }

      // Update user profile in the database
      const { error: profileError } = await supabase
        .from("users")
        .update({
          full_name: values.fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (profileError) {
        console.error("Error updating user profile:", profileError)
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>This is the name that will be displayed on your profile.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} disabled />
                    </FormControl>
                    <FormDescription>To change your email, please contact an administrator.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
