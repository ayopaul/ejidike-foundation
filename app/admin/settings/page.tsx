'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Loader2, Globe, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ComingSoonSettings {
  enabled: boolean;
  password: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<ComingSoonSettings>({
    enabled: false,
    password: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/site-settings?key=coming_soon');
      const data = await response.json();

      if (data.value) {
        setSettings(data.value);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate
    if (settings.enabled && !settings.password.trim()) {
      toast.error('Password is required when Coming Soon mode is enabled');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'coming_soon',
          value: settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, enabled }));
  };

  const handlePasswordChange = (password: string) => {
    setSettings(prev => ({ ...prev, password }));
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Site Settings</h1>
            <p className="text-muted-foreground">
              Manage global site configuration
            </p>
          </div>

          {/* Coming Soon Mode Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <CardTitle>Coming Soon Mode</CardTitle>
              </div>
              <CardDescription>
                When enabled, visitors will be redirected to a password-protected coming soon page.
                Only users who enter the correct password can access the site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Toggle Switch */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="coming-soon-toggle" className="text-base font-medium">
                    Enable Coming Soon Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {settings.enabled
                      ? 'Site is currently in Coming Soon mode'
                      : 'Site is publicly accessible'}
                  </p>
                </div>
                <Switch
                  id="coming-soon-toggle"
                  checked={settings.enabled}
                  onCheckedChange={handleToggle}
                />
              </div>

              {/* Status Indicator */}
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                settings.enabled
                  ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                  : 'bg-green-50 border border-green-200 text-green-800'
              }`}>
                {settings.enabled ? (
                  <>
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Coming Soon mode is active. Public visitors will be blocked.</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-5 w-5" />
                    <span className="font-medium">Site is live and publicly accessible.</span>
                  </>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="site-password">
                  Access Password {settings.enabled && <span className="text-red-500">*</span>}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Users will need to enter this password to access the site when Coming Soon mode is enabled.
                </p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="site-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter access password"
                    value={settings.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">1.</span>
                  Enable Coming Soon mode and set a password above.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">2.</span>
                  Public visitors will be redirected to a &quot;Coming Soon&quot; page.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">3.</span>
                  Users with the password can enter it to gain access for 7 days.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">4.</span>
                  Admin pages remain accessible for you to manage the site.
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">5.</span>
                  Disable Coming Soon mode when you&apos;re ready to launch publicly.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
