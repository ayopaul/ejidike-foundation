/**
 * FILE PATH: /app/api/partners/notify-admin-signup/route.ts
 * PURPOSE: Send email notification to admins when a new partner signs up
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { newPartnerSignupEmail } from '@/lib/email-templates';

// Use service role for fetching admin emails
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, partnerName, partnerEmail, organizationName } = body;

    if (!partnerId || !organizationName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch all admin profiles
    const { data: admins, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'admin');

    if (adminError) {
      console.error('Error fetching admins:', adminError);
      return NextResponse.json(
        { error: 'Failed to fetch admin users' },
        { status: 500 }
      );
    }

    if (!admins || admins.length === 0) {
      console.log('No admin users found to notify');
      return NextResponse.json({ success: true, message: 'No admins to notify' });
    }

    // Send email to each admin
    const emailPromises = admins.map(async (admin) => {
      if (!admin.email) return null;

      const emailContent = newPartnerSignupEmail({
        adminName: admin.full_name || 'Admin',
        partnerName: partnerName || 'Partner',
        partnerEmail: partnerEmail || '',
        organizationName: organizationName,
        partnerId: partnerId
      });

      return sendEmail({
        to: admin.email,
        toName: admin.full_name || 'Admin',
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r?.success).length;

    return NextResponse.json({
      success: true,
      message: `Notified ${successCount} admin(s)`,
      totalAdmins: admins.length,
      emailsSent: successCount
    });
  } catch (error: any) {
    console.error('Error notifying admins:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to notify admins' },
      { status: 500 }
    );
  }
}
