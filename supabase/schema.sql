-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Create indexes for better query performance
CREATE INDEX idx_conversations_phone_number ON conversations(phone_number);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- RLS Policies for conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Allow all operations for service role (for webhooks and server operations)
CREATE POLICY "Service role bypass conversations"
  ON conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations for service role (for webhooks and server operations)
CREATE POLICY "Service role bypass messages"
  ON messages
  FOR ALL
  USING (true)
  WITH CHECK (true);
