'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRole } from '@/types/database';
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
    { title: 'Programs', href: '/programs', icon: Award },
    { title: 'My Applications', href: '/applications', icon: FileText },
    { title: 'Mentorship', href: '/mentorship', icon: Users },
    { title: 'Internships', href: '/internships', icon: Briefcase },
    { title: 'Profile', href: '/profile', icon: Settings },
  ],
  mentor: [
    { title: 'Dashboard', href: '/mentor/dashboard', icon: LayoutDashboard },
    { title: 'My Mentees', href: '/mentor/mentees', icon: Users },
    { title: 'Sessions', href: '/mentor/sessions', icon: Calendar },
    { title: 'Resources', href: '/mentor/resources', icon: BookOpen },
    { title: 'Profile', href: '/mentor/profile', icon: Settings },
    { title: 'Support', href: '/mentor/support', icon: MessageSquare },
  ],
  partner: [
    { title: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard },
    { title: 'Organization', href: '/partner/organization', icon: Building2 },
    { title: 'Opportunities', href: '/partner/opportunities', icon: Briefcase },
    { title: 'Candidates', href: '/partner/candidates', icon: Users },
    { title: 'Reports', href: '/partner/reports', icon: BarChart3 },
  ],
  admin: [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Applications', href: '/admin/applications', icon: FileText },
    { title: 'Programs', href: '/admin/programs', icon: Award },
    { title: 'Mentors', href: '/admin/mentors', icon: Users },
    { title: 'Partners', href: '/admin/partners', icon: Building2 },
    { title: 'Users', href: '/admin/users', icon: UserCog },
    { title: 'Content', href: '/admin/content', icon: BookOpen },
  ],
};

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navigationConfig[role];

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="text-xl font-bold">Ejidike</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
                {item.title}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}