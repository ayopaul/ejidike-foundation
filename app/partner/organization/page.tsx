/**
 * FILE PATH: /ejdk/ejidike-foundation/app/partner/organization/page.tsx
 * PURPOSE: Manage organization profile
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Upload, Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner';
import { notifyAdmins } from '@/lib/notifications';

export default function OrganizationProfilePage() {
  const { user, profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [organization, setOrganization] = useState({
    organization_name: '',
    description: '',
    website: '',
    logo_url: '',
    sector: '',
    location: '',
    verification_status: 'pending' as 'pending' | 'verified' | 'rejected'
  });
  const [contactInfo, setContactInfo] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (user && profile) {
      fetchOrganization();
      setContactInfo({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });

      // Subscribe to real-time updates for verification status
      const channel = supabase
        .channel('partner_org_updates')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'partner_organizations',
          filter: `user_id=eq.${profile.id}`
        }, (payload) => {
          const updatedOrg = payload.new as any;
          setOrganization(prev => ({
            ...prev,
            verification_status: updatedOrg.verification_status || 'pending'
          }));

          // Show toast notification when status changes
          if (updatedOrg.verification_status === 'verified') {
            toast.success('Your organization has been verified!', {
              description: 'You can now create opportunities for applicants.'
            });
          } else if (updatedOrg.verification_status === 'rejected') {
            toast.error('Organization verification was not approved', {
              description: 'Please contact support for more information.'
            });
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, profile]);

  const fetchOrganization = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_organizations')
        .select('*')
        .eq('user_id', profile?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching organization:', error);
        throw error;
      }
      
      if (data) {
        setOrganization({
          organization_name: data.organization_name || '',
          description: data.description || '',
          website: data.website || '',
          logo_url: data.logo_url || '',
          sector: data.sector || '',
          location: data.location || '',
          verification_status: data.verification_status || 'pending'
        });
      }
    } catch (error: any) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) {
      toast.error('User profile not loaded. Please refresh the page.');
      return;
    }

    if (!organization.organization_name || !organization.sector) {
      toast.error('Please fill in all required fields (Organization Name and Sector)');
      return;
    }

    setSaving(true);

    try {
      // First, verify the profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profile.id)
        .single();

      if (checkError || !existingProfile) {
        console.error('Profile check error:', checkError);
        toast.error('Profile not found. Please contact support.');
        setSaving(false);
        return;
      }

      // Update contact info in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: contactInfo.full_name,
          phone: contactInfo.phone
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Check if organization already exists
      const { data: existingOrg } = await supabase
        .from('partner_organizations')
        .select('id, verification_status')
        .eq('user_id', profile.id)
        .maybeSingle();

      const isNewSubmission = !existingOrg;

      // Update organization - include all required fields
      const { error: orgError } = await supabase
        .from('partner_organizations')
        .upsert({
          user_id: profile.id,
          organization_name: organization.organization_name,
          description: organization.description,
          website: organization.website,
          logo_url: organization.logo_url,
          sector: organization.sector,
          location: organization.location,
          contact_person: contactInfo.full_name,
          contact_email: profile.email || user.email || '',
          contact_phone: contactInfo.phone,
          verification_status: 'pending'
        });

      if (orgError) {
        console.error('Organization upsert error:', orgError);
        throw orgError;
      }

      // Notify admins about new partner verification request
      if (isNewSubmission) {
        try {
          await notifyAdmins({
            title: 'New Partner Verification Request',
            message: `${organization.organization_name} has submitted their organization profile for verification.`,
            type: 'info',
            link: `/admin/partners/${profile.id}`,
            metadata: {
              organizationName: organization.organization_name,
              partnerId: profile.id
            }
          });
        } catch (notifError) {
          console.error('Failed to notify admins:', notifError);
          // Don't fail the save if notification fails
        }
      }

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile', {
        description: error.message || 'Please try again'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

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
      const filePath = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(filePath);

      setOrganization({ ...organization, logo_url: publicUrl });

      toast.success('Logo uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
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
        <h1 className="text-3xl font-bold">Organization Profile</h1>
        <p className="text-muted-foreground">Manage your organization information</p>
      </div>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
        </CardHeader>
        <CardContent>
          {organization.verification_status === 'verified' ? (
            <>
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Verified
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Your organization has been verified! You can now create opportunities.
              </p>
            </>
          ) : organization.verification_status === 'rejected' ? (
            <>
              <Badge variant="destructive" className="font-semibold">
                <XCircle className="h-4 w-4 mr-1.5" />
                Rejected
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Your organization verification was not approved. Please contact support for details.
              </p>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="font-semibold">
                <Clock className="h-4 w-4 mr-1.5" />
                Pending Verification
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Your organization is under review. You'll be notified once verified.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Logo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={organization.logo_url} />
            <AvatarFallback>
              <Building2 className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              type="file"
              id="logo-upload"
              className="hidden"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploading}
            />
            <label htmlFor="logo-upload">
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
                      Upload Logo
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

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org_name">Organization Name *</Label>
            <Input
              id="org_name"
              value={organization.organization_name}
              onChange={(e) => setOrganization({ ...organization, organization_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector">Sector *</Label>
            <Select
              value={organization.sector}
              onValueChange={(value) => setOrganization({ ...organization, sector: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your organization sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Agriculture">Agriculture</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Lagos, Nigeria"
              value={organization.location}
              onChange={(e) => setOrganization({ ...organization, location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell us about your organization..."
              value={organization.description}
              onChange={(e) => setOrganization({ ...organization, description: e.target.value })}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={organization.website}
              onChange={(e) => setOrganization({ ...organization, website: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Contact Person</Label>
            <Input
              id="full_name"
              value={contactInfo.full_name}
              onChange={(e) => setContactInfo({ ...contactInfo, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={contactInfo.email}
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
              value={contactInfo.phone}
              onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
            />
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