/**
 * FILE PATH: /ejdk/ejidike-foundation/app/(auth)/layout.tsx
 * PURPOSE: Layout for authentication pages (login, register)
 */

import { ReactNode } from 'react';

export const metadata = {
  title: 'Authentication - Ejidike Foundation',
  description: 'Sign in or create an account',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}