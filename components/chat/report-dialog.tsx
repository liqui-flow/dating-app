"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { reportUser, REPORT_REASONS } from "@/lib/reportService"

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportedUserId: string
  reporterId: string
  matchType: 'dating' | 'matrimony'
  userName: string
  onSuccess: () => void
}

export function ReportDialog({
  open,
  onOpenChange,
  reportedUserId,
  reporterId,
  matchType,
  userName,
  onSuccess
}: ReportDialogProps) {
  const [reason, setReason] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await reportUser({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        match_type: matchType,
        reason,
        description: description.trim() || undefined
      })

      if (result.success) {
        onSuccess()
        onOpenChange(false)
        // Reset form
        setReason("")
        setDescription("")
      } else {
        console.error('Report failed:', result.error)
        // You could show an error toast here
      }
    } catch (error) {
      console.error('Unexpected error submitting report:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    // Reset form
    setReason("")
    setDescription("")
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Report {userName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Please help us understand the issue. Reports are reviewed by our team and appropriate action will be taken.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent position="popper" className="bg-background/80 backdrop-blur-sm border-border text-foreground z-50">
                {REPORT_REASONS[matchType].map((reportReason) => (
                  <SelectItem key={reportReason} value={reportReason} className="text-foreground">
                    {reportReason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context that might help us review this report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!reason.trim() || isSubmitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
