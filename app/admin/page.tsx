/**
 * FILE PATH: /ejdk/ejidike-foundation/app/admin/page.tsx
 * PURPOSE: Admin portal landing page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

  return null;
}