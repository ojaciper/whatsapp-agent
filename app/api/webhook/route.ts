import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/app/lib/supabase';
import openai from '@/app/lib/openai';
import { parseWhatsAppPayload, sendWhatsAppMessage } from '@/app/lib/whatsapp';
import { loadAgentPrompt } from '@/app/lib/prompt';

// GET handler - Meta webhook verification
export async function GET(request: NextRequest) {
  console.log('GET /api/webhook - Webhook verification request');

  try {
    const searchParams = request.nextUrl.searchParams;
    const hubMode = searchParams.get('hub.mode');
    const hubVerifyToken = searchParams.get('hub.verify_token');
    const hubChallenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (hubMode === 'subscribe' && hubVerifyToken === verifyToken) {
      console.log('Webhook verified successfully');
      return new NextResponse(hubChallenge, { status: 200 });
    }

    console.error('Webhook verification failed - invalid token');
    return new NextResponse('Verification failed', { status: 403 });
  } catch (error) {
    console.error('Error in webhook GET handler:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

// POST handler - Receive incoming WhatsApp messages
export async function POST(request: NextRequest) {
  console.log('POST /api/webhook - Incoming message');

  try {
    // Check if Supabase is configured
    if (!supabaseServer) {
      console.error('❌ Supabase server not initialized - missing environment variables');
      console.error('Status: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL not set');
      return new NextResponse('Supabase not configured', { status: 500 });
    }

    // Type assertion since we've verified it's not null above
    const db = supabaseServer as any;

    const body = await request.json();
    console.log('Webhook payload received:', JSON.stringify(body, null, 2));

    // Parse the WhatsApp message
    const message = parseWhatsAppPayload(body);
    if (!message) {
      console.log('No valid message found in payload');
      return new NextResponse('OK', { status: 200 });
    }

    const { from: phoneNumber, text: userMessage } = message;
    console.log(`Message received from ${phoneNumber}: ${userMessage}`);

    // Get or create conversation
    let conversationId: string;
    try {
      const { data: existingConversation, error: fetchError } = await db
        .from('conversations')
        .select('id')
        .eq('phone_number', phoneNumber)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching conversation:', fetchError);
      }

      if (existingConversation) {
        conversationId = existingConversation.id;
        console.log(`Found existing conversation: ${conversationId}`);

        // Update conversation's updated_at
        const { error: updateError } = await db
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);

        if (updateError) {
          console.error('Error updating conversation timestamp:', updateError);
        }
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await db
          .from('conversations')
          .insert([{ phone_number: phoneNumber }])
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          return new NextResponse('Database error', { status: 500 });
        }

        conversationId = newConversation.id;
        console.log(`Created new conversation: ${conversationId}`);
      }
    } catch (dbError) {
      console.error('Database error during conversation retrieval/creation:', dbError);
      return new NextResponse('Database error', { status: 500 });
    }

    // Store user message in database
    try {
      const { error: insertError } = await db
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            role: 'user',
            content: userMessage,
          },
        ]);

      if (insertError) {
        console.error('Error storing user message:', insertError);
      } else {
        console.log('User message stored successfully');
      }
    } catch (dbError) {
      console.error('Error inserting user message:', dbError);
    }

    // Get agent prompt
    const systemPrompt = loadAgentPrompt();

    // Get conversation history for context
    let conversationHistory: any[] = [];
    try {
      const { data: messages, error: historyError } = await db
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(10); // Last 10 messages for context

      if (historyError) {
        console.error('Error fetching conversation history:', historyError);
      } else {
        conversationHistory = messages || [];
        console.log(`Fetched ${conversationHistory.length} messages for context`);
      }
    } catch (dbError) {
      console.error('Error fetching conversation history:', dbError);
    }

    // Prepare messages for OpenAI
    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: userMessage },
    ] as Array<{ role: 'user' | 'assistant'; content: string }>;

    // Call OpenAI GPT-4
    let aiResponse = '';
    try {
      console.log('Calling OpenAI GPT-4...');
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      aiResponse =
        completion.choices[0]?.message?.content ||
        'Sorry, I could not generate a response.';
      console.log(`AI response generated: ${aiResponse.substring(0, 100)}...`);
    } catch (aiError) {
      console.error('Error calling OpenAI:', aiError);
      aiResponse =
        'Sorry, I encountered an error processing your request. Please try again.';
    }

    // Store AI response in database
    try {
      const { error: insertError } = await db
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            role: 'assistant',
            content: aiResponse,
          },
        ]);

      if (insertError) {
        console.error('Error storing AI response:', insertError);
      } else {
        console.log('AI response stored successfully');
      }
    } catch (dbError) {
      console.error('Error inserting AI response:', dbError);
    }

    // Send response back to user via WhatsApp
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;

    try {
      const sent = await sendWhatsAppMessage(
        phoneNumberId,
        accessToken,
        phoneNumber,
        aiResponse
      );

      if (!sent) {
        console.error('Failed to send WhatsApp message');
      }
    } catch (whatsappError) {
      console.error('Error sending WhatsApp message:', whatsappError);
    }

    console.log('Webhook processing completed successfully');
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error in webhook POST handler:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
