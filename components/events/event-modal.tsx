"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X, Calendar, Clock, MapPin, Heart, Share2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  toggleLikeEvent,
  hasUserLikedEvent,
  getLikesForEvent,
  getCommentsForEvent,
  addCommentToEvent,
  type Comment,
} from "@/app/actions/social"
import { useToast } from "@/hooks/use-toast"

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  date: string
  time: string
  location: string
  description: string
  category: string
  imageUrl?: string
  eventId: string
  isLoggedIn: boolean
}

export function EventModal({
  isOpen,
  onClose,
  title,
  date,
  time,
  location,
  description,
  category,
  imageUrl,
  eventId,
  isLoggedIn,
}: EventModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState(0)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden" // Prevent scrolling behind modal
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "auto" // Restore scrolling
    }
  }, [isOpen, onClose])

  // Load likes and comments when modal opens
  useEffect(() => {
    if (isOpen && eventId) {
      setIsLoading(true)
      
      const loadSocialData = async () => {
        try {
          // Load like status
          if (isLoggedIn) {
            const userLiked = await hasUserLikedEvent(eventId)
            setLiked(userLiked)
          }
          
          // Load like count
          const { count: likesCount } = await getLikesForEvent(eventId)
          setLikeCount(likesCount)
          
          // Load comments
          const { comments: eventComments, count: commentsCount } = await getCommentsForEvent(eventId)
          setComments(eventComments)
          setCommentCount(commentsCount)
        } catch (error) {
          console.error("Error loading social data:", error)
        } finally {
          setIsLoading(false)
        }
      }
      
      loadSocialData()
    }
  }, [isOpen, eventId, isLoggedIn])

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }
  
  // Handle like button click
  const handleLikeClick = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to like events",
        variant: "default",
      })
      return
    }
    
    try {
      const result = await toggleLikeEvent(eventId)
      
      if (result.success) {
        setLiked(result.liked || false)
        setLikeCount(prev => result.liked ? prev + 1 : prev - 1)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling like:", error)
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      })
    }
  }
  
  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to comment",
        variant: "default",
      })
      return
    }
    
    if (!commentText.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please enter a comment",
        variant: "default",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await addCommentToEvent(eventId, commentText)
      
      if (result.success) {
        // Refresh comments
        const { comments: updatedComments, count: updatedCount } = await getCommentsForEvent(eventId)
        setComments(updatedComments)
        setCommentCount(updatedCount)
        setCommentText("")
        
        // Scroll to the bottom of comments
        setTimeout(() => {
          const commentsContainer = document.getElementById("comments-container")
          if (commentsContainer) {
            commentsContainer.scrollTop = commentsContainer.scrollHeight
          }
        }, 100)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle share button click
  const handleShare = (platform: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to share events",
        variant: "default",
      })
      return
    }
    
    const eventUrl = `${window.location.origin}/?event=${eventId}`
    let shareUrl = ""
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(`Check out this event: ${title}`)}`
        break
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this event: ${title} ${eventUrl}`)}`
        break
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(`Check out this event: ${title}`)}&body=${encodeURIComponent(`I thought you might be interested in this event: ${title}\n\n${eventUrl}`)}`
        break
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(eventUrl)
        toast({
          title: "Link Copied",
          description: "Event link copied to clipboard",
          variant: "default",
        })
        return
    }
    
    window.open(shareUrl, "_blank", "noopener,noreferrer")
  }

  if (!isOpen) return null

  const categoryColors = {
    competitions: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    social: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    joker: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  }

  const categoryColor =
    categoryColors[category as keyof typeof categoryColors] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div ref={modalRef} className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="modal-title" className="text-xl font-bold">
            {title}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-grow p-4">
          {imageUrl && (
            <div className="relative h-64 mb-4">
              <Image src={imageUrl || "/placeholder.svg"} alt={title} fill className="object-cover rounded-md" />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm ${categoryColor}`}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{location}</span>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none mb-6">
            <p>{description}</p>
          </div>
          
          <Separator className="my-4" />
          
          {/* Social interaction section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Like button */}
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 px-2"
                  onClick={handleLikeClick}
                  disabled={isLoading}
                >
                  <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                  <span>{likeCount}</span>
                </Button>
              </div>
              
              {/* Share button */}
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2" disabled={isLoading}>
                      <Share2 className="h-5 w-5" />
                      <span>Share</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <div className="grid gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start" 
                        onClick={() => handleShare("facebook")}
                      >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
                        </svg>
                        Facebook
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start" 
                        onClick={() => handleShare("twitter")}
                      >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 5.89722C21.2642 6.21999 20.4733 6.43722 19.643 6.53055C20.4904 6.03055 21.1409 5.23889 21.4475 4.29555C20.6547 4.75722 19.7767 5.09722 18.8409 5.27555C18.0936 4.49166 17.0269 4 15.8475 4C13.5811 4 11.7436 5.83722 11.7436 8.10333C11.7436 8.42555 11.7792 8.73889 11.8502 9.03889C8.43562 8.87 5.41614 7.23555 3.3926 4.75055C3.03927 5.36166 2.83738 6.03055 2.83738 6.75055C2.83738 8.11055 3.56152 9.2989 4.66208 9.98278C3.98959 9.96389 3.35676 9.78555 2.80384 9.48555V9.53889C2.80384 11.5389 4.21795 13.1989 6.09479 13.5778C5.75051 13.6711 5.38738 13.7222 5.01046 13.7222C4.74927 13.7222 4.49384 13.6978 4.24736 13.6489C4.76321 15.2811 6.27928 16.4811 8.07453 16.5133C6.67043 17.6267 4.9004 18.2822 2.97843 18.2822C2.64889 18.2822 2.32427 18.2633 2 18.2255C3.81602 19.4011 5.97186 20.0778 8.28921 20.0778C15.8365 20.0778 19.9651 13.7889 19.9651 8.32555C19.9651 8.15055 19.9613 7.97555 19.9538 7.80333C20.7549 7.23 21.4494 6.51389 22 5.69722V5.89722Z" />
                        </svg>
                        Twitter
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start" 
                        onClick={() => handleShare("whatsapp")}
                      >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.6 6.31999C16.8669 5.58141 15.9943 4.99596 15.033 4.59767C14.0716 4.19938 13.0406 3.99622 12 3.99999C10.6089 4.00135 9.24248 4.36819 8.03771 5.06377C6.83294 5.75935 5.83208 6.75926 5.13534 7.96335C4.4386 9.16745 4.07046 10.5335 4.06776 11.9246C4.06507 13.3158 4.42793 14.6832 5.12 15.89L4 20L8.2 18.9C9.35975 19.5452 10.6629 19.8891 11.99 19.9C14.0997 19.9 16.124 19.0625 17.6066 17.5799C19.0892 16.0973 19.9267 14.073 19.9267 11.9633C19.9267 9.85367 19.0892 7.82942 17.6066 6.34681L17.6 6.31999ZM12 18.53C10.8177 18.5308 9.65701 18.213 8.64 17.61L8.4 17.46L5.91 18.12L6.57 15.69L6.41 15.44C5.55925 14.0667 5.24174 12.429 5.51762 10.8372C5.7935 9.24545 6.64361 7.81015 7.9069 6.80322C9.1702 5.79628 10.7589 5.28765 12.3721 5.37368C13.9853 5.4597 15.511 6.13441 16.66 7.26999C17.916 8.49818 18.635 10.1735 18.65 11.93C18.6506 13.279 18.2094 14.5953 17.3826 15.6955C16.5558 16.7957 15.3834 17.6217 14.0627 18.0538C12.742 18.4858 11.3333 18.5015 10.0022 18.0985C8.67108 17.6955 7.47954 16.8952 6.63 15.81H6.61C6.61 15.81 5.79 15.28 5.76 14.75C5.73 14.22 6.61 14.12 6.61 14.12C6.61 14.12 7.94 12.44 8.12 12.31C8.3 12.18 8.51 12.44 8.51 12.44C8.51 12.44 9.59 13.72 9.68 13.83C9.77 13.94 9.33 14.44 9.33 14.44C9.33 14.44 9.23 14.66 9.43 14.83C9.63 15 10.35 15.51 10.83 15.83C11.4336 16.2098 12.132 16.4223 12.85 16.44C13.6074 16.4639 14.3418 16.2056 14.93 15.72C15.0386 15.6172 15.1239 15.4912 15.1799 15.3513C15.2358 15.2115 15.2613 15.0608 15.2547 14.9096C15.2481 14.7584 15.2095 14.6107 15.1416 14.4769C15.0736 14.3432 14.9778 14.2263 14.86 14.1333C14.6601 13.9656 14.1825 13.7421 14.1825 13.7421L12.95 13.1733C12.95 13.1733 12.7 13.05 12.82 12.79C12.82 12.79 13.4 11.85 13.44 11.79C13.48 11.73 13.76 11.7 13.93 11.79C14.1 11.88 15.25 12.47 15.25 12.47C15.25 12.47 15.63 12.67 15.43 13.12C15.3359 13.3905 15.1975 13.6432 15.02 13.87C14.7992 14.152 14.5328 14.3944 14.23 14.59C14.0018 14.7392 13.7559 14.8628 13.5 14.9583C13.2961 15.0345 13.0855 15.0891 12.87 15.12C12.2361 15.2416 11.5844 15.2227 10.96 15.0642C10.3357 14.9058 9.75246 14.6117 9.25 14.2C8.85596 13.8799 8.50569 13.5058 8.21 13.09C7.73371 12.4395 7.37268 11.7113 7.14 10.94C7.06893 10.6685 7.03501 10.3885 7.04 10.1083C7.04499 9.82806 7.08891 9.54949 7.17 9.27999C7.31901 8.71231 7.62127 8.20342 8.04 7.81999C8.15585 7.71912 8.28281 7.63347 8.42 7.56444C8.55719 7.49541 8.70345 7.44379 8.85 7.40999H9.22C9.33868 7.41118 9.45509 7.44052 9.56 7.49599C9.66491 7.55146 9.75559 7.63151 9.82 7.72999C9.93262 7.89241 10.2007 8.41088 10.2007 8.41088C10.2007 8.41088 10.36 8.76999 10.38 8.91999C10.4 9.06999 10.35 9.26999 10.25 9.36999C10.15 9.46999 10.05 9.57999 9.96 9.66999C9.87 9.75999 9.77 9.85999 9.7 9.92999C9.63 9.99999 9.58 10.12 9.65 10.25C9.72 10.38 10.15 11.1 10.85 11.72C11.5212 12.2998 12.325 12.7223 13.19 12.96C13.34 13.01 13.52 13.01 13.63 12.93C13.74 12.85 14.05 12.49 14.18 12.33C14.31 12.17 14.46 12.16 14.63 12.21C14.8 12.26 15.77 12.74 15.77 12.74L16.03 12.88C16.1869 12.9478 16.3184 13.0642 16.4054 13.2107C16.4923 13.3572 16.5307 13.5267 16.515 13.6967C16.4992 13.8666 16.4299 14.0279 16.3173 14.1563C16.2047 14.2847 16.0539 14.3741 15.89 14.41C15.6052 14.5079 15.3058 14.5592 15.0033 14.5617C14.7009 14.5643 14.4005 14.5179 14.114 14.425C13.7557 14.3054 13.4198 14.1316 13.12 13.91L12.09 13.31C11.4365 13.0759 10.7252 13.0289 10.0458 13.1742C9.36648 13.3194 8.74326 13.6509 8.25 14.13C7.89214 14.4635 7.63146 14.8815 7.49522 15.3414C7.35897 15.8013 7.35178 16.2875 7.47442 16.7515C7.59706 17.2154 7.84547 17.6408 8.19 17.9842C8.53452 18.3277 8.96238 18.5761 9.43 18.7L9.66 18.77C10.4326 19.0553 11.2572 19.1696 12.08 19.1033C12.9028 19.0369 13.7019 18.7912 14.42 18.38C15.3331 17.8595 16.0963 17.1156 16.6366 16.2154C17.1769 15.3152 17.4763 14.2879 17.5 13.24C17.5068 12.6179 17.3982 12.0009 17.18 11.42C17.0105 10.9915 16.7649 10.5959 16.4547 10.2501C16.1445 9.90439 15.7748 9.61371 15.36 9.38999L14.09 8.73999C14.09 8.73999 13.25 8.34999 13.14 8.24999C13.0256 8.15726 12.9318 8.04144 12.8651 7.91057C12.7984 7.7797 12.7605 7.63684 12.7539 7.49057C12.7473 7.34429 12.7722 7.19831 12.8268 7.06182C12.8814 6.92532 12.9643 6.80171 13.07 6.69999C13.1648 6.61349 13.2778 6.54812 13.4006 6.50817C13.5234 6.46821 13.6535 6.45448 13.7824 6.46788C13.9114 6.48128 14.0361 6.52153 14.1479 6.58611C14.2597 6.65069 14.3562 6.73814 14.43 6.83999L15.28 7.97999C15.7746 8.59113 16.1546 9.28599 16.4 10.03C16.5353 10.4474 16.6216 10.8789 16.6566 11.3167C16.6917 11.7544 16.6752 12.1949 16.6075 12.6283C16.5399 13.0616 16.4217 13.4835 16.2566 13.8826C16.0915 14.2817 15.8812 14.6532 15.6317 14.9858C15.3823 15.3184 15.0962 15.6084 14.7817 15.8461C14.4671 16.0838 14.1275 16.2664 13.7717 16.3883C13.416 16.5101 13.0482 16.5699 12.6775 16.5658C12.3069 16.5617 11.9403 16.4937 11.5871 16.364C11.2339 16.2343 10.8979 16.0444 10.5879 15.8003C10.278 15.5561 9.99736 15.2606 9.75425 14.9235C9.51114 14.5864 9.31709 14.2118 9.18 13.81C9.04291 13.4082 8.97507 12.9857 8.98 12.56C8.98493 12.1344 9.06256 11.7139 9.21 11.32C9.35744 10.9261 9.57386 10.5622 9.85 10.25C10.1261 9.93782 10.4583 9.67937 10.83 9.48999C11.2016 9.30061 11.6057 9.18241 12.02 9.13999C12.4343 9.09757 12.8529 9.13165 13.2533 9.24051C13.6537 9.34937 14.0285 9.53109 14.36 9.77499L15.5 10.53C15.5 10.53 16.28 11.01 16.35 11.06C16.42 11.11 16.5 11.11 16.5 11.01V8.91999C16.5 8.91999 16.5 8.73999 16.7 8.73999H17.68C17.68 8.73999 17.83 8.73999 17.83 8.91999V11.56C17.83 11.56 17.83 11.73 18.01 11.56L19.7 9.85999C19.7 9.85999 19.85 9.73999 19.99 9.73999H21.12C21.12 9.73999 21.33 9.73999 21.2 9.85999L18.92 12.14C18.92 12.14 18.8 12.26 18.92 12.38L21.33 15.38C21.33 15.38 21.45 15.56 21.2 15.56H20.02C20.02 15.56 19.85 15.56 19.75 15.44L17.83 12.94C17.83 12.94 17.68 12.82 17.68 12.94V15.44C17.68 15.44 17.68 15.56 17.53 15.56H16.53C16.53 15.56 16.38 15.56 16.38 15.44V12.94C16.38 12.94 16.38 12.76 16.23 12.76C16.08 12.76 15.9 12.94 15.9 12.94L14.05 15.44C14.05 15.44 13.93 15.56 13.78 15.56H12.53C12.53 15.56 12.38 15.56 12.53 15.38L14.9 12.26C14.9 12.26 15.05 12.14 14.9 12.01L12.53 9.85999C12.53 9.85999 12.38 9.73999 12.53 9.73999H13.78C13.78 9.73999 13.93 9.73999 14.05 9.85999L15.9 11.71C15.9 11.71 16.05 11.83 16.2 11.83C16.35 11.83 16.35 11.71 16.35 11.71V9.85999C16.35 9.85999 16.35 9.73999 16.5 9.73999H17.5C17.5 9.73999 17.65 9.73999 17.65 9.85999V11.71C17.65 11.71 17.65 11.83 17.8 11.83C17.95 11.83 18.1 11.71 18.1 11.71L19.95 9.85999C19.95 9.85999 20.07 9.73999 20.22 9.73999H21.47C21.47 9.73999 21.62 9.73999 21.47 9.85999L19.1 12.01C19.1 12.01 18.95 12.14 19.1 12.26L21.47 15.38C21.47 15.38 21.62 15.56 21.47 15.56H20.22C20.22 15.56 20.07 15.56 19.95 15.44L18.1 13.56C18.1 13.56 17.95 13.44 17.8 13.44C17.65 13.44 17.65 13.56 17.65 13.56V15.44C17.65 15.44 17.65 15.56 17.5 15.56H16.5C16.5 15.56 16.35 15.56 16.35 15.44V13.56C16.35 13.56 16.35 13.44 16.2 13.44C16.05 13.44 15.9 13.56 15.9 13.56L14.05 15.44C14.05 15.44 13.93 15.56 13.78 15.56H12.53C12.53 15.56 12.38 15.56 12.53 15.38L14.9 12.26C14.9 12.26 15.05 12.14 14.9 12.01L12.53 9.85999C12.53 9.85999 12.38 9.73999 12.53 9.73999H13.78C13.78 9.73999 13.93 9.73999 14.05 9.85999L15.9 11.71C15.9 11.71 16.05 11.83 16.2 11.83C16.35 11.83 16.35 11.71 16.35 11.71V9.85999C16.35 9.85999 16.35 9.73999 16.5 9.73999H17.5C17.5 9.73999 17.65 9.73999 17.65 9.85999V11.71C17.65 11.71 17.65 11.83 17.8 11.83C17.95 11.83 18.1 11.71 18.1 11.71L19.95 9.85999C19.95 9.85999 20.07 9.73999 20.22 9.73999H21.47C21.47 9.73999 21.62 9.73999 21.47 9.85999L19.1 12.01C19.1 12.01 18.95 12.14 19.1 12.26L21.47 15.38C21.47 15.38 21.62 15.56 21.47 15.56H20.22C20.22 15.56 20.07 15.56 19.95 15.44L18.1 13.56C18.1 13.56 17.95 13.44 17.8 13.44C17.65 13.44 17.65 13.56 17.65 13.56V15.44C17.65 15.44 17.65 15.56 17.5 15.56H16.5C16.5 15.56 16.35 15.56 16.35 15.44V13.56C16.35 13.56 16.35 13.44 16.2 13.44C16.05 13.44 15.9 13.56 15.9 13.56L14.05 15.44C14.05 15.44 13.93 15.56 13.78 15.56H12.53C12.53 15.56 12.38 15.56 12.53 15.38L14.9 12.26C14.9 12.26 15.05 12.14 14.9 12.01L12.53 9.85999C12.53 9.85999 12.38 9.73999 12.53 9.73999H13.78C13.78 9.73999 13.93 9.73999 14.05 9.85999L15.9 11.71C15.9 11.71 16.05 11.83 16.2 11.83C16.35 11.83 16.35 11.71 16.35 11.71V9.85999C16.35 9.85999 16.35 9.73999 16.5 9.73999H17.5C17.5 9.73999 17.65 9.73999 17.65 9.85999V11.71C17.65 11.71 17.65 11.83 17.8 11.83C17.95 11.83 18.1 11.71 18.1 11.71L19.95 9.85999C19.95 9.85999 20.07 9.73999 20.22 9.73999H21.47C21.47 9.73999 21.62 9.73999 21.47 9.85999L19.1 12.01C19.1 12.01 18.95 12.14 19.1 12.26L21.47 15.38C21.47 15.38 21.62 15.56 21.47 15.56H20.22C20.22 15.56 20.07 15.56 19.95 15.44L18.1 13.56C18.1 13.56 17.95 13.44 17.8 13.44C17.65 13.44 17.65 13.56 17.65 13.56V15.44C17.65 15.44 17.65 15.56 17.5 15.56H16.5C16.5 15.56 16.35 15.56 16.35 15.44V13.56C16.35 13.56 16.35 13.44 16.2 13.44C16.05 13.44 15.9 13.56 15.9 13.56L14.05 15.44C14.05 15.44 13.93 15.56 13.78 15.56H12.53C12.53 15.56 12.38 15.56 12.53 15.38L14.9 12.26C14.9 12.26 15.05 12.14 14.9 12.01L12.53 9.85999C12.53 9.85999 12.38 9.73999 12.53 9.73999H13.78C13.78 9.73999 13.93 9.73999 14.05 9.85999L15.9 11.71C15.9 11.71 16.05 11.83 16.2 11.83C16.35 11.83 16.35 11.71 16.35 11.71V9.85999C16.35 9.85999 16.35 9.73999 16.5 9.73999H17.5C17.5 9.73999 17.65 9.73999 17.65 9.85999V11.71C17.65 11.71 17.65 11.83 17.8 11.83C17.95 11.83 18.1 11.71 18.1 11.71L19.95 9.85999C19.95 9.85999 20.07 9.73999 20.22 9.73999H21.47C21.47 9.73999 21.62 9.73999 21.47 9.85999L19.1 12.01C19.1 12.01 18.95 12.14 19.1 12.26L21.47 15.38C21.47 15.38 21.62 15.56 21.47 15.56H20.22C20.22 15.56 20.07 15.56 19.95 15.44L18.1 13.56C18.1 13.56 17.95 13.44 17.8 13.44C17.65 13.44 17.65 13.56 17.65 13.56V15.44C17.65 15.44 17.65 15.56 17.5 15.56H16.5C16.5 15.56 16.35 15.56 16.35 15.44V13.56C16.35 13.56 16.35 13.44 16.2 13.44C16.05 13.44 15.9 13.56 15.9 13.56L14.05 15.44C14.05 15.44 13.93 15.56 13.78 15.56H12.53C12.53 15.56 12.38 15.56 12.53 15.38L14.9 12.26C14.9 12.26 15.05 12.14 14.9 12.01L12.53 9.85999C12.53 9.85999 12.38 9.73999 12.53 9.73999H13.78C13.78 9.73999 13.93 9.73999 14.05 9.85999L15.9 11.71C15.9 11.71 16.05 11.83 16.2 11.83C16.35 11.83 16.35 11.71 16.35 11.71V9.85999C16.35 9.85999 16.35 9.73999 16.5 9.73999H17.5C17.5 9.73999 17.65 9.73999 17.65 9.85999V11.71C17.65 11.71 17.65 11.83 17.8 11.83C17.95 11.83 18.1 11.71 18.1 11.71L19.95 9.85999C19.95 9.85999 20.07 9.73999 20.22 9.73999H21.47C21.47 9.73999 21.62 9.73999 21.47 9.85999L19.1 12.01C19.1 12.01 18.95 12.14 19.1 12.26L21.47 15.38C21.47 15.38 21.62 15.56 21.47 15.56H20.22C20.22 15.56 20.07 15.56 19.95 15.44L18.1 13.56C18.1 13.56 17.95 13.44 17.8 13.44C17.65 13.44 17.65 13.56 17.65 13.56V15.44C17.65 15.44 17.65 15.56 17.5 15.56H16.5C16.5 15.56 16.35 15.56 16.35 15.44V13.56C16.35 13.56 16.35 13.44 16.2 13.44C16.05 13.44 15.9 13.56 15.9 13.56L14.05 15.44C14.05 15.44 13.93 15.56 13.78 15.56H12.53C12.53 15.56 12.38 15.56 12.53 15.38L14.9 12.26C14.9 12.26 15.05 12.14 14.9 12.01L12.53 9.85999C12.53 9.85999 12.38 9.73999 12.53 9.73999H13.78C13.78 9.73999 13.93 9.73999 14.05 9.85999L15.9 11.71C15.9 11.71 16.05 11.83 16.2 11.83C16.35 11.83 16.35 11.71 16.35 11.71V9.85999C16.35 9.85999 16.35 9.73999 16.5 9.73999H17.5C17.5 9.73999 17.65 9.73999 17.65 9.85999V11.71C17.65 11.71 17.65 11.83 17.8 11.83C17.95 11.83 18.1 11.71 18.1 11.71L19.95 9.85999C19.95 9.85999 20.07 9.73999 20.22 9.73999H21.47C21.47 9.73999 21.62 9.73999 21.47 9.85999L19.1 12.01C19.1 12.01 18.95 12.14 19.1 12.26L21.47 15.38C21.47 15.38 21.62 15.56 21.47 15.56H20.22C20.22 15.56 20.07 15.56 19.95 15.44L18.1 13.56C18.1 13.56 17.95 13.44 17.8 13.44C17.65 13.44 17.65 13.56 17.65 13.56V15.44C17.65 15.44 17.65 15.56 17.5 15.56H16.5C16.5 15.56 16.35 15.56 16.35 15.44V13.56C16.35 13.56 16.35 13.44 16.2 13.44C16.05 13.44 15.9 13.56 15.9 13.56L14.05 15.44C14.05 15.44 13.93 15.56 13.78 15.56H12.53C12.53 15.56 12.38 15.56 12.53 15.38L14.9 12.26C14.9 12.26 15.05 12.14 14.9 12.01L12.53 9.85999C12.53 9.85999 12.38 9.73999 12.53 9.73999H13.78C13.78 9.73999 13.93 9.73999 14.05 9.85999L15.9 11.71C15.9 11.71 16.05 11.83 16.2 11.83C16.35 11.83 16.35 11.71 16.35 11.71V9.85999C16.35 9.85999 16.35 9.73999 16.5 9.73999H17.5C17.5 9.73999 17.65 9.73999 17.65 9.85999V11.71C17.65 11.71 17.65 11.83 17.8 11.83C17.95 11.83 18.1 11.71 18.1 11.71L19.95 9.85999C19.95 9.85999 20.07 9.73999 20.22 9.73999H21.47C21.47 9.73999 21.62 9.73999 21.47 9.85999L19.1 12.01C19.1 12.01 18.95 12.14 19.1 12.26L21.47 15.38C21.47 15.38 21.62 15.56 21.47 15.56H20.22C20.22 15.56 20.07 15.56 19.95 15.44L18.1 13.56C18.1 13.56 17.95 13.44 17.8 13.44C17.65 13.44 17.65 13.56 17.65 13.56V15.44C17.65 15.44 17.65 15.56 17.5 15.56H16.5C16.5 15.56 16.35 15.56 16.35 15.44V13.56C16.35 13.56 16.35 13.44 16.2 13.44C16.05 13.44 15.9 13.56 15.9 13.56L14.05 15.44C14.05 15.44 13.93 15.56 13.78 15.56H12.53C12.53 15.56 12.38 15.56 12.53 15.38L14.9 12.26C14.9 12.26 15.05 12.14 14.9 12.01L12.53 9.85999C12.53 9.85999 12.38 9.73999 12.53 9.73999H13.78C13.78 9.73999 13.93 9.73999 14.05 9.85999L15.9 11.71C15.9 11.71 16.05 11.83 16.2 11.83C16.35 11.83 16.35 11.71 16.35 11.71V9.85999C16.35 9.85999 16.35 9.73999 16.5 9.73999H17.5C17.5 9.73999 17.65 9.73999 17.65 9.85999V11.71C17.65 11.71 17.65 11.83 17.8 11.83C17.95 11.83 18.1 11.71 18.1 11.71L19.95 9.85999C19.95 9.85999 20.07 9.73999 20.22 9.73999H21.47C21.47 9.73999 21.62 9.73999 21.47 9.85999L19.1 12.01C19.1 12.01 18.95 12.14 19.1 12.26L21.47 15.38C21.47 15.38 21.62 15.56 21.47 15.56H20.22C20.22 15.56 20.07 15.56 19.95 15.44L18.1 13.56C18.1 13.56 17.95 13.44 17.8 13.44C17.65 13.44 17.65 13.56 17.65 13.56V15.44C17.65 15.44 17.65 15.56 17.5 15.56H16.5C16.5 15.56 16.35 15.56 16.35 15.44V13.56C16.35 13.56 16.35 13.44 16.2 13.44C16.05 13.44 15.9 13.56 15.9 13.56L14.05 15.44C14.05 15.44 13.93 15.56 13.78 15.56H12.53C12.53 15.56 12.38 15.56 12.53 15.38L14.9 12.26C14.9 12.26 15.05 12.14 14.9 12.01L12.53 9.85999C12.53 9.85999 12.38 9.73999 12.53 9.73999H13.78C13.78 9.73999 13.93 9.73999 14.05 9.85999L15.9 11.71C15.9 11.71 16.05 11.83 16.2 11.83C16.35 11.83 16.35 11.71 16.35 11.71V9.85999C16.35 9.85999 16.35 9.73999 16.5 9.73999H17.5C17.5 9.73999 17.65 9.73999 17.65 9.85999V11.71C17.65 11.71 17.65 11.83 17.8 11.83C17.95 11.83 18.1 11.71 18.1 11.71L19.95 9.85999C19.95 9.85999 20.07 9.73999 20.22 9.73999H21.47C21.47 9.73999 21.62 9.73999 21.47 9.85999L19.1 12.01C19.1 12.01 18.95 12.14 19.1 12.26L21.47 15.38C21.47 15.38 21.62 15.56 21.47 15.56H20.22C20.22 15.56 20.07 15.56 19.95 15.44L18.1 13.56C18.1 13.56 17.95 13.44 17.8 13.44C17.65 13.44 17.65 13.56 17.65 13.56V15.44C17.65 15.44 17.65 15\
