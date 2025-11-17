import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const adminPhoneNumber = process.env.RECIPIENT_PHONE_NUMBER; // <-- Get the admin number

const client = twilio(accountSid, authToken);

// --- START: FIX for Default Recipient ---
// The function now intelligently decides the target phone number.
export async function sendWhatsAppNotification(order, targetPhoneNumber) {

  // If no specific target is given, default to the admin phone number.
  // Otherwise, use the number that was passed in.
  const recipient = targetPhoneNumber || adminPhoneNumber;

  if (!recipient) {
    console.error(
      'WhatsApp Error: No recipient phone number specified and no default RECIPIENT_PHONE_NUMBER is set.'
    );
    return;
  }
  // --- END: FIX for Default Recipient ---

  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Twilio environment variables are not fully configured.');
    return;
  }

  // Format the number to include the '+' sign if it's missing.
  const formattedRecipientNumber = recipient.startsWith('+') 
    ? recipient 
    : `+${recipient}`;

  try {
    // --- START: MODIFICATION for Free-form Message ---
    // Instead of using a template, we construct the message body directly.
    const messageBody = `
*New Order Notification*

A new order has been placed on Pharmastackx.

*Order ID:* ${order._id.toString()}
*Customer:* ${order.user.name}
*Total Amount:* ₦${order.totalAmount.toLocaleString()}
*Order Type:* ${order.orderType}
*Delivery Option:* ${order.deliveryOption}

*Items:*
${order.items.map(item => `- ${item.name} (Quantity: ${item.qty})`).join('\n')}
    `.trim();

    await client.messages.create({
      body: messageBody, // <-- Use the 'body' parameter for the message content.
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${formattedRecipientNumber}`
    });
    // --- END: MODIFICATION for Free-form Message ---


    console.log(`WhatsApp notification sent successfully to ${formattedRecipientNumber} for order: ${order._id}`);

  } catch (error) {
    console.error(`Failed to send WhatsApp notification to ${formattedRecipientNumber} for order ${order._id}:`, error);
  }
}
