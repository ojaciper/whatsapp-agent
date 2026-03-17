'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/app/lib/supabase';
import type { Message } from '@/app/types';

interface ConversationWithLatestMessage {
  id: string;
  phone_number: string;
  updated_at: string;
  latest_message?: string;
  unread_count?: number;
}

interface ConversationsSidebarProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string, phoneNumber: string) => void;
}

export function ConversationsSidebar({
  selectedConversationId,
  onSelectConversation,
}: ConversationsSidebarProps) {
  const [conversations, setConversations] = useState<ConversationWithLatestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            phone_number,
            updated_at,
            messages (content, role, created_at)
          `)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const formattedConversations = (data || []).map((conv: any) => {
          const lastMessage = conv.messages?.[conv.messages.length - 1];
          return {
            ...conv,
            latest_message: lastMessage?.content || 'No messages',
          };
        });

        setConversations(formattedConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white">Conversations</h2>
        <p className="text-sm text-gray-400">{conversations.length} total</p>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No conversations yet</div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id, conversation.phone_number)}
              className={`w-full text-left p-4 border-b border-gray-700 hover:bg-gray-700 transition ${
                selectedConversationId === conversation.id ? 'bg-gray-700' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {conversation.phone_number}
                  </p>
                  <p className="text-sm text-gray-400 truncate mt-1">
                    {conversation.latest_message}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(conversation.updated_at).toLocaleDateString()}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
