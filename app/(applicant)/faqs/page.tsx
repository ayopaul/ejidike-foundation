/**
 * FILE PATH: /ejdk/ejidike-foundation/app/(applicant)/faqs/page.tsx
 * PURPOSE: Applicant FAQs - view FAQs created by admin
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  is_published: boolean;
  created_at: string;
}

export default function ApplicantFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .in('category', ['applicant', 'programs', 'general'])  // Show applicant, programs, and general FAQs
        .order('order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error: any) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Find answers to common questions about programs, applications, and more
        </p>
      </div>

      {faqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No FAQs available at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.id} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => toggleExpand(faq.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base">{faq.question}</CardTitle>
                  {expandedId === faq.id ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              {expandedId === faq.id && (
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {faq.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Still have questions?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you can't find the answer you're looking for, please contact the support team.
          </p>
          <p className="text-sm">
            Email: <a href="mailto:support@ejidikefoundation.com" className="text-primary hover:underline">
              support@ejidikefoundation.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
