'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset instructions sent to your email');
        setEmail('');
      } else {
        toast.error(data.error || 'Failed to send reset instructions');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
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

      {/* Right side with form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-md space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Forgot Password</h2>
            <p className="text-gray-400">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 rounded-xl text-lg"
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-[#E58D67] hover:bg-[#d47d57] text-white rounded-full text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>

            <div className="text-center">
              <a
                href="/"
                className="text-[#E58D67] hover:text-[#d47d57] text-sm"
              >
                Back to Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
