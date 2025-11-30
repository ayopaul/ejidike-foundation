# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ejidike Foundation is a Next.js 14 application (App Router) that manages educational and business grant programs, mentorship matching, and partner opportunities. The platform serves four distinct user roles: applicants, mentors, partners, and admins.

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Supabase (Auth, Database, Storage, Realtime)
- Tailwind CSS + Radix UI
- React Hook Form + Zod
- Sonner (toast notifications)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking (no output if successful)
npm run type-check

# Linting
npm run lint

# Production server
npm start
```

## Architecture & Key Concepts

### 1. Role-Based Route Organization

The app uses Next.js route groups to separate user interfaces by role:

```
app/
├── (applicant)/          # Applicant portal (route group - no /applicant in URL)
│   ├── dashboard/
│   ├── programs/
│   ├── apply/[id]/
│   ├── applications/
│   ├── opportunities/    # Browse all opportunities (internships, apprenticeships, volunteer)
│   └── mentorship/
├── admin/                # Admin portal (/admin routes)
│   ├── dashboard/
│   ├── programs/
│   ├── partners/
│   ├── mentors/
│   └── users/
├── mentor/               # Mentor portal (/mentor routes)
│   ├── dashboard/
│   └── profile/
├── partner/              # Partner portal (/partner routes)
│   ├── dashboard/
│   ├── opportunities/
│   └── organization/
└── api/                  # API routes
    ├── notifications/
    ├── partners/
    └── mentorship/
```

**Important:** Applicant routes use a route group `(applicant)` so URLs don't include `/applicant`. All other roles have the role prefix in their URLs.

### 2. Authentication & Profile System

**Critical ID Distinction:**
- `auth.users.id` - Supabase auth user ID (UUID)
- `profiles.user_id` - Foreign key to auth.users.id
- `profiles.id` - Profile table's primary key (UUID)

**Foreign Key Pattern:**
Most tables reference `profiles.id` (NOT `auth.users.id`). For example:
- `partner_organizations.user_id` → `profiles.id`
- `applications.applicant_id` → `profiles.id`
- `notifications.user_id` → `profiles.id`

**Profile Hook:**
Always use `useUserProfile()` hook which provides:
```typescript
const { user, profile, role, loading, error, refreshProfile } = useUserProfile();
// user = Supabase auth user (auth.users)
// profile = Profile object with profile.id and profile.user_id
// role = 'applicant' | 'mentor' | 'partner' | 'admin'
```

**Route Protection:**
Use `<ProtectedRoute allowedRoles={['admin']}>` wrapper to restrict access. It automatically redirects unauthorized users to their appropriate dashboard.

### 3. Database Patterns

**Type Safety:**
All database types are defined in `types/database.ts` matching the Supabase schema. Use these types instead of `any`.

**Supabase Client Usage:**
- Client components: `import { supabase } from '@/lib/supabase'` or `createSupabaseClient()`
- Server components: `createServerSupabaseClient()` (rarely used in this app)
- API routes: `createRouteHandlerClient({ cookies })`

**Common Query Pattern:**
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*, related_table(*)')
  .eq('user_id', profile.id)  // Use profile.id, not user.id
  .single();
```

### 4. Notification System

The platform has both **in-app** and **email** notifications:

**In-App Notifications:**
- Database table: `notifications`
- Helper functions: `lib/notifications.ts`
- API routes: `app/api/notifications/route.ts`
- UI: Header component with bell icon dropdown
- Real-time updates via Supabase Realtime

**Email Notifications:**
- Service: Brevo (300 emails/day free)
- Helper functions: `lib/email.ts`
- Templates: `lib/email-templates.ts`
- Test endpoint: `/api/test-email`

**Creating Notifications (In-App + Email):**
```typescript
import { createNotification } from '@/lib/notifications';
import { sendEmail } from '@/lib/email';
import { applicationApprovedEmail } from '@/lib/email-templates';

// 1. Create in-app notification
await createNotification({
  userId: profile.id,
  title: 'Application Approved',
  message: 'Your application has been approved!',
  type: 'success',
  link: `/applications/${applicationId}`
});

// 2. Send email notification
const emailContent = applicationApprovedEmail({
  applicantName: profile.full_name,
  programTitle: 'Program Name',
  reviewerNotes: 'Great application!',
  applicationId
});

await sendEmail({
  to: profile.email,
  toName: profile.full_name,
  subject: emailContent.subject,
  html: emailContent.html,
  text: emailContent.text
});
```

**Available Email Templates:**
- `applicationApprovedEmail` - Application approval
- `applicationRejectedEmail` - Application rejection
- `moreInfoRequestedEmail` - Request for additional info
- `partnerVerifiedEmail` - Partner organization verified
- `partnerRejectedEmail` - Partner organization rejected
- `mentorApprovedEmail` - Mentor application approved
- `mentorRejectedEmail` - Mentor application rejected

**Automated Notifications (In-App + Email):**
- Application approved/rejected/needs info → Notify applicant
- Partner verification/rejection → Notify partner + email
- Mentor approved/rejected → Notify mentor + email
- New partner signup → Notify admins (in-app only)
- New application submission → Notify admins (in-app only)

### 5. Application Form Pattern

Applications use auto-save drafts:
1. Draft application created automatically when user visits apply page
2. Form auto-saves every 2 seconds
3. File uploads linked to draft application ID
4. Status changes from 'draft' → 'submitted' on final submit

**Important:** Application forms check for existing drafts before creating new ones.

### 6. Partner System

**Partner Organization Workflow:**
1. Partner signs up → Profile created with role='partner'
2. Partner fills organization form → `partner_organizations` created with status='pending'
3. Admin reviews → Sets status to 'verified' or 'rejected' + records `verified_by` and `verified_at`
4. Partner receives in-app + email notification
5. Verified partners can create opportunities

**Verification Fields:**
When verifying/rejecting, always set:
- `verification_status`: 'verified' | 'rejected' | 'pending'
- `verified_by`: admin's profile.id
- `verified_at`: current timestamp

**Partner Opportunities Schema:**
The `partner_opportunities` table has these key fields:
```typescript
{
  id: string;
  partner_id: string;  // References partner_organizations.id (NOT profile.id!)
  title: string;
  description: string;
  type: string;  // 'internship' | 'apprenticeship' | 'volunteer'
  location: string;
  remote_option: boolean;
  requirements: string[];
  application_link?: string;
  application_deadline: string;
  status: 'open' | 'closed';
}
```

**CRITICAL PATTERN - Partner Opportunity Queries:**
Partner opportunities require a **two-step query** because `partner_id` references the organization ID, not the user's profile ID:

```typescript
// ✅ CORRECT - Two-step query
// Step 1: Get partner organization ID
const { data: org } = await supabase
  .from('partner_organizations')
  .select('id')
  .eq('user_id', profile.id)
  .single();

// Step 2: Query opportunities using organization ID
const { data: opportunities } = await supabase
  .from('partner_opportunities')
  .select('*')
  .eq('partner_id', org.id);

// ❌ WRONG - Direct query with profile.id won't work
const { data: opportunities } = await supabase
  .from('partner_opportunities')
  .select('*')
  .eq('partner_id', profile.id);  // This will return no results!
```

**Partner Pages Reference:**
- Dashboard: `/partner/dashboard` - Overview + quick stats
- Organization: `/partner/organization` - Edit org details + verification status
- Opportunities: `/partner/opportunities` - List all opportunities
- New Opportunity: `/partner/opportunities/new` - Create new opportunity
- Candidates: `/partner/candidates` - View applicants per opportunity
- Reports: `/partner/candidates/reports` - Analytics dashboard

**Common Partner System Bugs:**
1. ❌ Using `user.id` instead of `profile.id` when querying `partner_organizations`
2. ❌ Using `profile.id` instead of `org.id` when querying `partner_opportunities`
3. ❌ Forgetting to check `verification_status` before allowing opportunity creation
4. ❌ Using old field names (`opportunity_type` instead of `type`, `deadline` instead of `application_deadline`)

### 7. File Upload Pattern

Uses `FileUpload` component with Supabase Storage:
```typescript
<FileUpload
  applicationId={applicationId}
  onUploadSuccess={() => fetchDocuments()}
/>
```

Storage buckets: `application-documents`, `organization-logos`

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=

# Brevo Email Service (for email notifications)
BREVO_API_KEY=xkeysib-...  # Get from https://app.brevo.com/settings/keys/api
BREVO_FROM_EMAIL=update@ejidikefoundation.com
BREVO_FROM_NAME="Ejidike Foundation"
```

**Email Service:**
The platform uses Brevo (formerly Sendinblue) for transactional emails. Free tier: 300 emails/day. See `BREVO_SETUP_GUIDE.md` for setup instructions.

## Database Migrations

SQL migrations are in `supabase/migrations/`. To apply:
1. Open Supabase Dashboard → SQL Editor
2. Copy migration file content
3. Run the SQL

**Current Migrations:**
- `create_notifications_table.sql` - Notification system with RLS policies
- `fix_partner_opportunities_rls.sql` - RLS policies for partner_opportunities table

**Testing Endpoints:**
- `/api/test-email` - Test Brevo email integration
- `/api/debug-brevo` - Verify Brevo configuration

## Common Patterns & Best Practices

### When Creating Entities That Reference Users

Always use `profile.id`, not `user.id`:
```typescript
// ✅ CORRECT
await supabase
  .from('applications')
  .insert({
    applicant_id: profile.id,  // profile.id from useUserProfile()
    // ...
  });

// ❌ WRONG
await supabase
  .from('applications')
  .insert({
    applicant_id: user.id,  // user.id is auth.users.id - won't match foreign key
    // ...
  });
```

### When Adding Admin Actions

For admin actions that modify user data:
1. Track who performed the action (e.g., `verified_by`, `reviewed_by`)
2. Track when it happened (e.g., `verified_at`, `reviewed_at`)
3. Consider sending notifications to affected users
4. Use `useUserProfile()` to get admin's profile.id

### When Adding New Notifications

1. Update the trigger point (e.g., after status change)
2. Use appropriate notification type
3. Include a relevant link
4. Handle notification errors gracefully (don't fail the main operation)
5. Consider whether admins should be notified

### Toast Notifications

Use Sonner for user feedback:
```typescript
import { toast } from 'sonner';

toast.success('Success message');
toast.error('Error message', { description: 'Details' });
toast.info('Info', { action: { label: 'View', onClick: () => {} } });
```

### Date Formatting

Use `date-fns` for consistent date formatting:
```typescript
import { formatDistanceToNow } from 'date-fns';
import { formatDate } from '@/lib/utils';

// Relative time
formatDistanceToNow(new Date(created_at), { addSuffix: true }); // "5 minutes ago"

// Formatted date
formatDate(created_at); // Uses utility function
```

## Key Files to Reference

- `types/database.ts` - All database types
- `hooks/useUserProfile.ts` - Auth & profile hook
- `lib/supabase.ts` - Supabase client setup
- `lib/notifications.ts` - Notification helpers
- `components/auth/ProtectedRoute.tsx` - Route protection
- `components/layout/Header.tsx` - Main navigation & notifications UI

## Gotchas & Common Issues

1. **Foreign Key Errors:** Always use `profile.id` for user references, not `auth.users.id`
2. **Partner Opportunity Queries:** Must use two-step query (profile.id → org.id → opportunities)
3. **RLS Policies:** Most tables use profile-based RLS. Check Supabase dashboard if queries fail
4. **Route Groups:** Applicant routes don't have `/applicant` prefix due to route group
5. **Real-time:** Notifications use Supabase Realtime - ensure it's enabled in project
6. **Draft Applications:** Check for existing drafts before creating new ones to avoid duplicates
7. **Next.js Cache:** If routes 404 after adding pages, clear `.next` folder and restart dev server
8. **Brevo API Key:** Must start with `xkeysib-` (not `xsmtpsib-` which is SMTP key)
9. **Mentorship Foreign Keys:** Foreign key relationships may not be properly defined in the database. Instead of using Supabase joins with foreign key hints, fetch data separately and combine in JavaScript:
   ```typescript
   // ❌ WRONG - Foreign key hint may not exist
   const { data } = await supabase
     .from('mentorship_matches')
     .select('*, mentee:profiles!mentorship_matches_mentee_id_fkey(*)')

   // ✅ CORRECT - Fetch separately and combine
   const { data: matches } = await supabase
     .from('mentorship_matches')
     .select('*');

   const menteeIds = matches.map(m => m.mentee_id);
   const { data: mentees } = await supabase
     .from('profiles')
     .select('*')
     .in('id', menteeIds);

   // Combine in JavaScript
   const combined = matches.map(match => ({
     ...match,
     mentee: mentees.find(m => m.id === match.mentee_id)
   }));
   ```
10. **Duplicate Profiles:** Some users may have duplicate profile rows. Always use `.order('created_at', { ascending: false }).limit(1)` instead of `.single()` when fetching profiles
11. **Programs Status Values:** The `programs` table uses `status = 'active'`, NOT `'open'` (partner_opportunities uses `'open'`)

## Recent Fixes & Updates (November 2025)

**Partner System Overhaul:**
- ✅ Fixed partner organization verification status display (was hardcoded to "pending")
- ✅ Added real-time status updates when admin verifies organization
- ✅ Fixed all partner pages to use correct two-step query pattern (profile.id → org.id)
- ✅ Updated opportunity creation form to match actual database schema
- ✅ Added RLS policies for `partner_opportunities` table
- ✅ Fixed sidebar Reports link (`/partner/reports` → `/partner/candidates/reports`)
- ✅ Improved verification status badge visibility with icons and better contrast

**Notification System:**
- ✅ Implemented comprehensive email notification system using Brevo
- ✅ Created 7 professional HTML email templates
- ✅ Added in-app real-time notifications with Supabase Realtime
- ✅ Integrated notifications for application approvals, rejections, partner verification
- ✅ Added test endpoints for debugging email configuration

**Schema Updates:**
- ✅ Updated `partner_opportunities` field names (type, application_deadline, remote_option)
- ✅ Removed deprecated fields (duration, benefits, opportunity_type)
- ✅ Added `verified_by` and `verified_at` tracking for partner verification

**Documentation:**
- ✅ Created comprehensive notification documentation (NOTIFICATION_SYSTEM_COMPLETE.md)
- ✅ Added Brevo setup guides (BREVO_QUICKSTART.md, BREVO_SETUP_GUIDE.md)
- ✅ Documented 54 notification types in NOTIFICATION_GAPS_ANALYSIS.md
- ✅ Updated CLAUDE.md with partner system patterns

**Applicant Portal Fixes:**
- ✅ Renamed "Internships" to "Opportunities" to reflect all opportunity types
- ✅ Fixed applications page 406 error caused by duplicate profiles
- ✅ Fixed dashboard programs query (was using 'open' instead of 'active' status)
- ✅ Updated `useUserProfile` hook to handle duplicate profiles gracefully with `.order().limit(1)`

**Mentor Portal Fixes:**
- ✅ Fixed duplicate sidebar/header (removed redundant DashboardLayout wrapper)
- ✅ Fixed all mentor pages to use `profile.id` instead of `user.id`
- ✅ Fixed mentorship queries to fetch data separately (avoid foreign key join errors)
- ✅ Updated mentor dashboard to handle missing foreign key relationships
- ✅ Fixed `matched_at` column error (changed to use `start_date` or `created_at`)
- ✅ Fixed mentees list page to fetch profiles separately
- ✅ Fixed sessions pages to use 3-step query pattern (matches → sessions → profiles)
- ✅ Fixed log session page to fetch mentee data separately

**Profile & Authentication:**
- ✅ Fixed `useUserProfile` hook to handle duplicate profile rows (uses newest profile)
- ✅ Created cleanup migration for removing duplicate profiles
- ✅ Updated all portal pages to use `profile.id` consistently
