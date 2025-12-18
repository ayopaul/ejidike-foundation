'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, Mail, AlertCircle } from 'lucide-react';

type VerificationState = 'loading' | 'verifying' | 'success' | 'error' | 'expired' | 'resend';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [state, setState] = useState<VerificationState>(token ? 'loading' : 'resend');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  // Verify the token when page loads
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setState('verifying');
    setMessage('Verifying your email...');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setState('success');
        setMessage(data.message || 'Email verified successfully!');
        setEmail(data.email || '');
      } else {
        if (data.error?.includes('expired')) {
          setState('expired');
          setMessage('Your verification link has expired.');
        } else {
          setState('error');
          setMessage(data.error || 'Verification failed');
        }
      }
    } catch (error) {
      setState('error');
      setMessage('An error occurred during verification');
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resendEmail) {
      setMessage('Please enter your email address');
      return;
    }

    setResending(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Verification email sent!');
        if (data.alreadyVerified) {
          setTimeout(() => router.push('/login'), 2000);
        }
      } else {
        setMessage(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        {/* Loading/Verifying State */}
        {(state === 'loading' || state === 'verifying') && (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-2xl">Verifying Email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </>
        )}

        {/* Success State */}
        {state === 'success' && (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Email Verified!</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {email && (
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Verified email: <strong>{email}</strong>
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button asChild className="w-full">
                <Link href="/login">Continue to Login</Link>
              </Button>
            </CardFooter>
          </>
        )}

        {/* Error State */}
        {state === 'error' && (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">Verification Failed</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setState('resend')}
              >
                Request New Verification Link
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">Back to Login</Link>
              </Button>
            </CardFooter>
          </>
        )}

        {/* Expired State */}
        {state === 'expired' && (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Link Expired</CardTitle>
              <CardDescription>
                Your verification link has expired. Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                className="w-full"
                onClick={() => setState('resend')}
              >
                Request New Verification Link
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">Back to Login</Link>
              </Button>
            </CardFooter>
          </>
        )}

        {/* Resend State */}
        {state === 'resend' && (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Mail className="h-16 w-16 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Resend Verification Email</CardTitle>
              <CardDescription>
                Enter your email address and we&apos;ll send you a new verification link.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleResendVerification}>
              <CardContent className="space-y-4">
                {message && (
                  <Alert variant={message.includes('sent') ? 'default' : 'destructive'}>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    disabled={resending}
                    required
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={resending}>
                  {resending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Verification Email'
                  )}
                </Button>

                <div className="text-sm text-center text-muted-foreground">
                  Remember your password?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Login
                  </Link>
                </div>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-2xl">Loading</CardTitle>
          <CardDescription>
            Please wait...
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
