/**
 * FILE PATH: /ejdk/ejidike-foundation/components/admin/ApplicationReview.tsx
 * PURPOSE: Admin interface to approve/reject applications
 * USED IN: Admin dashboard, admin application detail page
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ApplicationReviewProps {
  applicationId: string;
  applicantName: string;
  programTitle: string;
  onReviewComplete?: () => void;
}

export default function ApplicationReview({
  applicationId,
  applicantName,
  programTitle,
  onReviewComplete
}: ApplicationReviewProps) {
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Approve application
  const handleApprove = async () => {
    if (!reviewerNotes.trim()) {
      toast.error('Please add reviewer notes');
      return;
    }

    setProcessing(true);

    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: 'approved',
          reviewer_notes: reviewerNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Application approved', {
        description: `${applicantName}'s application for ${programTitle} has been approved`
      });

      if (onReviewComplete) {
        onReviewComplete();
      }

    } catch (error: any) {
      toast.error('Failed to approve', {
        description: error.message
      });
    } finally {
      setProcessing(false);
    }
  };

  // Reject application
  const handleReject = async () => {
    if (!reviewerNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);

    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: 'rejected',
          reviewer_notes: reviewerNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Application rejected', {
        description: `${applicantName}'s application has been rejected`
      });

      if (onReviewComplete) {
        onReviewComplete();
      }

    } catch (error: any) {
      toast.error('Failed to reject', {
        description: error.message
      });
    } finally {
      setProcessing(false);
    }
  };

  // Request more information
  const handleRequestInfo = async () => {
    if (!reviewerNotes.trim()) {
      toast.error('Please specify what information is needed');
      return;
    }

    setProcessing(true);

    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: 'pending',
          reviewer_notes: `More information requested: ${reviewerNotes}`,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Information requested', {
        description: `${applicantName} will be notified to provide additional information`
      });

      if (onReviewComplete) {
        onReviewComplete();
      }

    } catch (error: any) {
      toast.error('Failed to send request', {
        description: error.message
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Application</CardTitle>
        <CardDescription>
          Review {applicantName}'s application for {programTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reviewer Notes */}
        <div className="space-y-2">
          <Label htmlFor="reviewer-notes">
            Reviewer Notes *
          </Label>
          <Textarea
            id="reviewer-notes"
            placeholder="Add your review notes, feedback, or reasons for decision..."
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            rows={5}
            required
          />
          <p className="text-xs text-muted-foreground">
            These notes will be visible to the applicant
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Approve */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="flex-1"
                disabled={processing || !reviewerNotes.trim()}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve Application?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will approve {applicantName}'s application for {programTitle}.
                  The applicant will be notified via email.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleApprove} disabled={processing}>
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    'Confirm Approval'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Reject */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={processing || !reviewerNotes.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Application?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reject {applicantName}'s application for {programTitle}.
                  Please ensure you've provided clear feedback in the reviewer notes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  disabled={processing}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Confirm Rejection'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Request More Info */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1"
                disabled={processing || !reviewerNotes.trim()}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Info
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Request More Information?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will ask {applicantName} to provide additional information.
                  Your notes will be sent to the applicant.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRequestInfo} disabled={processing}>
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}