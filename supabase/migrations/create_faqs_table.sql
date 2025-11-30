-- =====================================================
-- Create FAQs Table
-- =====================================================
-- This script creates the FAQs table for admin-managed FAQs

-- Create the faqs table
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  "order" INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_faqs_is_published ON public.faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_order ON public.faqs("order");

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read published FAQs
CREATE POLICY "Anyone can view published FAQs"
  ON public.faqs
  FOR SELECT
  TO public
  USING (is_published = true);

-- Allow admins to manage FAQs
CREATE POLICY "Admins can manage FAQs"
  ON public.faqs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert some sample FAQs
INSERT INTO public.faqs (question, answer, category, "order", is_published) VALUES
  (
    'What is the mentorship program?',
    'Our mentorship program connects experienced professionals with aspiring individuals seeking guidance in their career journey. Mentors provide advice, share experiences, and help mentees achieve their professional goals.',
    'mentorship',
    1,
    true
  ),
  (
    'How do I become a mentor?',
    'To become a mentor, create an account and select the "Mentor" role. Complete your profile with your expertise areas, experience, and availability. Our admin team will review your application and approve qualified mentors.',
    'mentorship',
    2,
    true
  ),
  (
    'How many mentees can I have?',
    'You can set your own maximum number of mentees in your profile settings. We recommend starting with 1-3 mentees to ensure quality mentorship. You can adjust this number based on your availability.',
    'mentorship',
    3,
    true
  ),
  (
    'How do mentorship sessions work?',
    'Sessions can be conducted virtually, in-person, or via phone based on mutual agreement. After each session, mentors log the session details including duration, topics discussed, and next steps in the platform.',
    'mentorship',
    4,
    true
  ),
  (
    'What are the time commitments?',
    'Time commitments vary by mentor. Typically, mentors spend 1-2 hours per month with each mentee. You have full control over your schedule and availability.',
    'mentorship',
    5,
    true
  ),
  (
    'How do I apply for a grant?',
    'Browse available programs in the Programs section, review eligibility criteria, and click "Apply" on the program that fits your needs. Fill out the application form with required documents and submit for review.',
    'programs',
    1,
    true
  ),
  (
    'How long does the application review take?',
    'Application review typically takes 2-4 weeks. You can track your application status in the "My Applications" section of your dashboard.',
    'programs',
    2,
    true
  ),
  (
    'Can I apply for multiple programs?',
    'Yes, you can apply for multiple programs as long as you meet the eligibility criteria for each program.',
    'programs',
    3,
    true
  );
