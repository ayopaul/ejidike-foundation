/**
 * FILE PATH: /ejdk/ejidike-foundation/app/mentor/profile/page.tsx
 * PURPOSE: Mentor profile management
 */

'use client';

import { useEffect, useState, KeyboardEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Save, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner';

export default function MentorProfilePage() {
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mentorProfile, setMentorProfile] = useState({
    expertise_areas: [] as string[],
    bio: '',
    years_of_experience: 0,
    max_mentees: 3,
    availability_status: 'available' as 'available' | 'limited' | 'unavailable'
  });
  const [expertiseInput, setExpertiseInput] = useState('');
  const [userInfo, setUserInfo] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (profile) {
      fetchMentorProfile();
      setUserInfo({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  const fetchMentorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('user_id', profile?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setMentorProfile({
          expertise_areas: data.expertise_areas || [],
          bio: data.bio || '',
          years_of_experience: data.years_of_experience || 0,
          max_mentees: data.max_mentees || 3,
          availability_status: data.availability_status || 'available'
        });
        // Clear input since tags will be shown as badges
        setExpertiseInput('');
      }
    } catch {
      // Profile fetch failed silently
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!mentorProfile.bio || mentorProfile.bio.trim() === '') {
      toast.error('Bio is required');
      return;
    }

    setSaving(true);

    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: userInfo.full_name,
          phone: userInfo.phone || null
        })
        .eq('id', profile?.id);

      if (profileError) {
        throw profileError;
      }

      // Update mentor profile
      const { error: mentorError } = await supabase
        .from('mentor_profiles')
        .upsert({
          user_id: profile?.id,
          expertise_areas: mentorProfile.expertise_areas,
          bio: mentorProfile.bio,
          years_of_experience: mentorProfile.years_of_experience,
          max_mentees: mentorProfile.max_mentees,
          availability_status: mentorProfile.availability_status
        });

      if (mentorError) {
        throw mentorError;
      }

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile', {
        description: error.message || 'Please try again'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${profile.user_id}/${fileName}`;  // Use user_id instead of profile.id

      // Delete old avatar if exists
      const oldAvatarPath = profile.avatar_url?.split('/profile-avatars/')[1];
      if (oldAvatarPath) {
        await supabase.storage
          .from('profile-avatars')
          .remove([oldAvatarPath]);
      }

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      toast.success('Avatar updated successfully');
      window.location.reload();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleExpertiseKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addExpertiseTag();
    }
  };

  const addExpertiseTag = () => {
    const trimmed = expertiseInput.trim();
    if (trimmed && !mentorProfile.expertise_areas.includes(trimmed)) {
      setMentorProfile({
        ...mentorProfile,
        expertise_areas: [...mentorProfile.expertise_areas, trimmed]
      });
      setExpertiseInput('');
    } else if (trimmed && mentorProfile.expertise_areas.includes(trimmed)) {
      toast.error('This expertise area already exists');
      setExpertiseInput('');
    }
  };

  const removeExpertiseTag = (tagToRemove: string) => {
    setMentorProfile({
      ...mentorProfile,
      expertise_areas: mentorProfile.expertise_areas.filter(tag => tag !== tagToRemove)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your mentor profile and availability</p>
      </div>

      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-2xl">
              {userInfo.full_name?.[0] || 'M'}
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            <label htmlFor="avatar-upload">
              <Button asChild disabled={uploading}>
                <span>
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </>
                  )}
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Max file size: 2MB. Formats: JPG, PNG, GIF
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={userInfo.full_name}
              onChange={(e) => setUserInfo({ ...userInfo, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userInfo.email}
              disabled
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+234..."
              value={userInfo.phone}
              onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mentor Info */}
      <Card>
        <CardHeader>
          <CardTitle>Mentor Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expertise">Expertise Areas</Label>
            <div className="space-y-2">
              {/* Display existing tags */}
              {mentorProfile.expertise_areas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mentorProfile.expertise_areas.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeExpertiseTag(tag)}
                        className="ml-2 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {/* Input for adding new tags */}
              <Input
                id="expertise"
                placeholder="Type an area and press Enter or comma"
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyDown={handleExpertiseKeyDown}
                onBlur={addExpertiseTag}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add. Click X to remove.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              placeholder="Tell mentees about your background and experience..."
              value={mentorProfile.bio}
              onChange={(e) => setMentorProfile({ ...mentorProfile, bio: e.target.value })}
              rows={5}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="years_of_experience">Years of Experience *</Label>
              <Input
                id="years_of_experience"
                type="number"
                min="0"
                max="50"
                step="1"
                value={mentorProfile.years_of_experience}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setMentorProfile({ ...mentorProfile, years_of_experience: Math.max(0, Math.min(50, val)) });
                }}
                required
              />
              <p className="text-xs text-muted-foreground">0-50 years</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_mentees">Max Mentees *</Label>
              <Input
                id="max_mentees"
                type="number"
                min="1"
                max="10"
                step="1"
                value={mentorProfile.max_mentees}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setMentorProfile({ ...mentorProfile, max_mentees: Math.max(1, Math.min(10, val)) });
                }}
                required
              />
              <p className="text-xs text-muted-foreground">1-10 mentees</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability">Availability Status</Label>
            <Select
              value={mentorProfile.availability_status}
              onValueChange={(value) => setMentorProfile({ ...mentorProfile, availability_status: value as 'available' | 'limited' | 'unavailable' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select availability status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="limited">Limited Availability</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
}