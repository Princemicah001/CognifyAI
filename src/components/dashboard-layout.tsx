
'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from './logo';
import { UserNav } from './user-nav';
import { LayoutDashboard, BookPlus, History, Settings, User as UserIcon, LogOut, Flame } from 'lucide-react';
import Link from 'next/link';
import Loading from '@/app/loading';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { AskCognifyFAB } from './ask-cognify-fab';
import { motion } from 'motion/react';


const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/materials/create', label: 'New Source', icon: BookPlus },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-card border-t border-border shadow-lg">
        <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="inline-flex flex-col items-center justify-center">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200",
                    pathname === item.href 
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 font-bold scale-105" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px]">{item.label}</span>
                </motion.div>
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <button type="button" className="inline-flex flex-col items-center justify-center">
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-muted-foreground hover:bg-muted"
                    >
                      <UserIcon className="w-5 h-5 mb-0.5" />
                      <span className="text-[10px]">Profile</span>
                    </motion.div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </div>
  )
}

const DailyStreak = () => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // This is a placeholder for more robust streak logic.
    // In a real app, this would involve checking last login date from Firestore.
    const storedStreak = localStorage.getItem('cognify_streak');
    const storedDate = localStorage.getItem('cognify_last_login');
    const today = new Date().toDateString();

    if (storedDate === today) {
      setStreak(Number(storedStreak) || 1);
    } else {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (storedDate === yesterday) {
        const newStreak = (Number(storedStreak) || 0) + 1;
        setStreak(newStreak);
        localStorage.setItem('cognify_streak', String(newStreak));
      } else {
        setStreak(1);
        localStorage.setItem('cognify_streak', '1');
      }
      localStorage.setItem('cognify_last_login', today);
    }
  }, []);

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-default"
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Flame className="h-4.5 w-4.5 fill-orange-500 text-orange-500" />
      </motion.div>
      <span className="font-bold text-xs leading-none tracking-tight">{streak} day streak</span>
    </motion.div>
  )
}


export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router, isClient]);

  if (!isClient || isUserLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="relative">
      {isMobile ? (
        <>
          <main className="flex-1 pb-20">
             <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
              <Link href="/dashboard">
                <Logo />
              </Link>
              <div className="ml-auto">
                <DailyStreak />
              </div>
            </header>
            <div className="p-4 sm:p-6">{children}</div>
          </main>
          <BottomNav />
        </>
      ) : (
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <Sidebar className="border-r border-border bg-card">
              <SidebarHeader className="p-6 border-b border-border/50">
                <Logo />
              </SidebarHeader>
              <SidebarContent className="p-4">
                <SidebarMenu className="gap-2">
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <motion.div
                        whileHover={{ scale: 1.03, x: 4 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={item.label}
                          className={cn(
                            "w-full flex items-center gap-3.5 px-4 py-6 text-sm font-semibold rounded-xl border border-transparent transition-all duration-200 cursor-pointer",
                            pathname === item.href
                              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/15 font-bold"
                              : "hover:bg-muted hover:border-border text-slate-700 dark:text-slate-300"
                          )}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </motion.div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="p-4 border-t border-border/50 bg-muted/20">
                <UserNav />
              </SidebarFooter>
            </Sidebar>
            <main className="flex-1">
              <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
                <SidebarTrigger className="md:hidden" />
                <div className="w-full flex-1">
                  {/* Future search bar could go here */}
                </div>
                <div className="flex items-center gap-4">
                  <DailyStreak />
                  <div className="hidden md:block">
                    <UserNav />
                  </div>
                </div>
              </header>
              <div className="p-4 sm:p-6">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      )}
      <AskCognifyFAB />
    </div>
  );
}
