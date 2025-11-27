/**
 * FILE PATH: /ejdk/ejidike-foundation/app/partner/layout.tsx
 * PURPOSE: Layout wrapper for partner portal
 */

'use client';

import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['partner']}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}