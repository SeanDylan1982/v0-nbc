"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { EmailVerificationModal } from "./email-verification-modal"

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      console.log("Starting signup process...")

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      })

      console.log("Auth response:", { authData, authError })

      if (authError) {
        console.error("Auth error:", authError)
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: authError.message,
        })
        return
      }

      if (!authData.user) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: "Failed to create user account",
        })
        return
      }

      // Create user profile
      try {
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: authData.user.id,
            email: values.email,
            full_name: values.fullName,
          },
        ])

        if (profileError) {
          console.error("Profile creation error:", profileError)
        } else {
          console.log("Profile created successfully")
        }
      } catch (profileErr) {
        console.error("Profile creation exception:", profileErr)
      }

      // Check if email confirmation is required
      if (!authData.session && authData.user && !authData.user.email_confirmed_at) {
        // Show email verification modal
        setUserEmail(values.email)
        setShowEmailVerification(true)

        // Reset form
        form.reset()

        // Close the auth dialog
        onSuccess()
      } else {
        // User is immediately signed in (email confirmation disabled)
        toast({
          title: "Account created successfully!",
          description: "Welcome to Northmead Bowls Club!",
        })

        // Reset form
        form.reset()

        // Close the dialog
        onSuccess()

        // Refresh to update auth state
        router.refresh()
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isLoading} />
                </FormControl>
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
                  <Input placeholder="your.email@example.com" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </Form>

      <EmailVerificationModal open={showEmailVerification} onOpenChange={setShowEmailVerification} email={userEmail} />
    </>
  )
}
