const { Resend } = require('resend');
const twilio = require('twilio');
require('dotenv').config();

class NotificationService {
  constructor() {
    // 1. Initialize Resend instance with the new API token environment key
    this.resend = new Resend(process.env.RESEND_API_KEY);

    // 2. Initialize Twilio SMS environment client
    this.smsClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  // =========================================================================
  // 70. EMAIL NOTIFICATIONS (via RESEND REST API)
  // =========================================================================
  /**
   * Dispatches automated emails globally.
   * @param {string} toAddress - Recipient client inbox target email string
   * @param {string} subjectTitle - Email subject text bar header
   * @param {string} htmlTemplate - Raw HTML structural template body content
   */
  async sendEmail(toAddress, subjectTitle, htmlTemplate) {
    try {
      // ⚠️ Note: If you are using Resend's free trial sandbox account, you MUST 
      // use 'onboarding@resend.dev' as the from email and can only send to your own email address!
      const fromEmail = 'onboarding@resend.dev'; 

      // Once you attach a real domain to Resend later, update this to your branding name:
      // const fromEmail = 'Store Updates <hello@yourcustomdomain.com>';

      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: [toAddress], // Resend accepts arrays of strings for single or multiple receivers
        subject: subjectTitle,
        html: htmlTemplate
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`[Resend Email Success] Delivered safely! Tracking ID: ${data.id}`);
    } catch (error) {
      console.error(`[Resend Email Error] Failed to deliver transmission to ${toAddress}:`, error.message);
    }
  }

  // =========================================================================
  // 71. SMS NOTIFICATIONS (via TWILIO API)
  // =========================================================================
  /**
   * Dispatches text communications globally.
   * @param {string} phoneNumber - Destination number (Must include international code prefix like +234...)
   * @param {string} messageString - Direct text body string message payload
   */
  async sendSMS(phoneNumber, messageString) {
    try {
      const response = await this.smsClient.messages.create({
        body: messageString,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      console.log(`[Twilio SMS Success] Text dispatched safely! Message SID Reference: ${response.sid}`);
    } catch (error) {
      console.error(`[Twilio SMS Error] Failed to transmit communication to ${phoneNumber}:`, error.message);
    }
  }
}

// Export a single pre-initialized instance of the service worker engine
module.exports = new NotificationService();
