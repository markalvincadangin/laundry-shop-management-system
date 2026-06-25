'use client';

import { AuthProvider } from '@/stores/auth-store';
import { LayoutProvider } from '@/stores/layout-store';
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
