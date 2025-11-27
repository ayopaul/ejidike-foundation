/**
 * FILE PATH: /ejdk/ejidike-foundation/app/(applicant)/layout.tsx
 * PURPOSE: Layout wrapper for all applicant pages with auth protection
 */

import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ApplicantLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['applicant']}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}