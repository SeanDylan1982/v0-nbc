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
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Login form submitted with:", { email: values.email })
    setIsLoading(true)

    try {
      console.log("Attempting to sign in...")

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      console.log("Sign in response:", {
        user: data.user?.email,
        session: !!data.session,
        error: error?.message,
      })

      if (error) {
        console.error("Sign in error:", error)

        let errorMessage = error.message

        // Handle specific error cases
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again."
        } else if (error.message.includes("Email not confirmed")) {
          console.log("Email not confirmed, showing verification modal")
          setUserEmail(values.email)
          setShowEmailVerification(true)
          setIsLoading(false)
          return
        } else if (error.message.includes("signup_disabled")) {
          errorMessage = "Account registration is currently disabled. Please contact support."
        }

        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: errorMessage,
        })
        setIsLoading(false)
        return
      }

      if (!data.user || !data.session) {
        console.error("No user or session data received")
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: "Authentication failed. Please try again.",
        })
        setIsLoading(false)
        return
      }

      console.log("Sign in successful for user:", data.user.email)

      toast({
        title: "Welcome back!",
        description: `Successfully signed in as ${data.user.email}`,
      })

      // Reset form
      form.reset()

      // Close the dialog first
      onSuccess()

      // Wait a moment for the dialog to close, then refresh
      setTimeout(() => {
        router.refresh()
        // Add a URL parameter to force header refresh
        const url = new URL(window.location.href)
        url.searchParams.set("refresh", Date.now().toString())
        router.push(url.pathname + url.search)
      }, 100)
    } catch (error) {
      console.error("Unexpected sign in error:", error)
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
      })
      setIsLoading(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your.email@example.com"
                    {...field}
                    disabled={isLoading}
                    type="email"
                    autoComplete="email"
                  />
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
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      <EmailVerificationModal open={showEmailVerification} onOpenChange={setShowEmailVerification} email={userEmail} />
    </>
  )
}
