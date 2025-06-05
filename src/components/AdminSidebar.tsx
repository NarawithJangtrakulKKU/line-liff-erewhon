'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { 
  BarChart3, 
  Package, 
  Tag, 
  Users, 
  LogOut,
  Menu,
  X,
  ChartPie,
  Star,
  ChartBar
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// ประเภทของรายการในเมนู
interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  isMobile?: boolean;
}

export default function AdminSidebar({ isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ฟังก์ชันสำหรับการออกจากระบบ
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  // รายการเมนู sidebar - สามารถเพิ่มได้ในอนาคต
  const sidebarItems: SidebarItem[] = [
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: <ChartPie className="h-5 w-5" />,
    },
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      title: 'Categories',
      href: '/admin/categories',
      icon: <Tag className="h-5 w-5" />
    },
    {
      title: 'Products',
      href: '/admin/products',
      icon: <Package className="h-5 w-5" />
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />
    },
    {
        title: 'Orders',
        href: '/admin/orders',
        icon: <Package className="h-5 w-5" />
    },
    {
      title: 'Reviews',
      href: '/admin/reviews',
      icon: <Star className="h-5 w-5" />
    },
    {
      title: 'Reports',
      href: '/admin/reports',
      icon: <ChartBar className="h-5 w-5" />
    }
  ];

  // Component สำหรับ Logout Button
  const LogoutButton = ({ mobile = false }: { mobile?: boolean }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="flex-shrink-0 w-full group flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
          onClick={mobile ? () => setIsMobileMenuOpen(false) : undefined}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Log Out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out? Any unsaved changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="bg-black hover:bg-gray-800"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Mobile Menu Trigger (แสดงเฉพาะบน mobile)
  const MobileMenuTrigger = () => (
    <div className="md:hidden">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open main menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-black text-white p-0 w-64">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <span className="text-xl font-bold">Admin Dashboard</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {sidebarItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    pathname === item.href
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              ))}
            </nav>
            
            {/* Logout */}
            <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
              <LogoutButton mobile={true} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  // Desktop Sidebar (แสดงเฉพาะบน desktop)
  const DesktopSidebar = () => (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
      <div className="flex flex-col flex-grow pt-5 bg-black text-white overflow-y-auto">
        {/* Header */}
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <span className="text-xl font-bold">Admin Dashboard</span>
        </div>
        
        {/* Navigation */}
        <div className="mt-5 flex-1 flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  pathname === item.href
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Logout */}
        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  );

  // ถ้าเป็น isMobile prop (สำหรับใช้ใน mobile header) ให้แสดงแค่ trigger button
  if (isMobile) {
    return <MobileMenuTrigger />;
  }

  // แสดงทั้ง Desktop และ Mobile Menu
  return (
    <>
      <DesktopSidebar />
      <MobileMenuTrigger />
    </>
  );
}