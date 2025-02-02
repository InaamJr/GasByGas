import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-black p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-white text-2xl font-bold">
            GasByGas Admin
          </Link>
          
          <div className="flex items-center gap-4">
            {session?.user?.isSuperAdmin && (
              <>
                <Link href="/settings">
                  <Button variant="ghost" className="text-white">
                    Settings
                  </Button>
                </Link>
                <Link href="/add-admin">
                  <Button variant="ghost" className="text-white">
                    Add Admin
                  </Button>
                </Link>
              </>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={session?.user?.image || ''} 
                      alt={session?.user?.name || ''} 
                    />
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => signOut()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
}
