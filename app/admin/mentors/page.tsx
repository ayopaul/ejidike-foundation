/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/mentors/page.tsx
 * PURPOSE: Mentor management dashboard
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Users, CheckCircle, Calendar, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminMentorsPage() {
  const mentorSections = [
    {
      title: 'Mentor Applications',
      description: 'Review and approve mentor applications',
      icon: UserCheck,
      href: '/admin/mentors/applications',
      color: 'text-blue-600'
    },
    {
      title: 'Mentorship Matches',
      description: 'View and manage mentor-mentee matches',
      icon: Users,
      href: '/admin/mentors/matches',
      color: 'text-green-600'
    },
    {
      title: 'Mentorship Sessions',
      description: 'View all mentorship sessions and logs',
      icon: Calendar,
      href: '/admin/mentors/sessions',
      color: 'text-purple-600'
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mentor Management</h1>
        <p className="text-muted-foreground">Manage mentors, matches, and sessions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mentorSections.map((section) => {
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}