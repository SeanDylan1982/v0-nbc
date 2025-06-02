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
    setIsLoading(true)

    try {
      console.log("Starting login process...")

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      console.log("Login response:", { data, error })

      if (error) {
        console.error("Login error:", error)

        let errorMessage = error.message

        // Handle specific error cases
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again."
        } else if (error.message.includes("Email not confirmed")) {
          // Show email verification modal instead of just an error
          setUserEmail(values.email)
          setShowEmailVerification(true)
          return
        } else if (error.message.includes("signup_disabled")) {
          errorMessage = "Account registration is currently disabled. Please contact support."
        }

        toast({
          variant: "destructive",
          title: "Login failed",
          description: errorMessage,
        })
        return
      }

      if (!data.user) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "No user data received. Please try again.",
        })
        return
      }

      console.log("Login successful for user:", data.user.email)

      // Check if user profile exists, create if it doesn't
      try {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist, create it
          console.log("Creating missing user profile...")
          const { error: createError } = await supabase.from("users").insert([
            {
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || "",
            },
          ])

          if (createError) {
            console.error("Error creating profile:", createError)
          } else {
            console.log("Profile created successfully")
          }
        }
      } catch (profileErr) {
        console.error("Profile check/creation error:", profileErr)
      }

      toast({
        title: "Welcome back!",
        description: `Successfully signed in as ${data.user.email}`,
      })

      // Reset form
      form.reset()

      // Close the dialog
      onSuccess()

      // Refresh the page to update auth state
      router.refresh()
    } catch (error) {
      console.error("Unexpected login error:", error)
      toast({
        variant: "destructive",
        title: "Login failed",
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
