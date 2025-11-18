"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Flag } from "lucide-react"
import toast from "react-hot-toast"

interface ReportUserDialogProps {
  userId: string
  username: string
  isOpen: boolean
  onClose: () => void
}

const reportReasons = [
  { value: "spam", label: "Spam or unwanted messages" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "fake_profile", label: "Fake or impersonation" },
  { value: "underage", label: "Underage user" },
  { value: "other", label: "Other" },
]

export function ReportUserDialog({
  userId,
  username,
  isOpen,
  onClose,
}: ReportUserDialogProps) {
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/user/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          reason,
          details: details.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit report")
      }

      toast.success("Report submitted. Thank you for helping keep our community safe.")
      setReason("")
      setDetails("")
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit report")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report User</DialogTitle>
          <DialogDescription>
            Report {username} for violating community guidelines
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide more context about this report..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {details.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            <Flag className="w-4 h-4 mr-2" />
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
