'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        router.push('/dashboard');
        toast.success('Login successful!');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side with background image */}
      <div className="flex-1 relative hidden lg:block">
        <div className="absolute inset-0 bg-black/90 z-10" />
        <Image
          src="/Login.png"
          alt="Gas flame background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-20 left-10 z-20">
          <div className="flex items-center gap-4 mb-6">
            <Image
              src="/loginLogo.png"
              alt="GasByGas Logo"
              width={100}
              height={100}
            />
            <div className="text-white">
              <h1 className="text-4xl font-bold">GAS BY</h1>
              <h1 className="text-4xl font-bold">GAS</h1>
            </div>
          </div>
          <p className="text-white text-xl tracking-wide">MADE CONVENIENT</p>
        </div>
      </div>

      {/* Right side with login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white">Admin Login</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              <Input
                type="text"
                placeholder="Enter Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 rounded-xl text-lg"
                disabled={isLoading}
              />
              <Input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 rounded-xl text-lg"
                disabled={isLoading}
              />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-[#E58D67] hover:text-[#d47d57] text-sm"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 bg-[#E58D67] hover:bg-[#d47d57] text-white rounded-full text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'GET STARTED'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}