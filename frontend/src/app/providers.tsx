'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { LayoutProvider } from '@/contexts/LayoutContext';
import { QueryProvider } from '@/components/providers/QueryProvider';

/**
 * Global Providers aggregation.
 * Wraps the application in necessary context and infrastructure providers.
 * Follows FRONT-002 §4 organization.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <LayoutProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </LayoutProvider>
    </QueryProvider>
  );
}
