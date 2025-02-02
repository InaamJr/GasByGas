'use client';

import { Menu, Bell, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TopBarProps {
  toggleSidebar: () => void;
}

export function TopBar({ toggleSidebar }: TopBarProps) {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50">
      <div className="flex items-center h-[72px] px-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <Image
                src="/gas-flame.png"
                alt="Gas By Gas Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 max-w-2xl mx-auto px-4">
          <Input
            type="search"
            placeholder="Search"
            className="w-full h-10 bg-gray-50 border-gray-200 rounded-full"
          />
        </div>

        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={session?.user?.image || ''} 
                    alt={session?.user?.name || 'User'} 
                  />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              {session?.user?.isSuperAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="h-[1px] bg-gray-200" />
    </header>
  );
}