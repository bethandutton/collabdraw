'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { io } from 'socket.io-client';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [userCount, setUserCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const socket = io({
      path: '/api/socket',
      addTrailingSlash: false,
    });

    socket.on('user-count', (count: number) => {
      setUserCount(count);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black">
      {/* Title - Top Left */}
      <div className="fixed top-4 left-4 text-white text-xl font-bold z-50">
        CollabDraw
      </div>

      {/* About Link - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <Link 
          href={pathname === '/about' ? '/' : '/about'}
          className="text-white hover:text-gray-300"
        >
          {pathname === '/about' ? 'Back to Canvas' : 'About'}
        </Link>
      </div>

      {/* User Count - Bottom Left */}
      <div className="fixed bottom-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full z-50">
        {userCount} online
      </div>

      {children}
    </div>
  );
}
