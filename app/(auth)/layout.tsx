/**
 * FILE PATH: /ejdk/ejidike-foundation/app/(auth)/layout.tsx
 * PURPOSE: Layout for authentication pages
 */

import { Suspense } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}