import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function sendWhatsAppNotification(order, targetPhoneNumber) {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Twilio environment variables are not fully configured.');
    return;
  }

  if (targetPhoneNumber) {
    const formattedRecipientNumber = targetPhoneNumber.startsWith('+') 
      ? targetPhoneNumber 
      : `+${targetPhoneNumber}`;

    try {
      // --- START: FIX for WhatsApp Template Messaging (Error 63016) ---
      
      // 1. Define your Content SID. You get this from the Twilio console
      //    after your template is approved.
      const contentSid = 'YOUR_CONTENT_SID_HERE'; // <--- IMPORTANT: REPLACE THIS

      // 2. Define the variables for your template. The keys are the numbers
      //    corresponding to the {{...}} placeholders in your template.
      const contentVariables = {
        '1': order._id.toString(),
        '2': order.user.name,
        '3': order.totalAmount.toLocaleString(),
        '4': order.orderType,
        '5': order.deliveryOption,
        '6': order.items.map(item => `- ${item.name} (Quantity: ${item.qty})`).join('\n')
      };

      // 3. Send the message using ContentSid and ContentVariables instead of 'body'.
      await client.messages.create({
        contentSid: contentSid,
        contentVariables: contentVariables,
        from: `whatsapp:${twilioPhoneNumber}`,
        to: `whatsapp:${formattedRecipientNumber}`
      });

      // --- END: FIX for WhatsApp Template Messaging ---

      console.log(`WhatsApp template notification sent successfully to ${formattedRecipientNumber} for order: ${order._id}`);

    } catch (error) {
      console.error(`Failed to send WhatsApp notification to ${formattedRecipientNumber} for order ${order._id}:`, error);
    }
  }
}
