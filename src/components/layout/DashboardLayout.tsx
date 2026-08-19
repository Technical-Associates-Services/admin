'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  FileText, 
  Settings, 
  LogOut,
  Image as ImageIcon,
  MessageSquare,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null; // Let AuthContext handle redirect if not logged in

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Categories', href: '/categories', icon: Layers },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Brands', href: '/brands', icon: Layers },
    // { name: 'Shops', href: '/shops', icon: Layers }, // Hidden: Not used in frontend
    { name: 'Blogs', href: '/blogs', icon: FileText },
    // { name: 'Blog Categories', href: '/blog-categories', icon: Layers }, // Hidden: Not used in frontend
    { name: 'Pages', href: '/pages', icon: FileText },
    { name: 'Services', href: '/services', icon: Layers },
    { name: 'Solutions', href: '/solutions', icon: Layers },
    { name: 'Associates', href: '/associates', icon: Layers },
    { name: 'Sister Concerns', href: '/concerns', icon: Layers },
    { name: 'Banners', href: '/banners', icon: ImageIcon },
    { name: 'Testimonials', href: '/testimonials', icon: MessageSquare },
    { name: 'References', href: '/references', icon: Layers },
    // { name: 'Catalogues', href: '/catalogues', icon: FileText }, // Hidden: Standalone catalogues page not in frontend
    { name: 'Contact Messages', href: '/contacts', icon: MessageSquare },
    { name: 'Enquiries', href: '/enquiries', icon: MessageSquare },
    // { name: 'Reviews', href: '/reviews', icon: MessageSquare }, // Hidden: Not used in frontend
    // { name: 'Job Postings', href: '/jobs', icon: FileText }, // Hidden: Careers section doesn't exist in frontend
    // { name: 'Applications', href: '/candidates', icon: Users }, // Hidden: Careers section doesn't exist in frontend
    { name: 'FAQs', href: '/faqs', icon: FileText },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Subscribers', href: '/subscribers', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 flex flex-col fixed inset-y-0 z-10 hidden md:flex shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <img src="/logo.png" alt="TAS Logo" className="h-8 object-contain" />
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : (pathname === item.href || pathname.startsWith(`${item.href}/`));
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-500' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}>
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:pl-64 min-w-0">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 md:hidden shadow-sm">
          <img src="/logo.png" alt="TAS Logo" className="h-8 object-contain" />
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-5 w-5 text-red-600" />
          </Button>
        </header>
        <div className="flex-1 p-6 overflow-auto">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
