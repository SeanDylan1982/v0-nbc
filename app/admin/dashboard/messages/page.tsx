"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Eye, Mail, Phone, Trash2, Filter, Search } from "lucide-react"
import { getMessages, updateMessageStatus, deleteMessage, type Message } from "@/app/actions/messages"

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadMessages()
  }, [])

  useEffect(() => {
    filterMessages()
  }, [messages, statusFilter, searchTerm])

  const loadMessages = async () => {
    setLoading(true)
    const result = await getMessages()
    if (result.success && result.data) {
      setMessages(result.data)
    } else {
      toast.error(result.error || "Failed to load messages")
    }
    setLoading(false)
  }

  const filterMessages = () => {
    let filtered = messages

    if (statusFilter !== "all") {
      filtered = filtered.filter((message) => message.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (message) =>
          message.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.message.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredMessages(filtered)
  }

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message)
    if (message.status === "unread") {
      const result = await updateMessageStatus(message.id, "read")
      if (result.success) {
        setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, status: "read" } : m)))
      }
    }
  }

  const handleStatusChange = async (messageId: string, newStatus: "unread" | "read" | "replied") => {
    const result = await updateMessageStatus(messageId, newStatus)
    if (result.success) {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, status: newStatus } : m)))
      toast.success("Message status updated")
    } else {
      toast.error(result.error || "Failed to update status")
    }
  }

  const handleDeleteMessage = async () => {
    if (!deleteMessageId) return

    const result = await deleteMessage(deleteMessageId)
    if (result.success) {
      setMessages((prev) => prev.filter((m) => m.id !== deleteMessageId))
      toast.success("Message deleted")
    } else {
      toast.error(result.error || "Failed to delete message")
    }
    setDeleteMessageId(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "bg-red-100 text-red-800"
      case "read":
        return "bg-yellow-100 text-yellow-800"
      case "replied":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const unreadCount = messages.filter((m) => m.status === "unread").length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Manage contact form submissions
            {unreadCount > 0 && <Badge className="ml-2 bg-red-100 text-red-800">{unreadCount} unread</Badge>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages List */}
      <div className="grid gap-4">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No messages found</p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className={message.status === "unread" ? "border-l-4 border-l-red-500" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {message.first_name} {message.last_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {message.email}
                      </span>
                      {message.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {message.phone}
                        </span>
                      )}
                      <span>{formatDate(message.created_at)}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(message.status)}>{message.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{message.message}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewMessage(message)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Select
                    value={message.status}
                    onValueChange={(value: "unread" | "read" | "replied") => handleStatusChange(message.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setDeleteMessageId(message.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Message Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Message from {selectedMessage?.first_name} {selectedMessage?.last_name}
            </DialogTitle>
            <DialogDescription>
              Received on {selectedMessage && formatDate(selectedMessage.created_at)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <p className="text-sm">{selectedMessage?.email}</p>
              </div>
              {selectedMessage?.phone && (
                <div>
                  <Label>Phone</Label>
                  <p className="text-sm">{selectedMessage.phone}</p>
                </div>
              )}
            </div>
            <div>
              <Label>Message</Label>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{selectedMessage?.message}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedMessage) {
                  window.location.href = `mailto:${selectedMessage.email}?subject=Re: Your message to Northmead Bowls Club`
                }
              }}
            >
              Reply via Email
            </Button>
            <Button onClick={() => setSelectedMessage(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteMessageId} onOpenChange={() => setDeleteMessageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
