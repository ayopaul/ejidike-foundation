// /**
//  * FILE PATH: /ejdk/ejidike-foundation/app/(auth)/login/page.tsx
//  * PURPOSE: User login page - with fixed redirect
//  */

// 'use client';

// import { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Loader2, AlertCircle } from 'lucide-react';
// import { supabase } from '@/lib/supabase';
// import { toast } from 'sonner';

// export default function LoginPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const redirectTo = searchParams.get('redirect');

//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//     setError('');
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       // Validate inputs
//       if (!formData.email || !formData.password) {
//         setError('Please fill in all fields');
//         setLoading(false);
//         return;
//       }

//       // Sign in with Supabase
//       const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
//         email: formData.email,
//         password: formData.password
//       });

//       if (authError) {
//         console.error('Login error:', authError);
        
//         if (authError.message.includes('Invalid login credentials')) {
//           setError('Invalid email or password');
//         } else {
//           setError(authError.message);
//         }
//         setLoading(false);
//         return;
//       }

//       if (!authData.user) {
//         setError('Login failed. Please try again.');
//         setLoading(false);
//         return;
//       }

//       // Fetch user profile to get role
//       const { data: profiles, error: profileError } = await supabase
//         .from('profiles')
//         .select('role, id, user_id')
//         .eq('user_id', authData.user.id);

//       // Check if profile exists
//       if (profileError || !profiles || profiles.length === 0) {
//         console.error('Profile fetch error:', profileError);
        
//         // Profile doesn't exist - create it
//         console.log('Profile not found, creating one...');
        
//         const { error: createError } = await supabase
//           .from('profiles')
//           .insert({
//             user_id: authData.user.id,
//             email: authData.user.email || formData.email,
//             full_name: authData.user.user_metadata?.full_name || 'User',
//             role: authData.user.user_metadata?.role || 'applicant'
//           });

//         if (createError) {
//           console.error('Failed to create profile:', createError);
//           setError('Account setup incomplete. Please contact support.');
          
//           // Sign out the user
//           await supabase.auth.signOut();
//           setLoading(false);
//           return;
//         }

//         // Retry fetching the profile
//         const { data: newProfile } = await supabase
//           .from('profiles')
//           .select('role')
//           .eq('user_id', authData.user.id)
//           .single();

//         if (!newProfile) {
//           setError('Failed to complete login. Please try again.');
//           await supabase.auth.signOut();
//           setLoading(false);
//           return;
//         }

//         // Continue with the new profile
//         toast.success('Login successful! Redirecting...');
//         redirectUser(newProfile.role);
//         return;
//       }

//       const profile = profiles[0];

//       // Show success message
//       toast.success('Login successful! Redirecting...');

//       // Redirect based on role
//       redirectUser(profile.role);
//     } catch (err: any) {
//       console.error('Login error:', err);
//       setError(err.message || 'An unexpected error occurred');
//       setLoading(false);
//     }
//   };

//   const redirectUser = (role: string) => {
//     let destination = '/dashboard';
    
//     // Determine destination based on role
//     switch (role) {
//       case 'admin':
//         destination = '/admin/dashboard';
//         break;
//       case 'mentor':
//         destination = '/mentor/dashboard';
//         break;
//       case 'partner':
//         destination = '/partner/dashboard';
//         break;
//       case 'applicant':
//       default:
//         destination = '/dashboard';
//         break;
//     }
  
//     // Use redirectTo if provided
//     if (redirectTo) {
//       destination = redirectTo;
//     }
  
//     console.log('=== REDIRECT DEBUG ===');
//     console.log('User role:', role);
//     console.log('Destination:', destination);
//     console.log('Current URL:', window.location.href);
//     console.log('Attempting redirect...');
  
//     // Try multiple redirect methods
//     try {
//       // Method 1: window.location.href (most reliable)
//       window.location.href = destination;
      
//       // Method 2: router.push as backup (should not reach if Method 1 works)
//       setTimeout(() => {
//         console.log('Trying router.push as backup...');
//         router.push(destination);
//         router.refresh();
//       }, 1000);
//     } catch (error) {
//       console.error('Redirect error:', error);
//       // Fallback
//       router.push(destination);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
//           <CardDescription className="text-center">
//             Sign in to your Ejidike Foundation account
//           </CardDescription>
//         </CardHeader>

//         <form onSubmit={handleSubmit}>
//           <CardContent className="space-y-4">
//             {error && (
//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 name="email"
//                 type="email"
//                 placeholder="you@example.com"
//                 value={formData.email}
//                 onChange={handleChange}
//                 disabled={loading}
//                 required
//                 autoComplete="email"
//               />
//             </div>

//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password">Password</Label>
//                 <Link
//                   href="/forgot-password"
//                   className="text-sm text-primary hover:underline"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <Input
//                 id="password"
//                 name="password"
//                 type="password"
//                 placeholder="••••••••"
//                 value={formData.password}
//                 onChange={handleChange}
//                 disabled={loading}
//                 required
//                 autoComplete="current-password"
//               />
//             </div>
//           </CardContent>

//           <CardFooter className="flex flex-col space-y-4">
//             <Button
//               type="submit"
//               className="w-full"
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Signing in...
//                 </>
//               ) : (
//                 'Sign In'
//               )}
//             </Button>

//             <div className="text-sm text-center text-muted-foreground">
//               Don't have an account?{' '}
//               <Link href="/register" className="text-primary hover:underline font-medium">
//                 Sign up
//               </Link>
//             </div>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        setError(authError.message.includes('Invalid') ? 'Invalid email or password' : authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Login failed');
        setLoading(false);
        return;
      }

      // Get profile
      const { data: profiles } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', authData.user.id);

      const profile = profiles?.[0];
      
      if (!profile) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      // Determine destination
      const destinations: Record<string, string> = {
        'admin': '/admin/dashboard',
        'mentor': '/mentor/dashboard',
        'partner': '/partner/dashboard',
        'applicant': '/dashboard'
      };

      const destination = destinations[profile.role] || '/dashboard';

      console.log('Redirecting to:', destination);

      // Hard redirect
      window.location.href = destination;

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your Ejidike Foundation account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}