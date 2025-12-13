import { storage } from '../storage';
import type { Notification } from '@shared/schema';

interface PushNotificationPayload {
  userId: string;
  type: 'booking' | 'message' | 'payment' | 'admin';
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  static async sendPushNotification(payload: PushNotificationPayload): Promise<void> {
    try {
      // Create database notification
      await storage.createNotification({
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        link: payload.link,
        metadata: payload.metadata,
        isRead: false,
      });

      // Send SMS push notification via Twilio if available
      const user = await storage.getUser(payload.userId);
      if (!user) return;

      // Only send SMS if Twilio is configured and user has a phone
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        await this.sendSmsNotification(payload);
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  private static async sendSmsNotification(payload: PushNotificationPayload): Promise<void> {
    try {
      // Twilio integration would go here
      // For now, just log that it would be sent
      console.log(`[SMS Notification] ${payload.title}: ${payload.message}`);
      
      // Example Twilio implementation (commented out - requires credentials):
      // const twilio = require('twilio');
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await client.messages.create({
      //   body: `${payload.title}: ${payload.message}`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: userPhone,
      // });
    } catch (error) {
      console.error('Error sending SMS notification:', error);
    }
  }

  static async sendBookingNotification(bookingId: string, hostId: string, status: 'created' | 'approved' | 'cancelled'): Promise<void> {
    const titles: Record<string, string> = {
      created: 'New Booking Request',
      approved: 'Booking Approved',
      cancelled: 'Booking Cancelled',
    };

    const messages: Record<string, string> = {
      created: 'You have a new booking request',
      approved: 'A booking has been approved and confirmed',
      cancelled: 'A booking has been cancelled',
    };

    await this.sendPushNotification({
      userId: hostId,
      type: 'booking',
      title: titles[status],
      message: messages[status],
      link: `/admin/bookings/${bookingId}`,
      metadata: { bookingId, status },
    });
  }

  static async sendMessageNotification(conversationId: string, recipientId: string, senderName: string): Promise<void> {
    await this.sendPushNotification({
      userId: recipientId,
      type: 'message',
      title: 'New Message',
      message: `${senderName} sent you a message`,
      link: `/messages/${conversationId}`,
      metadata: { conversationId },
    });
  }

  static async sendPaymentNotification(bookingId: string, userId: string, status: 'pending' | 'completed' | 'failed'): Promise<void> {
    const titles: Record<string, string> = {
      pending: 'Payment Pending',
      completed: 'Payment Received',
      failed: 'Payment Failed',
    };

    const messages: Record<string, string> = {
      pending: 'Your payment is being processed',
      completed: 'Your payment has been received',
      failed: 'Your payment could not be processed',
    };

    await this.sendPushNotification({
      userId,
      type: 'payment',
      title: titles[status],
      message: messages[status],
      link: `/booking/${bookingId}`,
      metadata: { bookingId, status },
    });
  }
}

export default NotificationService;
