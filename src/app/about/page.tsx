'use client';

import Layout from '@/components/Layout';

export default function About() {
  return (
    <Layout>
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="max-w-2xl p-8 bg-gray-800 rounded-lg text-white">
          <h1 className="text-3xl font-bold mb-4">About CollabDraw</h1>
          <p className="mb-4">
            CollabDraw is a real-time collaborative drawing canvas where users can
            create together in an infinite space. See other users&apos; cursors and
            drawings in real-time, with each person represented by their chosen
            avatar. Created by Bethan Dutton
          </p>
          <p>
            Created with Next.js, Socket.IO, and a lot of creativity. Draw, explore,
            and collaborate!
          </p>
          <p>Let&apos;s draw together!</p>
          <p>It&apos;s a simple drawing app that allows users to draw together in real-time.</p>
        </div>
      </div>
    </Layout>
  );
}
