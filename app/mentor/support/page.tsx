/**
 * FILE PATH: /ejdk/ejidike-foundation/app/mentor/support/page.tsx
 * PURPOSE: Mentor support and help center
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, HelpCircle, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function MentorSupportPage() {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the message to support
    toast.success('Support request sent', {
      description: 'We will get back to you within 24-48 hours'
    });
    setFormData({ subject: '', message: '' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="text-muted-foreground">Get help and contact support</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <HelpCircle className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Find answers to common questions
            </p>
            <Button variant="outline" className="w-full">View FAQs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browse mentor guidelines and resources
            </p>
            <Button variant="outline" className="w-full">Read Docs</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Mail className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Email Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Contact us directly via email
            </p>
            <a href="mailto:support@ejidikefoundation.com">
              <Button variant="outline" className="w-full">Send Email</Button>
            </a>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>Send us a message and we'll get back to you soon</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Describe your issue or question in detail..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <a href="#" className="block text-sm text-primary hover:underline">
            → How to log a mentorship session
          </a>
          <a href="#" className="block text-sm text-primary hover:underline">
            → Best practices for virtual mentoring
          </a>
          <a href="#" className="block text-sm text-primary hover:underline">
            → Managing mentee expectations
          </a>
          <a href="#" className="block text-sm text-primary hover:underline">
            → Platform troubleshooting guide
          </a>
        </CardContent>
      </Card>
    </div>
  );
}