/**
 * FILE PATH: /ejdk/ejidike-foundation/app/mentor/resources/page.tsx
 * PURPOSE: Mentor resources and guides
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, HelpCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function MentorResourcesPage() {
  const resources = [
    {
      title: 'Mentorship Best Practices',
      description: 'Learn effective mentorship techniques and strategies',
      icon: BookOpen,
      type: 'Guide',
      href: '#'  // Can be updated with actual link later
    },
    {
      title: 'Communication Guidelines',
      description: 'How to communicate effectively with mentees',
      icon: FileText,
      type: 'Document',
      href: '#'  // Can be updated with actual link later
    },
    {
      title: 'FAQs',
      description: 'Frequently asked questions about mentorship',
      icon: HelpCircle,
      type: 'FAQ',
      href: '/mentor/faqs'
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
          const isActive = resource.href !== '#';

          return (
            <Card
              key={index}
              className={isActive ? 'hover:border-primary transition-colors' : 'opacity-60'}
            >
              <CardHeader>
                <Icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{resource.type}</p>
                  {isActive ? (
                    <Link href={resource.href}>
                      <Button size="sm" variant="outline">
                        View <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Coming Soon
                    </Button>
                  )}
                </div>
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
          <Button asChild variant="outline">
            <a href="mailto:support@ejidikefoundation.com">
              Contact Support
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}