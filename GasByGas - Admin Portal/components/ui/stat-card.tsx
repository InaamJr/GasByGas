'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from './card';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon,
  href,
  className
}: StatCardProps) {
  const content = (
    <Card className={cn(
      "p-6 rounded-[20px] hover:shadow-lg transition-all duration-300",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium mb-2">{title}</h3>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="flex items-center gap-2">
          <Icon className="h-6 w-6" />
          <span className="text-gray-400">›</span>
        </div>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}