'use client';

import { useState } from 'react';
import DrawingCanvas from '@/components/DrawingCanvas';
import LoginPage from '@/components/LoginPage';
import Layout from '@/components/Layout';

export default function Home() {
  const [user, setUser] = useState<{
    name: string;
    avatar: string;
    id: string;
  } | null>(null);

  if (!user) {
    return (
      <Layout>
        <LoginPage onLogin={setUser} />
      </Layout>
    );
  }

  return (
    <Layout>
      <DrawingCanvas user={user} />
    </Layout>
  );
}