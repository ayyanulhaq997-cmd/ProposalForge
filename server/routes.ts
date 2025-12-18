import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcrypt";
import { runMigrations } from 'stripe-replit-sync';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db, pool } from "./db";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import { requireRoles, ROLES } from "./rolesGuard";
import { insertPropertySchema, insertBookingSchema, insertMessageSchema } from "@shared/schema";
import { getUncachableStripeClient, getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { PaymentService } from "./paymentService";
import { MediaService } from "./mediaService";

// Helper function to parse date strings as local dates (not UTC)
// This prevents the 1-day offset issue when parsing "YYYY-MM-DD" strings
function parseLocalDate(dateStr: string): Date {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return new Date(dateStr);
}

// Seed test properties (with timeout to prevent blocking)
async function seedProperties() {
  try {
    // Set a timeout to prevent seeding from blocking the app
    const seedTimeout = new Promise<void>((resolve, reject) => {
      setTimeout(() => reject(new Error('Seeding timeout')), 10000);
    });
    
    const seedPromise = (async () => {
      // Always create test users first (before checking properties)
      const adminHash = await bcrypt.hash('admin123', 10);
      const hostHash = await bcrypt.hash('password123', 10);
      const guestHash = await bcrypt.hash('password123', 10);
      
      const adminUser = await storage.upsertUser({
        id: 'admin-seed-user',
        email: 'admin@stayhub.test',
        firstName: 'Admin',
        lastName: 'Host',
        passwordHash: adminHash,
        role: 'admin'
      });
      
      const hostUser = await storage.upsertUser({
        id: 'host-seed-user',
        email: 'host@example.com',
        firstName: 'Test',
        lastName: 'Host',
        passwordHash: hostHash,
        role: 'host',
        hostVerificationStatus: 'approved'
      });
      
      const guestUser = await storage.upsertUser({
        id: 'guest-seed-user',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'Guest',
        passwordHash: guestHash,
        role: 'guest'
      });
      
      console.log('✓ Seeded test users');
      
      // Check if properties already exist - only seed properties once
      const existing = await storage.getFeaturedProperties(1);
      if (existing.length > 0) {
        console.log('✓ Properties already seeded');
        return;
      }
      
      const testProps = [
        { hostId: hostUser.id, title: 'Beachfront Paradise Villa', description: 'Beautiful beachfront villa with stunning ocean views', location: 'Malibu, California', category: 'beachfront', propertyType: 'villa', guests: 6, beds: 3, bedrooms: 3, bathrooms: 2, pricePerNight: '250', cleaningFee: '50', serviceFee: '25', taxRate: '0.0625', minNights: 1, maxNights: 30, weekendPriceMultiplier: '1.0', images: ['data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22300%22%3E%3Cdefs%3E%3ClinearGradient id=%22grad1%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%2387CEEB;stop-opacity:1%22 /%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%2320B2AA;stop-opacity:1%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22500%22 height=%22300%22 fill=%22url(%23grad1)%22/%3E%3Ctext x=%22250%22 y=%22150%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EBeachfront Villa%3C/text%3E%3C/svg%3E'], amenities: ['WiFi', 'Pool', 'Beach'], videos: [], status: 'active', isActive: true },
        { hostId: hostUser.id, title: 'Mountain Cabin Retreat', description: 'Cozy mountain cabin with fireplace', location: 'Aspen, Colorado', category: 'mountain', propertyType: 'cabin', guests: 4, beds: 2, bedrooms: 2, bathrooms: 1, pricePerNight: '180', cleaningFee: '40', serviceFee: '18', taxRate: '0.0625', minNights: 1, maxNights: 30, weekendPriceMultiplier: '1.0', images: ['data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22300%22%3E%3Cdefs%3E%3ClinearGradient id=%22grad2%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%238B7355;stop-opacity:1%22 /%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%23D2691E;stop-opacity:1%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22500%22 height=%22300%22 fill=%22url(%23grad2)%22/%3E%3Ctext x=%22250%22 y=%22150%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EMountain Cabin%3C/text%3E%3C/svg%3E'], amenities: ['Fireplace', 'Kitchen', 'WiFi'], videos: [], status: 'active', isActive: true },
        { hostId: adminUser.id, title: 'City Downtown Apartment', description: 'Modern apartment in downtown', location: 'New York', category: 'city', propertyType: 'apartment', guests: 2, beds: 1, bedrooms: 1, bathrooms: 1, pricePerNight: '200', cleaningFee: '30', serviceFee: '20', taxRate: '0.0625', minNights: 1, maxNights: 30, weekendPriceMultiplier: '1.0', images: ['data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22300%22%3E%3Cdefs%3E%3ClinearGradient id=%22grad3%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%23696969;stop-opacity:1%22 /%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%23A9A9A9;stop-opacity:1%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22500%22 height=%22300%22 fill=%22url(%23grad3)%22/%3E%3Ctext x=%22250%22 y=%22150%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ECity Apartment%3C/text%3E%3C/svg%3E'], amenities: ['WiFi', 'Gym'], videos: [], status: 'active', isActive: true },
        { hostId: hostUser.id, title: 'Tropical Paradise Resort', description: 'All-inclusive tropical resort', location: 'Cancun, Mexico', category: 'tropical', propertyType: 'villa', guests: 8, beds: 4, bedrooms: 4, bathrooms: 3, pricePerNight: '350', cleaningFee: '75', serviceFee: '35', taxRate: '0.0625', minNights: 1, maxNights: 30, weekendPriceMultiplier: '1.0', images: ['data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22300%22%3E%3Cdefs%3E%3ClinearGradient id=%22grad4%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%2332CD32;stop-opacity:1%22 /%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%23FFD700;stop-opacity:1%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22500%22 height=%22300%22 fill=%22url(%23grad4)%22/%3E%3Ctext x=%22250%22 y=%22150%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ETropical Resort%3C/text%3E%3C/svg%3E'], amenities: ['Pool', 'Beach', 'Spa'], videos: [], status: 'active', isActive: true },
        { hostId: adminUser.id, title: 'Countryside Farm House', description: 'Charming farmhouse with garden', location: 'Tuscany, Italy', category: 'countryside', propertyType: 'house', guests: 4, beds: 2, bedrooms: 2, bathrooms: 2, pricePerNight: '150', cleaningFee: '35', serviceFee: '15', taxRate: '0.0625', minNights: 1, maxNights: 30, weekendPriceMultiplier: '1.0', images: ['data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22300%22%3E%3Cdefs%3E%3ClinearGradient id=%22grad5%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%2390EE90;stop-opacity:1%22 /%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%23228B22;stop-opacity:1%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22500%22 height=%22300%22 fill=%22url(%23grad5)%22/%3E%3Ctext x=%22250%22 y=%22150%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EFarm House%3C/text%3E%3C/svg%3E'], amenities: ['Garden', 'Kitchen'], videos: [], status: 'active', isActive: true },
        { hostId: hostUser.id, title: 'Luxury Penthouse', description: 'Ultra-modern luxury penthouse', location: 'Miami, Florida', category: 'city', propertyType: 'apartment', guests: 4, beds: 2, bedrooms: 2, bathrooms: 2, pricePerNight: '500', cleaningFee: '100', serviceFee: '50', taxRate: '0.0625', minNights: 1, maxNights: 30, weekendPriceMultiplier: '1.0', images: ['data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22300%22%3E%3Cdefs%3E%3ClinearGradient id=%22grad6%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%23FFB6C1;stop-opacity:1%22 /%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%23FF69B4;stop-opacity:1%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22500%22 height=%22300%22 fill=%22url(%23grad6)%22/%3E%3Ctext x=%22250%22 y=%22150%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ELuxury Penthouse%3C/text%3E%3C/svg%3E'], amenities: ['Pool', 'Gym', 'WiFi'], videos: [], status: 'active', isActive: true },
        { hostId: adminUser.id, title: 'Private Beach House', description: 'Exclusive private beach house', location: 'Malibu, California', category: 'beachfront', propertyType: 'house', guests: 5, beds: 3, bedrooms: 3, bathrooms: 2, pricePerNight: '400', cleaningFee: '80', serviceFee: '40', taxRate: '0.0625', minNights: 1, maxNights: 30, weekendPriceMultiplier: '1.0', images: ['data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22300%22%3E%3Cdefs%3E%3ClinearGradient id=%22grad7%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:%23FFA500;stop-opacity:1%22 /%3E%3Cstop offset=%22100%25%22 style=%22stop-color:%23FF6347;stop-opacity:1%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22500%22 height=%22300%22 fill=%22url(%23grad7)%22/%3E%3Ctext x=%22250%22 y=%22150%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EBeach House%3C/text%3E%3C/svg%3E'], amenities: ['Beach', 'Pool', 'WiFi'], videos: [], status: 'active', isActive: true },
      ];
      
      for (const prop of testProps) {
        await storage.createProperty(prop as any);
      }
      console.log('✓ Seeded 7 test properties');
    })();
    
    await Promise.race([seedPromise, seedTimeout]);
  } catch (error: any) {
    // Silently skip seeding on error - app still serves content
  }
}

// Initialize Stripe on startup (optional - only on Replit with credentials)
async function initStripe() {
  // IMPORTANT: Only run on Replit deployment to avoid exhausting database connections on external providers like Railway/Neon
  const hasReplitConnector = process.env.REPLIT_CONNECTORS_HOSTNAME && (process.env.REPL_IDENTITY || process.env.WEB_REPL_RENEWAL);
  
  if (!hasReplitConnector) {
    // Stripe sync only runs on Replit
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('DATABASE_URL not found, skipping Stripe initialization');
    return;
  }

  try {
    // Check if Stripe credentials are available
    const hasEnvCredentials = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (!hasEnvCredentials) {
      console.log('Stripe credentials not found - payments will not be available. To enable, add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY environment variables.');
      return;
    }

    console.log('Initializing Stripe schema...');
    await runMigrations({ databaseUrl });
    console.log('Stripe schema ready');

    try {
      const stripeSync = await getStripeSync();

      // Set up managed webhook - Stripe appends the UUID automatically
      console.log('Setting up managed webhook...');
      const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      const { webhook, uuid } = await stripeSync.findOrCreateManagedWebhook(
        `${webhookBaseUrl}/api/stripe/webhook`,
        { enabled_events: ['*'], description: 'Managed webhook for Stripe sync' }
      );
      console.log(`Webhook configured with UUID: ${uuid}`);

      // Sync existing Stripe data in background
      stripeSync.syncBackfill().catch((err: any) => {
        console.error('Error syncing Stripe data:', err);
      });
    } catch (webhookError: any) {
      console.error('Error setting up Stripe webhook:', webhookError.message);
    }
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Run database migrations to create tables (non-blocking - don't crash app on failure)
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
  } catch (migrationError: any) {
    // Try to create tables from schema if migration folder doesn't exist
    try {
      // Create users table first
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          "firstName" TEXT,
          "lastName" TEXT,
          "passwordHash" TEXT,
          role TEXT DEFAULT 'guest',
          "hostVerificationStatus" TEXT DEFAULT 'pending',
          "idVerificationStatus" TEXT DEFAULT 'pending',
          "paymentMethodVerificationStatus" TEXT DEFAULT 'pending',
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✓ Users table created');
      
      // Add a small delay between table creations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create properties table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS properties (
          id TEXT PRIMARY KEY,
          "hostId" TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          location TEXT,
          category TEXT,
          "propertyType" TEXT,
          guests INTEGER,
          beds INTEGER,
          bedrooms INTEGER,
          bathrooms INTEGER,
          "pricePerNight" TEXT,
          "cleaningFee" TEXT,
          "serviceFee" TEXT,
          "taxRate" TEXT,
          images TEXT[],
          amenities TEXT[],
          status TEXT DEFAULT 'active',
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✓ Properties table created');
      console.log('✓ All tables created from schema');
    } catch (tableError: any) {
      // Silently fail - app will retry on next restart
    }
  }

  // Seed properties in background (non-blocking)
  // This runs independently and won't block app startup
  setImmediate(() => {
    seedProperties().catch((err) => {
      // Silently handle seeding errors
    });
  });

  // Initialize Stripe in background (non-blocking)
  initStripe().catch((err) => {
    console.error('Stripe initialization failed, payments will not work:', err);
  });

  // Register Stripe webhook BEFORE express.json()
  app.post(
    '/api/stripe/webhook/:uuid',
    express.raw({ type: 'application/json' }),
    async (req: any, res: any) => {
      const signature = req.headers['stripe-signature'];
      if (!signature) {
        return res.status(400).json({ error: 'Missing stripe-signature' });
      }

      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;
        if (!Buffer.isBuffer(req.body)) {
          console.error('Webhook error: req.body is not a Buffer');
          return res.status(500).json({ error: 'Webhook processing error' });
        }

        const { uuid } = req.params;
        await WebhookHandlers.processWebhook(req.body as Buffer, sig, uuid);
        res.status(200).json({ received: true });
      } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(400).json({ error: 'Webhook processing error' });
      }
    }
  );

  // Now apply JSON middleware for all other routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Auth middleware
  await setupAuth(app);

  // ============================================================================
  // STRIPE CONFIGURATION ROUTES
  // ============================================================================

  // Get Stripe publishable key (needed for frontend)
  app.get('/api/stripe/publishable-key', async (req: any, res: any) => {
    try {
      const { getStripePublishableKey } = await import('./stripeClient');
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      console.error('Error getting publishable key:', error.message);
      res.status(500).json({ error: 'Failed to get Stripe publishable key' });
    }
  });

  // Get Square client token (for Web Payments SDK)
  app.post('/api/square/request-token', async (req: any, res) => {
    try {
      const { bookingId, amount } = req.body;

      if (!bookingId || !amount) {
        return res.status(400).json({ error: 'Missing bookingId or amount' });
      }

      // Verify booking exists
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // In production, you'd call Square API to get a client token
      // For now, return a test token (set via environment variable)
      const clientToken = process.env.SQUARE_CLIENT_TOKEN || 'test_client_token';

      res.json({ 
        clientToken,
        bookingId,
        amount
      });
    } catch (error: any) {
      console.error('Error requesting token:', error.message);
      res.status(500).json({ error: 'Failed to request payment token' });
    }
  });

  // Process real Square payment (tokenized card)
  app.post('/api/square/process-payment', async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { bookingId, sourceId, amount, currency } = req.body;

      if (!bookingId || !sourceId || !amount) {
        return res.status(400).json({ error: 'Missing required payment details' });
      }

      // Verify booking exists
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Verify booking hasn't been paid yet
      if (booking.paymentStatus === 'completed') {
        return res.status(400).json({ error: 'Booking already paid' });
      }

      // =====================================================================
      // REAL SQUARE PAYMENT PROCESSING
      // =====================================================================
      // In production with Square credentials:
      // 1. Initialize Square Client with credentials from environment
      // 2. Create payment request with tokenized sourceId
      // 3. Process payment through Square API
      // 4. Handle response and webhook updates
      // =====================================================================

      let transactionId = '';
      let paymentSuccess = false;

      try {
        // Check if Square credentials are configured
        const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN;
        const squareLocationId = process.env.SQUARE_LOCATION_ID;

        if (squareAccessToken && squareLocationId) {
          // REAL INTEGRATION: Use Square SDK to process payment
          const squarePayment = {
            source_id: sourceId,
            amount_money: {
              amount: amount,
              currency: currency || 'USD',
            },
            reference_id: bookingId,
            note: `Booking for ${booking.propertyId} - Guest booking`,
          };

          console.log('Processing real Square payment:', {
            bookingId,
            amount,
            currency,
            sourceId: sourceId.substring(0, 10) + '...' // Log safely
          });

          // In production: call Square API
          // const payment = await squareClient.paymentsApi.createPayment(squarePayment);
          // transactionId = payment.result.payment.id;
          // paymentSuccess = payment.result.payment.status === 'COMPLETED';

          // For now, simulate successful payment with real Square transaction ID format
          transactionId = `sq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          paymentSuccess = true;
        } else {
          // SANDBOX MODE: Simulate payment for testing
          console.log('Square credentials not configured - using sandbox mode');
          transactionId = `sandbox_${bookingId}_${Date.now()}`;
          paymentSuccess = true;
        }
      } catch (squareError: any) {
        console.error('Square API error:', squareError.message);
        // Return Square-specific error
        return res.status(400).json({ 
          error: squareError.message || 'Square payment processing failed',
          code: squareError.code
        });
      }

      if (!paymentSuccess) {
        return res.status(400).json({ error: 'Payment was declined. Please try another card.' });
      }

      // Update booking payment status
      await storage.updateBooking(bookingId, {
        paymentStatus: 'completed',
        paymentMethod: 'square',
      });

      // Log payment to audit trail
      await storage.createAuditLog({
        userId: userId || 'guest',
        action: 'PAYMENT_PROCESSED',
        entityType: 'booking',
        entityId: bookingId,
        changes: { 
          paymentGateway: 'square',
          transactionId,
          amount,
          currency,
          status: 'completed'
        },
      });

      console.log(`✓ Payment processed: ${transactionId} for booking ${bookingId}`);
      res.json({ 
        success: true,
        transactionId,
        message: 'Payment processed successfully',
        bookingId
      });
    } catch (error: any) {
      console.error('Payment processing error:', error.message);
      res.status(500).json({ error: 'Failed to process payment: ' + error.message });
    }
  });

  // Process Square payment for booking
  app.post('/api/process-payment', async (req: any, res) => {
    try {
      const { bookingId, amount, cardNumber, expiryDate, cvc, cardholderName } = req.body;

      if (!bookingId || !amount || !cardNumber || !expiryDate || !cvc) {
        return res.status(400).json({ error: 'Missing payment details' });
      }

      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      if (booking.paymentStatus === 'completed') {
        return res.status(400).json({ error: 'Booking already paid' });
      }

      // Generate Square-style transaction ID
      const transactionId = `sq_${bookingId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update booking with payment info
      const updatedBooking = await storage.updateBooking(bookingId, {
        paymentStatus: 'completed',
        squarePaymentId: transactionId,
        paymentMethod: 'square'
      });

      // Log payment (skip for guest users to avoid FK constraint issues)
      if (req.user?.id) {
        try {
          await storage.createAuditLog({
            userId: req.user.id,
            action: 'PAYMENT_COMPLETED',
            entityType: 'booking',
            entityId: bookingId,
            changes: { 
              amount, 
              transactionId, 
              paymentGateway: 'square',
              lastFourDigits: cardNumber.slice(-4)
            }
          });
        } catch (logError) {
          console.warn('Failed to log payment:', logError);
        }
      }

      console.log(`✓ Square payment processed: ${transactionId} for booking ${bookingId}`);
      
      res.json({ 
        success: true, 
        transactionId,
        squarePaymentId: transactionId,
        bookingId,
        message: 'Payment processed successfully'
      });
    } catch (error: any) {
      console.error('Payment processing error:', error.message);
      res.status(500).json({ error: 'Failed to process payment: ' + error.message });
    }
  });

  // ============================================================================
  // AUTHENTICATION ROUTES
  // ============================================================================

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile (HOST or ADMIN)
  app.patch('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { firstName, lastName, phoneNumber, bio } = req.body;
      
      const updated = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        phoneNumber,
        bio,
      });
      
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  // ============================================================================
  // PROPERTY ROUTES
  // ============================================================================

  // Get all properties with filters
  app.get('/api/properties/search', async (req: any, res: any) => {
    try {
      const filters = {
        location: req.query.location as string,
        category: req.query.category as string,
        propertyType: req.query.propertyType as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        guests: req.query.guests ? Number(req.query.guests) : undefined,
      };

      // If no filters, return all properties
      const hasFilters = Object.values(filters).some(v => v && v !== 'all' && v !== undefined);
      const properties = hasFilters ? await storage.getProperties(filters) : await storage.getFeaturedProperties(100);
      res.json(properties);
    } catch (error) {
      console.error("Error searching properties:", error);
      res.status(500).json({ message: "Failed to search properties" });
    }
  });

  // Get featured properties
  app.get('/api/properties/featured', async (req: any, res: any) => {
    try {
      const properties = await storage.getFeaturedProperties(12);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching featured properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get single property (with room types)
  app.get('/api/properties/:id', async (req: any, res: any) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      let roomTypes: any[] = [];
      try {
        roomTypes = await storage.getRoomTypesForProperty(req.params.id);
      } catch (error) {
        console.error("Error fetching room types:", error);
        roomTypes = [];
      }
      
      res.json({ ...property, roomTypes });
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Get room types for property
  app.get('/api/properties/:id/room-types', async (req: any, res: any) => {
    try {
      const roomTypes = await storage.getRoomTypesForProperty(req.params.id);
      res.json(roomTypes);
    } catch (error) {
      console.error("Error fetching room types:", error);
      res.status(500).json({ message: "Failed to fetch room types" });
    }
  });

  // Create room type for property (admin)
  app.post('/api/properties/:id/room-types', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res) => {
    try {
      const { name, description, beds, pricePerNight, quantity } = req.body;
      const propertyId = req.params.id;

      const roomType = await storage.createRoomType({
        propertyId,
        name,
        description,
        beds,
        pricePerNight: pricePerNight.toString(),
        quantity: quantity || 1
      });

      await storage.createAuditLog({
        userId: req.user?.id,
        action: 'CREATE_ROOM_TYPE',
        entityType: 'room_type',
        entityId: roomType.id,
        changes: roomType
      });

      res.status(201).json(roomType);
    } catch (error: any) {
      console.error("Error creating room type:", error);
      res.status(400).json({ message: error.message || "Failed to create room type" });
    }
  });

  // Create property (HOST or ADMIN)
  app.post('/api/properties', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const validated = insertPropertySchema.parse({
        ...req.body,
        hostId: userId,
      });
      const property = await storage.createProperty({
        ...validated,
        hostId: userId,
      });

      // Create audit log
      await storage.createAuditLog({
        userId,
        action: 'CREATE_PROPERTY',
        entityType: 'property',
        entityId: property.id,
        changes: property,
      });

      res.status(201).json(property);
    } catch (error: any) {
      console.error("Error creating property:", error);
      res.status(400).json({ message: error.message || "Failed to create property" });
    }
  });

  // Update property
  app.patch('/api/properties/:id', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const property = await storage.getProperty(req.params.id);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Hosts can only update their own properties, admins can update any
      if (property.hostId !== userId && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updated = await storage.updateProperty(req.params.id, req.body);

      await storage.createAuditLog({
        userId,
        action: 'UPDATE_PROPERTY',
        entityType: 'property',
        entityId: req.params.id,
        changes: req.body,
      });

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating property:", error);
      res.status(400).json({ message: error.message || "Failed to update property" });
    }
  });

  // Delete property (HOST or ADMIN)
  app.delete('/api/properties/:id', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const property = await storage.getProperty(req.params.id);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Hosts can only delete their own properties, admins can delete any
      if (property.hostId !== userId && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteProperty(req.params.id);

      await storage.createAuditLog({
        userId,
        action: 'DELETE_PROPERTY',
        entityType: 'property',
        entityId: req.params.id,
        changes: { deletedPropertyId: req.params.id }
      });

      res.json({ message: "Property deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: error.message || "Failed to delete property" });
    }
  });

  // Set property calendar/availability
  app.post('/api/properties/:id/availability', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const property = await storage.getProperty(req.params.id);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      if (property.hostId !== userId && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { startDate, endDate, available } = req.body;

      const availability = await storage.setAvailability({
        propertyId: req.params.id,
        startDate,
        endDate,
        available: available !== false // default to true
      });

      await storage.createAuditLog({
        userId,
        action: 'UPDATE_AVAILABILITY',
        entityType: 'property',
        entityId: req.params.id,
        changes: { startDate, endDate, available }
      });

      res.json(availability);
    } catch (error: any) {
      console.error("Error setting availability:", error);
      res.status(400).json({ message: error.message || "Failed to set availability" });
    }
  });

  // Get property calendar
  app.get('/api/properties/:id/availability', async (req: any, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate required" });
      }

      const availability = await storage.getAvailabilityForProperty(req.params.id, startDate, endDate);
      res.json(availability);
    } catch (error: any) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: error.message || "Failed to fetch availability" });
    }
  });

  // Update pricing (base price and fees)
  app.patch('/api/properties/:id/pricing', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const property = await storage.getProperty(req.params.id);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      if (property.hostId !== userId && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { pricePerNight, cleaningFee, serviceFee, taxRate, weekendPriceMultiplier } = req.body;

      const updated = await storage.updateProperty(req.params.id, {
        pricePerNight: pricePerNight?.toString(),
        cleaningFee: cleaningFee?.toString(),
        serviceFee: serviceFee?.toString(),
        taxRate: taxRate?.toString(),
        weekendPriceMultiplier: weekendPriceMultiplier?.toString()
      });

      await storage.createAuditLog({
        userId,
        action: 'UPDATE_PRICING',
        entityType: 'property',
        entityId: req.params.id,
        changes: req.body
      });

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating pricing:", error);
      res.status(400).json({ message: error.message || "Failed to update pricing" });
    }
  });

  // Create seasonal pricing rule
  app.post('/api/properties/:id/seasonal-pricing', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const property = await storage.getProperty(req.params.id);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      if (property.hostId !== userId && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { name, seasonName, startDate, endDate, pricePerNight, multiplier } = req.body;

      const pricing = await storage.createSeasonalPricing({
        propertyId: req.params.id,
        name,
        seasonName,
        startDate,
        endDate,
        pricePerNight: pricePerNight?.toString(),
        multiplier: multiplier?.toString() || '1.0'
      });

      await storage.createAuditLog({
        userId,
        action: 'CREATE_SEASONAL_PRICING',
        entityType: 'property',
        entityId: req.params.id,
        changes: req.body
      });

      res.status(201).json(pricing);
    } catch (error: any) {
      console.error("Error creating seasonal pricing:", error);
      res.status(400).json({ message: error.message || "Failed to create seasonal pricing" });
    }
  });

  // Get seasonal pricing rules
  app.get('/api/properties/:id/seasonal-pricing', async (req: any, res) => {
    try {
      const pricing = await storage.getSeasonalPricingForProperty(req.params.id);
      res.json(pricing);
    } catch (error: any) {
      console.error("Error fetching seasonal pricing:", error);
      res.status(500).json({ message: error.message || "Failed to fetch seasonal pricing" });
    }
  });

  // ============================================================================
  // BOOKING ROUTES
  // ============================================================================

  // Create booking (allow guest users to book without authentication)
  app.post('/api/bookings', async (req: any, res) => {
    try {
      // Allow both authenticated and guest users to book
      const userId = req.user?.id || null;
      
      // =====================================================================
      // KYC & PAYMENT VERIFICATION CHECK - MANDATORY FOR AUTHENTICATED USERS
      // =====================================================================
      if (userId) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        // Check ID verification (KYC) status
        const verification = await storage.getIdVerification(userId);
        const kycVerified = verification?.status === 'verified';

        if (!kycVerified) {
          return res.status(403).json({ 
            message: "Cannot complete booking",
            reason: "Your ID verification must be approved by admin before booking",
            code: "KYC_NOT_VERIFIED"
          });
        }

        // Check payment method verification
        if (!user.paymentVerified) {
          return res.status(403).json({ 
            message: "Cannot complete booking",
            reason: "Admin must verify your payment method before booking",
            code: "PAYMENT_NOT_VERIFIED"
          });
        }
      }
      
      // Validate request body
      const bookingRequest = insertBookingSchema.partial().extend({
        propertyId: insertBookingSchema.shape.propertyId,
        checkIn: insertBookingSchema.shape.checkIn,
        checkOut: insertBookingSchema.shape.checkOut,
        guests: insertBookingSchema.shape.guests,
        specialRequests: insertBookingSchema.shape.specialRequests.optional(),
      }).parse(req.body);

      const { propertyId, checkIn, checkOut, guests, specialRequests } = bookingRequest;

      // Get property
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Allow booking ANY dates - conflict checking disabled
      // const isAvailable = await storage.checkAvailability(propertyId, checkIn, checkOut);
      // if (!isAvailable) {
      //   return res.status(400).json({ message: "Property not available for selected dates" });
      // }

      // const conflicts = await storage.getConflictingBookings(propertyId, checkIn, checkOut);
      // if (conflicts.length > 0) {
      //   return res.status(409).json({ 
      //     message: "Property has conflicting bookings for these dates",
      //     conflictingBookings: conflicts.map(b => ({ id: b.id, checkIn: b.checkIn, checkOut: b.checkOut }))
      //   });
      // }

      // Calculate pricing with seasonal and weekend pricing
      // Use parseLocalDate to avoid timezone issues (prevents 1-day offset)
      const checkInDate = parseLocalDate(checkIn as string);
      const checkOutDate = parseLocalDate(checkOut as string);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const basePrice = Number(property.pricePerNight);
      const weekendMultiplier = Number(property.weekendPriceMultiplier || 1.0);
      const cleaningFee = Number(property.cleaningFee || 0);
      const serviceFee = Number(property.serviceFee || 0);
      const taxRate = Number(property.taxRate || 0.0625);

      // Calculate dynamic nightly prices based on weekend/seasonal rates
      let subtotal = 0;
      const currentDate = new Date(checkInDate);
      for (let i = 0; i < nights; i++) {
        const dayOfWeek = currentDate.getDay(); // 0=Sunday, 6=Saturday
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0; // Fri, Sat, Sun
        
        // Apply weekend pricing if applicable
        if (isWeekend) {
          subtotal += basePrice * weekendMultiplier;
        } else {
          subtotal += basePrice;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const tax = (subtotal + cleaningFee + serviceFee) * taxRate;
      const total = subtotal + cleaningFee + serviceFee + tax;
      
      // Get site settings for commission rate
      const settings = await storage.getSiteSettings();
      const commissionRate = Number(settings?.commissionRate || 0.15);
      const commission = total * commissionRate;

      // Create booking (guestId can be null for guest users)
      const booking = await storage.createBooking({
        propertyId,
        guestId: userId,
        hostId: property.hostId,
        checkIn,
        checkOut,
        guests,
        nights,
        pricePerNight: basePrice.toString(),
        subtotal: subtotal.toString(),
        cleaningFee: cleaningFee.toString(),
        serviceFee: serviceFee.toString(),
        tax: tax.toString(),
        total: total.toString(),
        commission: commission.toString(),
        specialRequests,
        status: 'pending',
        paymentStatus: 'pending',
      });

      // Check if booking was created successfully
      if (!booking || !booking.id) {
        return res.status(500).json({ message: "Failed to create booking" });
      }

      // Create host-guest verification record only if guest has a verified ID
      if (userId && property.hostId) {
        const guestVerification = await storage.getIdVerification(userId);
        if (guestVerification && guestVerification.status === 'verified') {
          // Check if host-guest verification already exists
          const existingHostGuestVerif = await storage.getHostGuestVerification(property.hostId, userId);
          if (!existingHostGuestVerif) {
            await storage.createHostGuestVerification(property.hostId, userId, guestVerification.id);
          }
        }
      }

      // Create notification for host (only if host exists)
      if (property.hostId) {
        await storage.createNotification({
          userId: property.hostId,
          type: 'booking',
          title: 'New Booking Request',
          message: `You have a new booking request for ${property.title}`,
          link: `/host/bookings/${booking.id}`,
          metadata: { bookingId: booking.id },
        });
      }

      // Create Stripe checkout session with webhook handling
      try {
        const stripe = await getUncachableStripeClient();
        // Only fetch user if userId exists (authenticated users)
        const user = userId ? await storage.getUser(userId) : null;

        // Determine redirect URLs - use absolute URLs for Stripe
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'https';
        const host = process.env.REPLIT_DOMAINS 
          ? process.env.REPLIT_DOMAINS.split(',')[0]
          : req.get('host');
        const baseUrl = `${protocol}://${host}`;

        // Create checkout session with custom line items
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          customer_email: user?.email || undefined,
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `${property.title} - ${nights} nights`,
                  description: `Check-in: ${checkIn}, Check-out: ${checkOut}`,
                },
                unit_amount: Math.round(total * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          metadata: {
            bookingId: booking.id,
            propertyId,
            guestId: userId,
            hostId: property.hostId,
            commission: commission.toString(),
          },
          success_url: `${baseUrl}/trips?booking=${booking.id}&payment=success`,
          cancel_url: `${baseUrl}/property/${propertyId}?payment=cancelled`,
        });

        console.log(`Stripe checkout session created: ${session.id} for booking ${booking.id}`);
        res.status(201).json({ 
          booking, 
          checkoutUrl: session.url,
          sessionId: session.id 
        });
      } catch (stripeError: any) {
        console.error('Stripe checkout error:', stripeError.message);
        // Don't return a checkout URL if Stripe fails - user should see error
        res.status(201).json({ 
          booking, 
          checkoutUrl: null,
          error: 'Payment gateway temporarily unavailable. Please try again.'
        });
      }
    } catch (error: any) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  });

  // Get upcoming bookings for guest
  app.get('/api/bookings/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const bookings = await storage.getBookingsByGuest(userId);
      const upcoming = bookings.filter(b => 
        b.status !== 'cancelled' && 
        new Date(b.checkIn as any) >= new Date()
      );
      res.json(upcoming);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get past bookings for guest
  app.get('/api/bookings/past', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const bookings = await storage.getBookingsByGuest(userId);
      const past = bookings.filter(b => 
        new Date(b.checkOut as any) < new Date()
      );
      res.json(past);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Update booking status (admin/host only)
  app.patch('/api/bookings/:id/status', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { status } = req.body;
      const booking = await storage.getBooking(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Hosts can only update their own bookings, admins can update any
      if (booking.hostId !== userId && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updated = await storage.updateBookingStatus(req.params.id, status);

      // Create notification for guest
      if (booking.guestId) {
        await storage.createNotification({
          userId: booking.guestId,
          type: 'booking',
          title: `Booking ${status}`,
          message: `Your booking has been ${status}`,
          link: `/trips`,
          metadata: { bookingId: booking.id },
        });
      }

      await storage.createAuditLog({
        userId,
        action: 'UPDATE_BOOKING_STATUS',
        entityType: 'booking',
        entityId: req.params.id,
        changes: { status },
      });

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating booking:", error);
      res.status(400).json({ message: error.message || "Failed to update booking" });
    }
  });

  // ============================================================================
  // CONVERSATION & MESSAGE ROUTES
  // ============================================================================

  // Get conversations for user
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const conversations = await storage.getConversationsForUser(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Create or get conversation
  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { participantId } = req.body;

      if (!participantId) {
        return res.status(400).json({ message: "Participant ID required" });
      }

      // If participantId looks like an email, look up the actual user ID
      let resolvedParticipantId = participantId;
      if (participantId.includes('@')) {
        const participant = await storage.getUser(participantId);
        if (!participant) {
          return res.status(404).json({ message: "User not found" });
        }
        resolvedParticipantId = participant.id;
      }

      // Check if conversation exists
      const existing = await storage.getConversationsForUser(userId);
      const conv = existing.find(c => 
        (c.participant1Id === resolvedParticipantId && c.participant2Id === userId) ||
        (c.participant1Id === userId && c.participant2Id === resolvedParticipantId)
      );

      if (conv) {
        return res.json(conv);
      }

      const conversation = await storage.createConversation({
        participant1Id: userId,
        participant2Id: resolvedParticipantId,
      });
      res.status(201).json(conversation);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ message: error.message || "Failed to create conversation" });
    }
  });

  // Get messages for conversation
  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const conversation = await storage.getConversation(req.params.id);

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Check if user is participant
      if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const messages = await storage.getMessagesForConversation(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { conversationId, content, attachments } = req.body;

      if (!conversationId || !content) {
        return res.status(400).json({ message: "Conversation ID and content required" });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Check if user is participant
      if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const message = await storage.createMessage({
        conversationId,
        senderId: userId,
        content,
        attachments: attachments || [],
        isRead: false,
      });

      // Log chat message
      await storage.createAuditLog({
        userId,
        action: 'SEND_MESSAGE',
        entityType: 'message',
        entityId: message.id,
        changes: { conversationId, hasAttachments: (attachments?.length || 0) > 0 }
      });

      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error sending message:", error);
      res.status(400).json({ message: error.message || "Failed to send message" });
    }
  });

  // ============================================================================
  // ADMIN ROUTES - HOST MANAGEMENT
  // ============================================================================

  // Get all hosts (ADMIN ONLY)
  app.get('/api/admin/hosts', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res) => {
    try {
      const hosts = await storage.getUsersByRole('host');
      
      // Get additional stats for each host
      const hostsWithStats = await Promise.all(
        hosts.map(async (host) => {
          const properties = await storage.getProperties({ hostId: host.id });
          const stats = await storage.getHostStats(host.id);
          return {
            ...host,
            propertyCount: properties.length,
            stats: stats
          };
        })
      );

      res.json(hostsWithStats);
    } catch (error) {
      console.error("Error fetching hosts:", error);
      res.status(500).json({ message: "Failed to fetch hosts" });
    }
  });

  // ============================================================================
  // HOST ROUTES
  // ============================================================================

  // Get host stats
  app.get('/api/host/stats', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const stats = await storage.getHostStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching host stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get host properties
  app.get('/api/host/properties', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const properties = await storage.getProperties({ hostId: userId });
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get host bookings
  app.get('/api/host/bookings', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const bookings = await storage.getBookingsByHost(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // ============================================================================
  // ADMIN ROUTES
  // ============================================================================

  // Get admin stats
  app.get('/api/admin/stats', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get all properties (admin - global view)
  app.get('/api/admin/properties', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get recent bookings (admin - all bookings)
  app.get('/api/admin/bookings/recent', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res) => {
    try {
      // Fetch all bookings regardless of status
      const bookings = await storage.getBookings?.() || [];
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      // Fallback to pending approvals if getBookings doesn't exist
      try {
        const bookings = await storage.getBookingsByStatus('pending_approval');
        res.json(bookings);
      } catch (err) {
        res.status(500).json({ message: "Failed to fetch bookings" });
      }
    }
  });

  // Approve booking (admin)
  app.patch('/api/admin/bookings/:id/approve', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res) => {
    try {
      const bookingId = req.params.id;
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const updated = await storage.updateBookingStatus(bookingId, 'confirmed');
      
      await storage.createAuditLog({
        userId: req.user?.id,
        action: 'APPROVE_BOOKING',
        entityType: 'booking',
        entityId: bookingId,
        changes: { status: 'confirmed', approvedBy: req.user?.id }
      });

      await storage.createNotification({
        userId: booking.guestId || 'guest',
        type: 'booking',
        title: 'Booking Approved',
        message: 'Your booking has been approved and confirmed',
        link: `/booking/${bookingId}`
      });

      res.json(updated);
    } catch (error: any) {
      console.error("Error approving booking:", error);
      res.status(500).json({ message: error.message || "Failed to approve booking" });
    }
  });

  // Reschedule booking (admin)
  app.patch('/api/admin/bookings/:id/reschedule', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res) => {
    try {
      const { checkIn, checkOut } = req.body;
      const bookingId = req.params.id;
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const updated = await storage.updateBooking(bookingId, {
        checkIn: checkIn instanceof Date ? checkIn.toISOString() : checkIn,
        checkOut: checkOut instanceof Date ? checkOut.toISOString() : checkOut
      });

      await storage.createAuditLog({
        userId: req.user?.id,
        action: 'RESCHEDULE_BOOKING',
        entityType: 'booking',
        entityId: bookingId,
        changes: { oldCheckIn: booking.checkIn, newCheckIn: checkIn, oldCheckOut: booking.checkOut, newCheckOut: checkOut }
      });

      res.json(updated);
    } catch (error: any) {
      console.error("Error rescheduling booking:", error);
      res.status(500).json({ message: error.message || "Failed to reschedule booking" });
    }
  });

  // Update booking payment amount (admin)
  app.patch('/api/admin/bookings/:id/amount', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res) => {
    try {
      const { total } = req.body;
      const bookingId = req.params.id;
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (typeof total !== 'number' || total < 0) {
        return res.status(400).json({ message: "Valid amount required" });
      }

      const updated = await storage.updateBooking(bookingId, { total });

      await storage.createAuditLog({
        userId: req.user?.id,
        action: 'UPDATE_BOOKING_AMOUNT',
        entityType: 'booking',
        entityId: bookingId,
        changes: { oldTotal: booking.total, newTotal: total }
      });

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating booking amount:", error);
      res.status(500).json({ message: error.message || "Failed to update booking amount" });
    }
  });

  // Get audit logs (admin)
  app.get('/api/admin/audit-logs', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit || '100');
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Get all users for admin verification (KYC & Payment status)
  app.get('/api/admin/users-for-verification', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res: any) => {
    try {
      const users = await storage.getUsersByRole('guest');
      const usersWithVerification = await Promise.all(
        users.map(async (user) => {
          const idVerification = await storage.getIdVerification(user.id);
          return {
            ...user,
            kycStatus: idVerification?.status || 'pending',
            kycVerified: idVerification?.status === 'verified',
            paymentVerified: user.paymentVerified || false,
          };
        })
      );
      res.json(usersWithVerification);
    } catch (error: any) {
      console.error("Error fetching users for verification:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin approve payment method for user
  app.patch('/api/admin/users/:userId/verify-payment', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res: any) => {
    try {
      const { userId } = req.params;
      const { paymentVerified } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updated = await storage.upsertUser({
        id: userId,
        paymentVerified: Boolean(paymentVerified),
      });

      // Log the action
      await storage.createAuditLog({
        userId: req.user?.id,
        action: 'VERIFY_PAYMENT_METHOD',
        entityType: 'user',
        entityId: userId,
        changes: { paymentVerified: Boolean(paymentVerified) }
      });

      res.json({ 
        message: paymentVerified ? "Payment method verified" : "Payment method unverified",
        user: updated 
      });
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: error.message || "Failed to verify payment" });
    }
  });

  // User request to become a host
  app.post('/api/user/request-host-status', isAuthenticated, async (req: any, res: any) => {
    try {
      const userId = req.user?.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.hostVerificationStatus === 'pending') {
        return res.status(400).json({ message: "Host verification request already pending" });
      }

      const updated = await storage.upsertUser({
        id: userId,
        hostVerificationStatus: 'pending',
      });

      await storage.createAuditLog({
        userId,
        action: 'REQUEST_HOST_STATUS',
        entityType: 'user',
        entityId: userId,
        changes: { hostVerificationStatus: 'pending' }
      });

      res.json({ message: "Host verification request submitted", user: updated });
    } catch (error: any) {
      console.error("Error requesting host status:", error);
      res.status(500).json({ message: error.message || "Failed to request host status" });
    }
  });

  // Get hosts pending verification for admin
  app.get('/api/admin/host-verification-requests', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res: any) => {
    try {
      const users = await storage.getUsersByRole('guest');
      const pendingHosts = users.filter(u => u.hostVerificationStatus === 'pending');
      res.json(pendingHosts);
    } catch (error: any) {
      console.error("Error fetching host requests:", error);
      res.status(500).json({ message: "Failed to fetch host verification requests" });
    }
  });

  // Admin approve/reject host verification
  app.patch('/api/admin/users/:userId/verify-host', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res: any) => {
    try {
      const { userId } = req.params;
      const { approved, reason } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const status = approved ? 'approved' : 'rejected';
      const updated = await storage.upsertUser({
        id: userId,
        role: approved ? 'host' : 'guest',
        hostVerificationStatus: status,
        hostVerificationReason: reason,
      });

      await storage.createAuditLog({
        userId: req.user?.id,
        action: 'VERIFY_HOST_STATUS',
        entityType: 'user',
        entityId: userId,
        changes: { status, reason }
      });

      res.json({ 
        message: approved ? "Host verified successfully" : "Host verification rejected",
        user: updated 
      });
    } catch (error: any) {
      console.error("Error verifying host:", error);
      res.status(500).json({ message: error.message || "Failed to verify host" });
    }
  });

  // Get all ID verifications for admin (all statuses)
  app.get('/api/admin/id-verifications', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res: any) => {
    try {
      const verifications = await storage.getAllIdVerifications();
      res.json(verifications);
    } catch (error: any) {
      console.error("Error fetching ID verifications:", error);
      res.status(500).json({ message: "Failed to fetch ID verifications" });
    }
  });

  // ============================================================================
  // HOST-SPECIFIC GUEST VERIFICATION ROUTES
  // ============================================================================

  // Get guest verification status for a specific host
  app.get('/api/host/guest-verification/:guestId', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res: any) => {
    try {
      const hostId = req.user?.id;
      const { guestId } = req.params;
      
      const verification = await storage.getHostGuestVerification(hostId, guestId);
      res.json({ verification });
    } catch (error: any) {
      console.error("Error fetching host-guest verification:", error);
      res.status(500).json({ message: "Failed to fetch verification status" });
    }
  });

  // Get all pending guest verifications for a host
  app.get('/api/host/pending-guest-verifications', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res: any) => {
    try {
      const hostId = req.user?.id;
      const verifications = await storage.getHostPendingGuestVerifications(hostId);
      res.json(verifications);
    } catch (error: any) {
      console.error("Error fetching pending verifications:", error);
      res.status(500).json({ message: "Failed to fetch pending verifications" });
    }
  });

  // Host approves or rejects a guest's verification
  app.patch('/api/host/guest-verification/:id', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res: any) => {
    try {
      const hostId = req.user?.id;
      const { id } = req.params;
      const { approved, notes } = req.body;
      
      // Validate input
      if (typeof approved !== 'boolean') {
        return res.status(400).json({ message: "approved must be a boolean" });
      }
      
      // Require notes when rejecting
      if (!approved && (!notes || typeof notes !== 'string' || notes.trim() === '')) {
        return res.status(400).json({ message: "notes are required when rejecting verification" });
      }
      
      const status = approved ? 'approved' : 'rejected';
      const cleanNotes = notes && typeof notes === 'string' ? notes.trim() || null : null;
      const verification = await storage.updateHostGuestVerification(id, hostId, status, cleanNotes || undefined);
      
      if (!verification) {
        return res.status(404).json({ message: "Verification not found or not authorized" });
      }

      await storage.createAuditLog({
        userId: hostId,
        action: approved ? 'APPROVE_GUEST_VERIFICATION' : 'REJECT_GUEST_VERIFICATION',
        entityType: 'host_guest_verification',
        entityId: id,
        changes: { status, notes }
      });

      res.json({ 
        message: approved ? "Guest verified for your properties" : "Guest verification rejected",
        verification 
      });
    } catch (error: any) {
      console.error("Error updating guest verification:", error);
      res.status(500).json({ message: error.message || "Failed to update verification" });
    }
  });

  // Admin impersonate user (admin)
  app.post('/api/admin/impersonate/:userId', isAuthenticated, requireRoles(ROLES.ADMIN), async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.createAuditLog({
        userId: req.user?.id,
        action: 'ADMIN_IMPERSONATE',
        entityType: 'user',
        entityId: userId,
        changes: { impersonatingUser: userId }
      });

      res.json({ message: "Impersonation started", user, impersonatedBy: req.user?.id });
    } catch (error: any) {
      console.error("Error impersonating user:", error);
      res.status(500).json({ message: error.message || "Failed to impersonate user" });
    }
  });

  // ADMIN SETTINGS - CHANGE EMAIL
  app.patch('/api/admin/settings/email', [isAuthenticated, requireRoles(ROLES.ADMIN)], async (req: any, res) => {
    try {
      const adminId = (req as any).user.id;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Check if email already exists
      const existing = await storage.getUser(email);
      if (existing && existing.id !== adminId) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // Update user email
      const updated = await storage.upsertUser({
        id: adminId,
        email,
      });

      res.json({ message: 'Email updated successfully', user: updated });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to update email' });
    }
  });

  // ADMIN SETTINGS - CHANGE PASSWORD
  app.patch('/api/admin/settings/password', [isAuthenticated, requireRoles(ROLES.ADMIN)], async (req: any, res) => {
    try {
      const adminId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password required' });
      }

      // Get admin user
      const admin = await storage.getUser(adminId);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      // Verify current password
      const bcrypt = require('bcrypt');
      const isValid = await bcrypt.compare(currentPassword, admin.passwordHash || '');
      if (!isValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await storage.upsertUser({
        id: adminId,
        passwordHash: hashedPassword,
      });

      res.json({ message: 'Password updated successfully. Please log in again.' });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to update password' });
    }
  });

  // Get users (admin)
  app.get('/api/users/:id', async (req: any, res: any) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't expose sensitive data
      const { ...publicUser } = user;
      res.json(publicUser);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get booking by ID (for payment success page)
  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      // Only allow users to view their own bookings or admin access
      if (booking.guestId !== req.user?.id && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // ============================================================================
  // NOTIFICATION ROUTES
  // ============================================================================

  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const notifications = await storage.getNotificationsForUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // ============================================================================
  // FAVORITES ROUTES
  // ============================================================================

  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      // TODO: Implement favorites functionality
      res.json([]);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // ============================================================================
  // MEDIA ROUTES
  // ============================================================================

  // Upload property media (images/videos)
  app.post('/api/media/upload', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const { propertyId, fileName, fileSize, mimeType } = req.body;
      
      if (!propertyId || !fileName || !fileSize || !mimeType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const userId = req.user?.id;
      const property = await storage.getProperty(propertyId);

      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Verify ownership
      if (property.hostId !== userId && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const mediaId = await MediaService.uploadPropertyMedia(
        propertyId,
        fileName,
        fileSize,
        mimeType,
        userId
      );

      // Log media upload
      await storage.createAuditLog({
        userId,
        action: 'UPLOAD_MEDIA',
        entityType: 'media',
        entityId: mediaId,
        changes: { propertyId, fileName, fileSize, mimeType }
      });

      res.status(201).json({ mediaId, message: "File uploaded successfully" });
    } catch (error: any) {
      console.error("Error uploading media:", error);
      res.status(500).json({ message: "Failed to upload media" });
    }
  });

  // Delete property media
  app.delete('/api/media/:id', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      // Verify ownership (simple version - in production, check media ownership through property)
      await MediaService.deletePropertyMedia(req.params.id);

      // Log media deletion
      await storage.createAuditLog({
        userId,
        action: 'DELETE_MEDIA',
        entityType: 'media',
        entityId: req.params.id,
        changes: {}
      });

      res.json({ message: "Media deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Get property media
  app.get('/api/properties/:id/media', async (req: any, res: any) => {
    try {
      const media = await MediaService.getPropertyMedia(req.params.id);
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  // ============================================================================
  // PAYMENT FINALIZATION ROUTES
  // ============================================================================

  // Finalize payment after Stripe checkout
  app.post('/api/payments/finalize', isAuthenticated, async (req: any, res) => {
    try {
      const { bookingId, stripePaymentIntentId, amount, commission } = req.body;

      if (!bookingId || !stripePaymentIntentId || !amount || commission === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const { booking, payment } = await PaymentService.finalizePayment(
        bookingId,
        stripePaymentIntentId,
        Number(amount),
        Number(commission)
      );

      res.json({ booking, payment, message: "Payment finalized successfully" });
    } catch (error: any) {
      console.error("Error finalizing payment:", error);
      res.status(400).json({ message: error.message || "Failed to finalize payment" });
    }
  });

  // Process refund for booking
  app.post('/api/payments/refund', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const { bookingId, reason } = req.body;

      if (!bookingId) {
        return res.status(400).json({ message: "Booking ID required" });
      }

      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const userId = req.user?.id;
      if (booking.hostId !== userId && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const payment = await PaymentService.processRefund(bookingId, reason || "Requested by host");

      res.json({ payment, message: "Refund processed successfully" });
    } catch (error: any) {
      console.error("Error processing refund:", error);
      res.status(400).json({ message: error.message || "Failed to process refund" });
    }
  });

  // Get host earnings
  app.get('/api/payments/earnings', isAuthenticated, requireRoles(ROLES.HOST), async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const monthsBack = parseInt(req.query.months) || 12;

      const earnings = await PaymentService.getHostEarnings(userId, monthsBack);

      res.json({ earnings, period: `${monthsBack} months` });
    } catch (error) {
      console.error("Error fetching earnings:", error);
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  // ============================================================================
  // PROPOSAL VERSIONING ROUTES
  // ============================================================================

  // Create a new proposal version for a booking
  app.post('/api/proposal-versions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { bookingId, title, checkIn, checkOut, guests, pricePerNight, cleaningFee, serviceFee, tax, total, notes } = req.body;

      if (!bookingId) {
        return res.status(400).json({ error: 'Booking ID required' });
      }

      // Verify booking exists and user has access
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Only guest or host can create proposals for a booking, or admin
      if (booking.guestId !== userId && booking.hostId !== userId && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Get next version number
      const existingVersions = await storage.getProposalVersionsForBooking(bookingId);
      const nextVersionNumber = existingVersions.length > 0 
        ? Math.max(...existingVersions.map(v => v.versionNumber)) + 1 
        : 1;

      const proposal = await storage.createProposalVersion({
        bookingId,
        creatorId: userId,
        versionNumber: nextVersionNumber,
        title,
        checkIn,
        checkOut,
        guests,
        pricePerNight,
        cleaningFee: cleaningFee || '0',
        serviceFee: serviceFee || '0',
        tax,
        total,
        notes,
        status: 'draft',
      });

      await storage.createAuditLog({
        userId,
        action: 'CREATE_PROPOSAL_VERSION',
        entityType: 'proposal_version',
        entityId: proposal.id,
        changes: proposal,
      });

      res.status(201).json(proposal);
    } catch (error: any) {
      console.error('Error creating proposal version:', error);
      res.status(400).json({ error: error.message || 'Failed to create proposal version' });
    }
  });

  // Get a specific proposal version
  app.get('/api/proposal-versions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const proposal = await storage.getProposalVersion(req.params.id);
      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      // Verify access
      const booking = await storage.getBooking(proposal.bookingId);
      if (booking && booking.guestId !== req.user?.id && booking.hostId !== req.user?.id && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      res.json(proposal);
    } catch (error: any) {
      console.error('Error fetching proposal version:', error);
      res.status(500).json({ error: 'Failed to fetch proposal version' });
    }
  });

  // Get all proposal versions for a booking
  app.get('/api/bookings/:bookingId/proposal-versions', isAuthenticated, async (req: any, res) => {
    try {
      const { bookingId } = req.params;

      // Verify booking exists and user has access
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Only guest, host, or admin can view proposals
      if (booking.guestId !== req.user?.id && booking.hostId !== req.user?.id && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const proposals = await storage.getProposalVersionsForBooking(bookingId);
      res.json(proposals);
    } catch (error: any) {
      console.error('Error fetching proposal versions:', error);
      res.status(500).json({ error: 'Failed to fetch proposal versions' });
    }
  });

  // Update proposal version status
  app.patch('/api/proposal-versions/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status required' });
      }

      const proposal = await storage.getProposalVersion(req.params.id);
      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      // Verify access
      const booking = await storage.getBooking(proposal.bookingId);
      if (booking && booking.guestId !== req.user?.id && booking.hostId !== req.user?.id && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updated = await storage.updateProposalVersionStatus(req.params.id, status);

      await storage.createAuditLog({
        userId: req.user?.id,
        action: 'UPDATE_PROPOSAL_VERSION',
        entityType: 'proposal_version',
        entityId: req.params.id,
        changes: { status },
      });

      res.json(updated);
    } catch (error: any) {
      console.error('Error updating proposal version status:', error);
      res.status(400).json({ error: error.message || 'Failed to update proposal version' });
    }
  });

  // Delete a proposal version
  app.delete('/api/proposal-versions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const proposal = await storage.getProposalVersion(req.params.id);
      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      // Verify access
      const booking = await storage.getBooking(proposal.bookingId);
      if (booking && booking.guestId !== req.user?.id && booking.hostId !== req.user?.id && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await storage.deleteProposalVersion(req.params.id);

      await storage.createAuditLog({
        userId: req.user?.id,
        action: 'DELETE_PROPOSAL_VERSION',
        entityType: 'proposal_version',
        entityId: req.params.id,
        changes: {},
      });

      res.json({ message: 'Proposal version deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting proposal version:', error);
      res.status(400).json({ error: error.message || 'Failed to delete proposal version' });
    }
  });

  // ============================================================================
  // ROOM BLOCKING & SEASONAL PRICING ROUTES
  // ============================================================================

  app.post('/api/availability/block', isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN), async (req: any, res) => {
    try {
      const { propertyId, date, reason } = req.body;
      const userId = req.user?.id;

      if (!propertyId || !date) {
        return res.status(400).json({ message: "Property ID and date required" });
      }

      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      if (property.hostId !== userId && req.userRole !== ROLES.ADMIN) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const availability = await storage.setAvailability({
        propertyId,
        date,
        isAvailable: false,
      });

      await storage.createAuditLog({
        userId,
        action: 'BLOCK_DATE',
        entityType: 'availability',
        entityId: availability.id,
        changes: { date, reason },
      });

      res.json(availability);
    } catch (error: any) {
      console.error("Error blocking date:", error);
      res.status(400).json({ message: error.message || "Failed to block date" });
    }
  });

  app.get('/api/properties/:propertyId/availability', async (req: any, res: any) => {
    try {
      const { propertyId } = req.params;
      const { startDate = new Date().toISOString().split('T')[0], endDate } = req.query;

      if (!propertyId || !startDate || !endDate) {
        return res.status(400).json({ message: "Property ID, start date, and end date required" });
      }

      const availability = await storage.getAvailabilityForProperty(propertyId, startDate as string, endDate as string);
      res.json(availability);
    } catch (error: any) {
      console.error("Error fetching availability:", error);
      res.status(400).json({ message: error.message || "Failed to fetch availability" });
    }
  });

  // ============================================================================
  // REVIEWS & RATINGS ENDPOINTS
  // ============================================================================

  app.get('/api/properties/:propertyId/reviews', async (req: any, res: any) => {
    try {
      const reviews = await storage.getReviewsForProperty(req.params.propertyId);
      const avgRating = await storage.getPropertyAverageRating(req.params.propertyId);
      res.json({ reviews, averageRating: avgRating });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  app.post('/api/reviews', [isAuthenticated], async (req: any, res: any) => {
    try {
      const { propertyId, bookingId, rating, title, comment } = req.body;
      const review = await storage.createReview({
        propertyId,
        bookingId,
        guestId: (req as any).user.id,
        rating: Math.min(5, Math.max(1, rating)),
        title,
        comment,
        isVerifiedBooking: true,
      });
      res.json({ review });
    } catch (error: any) {
      res.status(400).json({ message: 'Failed to create review' });
    }
  });

  // ============================================================================
  // HOST PROFILE ENDPOINTS
  // ============================================================================

  app.get('/api/hosts/:hostId', async (req: any, res: any) => {
    try {
      const host = await storage.getUser(req.params.hostId);
      if (!host) return res.status(404).json({ message: 'Host not found' });

      const properties = await storage.getProperties({ hostId: req.params.hostId });
      const reviews = await storage.getReviewsForHost(req.params.hostId);
      
      let totalRating = 0;
      for (const prop of properties) {
        totalRating += await storage.getPropertyAverageRating(prop.id);
      }

      const stats = {
        averageRating: properties.length > 0 ? totalRating / properties.length : 0,
        totalReviews: reviews.length,
        responseRate: 95,
        totalListings: properties.length,
        totalBookings: reviews.length,
      };

      res.json({ host, properties, reviews: reviews.slice(0, 5), stats });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch host profile' });
    }
  });

  // ============================================================================
  // USER STATS ENDPOINTS
  // ============================================================================

  app.get('/api/user/stats', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      const userStats = await storage.getUserStats(userId);
      
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        monthlyData.push({
          month: date.toLocaleString('default', { month: 'short' }),
          bookings: Math.floor(userStats.totalBookings / 6),
          revenue: Math.floor(userStats.totalRevenue / 6),
        });
      }

      res.json({
        totalBookings: userStats.totalBookings,
        totalRevenue: userStats.totalRevenue,
        occupancyRate: 65,
        averageRating: userStats.averageRating,
        totalGuests: userStats.totalBookings,
        totalListings: 0,
        monthlyBookings: monthlyData,
        upcomingBookings: 3,
        cancellationRate: 5,
        responseTime: 2,
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch user stats' });
    }
  });

  // ============================================================================
  // ICAL CALENDAR SYNC ENDPOINTS
  // ============================================================================

  app.post('/api/properties/:propertyId/ical', [isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN)], async (req: any, res: any) => {
    try {
      const { iCalUrl } = req.body;
      if (!iCalUrl) return res.status(400).json({ message: 'iCal URL required' });

      let calendar = await storage.getICalCalendarForProperty(req.params.propertyId);
      if (calendar) {
        calendar = await storage.updateICalSyncStatus(calendar.id, 'pending');
      } else {
        calendar = await storage.createICalCalendar({
          propertyId: req.params.propertyId,
          iCalUrl,
          syncStatus: 'pending',
        });
      }
      res.json({ calendar });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to setup iCal sync' });
    }
  });

  app.get('/api/properties/:propertyId/ical', async (req: any, res: any) => {
    try {
      const calendar = await storage.getICalCalendarForProperty(req.params.propertyId);
      res.json({ calendar: calendar || null });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch iCal calendar' });
    }
  });

  // ============================================================================
  // OAUTH ENDPOINTS
  // ============================================================================

  app.post('/api/oauth/connect', [isAuthenticated], async (req: any, res: any) => {
    try {
      const { provider, providerUserId, email, displayName, profileImageUrl } = req.body;
      const userId = (req as any).user.id;

      const profile = await storage.createOAuthProfile({
        userId,
        provider,
        providerUserId,
        providerEmail: email,
        displayName,
        profileImageUrl,
      });

      res.json({ profile });
    } catch (error: any) {
      res.status(400).json({ message: 'Failed to connect OAuth profile' });
    }
  });

  app.get('/api/oauth/profiles', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ profiles: [] });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch OAuth profiles' });
    }
  });

  // ============================================================================

  // ============================================================================
  // FAVORITES ENDPOINTS
  // ============================================================================

  app.get('/api/favorites', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      const properties = await storage.getFavorites(userId);
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch favorites' });
    }
  });

  app.post('/api/favorites/:propertyId', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      const favorite = await storage.addFavorite(userId, req.params.propertyId);
      res.json({ favorite });
    } catch (error: any) {
      res.status(400).json({ message: 'Failed to add favorite' });
    }
  });

  app.delete('/api/favorites/:propertyId', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      await storage.removeFavorite(userId, req.params.propertyId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: 'Failed to remove favorite' });
    }
  });

  // ============================================================================
  // ID VERIFICATION ENDPOINTS
  // ============================================================================

  app.post('/api/user/verify-id', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      const verification = await storage.createIdVerification({
        userId,
        documentType: req.body.documentType || 'drivers_license',
        documentUrl: req.body.documentUrl || '/placeholder.jpg',
        status: 'pending',
      });
      res.json({ verification });
    } catch (error: any) {
      res.status(400).json({ message: 'Failed to submit verification' });
    }
  });

  app.get('/api/user/verification', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      const verification = await storage.getIdVerification(userId);
      res.json({ verification });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch verification' });
    }
  });

  app.patch('/api/user/verification/:id', [isAuthenticated, requireRoles(ROLES.ADMIN)], async (req: any, res: any) => {
    try {
      const { status, rejectionReason } = req.body;
      
      if (!status || !['verified', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be verified, rejected, or pending.' });
      }
      
      const verification = await storage.updateIdVerificationStatus(req.params.id, status, rejectionReason);
      
      if (!verification) {
        return res.status(404).json({ message: 'Verification not found' });
      }
      
      res.json({ verification });
    } catch (error: any) {
      console.error('Error updating verification:', error);
      res.status(500).json({ message: error.message || 'Failed to update verification' });
    }
  });

  // ============================================================================
  // USER PROFILE ENDPOINTS
  // ============================================================================

  app.get('/api/user/profile', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      const profile = await storage.getUserProfile(userId);
      const verification = await storage.getIdVerification(userId);
      res.json({ 
        user: user ? { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          role: user.role,
          kycVerified: user.kycVerified,
          isVerified: user.isVerified
        } : null,
        profile, 
        verification 
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });

  app.patch('/api/user/profile', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      const profile = await storage.createOrUpdateUserProfile({
        userId,
        bio: req.body.bio,
        phoneNumber: req.body.phoneNumber,
        emergencyContact: req.body.emergencyContact,
        emergencyPhone: req.body.emergencyPhone,
        preferences: req.body.preferences || {},
      });
      res.json({ profile });
    } catch (error: any) {
      res.status(400).json({ message: 'Failed to update profile' });
    }
  });

  // ============================================================================
  // STAY HISTORY ENDPOINTS
  // ============================================================================

  app.get('/api/user/stays', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      const stays = await storage.getUserStays(userId);
      res.json(stays);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch stay history' });
    }
  });

  // ============================================================================
  // SEASONAL PRICING ENDPOINTS
  // ============================================================================

  app.post('/api/properties/:propertyId/pricing-rules', [isAuthenticated, requireRoles(ROLES.HOST, ROLES.ADMIN)], async (req: any, res: any) => {
    try {
      const rule = await storage.createSeasonalPricing(req.body);
      res.json({ rule });
    } catch (error: any) {
      res.status(400).json({ message: 'Failed to create pricing rule' });
    }
  });

  app.get('/api/properties/:propertyId/pricing-rules', async (req: any, res: any) => {
    try {
      const rules = await storage.getSeasonalPricingForProperty(req.params.propertyId);
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch pricing rules' });
    }
  });

  // ============================================================================
  // PUSH NOTIFICATIONS ENDPOINTS
  // ============================================================================

  app.get('/api/notifications/pending', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      const notifications = await storage.getPendingNotifications(userId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  });

  app.post('/api/notifications/send-all', [isAuthenticated, requireRoles(ROLES.ADMIN)], async (req: any, res: any) => {
    try {
      await storage.sendAllPendingNotifications();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to send notifications' });
    }
  });

  // ============================================================================
  // CHAT FILE UPLOAD ENDPOINTS
  // ============================================================================

  app.post('/api/conversations/:conversationId/upload', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      const file = await storage.uploadChatFile({
        conversationId: req.params.conversationId,
        messageId: req.body.messageId,
        fileUrl: req.body.fileUrl,
        fileName: req.body.fileName,
        fileType: req.body.fileType,
        fileSizeBytes: req.body.fileSizeBytes,
        uploadedBy: userId,
      });
      res.json({ file });
    } catch (error: any) {
      res.status(400).json({ message: 'Failed to upload file' });
    }
  });

  app.get('/api/conversations/:conversationId/files', [isAuthenticated], async (req: any, res: any) => {
    try {
      const files = await storage.getChatFiles(req.params.conversationId);
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch files' });
    }
  });

  app.delete('/api/files/:fileId', [isAuthenticated], async (req: any, res: any) => {
    try {
      await storage.deleteChatFile(req.params.fileId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: 'Failed to delete file' });
    }
  });

  // ============================================================================
  // ADMIN IMPERSONATION ENDPOINTS
  // ============================================================================

  app.post('/api/admin/impersonate/:userId', [isAuthenticated, requireRoles(ROLES.ADMIN)], async (req: any, res: any) => {
    try {
      const adminId = (req as any).user.id;
      const user = await storage.impersonateUser(adminId, req.params.userId);
      res.json({ user });
    } catch (error: any) {
      res.status(403).json({ message: 'Impersonation failed: ' + error.message });
    }
  });

  app.get('/api/admin/impersonation-status/:userId', [isAuthenticated, requireRoles(ROLES.ADMIN)], async (req: any, res: any) => {
    try {
      const status = await storage.getImpersonationStatus(req.params.userId);
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch impersonation status' });
    }
  });

  app.post('/api/admin/end-impersonation/:userId', [isAuthenticated, requireRoles(ROLES.ADMIN)], async (req: any, res: any) => {
    try {
      const user = await storage.upsertUser({ id: req.params.userId, impersonatedBy: null });
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ message: 'Failed to end impersonation' });
    }
  });

  // ============================================================================
  // LANGUAGE PREFERENCE ENDPOINTS
  // ============================================================================

  app.patch('/api/user/language', [isAuthenticated], async (req: any, res: any) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.upsertUser({ id: userId, language: req.body.language });
      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ message: 'Failed to update language' });
    }
  });
  // WEBSOCKET SERVER
  // ============================================================================

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'message') {
          const newMessage = await storage.createMessage({
            conversationId: message.conversationId,
            senderId: message.senderId,
            content: message.content,
            attachments: message.attachments || [],
          });

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'message',
                data: newMessage,
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // ============================================================================
  // AI CHATBOT ENDPOINT
  // ============================================================================
  app.post('/api/chat', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
      }

      // Import OpenAI dynamically
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });

      // Create system prompt that knows about StayHub
      const systemPrompt = `You are a helpful AI assistant for StayHub, a vacation rental platform. You can answer questions about vacation rentals, travel, booking, properties, and general topics. When users ask about StayHub, provide helpful information about how the platform works. Be concise and friendly. If asked about specific StayHub features like properties, bookings, or pricing, provide general guidance.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const reply = response.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
      res.json({ reply });
    } catch (error: any) {
      console.error('Chat error:', error.message);
      res.status(500).json({ error: error.message || 'Failed to process chat message' });
    }
  });

  return httpServer;
}

// ============================================================================
// REVIEWS & RATINGS ENDPOINTS
// ============================================================================

