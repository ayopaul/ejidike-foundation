'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { UserRole, Profile } from '@/types/database';
import { createSupabaseClient } from '@/lib/supabase';
import {
  LayoutDashboard,
  FileText,
  Users,
  Award,
  Briefcase,
  Calendar,
  Settings,
  BookOpen,
  Building2,
  UserCog,
  MessageSquare,
  BarChart3,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const navigationConfig: Record<UserRole, NavItem[]> = {
  applicant: [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Browse Programs', href: '/browse-programs', icon: Award },
    { title: 'My Applications', href: '/applications', icon: FileText },
    { title: 'Mentorship', href: '/mentorship', icon: Users },
    { title: 'Opportunities', href: '/opportunities', icon: Briefcase },
    { title: 'My Events', href: '/my-events', icon: Calendar },
    { title: 'Profile', href: '/profile', icon: Settings },
  ],
  mentor: [
    { title: 'Dashboard', href: '/mentor/dashboard', icon: LayoutDashboard },
    { title: 'My Mentees', href: '/mentor/mentees', icon: Users },
    { title: 'Sessions', href: '/mentor/sessions', icon: Calendar },
    { title: 'Resources', href: '/mentor/resources', icon: BookOpen },
    { title: 'My Events', href: '/mentor/my-events', icon: Calendar },
    { title: 'FAQs', href: '/mentor/faqs', icon: HelpCircle },
    { title: 'Profile', href: '/mentor/profile', icon: Settings },
    { title: 'Support', href: '/mentor/support', icon: MessageSquare },
  ],
  partner: [
    { title: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard },
    { title: 'Organization', href: '/partner/organization', icon: Building2 },
    { title: 'Opportunities', href: '/partner/opportunities', icon: Briefcase },
    { title: 'Candidates', href: '/partner/candidates', icon: Users },
    { title: 'My Events', href: '/partner/my-events', icon: Calendar },
    { title: 'Reports', href: '/partner/candidates/reports', icon: BarChart3 },
  ],
  admin: [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Applications', href: '/admin/applications', icon: FileText },
    { title: 'Programs', href: '/admin/programs', icon: Award },
    { title: 'Mentors', href: '/admin/mentors', icon: Users },
    { title: 'Partners', href: '/admin/partners', icon: Building2 },
    { title: 'Users', href: '/admin/users', icon: UserCog },
    { title: 'Events', href: '/admin/content/events', icon: Calendar },
    { title: 'Contact Messages', href: '/admin/content/contact-messages', icon: MessageSquare },
    { title: 'Content', href: '/admin/content', icon: BookOpen },
  ],
};

interface SidebarProps {
  role: UserRole;
  profile: Profile | null;
}

export function Sidebar({ role, profile }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navigationConfig[role];
  const supabase = createSupabaseClient();
  const [pendingMenteesCount, setPendingMenteesCount] = useState(0);

  // Fetch pending mentees count for mentors
  useEffect(() => {
    if (role === 'mentor' && profile?.id) {
      const fetchPendingCount = async () => {
        const { count } = await supabase
          .from('mentorship_matches')
          .select('*', { count: 'exact', head: true })
          .eq('mentor_id', profile.id)
          .eq('status', 'pending');

        setPendingMenteesCount(count || 0);
      };

      fetchPendingCount();

      // Set up realtime subscription to update count
      const channel = supabase
        .channel('mentorship_matches_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mentorship_matches',
            filter: `mentor_id=eq.${profile.id}`
          },
          () => {
            fetchPendingCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [role, profile?.id]);

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="p-6">
        <Link href="/" className="flex items-center">
          <img
            src="https://njafmfnkhzcpxzhwskpy.supabase.co/storage/v1/object/public/organization-logos/Ejidike%20foudnation%20logo.png"
            alt="Ejidike Foundation"
            className="h-12 w-auto object-contain"
          />
        </Link>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const showBadge = role === 'mentor' && item.href === '/mentor/mentees' && pendingMenteesCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.title}</span>
                {showBadge && (
                  <Badge
                    variant={isActive ? "secondary" : "default"}
                    className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {pendingMenteesCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}