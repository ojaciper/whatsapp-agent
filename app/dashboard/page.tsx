'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { ConversationsSidebar } from '@/app/components/ConversationsSidebar';
import { MessageThread } from '@/app/components/MessageThread';

export default function DashboardPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSelectConversation = (conversationId: string, phoneNumber: string) => {
    setSelectedConversation(conversationId);
    setSelectedPhoneNumber(phoneNumber);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">WhatsApp Agent Dashboard</h1>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
        >
          Sign Out
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ConversationsSidebar
          selectedConversationId={selectedConversation}
          onSelectConversation={handleSelectConversation}
        />
        <MessageThread
          conversationId={selectedConversation}
          phoneNumber={selectedPhoneNumber}
        />
      </div>
    </div>
  );
}
