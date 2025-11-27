/**
 * FILE PATH: /ejdk/ejidike-foundation/app/mentor/resources/page.tsx
 * PURPOSE: Mentor resources and guides
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Video, BookOpen, HelpCircle } from 'lucide-react';

export default function MentorResourcesPage() {
  const resources = [
    {
      title: 'Mentorship Best Practices',
      description: 'Learn effective mentorship techniques and strategies',
      icon: BookOpen,
      type: 'Guide'
    },
    {
      title: 'Communication Guidelines',
      description: 'How to communicate effectively with mentees',
      icon: FileText,
      type: 'Document'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch tutorials on using the mentorship platform',
      icon: Video,
      type: 'Video'
    },
    {
      title: 'FAQs',
      description: 'Frequently asked questions about mentorship',
      icon: HelpCircle,
      type: 'FAQ'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resources</h1>
        <p className="text-muted-foreground">Access mentorship guides and resources</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {resources.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <Card key={index} className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <Icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{resource.type}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you have questions or need assistance with mentorship, please contact the admin team.
          </p>
          <p className="text-sm">
            Email: <a href="mailto:support@ejidikefoundation.com" className="text-primary hover:underline">
              support@ejidikefoundation.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}