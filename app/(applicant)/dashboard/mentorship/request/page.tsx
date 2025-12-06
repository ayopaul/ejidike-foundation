// app/(applicant)/dashboard/mentorship/request/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Users,
  Search,
  Briefcase,
  Star,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function RequestMentorPage() {
  const router = useRouter();
  const { user, profile } = useUserProfile();
  const supabase = createSupabaseClient();
  
  const [mentors, setMentors] = useState<any[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailableMentors();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = mentors.filter((mentor) =>
        mentor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.expertise?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMentors(filtered);
    } else {
      setFilteredMentors(mentors);
    }
  }, [searchQuery, mentors]);

  const fetchAvailableMentors = async () => {
    try {
      setLoading(true);

      // First, get all mentor profiles that are available
      const { data: mentorProfiles, error: mentorError } = await supabase
        .from('mentor_profiles')
        .select('user_id, headline, expertise_areas, bio, years_of_experience, linkedin_url, availability_status')
        .eq('availability_status', 'available');

      if (mentorError) {
        console.error('Error fetching mentor profiles:', mentorError);
        throw mentorError;
      }

      if (!mentorProfiles || mentorProfiles.length === 0) {
        setMentors([]);
        setFilteredMentors([]);
        setLoading(false);
        return;
      }

      // Get the profile IDs of available mentors
      const mentorUserIds = mentorProfiles.map(mp => mp.user_id);

      // Fetch the profile details for these mentors
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'mentor')
        .in('id', mentorUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Combine the data
      const formattedMentors = (profiles || []).map((p: any) => {
        const mentorProfile = mentorProfiles.find(mp => mp.user_id === p.id);
        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          expertise: mentorProfile?.headline || mentorProfile?.expertise_areas?.join(', ') || 'General Mentorship',
          bio: mentorProfile?.bio || '',
          years_experience: mentorProfile?.years_of_experience || 0,
          linkedin_url: mentorProfile?.linkedin_url,
        };
      });

      setMentors(formattedMentors);
      setFilteredMentors(formattedMentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Error', {
        description: 'Failed to load available mentors',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentor = async () => {
    if (!selectedMentor) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/mentorship/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentor_id: selectedMentor.id,
          mentee_id: profile?.id,
          goals: goals || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request mentor');
      }

      toast.success('Request Sent!', {
        description: `Your mentorship request has been sent to ${selectedMentor.full_name}. We'll notify you when they respond.`,
      });

      router.push('/dashboard/mentorship');
    } catch (error: any) {
      toast.error('Error', {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/dashboard/mentorship">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mentorship
              </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Find a Mentor</h2>
            <p className="text-muted-foreground">
              Browse our network of experienced professionals and request mentorship
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, expertise, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredMentors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Mentors Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search criteria'
                    : 'No mentors are currently available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMentors.map((mentor) => (
                <Card
                  key={mentor.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedMentor(mentor)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg">
                          {mentor.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{mentor.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{mentor.expertise}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {mentor.bio || 'No bio available'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {mentor.years_experience} years
                      </span>
                      {mentor.linkedin_url && (
                        <a
                          href={mentor.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          LinkedIn
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => setSelectedMentor(mentor)}
                    >
                      Request Mentorship
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
      </div>

      {/* Request Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedMentor.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{selectedMentor.full_name}</CardTitle>
                    <p className="text-muted-foreground">{selectedMentor.expertise}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMentor(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">About</h4>
                <p className="text-muted-foreground">{selectedMentor.bio}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Experience</h4>
                <p className="text-muted-foreground">
                  {selectedMentor.years_experience} years in {selectedMentor.expertise}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Your Goals (Optional)
                </label>
                <Textarea
                  placeholder="What do you hope to achieve with this mentorship? (e.g., career guidance, skill development, industry insights)"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Sharing your goals helps your mentor prepare for your first session
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMentor(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestMentor}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Sending Request...' : 'Send Request'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}