/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/content/page.tsx
 * PURPOSE: Content management dashboard
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, HelpCircle, Scale, Bell } from 'lucide-react';
import Link from 'next/link';

export default function AdminContentPage() {
  const contentSections = [
    {
      title: 'Announcements',
      description: 'Manage site-wide announcements',
      icon: Bell,
      href: '/admin/content/announcements',
      color: 'text-blue-600'
    },
    {
      title: 'FAQs',
      description: 'Manage frequently asked questions',
      icon: HelpCircle,
      href: '/admin/content/faqs',
      color: 'text-green-600'
    },
    {
      title: 'Legal Documents',
      description: 'Edit privacy policy, terms, and legal content',
      icon: Scale,
      href: '/admin/content/legal',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">Manage site content and information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contentSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <Icon className={`h-8 w-8 ${section.color} mb-2`} />
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Manage
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}