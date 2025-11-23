import { storage } from "./storage";
import type { Booking, Payment } from "@shared/schema";

/**
 * Payment Service: Handles money finalization, payouts, and refunds
 * Includes comprehensive logging, error handling, and audit trails
 */
export class PaymentService {
  /**
   * Finalize payment after successful Stripe checkout
   * - Validate payment amount matches booking total
   * - Update booking status to confirmed
   * - Create payment record with full audit trail
   * - Calculate and store host payout
   * - Block availability dates
   * - Create notifications
   */
  static async finalizePayment(
    bookingId: string,
    stripePaymentIntentId: string,
    amount: number,
    commission: number
  ): Promise<{ booking: Booking; payment: Payment }> {
    const startTime = Date.now();
    
    try {
      console.log(`[PAYMENT] Starting payment finalization - BookingID: ${bookingId}, Amount: $${amount}, Commission: $${commission}`);
      
      // Get booking details
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        throw new Error(`Booking ${bookingId} not found in database`);
      }

      // Validate payment amount matches booking total (with 1 cent tolerance for rounding)
      const bookingTotal = Number(booking.total);
      if (Math.abs(amount - bookingTotal) > 0.01) {
        console.error(`[PAYMENT_ERROR] Amount mismatch - Booking: $${bookingTotal}, Payment: $${amount}`);
        throw new Error(`Payment amount ($${amount}) does not match booking total ($${bookingTotal})`);
      }

      // Validate commission is within acceptable range (10-20%)
      const commissionPercentage = (commission / amount) * 100;
      if (commissionPercentage < 10 || commissionPercentage > 20) {
        console.warn(`[PAYMENT_WARNING] Commission percentage outside expected range: ${commissionPercentage.toFixed(2)}%`);
      }

      // Calculate host payout (amount paid to host after commission)
      const hostPayout = amount - commission;
      if (hostPayout <= 0) {
        throw new Error(`Invalid host payout calculation: $${hostPayout}`);
      }

      console.log(`[PAYMENT] Amount validated - BookingID: ${bookingId}, HostPayout: $${hostPayout}`);

      // Create payment record with full audit trail
      const payment = await storage.createPayment({
        bookingId,
        guestId: booking.guestId,
        hostId: booking.hostId,
        stripePaymentIntentId,
        amount: amount.toString(),
        status: 'succeeded',
        hostPayout: hostPayout.toString(),
        commission: commission.toString(),
        tax: booking.tax.toString(),
        paymentMethod: 'card',
        metadata: { 
          stripePaymentIntentId,
          commissionPercentage: (commissionPercentage).toFixed(2),
          finalizedAt: new Date().toISOString(),
        },
        processedAt: new Date(),
      });
      
      console.log(`[PAYMENT] Payment record created - PaymentID: ${payment.id}`);

      // Update booking status to confirmed
      const confirmedBooking = await storage.updateBookingStatus(bookingId, 'confirmed');
      if (!confirmedBooking) {
        console.error(`[PAYMENT_ERROR] Failed to update booking status to confirmed - BookingID: ${bookingId}`);
        throw new Error("Failed to confirm booking after payment");
      }

      console.log(`[PAYMENT] Booking confirmed - BookingID: ${bookingId}`);

      // Update booking payment status
      await storage.updateBooking(bookingId, {
        paymentStatus: 'paid',
        paymentIntentId: stripePaymentIntentId,
        confirmedAt: new Date(),
      });

      // Block availability dates for this booking
      const checkInDate = new Date(booking.checkIn as any);
      const checkOutDate = new Date(booking.checkOut as any);
      let blockedDates = 0;
      
      for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
        await storage.setAvailability({
          propertyId: booking.propertyId,
          date: d.toISOString().split('T')[0],
          isAvailable: false,
        });
        blockedDates++;
      }
      
      console.log(`[PAYMENT] Blocked ${blockedDates} dates for property ${booking.propertyId}`);

      // Create audit log for payment
      await storage.createAuditLog({
        userId: booking.guestId,
        action: 'PAYMENT_COMPLETED',
        entityType: 'payment',
        entityId: payment.id,
        changes: {
          bookingId,
          amount: amount.toString(),
          hostPayout: hostPayout.toString(),
          commission: commission.toString(),
          stripePaymentIntentId,
        },
      });

      // Create notification for host about payment
      await storage.createNotification({
        userId: booking.hostId,
        type: 'payment',
        title: 'Payment Received',
        message: `Payment of $${hostPayout.toFixed(2)} received for booking ${bookingId.slice(0, 8)}...`,
        link: `/host/earnings`,
        metadata: { paymentId: payment.id, bookingId },
      });

      const duration = Date.now() - startTime;
      console.log(`[PAYMENT] ✓ Payment finalization completed successfully in ${duration}ms - BookingID: ${bookingId}`);

      return { booking: confirmedBooking, payment };
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[PAYMENT_ERROR] Payment finalization failed after ${duration}ms - BookingID: ${bookingId}`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Process refund for cancelled booking
   * - Validate booking and payment exist
   * - Process full or partial refund
   * - Unblock availability dates
   * - Create audit trail
   * - Notify both guest and host
   */
  static async processRefund(bookingId: string, reason: string, partialAmount?: number): Promise<Payment> {
    const startTime = Date.now();
    
    try {
      console.log(`[REFUND] Starting refund process - BookingID: ${bookingId}, Reason: ${reason}${partialAmount ? `, PartialAmount: $${partialAmount}` : ''}`);
      
      // Get payment record
      const payments = await storage.getPaymentsByBooking(bookingId);
      if (!payments || payments.length === 0) {
        throw new Error(`No payment found for booking ${bookingId}`);
      }

      const originalPayment = payments[0];
      const fullAmount = Number(originalPayment.amount);

      // Validate partial amount if provided
      let refundAmount = fullAmount;
      if (partialAmount !== undefined) {
        if (partialAmount <= 0 || partialAmount > fullAmount) {
          console.error(`[REFUND_ERROR] Invalid partial refund amount - Full: $${fullAmount}, Partial: $${partialAmount}`);
          throw new Error(`Partial refund amount must be between $0.01 and $${fullAmount}`);
        }
        refundAmount = partialAmount;
        console.log(`[REFUND] Processing partial refund - Full: $${fullAmount}, Refund: $${refundAmount}`);
      }

      // Update payment status to refunded
      const refundedPayment = await storage.updatePaymentStatus(
        originalPayment.id,
        partialAmount ? 'partially_refunded' : 'refunded'
      );

      if (!refundedPayment) {
        console.error(`[REFUND_ERROR] Failed to update payment status - PaymentID: ${originalPayment.id}`);
        throw new Error("Failed to process refund");
      }

      console.log(`[REFUND] Payment status updated - PaymentID: ${originalPayment.id}, Amount: $${refundAmount}`);

      // Update booking status
      await storage.updateBooking(bookingId, {
        paymentStatus: partialAmount ? 'partially_refunded' : 'refunded',
        status: 'cancelled',
        cancelledAt: new Date(),
      });

      // Unblock availability dates
      const booking = await storage.getBooking(bookingId);
      if (booking) {
        const checkInDate = new Date(booking.checkIn as any);
        const checkOutDate = new Date(booking.checkOut as any);
        let unlockedDates = 0;
        
        for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
          await storage.setAvailability({
            propertyId: booking.propertyId,
            date: d.toISOString().split('T')[0],
            isAvailable: true,
          });
          unlockedDates++;
        }
        
        console.log(`[REFUND] Unlocked ${unlockedDates} dates for property ${booking.propertyId}`);

        // Create audit log for refund
        await storage.createAuditLog({
          userId: booking.hostId,
          action: 'REFUND_PROCESSED',
          entityType: 'payment',
          entityId: originalPayment.id,
          changes: {
            bookingId,
            refundAmount: refundAmount.toString(),
            reason,
            refundType: partialAmount ? 'partial' : 'full',
          },
        });

        // Notify guest about refund
        await storage.createNotification({
          userId: booking.guestId,
          type: 'payment',
          title: partialAmount ? 'Partial Refund Processed' : 'Refund Processed',
          message: `${partialAmount ? 'Partial refund' : 'Refund'} of $${refundAmount.toFixed(2)} has been processed. Reason: ${reason}`,
          link: `/trips`,
          metadata: { paymentId: refundedPayment.id, bookingId },
        });

        // Notify host about cancellation
        await storage.createNotification({
          userId: booking.hostId,
          type: 'booking',
          title: 'Booking Cancelled',
          message: `Booking ${bookingId.slice(0, 8)}... has been cancelled. Reason: ${reason}`,
          link: `/host/bookings`,
          metadata: { bookingId },
        });
      }

      const duration = Date.now() - startTime;
      console.log(`[REFUND] ✓ Refund processed successfully in ${duration}ms - BookingID: ${bookingId}`);

      return refundedPayment;
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[REFUND_ERROR] Refund processing failed after ${duration}ms - BookingID: ${bookingId}`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get host earnings (payouts received)
   */
  static async getHostEarnings(hostId: string, monthsBack: number = 12): Promise<number> {
    const payments = await storage.getPaymentsByStatus('succeeded');
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

    return payments
      .filter(p => p.hostId === hostId && new Date(p.processedAt!) >= cutoffDate)
      .reduce((sum, p) => sum + Number(p.hostPayout || 0), 0);
  }
}
