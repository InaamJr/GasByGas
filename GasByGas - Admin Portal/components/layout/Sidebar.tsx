'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import { 
  Store, 
  Users, 
  Coins,
  ClipboardList,
  HelpCircle,
  UserPlus,
  LogOut,
  Calendar,
  Settings,
  Cylinder
} from 'lucide-react';

interface MenuItem {
  name: string;
  icon: any;
  href: string;
  superAdminOnly?: boolean;
}

interface MenuSection {
  name: string;
  items: MenuItem[];
}

const menuItems: MenuSection[] = [
  { 
    name: 'General', 
    items: [
      { name: 'Outlets', icon: Store, href: '/dashboard/outlets' },
      { name: 'Consumers', icon: Users, href: '/dashboard/consumers' },
      { name: 'Tokens', icon: Coins, href: '/dashboard/tokens' },
      { name: 'Pending Orders', icon: ClipboardList, href: '/dashboard/orders' },
      { name: 'Pending Registration Requests', icon: HelpCircle, href: '/dashboard/pending-registrations' },
      { name: 'Scheduled Deliveries', icon: Calendar, href: '/dashboard/scheduled-deliveries' },
    ]
  },
  { 
    name: 'Settings', 
    items: [
      { name: 'Add Admin', icon: UserPlus, href: '/dashboard/add-admin', superAdminOnly: true },
      { name: 'Cylinder Types', icon: Cylinder, href: '/dashboard/settings/cylinder-types', superAdminOnly: true },
    ]
  },
];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const filteredMenuItems = menuItems.map(section => ({
    ...section,
    items: section.items.filter(item => 
      !item.superAdminOnly || session?.user?.isSuperAdmin
    )
  })).filter(section => section.items.length > 0);

  return (
    <aside className={`
      fixed left-0 top-[72px] h-[calc(100vh-72px)] bg-white/80 w-64 
      transition-transform duration-300 ease-in-out z-40 backdrop-blur-sm
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      shadow-lg
    `}>
      <div className="flex flex-col h-full p-6">
        <div className="flex-1">
          <div>
            <h2 className="text-3xl font-semibold text-gray-700">Welcome,</h2>
            <p className="text-2xl text-gray-500">{session?.user?.name || 'Admin'}</p>
            {session?.user?.isSuperAdmin && (
              <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                Super Admin
              </span>
            )}
          </div>

          <nav className="mt-8 space-y-8">
            {filteredMenuItems.map((section) => (
              <div key={section.name}>
                <h3 className="text-sm font-medium text-gray-500 mb-4">{section.name}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link href={item.href}>
                          <span className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                            isActive 
                              ? 'bg-gray-200 text-gray-900' 
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}>
                            <item.icon className="h-5 w-5" />
                            {item.name}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto space-y-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-600 hover:text-gray-900"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>

          <div className="text-sm text-gray-400">
            2025 Gas By Gas
          </div>
        </div>
      </div>
    </aside>
  );
}