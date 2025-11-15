
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
// Admin number for master notifications
const adminPhoneNumber = process.env.RECIPIENT_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

// The function now accepts an optional recipient number
export async function sendOrderNotification(order, recipient) {
  // Determine the target phone number
  const targetPhoneNumber = recipient || adminPhoneNumber;

  if (!accountSid || !authToken || !twilioPhoneNumber || !targetPhoneNumber) {
    console.error('Twilio credentials or a recipient number are not fully configured.');
    return;
  }

  // Format the number for Twilio. It expects a '+' at the beginning.
  // This handles numbers stored as '234...' or '+234...'.
  const formattedRecipientNumber = targetPhoneNumber.startsWith('+') 
    ? targetPhoneNumber 
    : `+${targetPhoneNumber}`;

  try {
    const messageBody = `
      *New Order Alert!*

      A new order has been placed.

      *Order ID:* ${order._id}
      *Patient Name:* ${order.user.name}
      *Total Amount:* ₦${order.totalAmount.toLocaleString()}
      *Order Type:* ${order.orderType}
      *Delivery Option:* ${order.deliveryOption}

      *Items Ordered:*
      ${order.items.map(item => `- ${item.name} (Quantity: ${item.qty})`).join('\n      ')}
    `;

    await client.messages.create({
      body: messageBody,
      from: `whatsapp:${twilioPhoneNumber}`,
      // Use the formatted recipient number
      to: `whatsapp:${formattedRecipientNumber}`
    });

    console.log(`WhatsApp notification sent successfully to ${formattedRecipientNumber} for order: ${order._id}`);

  } catch (error) {
    console.error(`Failed to send WhatsApp notification to ${formattedRecipientNumber} for order ${order._id}:`, error);
  }
}
