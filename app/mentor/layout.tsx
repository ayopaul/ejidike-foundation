/**
 * FILE PATH: /ejdk/ejidike-foundation/app/mentor/layout.tsx
 * PURPOSE: Layout wrapper for mentor portal
 */

'use client';

import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MentorLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}