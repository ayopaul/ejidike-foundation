/**
 * FILE PATH: /ejdk/ejidike-foundation/app/unauthorized/page.tsx
 * PURPOSE: Unauthorized access page
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function UnauthorizedPage() {
  const { profile, role, loading } = useUserProfile();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading && role && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium text-center mb-2">Your current role:</p>
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-sm">
                  {role}
                </Badge>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground text-center">
            If you believe this is an error, please contact your administrator.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}