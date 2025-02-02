'use client';

import { useState, useEffect } from 'react';
import { Store, Users, Coins, ClipboardList, HelpCircle, Calendar } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';

export function StatCards() {
  const [stats, setStats] = useState({
    outlets: 0,
    consumers: 0,
    tokens: 0,
    orders: 0,
    requests: 0,
    deliveries: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [outlets, consumers, tokens, orders, requests] = await Promise.all([
          fetch('/api/outlets').then(res => res.json()),
          fetch('/api/consumers').then(res => res.json()),
          fetch('/api/tokens').then(res => res.json()),
          fetch('/api/orders').then(res => res.json()),
          fetch('/api/pending-registrations').then(res => res.json())
        ]);

        setStats({
          outlets: outlets?.length || 0,
          consumers: consumers?.length || 0,
          tokens: tokens?.length || 0,
          orders: orders?.length || 0,
          requests: requests?.length || 0,
          deliveries: 0 // TODO: Add deliveries endpoint
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      title: 'Outlets',
      value: stats.outlets.toString(),
      icon: Store,
      href: '/dashboard/outlets',
      className: 'bg-white rounded-[20px] shadow-lg hover:scale-105 transition-transform'
    },
    { 
      title: 'Consumers',
      value: stats.consumers.toString(),
      icon: Users,
      href: '/dashboard/consumers',
      className: 'bg-gray-200 rounded-[20px] shadow-lg hover:scale-105 transition-transform'
    },
    { 
      title: 'Tokens',
      value: stats.tokens.toString(),
      icon: Coins,
      href: '/dashboard/tokens',
      className: 'bg-white rounded-[20px] shadow-lg hover:scale-105 transition-transform'
    },
    { 
      title: 'Pending Orders',
      value: stats.orders.toString(),
      icon: ClipboardList,
      href: '/dashboard/orders',
      className: 'bg-gray-200 rounded-[20px] shadow-lg hover:scale-105 transition-transform'
    },
    { 
      title: 'Pending Registration Requests',
      value: stats.requests.toString(),
      icon: HelpCircle,
      href: '/dashboard/pending-registrations',
      className: 'bg-white rounded-[20px] shadow-lg hover:scale-105 transition-transform'
    },
    { 
      title: 'Scheduled Deliveries',
      value: stats.deliveries.toString(),
      icon: Calendar,
      href: '/dashboard/scheduled-deliveries',
      className: 'bg-gray-200 rounded-[20px] shadow-lg hover:scale-105 transition-transform'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => (
        <StatCard
          key={stat.title}
          {...stat}
        />
      ))}
    </div>
  );
}