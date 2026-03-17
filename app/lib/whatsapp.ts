// Parse Meta WhatsApp webhook payload to extract phone number and message text
export interface WhatsAppMessage {
  from: string;
  text: string;
}

export function parseWhatsAppPayload(body: any): WhatsAppMessage | null {
  try {
    // Meta sends the payload in this structure:
    // body.entry[0].changes[0].value.messages[0]
    const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return null;
    }

    const message = messages[0];
    const from = message.from;
    const text = message.text?.body;

    if (!from || !text) {
      return null;
    }

    return { from, text };
  } catch (error) {
    console.error('Error parsing WhatsApp payload:', error);
    return null;
  }
}

// Send message via WhatsApp Cloud API
export async function sendWhatsAppMessage(
  phoneNumberId: string,
  accessToken: string,
  recipientPhoneNumber: string,
  messageText: string
): Promise<boolean> {
  try {
    const url = `https://graph.instagram.com/v21.0/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhoneNumber,
        type: 'text',
        text: {
          body: messageText,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp API error:', error);
      return false;
    }

    console.log('WhatsApp message sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}
