/**
 * FILE PATH: /ejdk/ejidike-foundation/components/shared/StatusBadge.tsx
 * PURPOSE: Reusable status badge with color coding
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'active':
      case 'approved':
      case 'completed':
      case 'verified':
      case 'open':
        return 'default';
      
      case 'pending':
      case 'draft':
      case 'scheduled':
        return 'secondary';
      
      case 'rejected':
      case 'cancelled':
      case 'closed':
        return 'destructive';
      
      case 'submitted':
      case 'under review':
        return 'outline';
      
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getVariant(status)} className={cn(className)}>
      {status}
    </Badge>
  );
}