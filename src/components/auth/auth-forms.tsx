'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { motion } from 'motion/react';

type AuthFormMode = 'login' | 'signup';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2c-27.4-26.2-64.3-42.3-105.8-42.3-84.3 0-153.2 68.9-153.2 153.2s68.9 153.2 153.2 153.2c97.4 0 135.8-67.5 140-101.4H248v-95h239.8c1.6 10.1 2.2 20.9 2.2 31.8z"></path>
  </svg>
);


export function AuthForms({ mode }: { mode: AuthFormMode }) {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If the user is logged in, redirect them to the dashboard.
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Account Created',
          description: 'Welcome to Cognify!',
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Welcome Back',
          description: 'Successfully logged in.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Signed In',
        description: 'Successfully logged in with Google.',
      });
    } catch (popupError: any) {
      console.warn("Popup blocked or failed, trying redirect:", popupError);
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError: any) {
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Error',
          description: redirectError.message,
        });
        setIsLoading(false);
      }
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="grid gap-6"
    >
      <form onSubmit={handleAuth} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="transition-all duration-200 focus:scale-[1.01]"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="transition-all duration-200 focus:scale-[1.01]"
          />
        </div>
        <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
          <Button type="submit" className="w-full active:scale-95 transition-transform" disabled={isLoading}>
            {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </Button>
        </motion.div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
        <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={isLoading} className="w-full active:scale-95 transition-transform">
          {isLoading ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Google
        </Button>
      </motion.div>
    </motion.div>
  );
}
