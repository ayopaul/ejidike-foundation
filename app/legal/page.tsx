// app/legal/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, FileText, Cookie } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase';

export default function LegalPage() {
  const [loading, setLoading] = useState(true);
  const [legalDocs, setLegalDocs] = useState({
    privacy_policy: '',
    terms_of_service: '',
    cookie_policy: ''
  });
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchLegalDocs();
  }, []);

  const fetchLegalDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('privacy_policy, terms_of_service, cookie_policy')
        .single();

      if (error) {
        console.error('Error fetching legal docs:', error);
      }

      if (data) {
        setLegalDocs({
          privacy_policy: data.privacy_policy || '',
          terms_of_service: data.terms_of_service || '',
          cookie_policy: data.cookie_policy || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format content - convert newlines to paragraphs
  const formatContent = (content: string) => {
    if (!content) return null;

    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
        {paragraph.split('\n').map((line, lineIndex) => (
          <span key={lineIndex}>
            {line}
            {lineIndex < paragraph.split('\n').length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
  };

  return (
    <SiteLayout>
      <section className="w-full bg-[#FBF4EE] px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto w-[90%] lg:w-[80%]">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 mb-4">
              Privacy & Terms
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Learn about how we collect, use, and protect your information, and the terms that govern your use of our platform.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="privacy" className="space-y-6">
              <TabsList className="bg-white/50">
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </TabsTrigger>
                <TabsTrigger value="terms" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </TabsTrigger>
                <TabsTrigger value="cookies" className="flex items-center gap-2">
                  <Cookie className="h-4 w-4" />
                  Cookie Policy
                </TabsTrigger>
              </TabsList>

              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Privacy Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    {legalDocs.privacy_policy ? (
                      formatContent(legalDocs.privacy_policy)
                    ) : (
                      <p className="text-muted-foreground italic">
                        Privacy policy content is being prepared. Please check back soon.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="terms">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Terms of Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    {legalDocs.terms_of_service ? (
                      formatContent(legalDocs.terms_of_service)
                    ) : (
                      <p className="text-muted-foreground italic">
                        Terms of service content is being prepared. Please check back soon.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cookies">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cookie className="h-5 w-5 text-primary" />
                      Cookie Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    {legalDocs.cookie_policy ? (
                      formatContent(legalDocs.cookie_policy)
                    ) : (
                      <p className="text-muted-foreground italic">
                        Cookie policy content is being prepared. Please check back soon.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
