"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, RefreshCw } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface EmailVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
}

export function EmailVerificationModal({ open, onOpenChange, email }: EmailVerificationModalProps) {
  const [isResending, setIsResending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()
  const supabase = createClientSupabaseClient()

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to resend email",
          description: error.message,
        })
      } else {
        setEmailSent(true)
        toast({
          title: "Email sent!",
          description: "We've sent another verification email to your inbox.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">Check Your Email</DialogTitle>
          <DialogDescription className="text-center text-base">We've sent a verification link to</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="font-semibold text-lg text-foreground">{email}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What to do next:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>Return here and sign in with your credentials</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Didn't receive the email? Check your spam folder or</p>
          </div>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleResendEmail}
              disabled={isResending || emailSent}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : emailSent ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Email Sent!
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button onClick={() => onOpenChange(false)} variant="default" className="w-full">
              Got It, I'll Check My Email
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            <p>
              Having trouble? Contact us at{" "}
              <a href="mailto:support@northmeadbowls.com" className="text-blue-600 hover:underline">
                support@northmeadbowls.com
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
