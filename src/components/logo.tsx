import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-indigo-950 border border-slate-200/50 dark:border-indigo-500/20 shadow-sm p-1 overflow-hidden">
        <Image
          src="/icon.png"
          alt="Cognify Logo"
          width={32}
          height={32}
          className="object-contain h-full w-full"
          referrerPolicy="no-referrer"
        />
        <div className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-amber-400 text-[6px] font-bold text-slate-950 animate-pulse">
          ✨
        </div>
      </div>
      <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-100 dark:to-white">
        Cognify
      </span>
    </div>
  );
}


