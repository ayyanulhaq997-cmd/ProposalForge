import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// AUTHENTICATION & USERS (Replit Auth Required)
// ============================================================================

// Session storage table (REQUIRED for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with local auth fields + role
export const users: any = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default('guest'), // guest, host, admin
  isVerified: boolean("is_verified").default(false),
  kycVerified: boolean("kyc_verified").default(false), // ID/passport verified by admin
  paymentVerified: boolean("payment_verified").default(false), // Payment method verified
  hostVerificationStatus: varchar("host_verification_status", { length: 20 }).default('none'), // none, pending, approved, rejected
  hostVerificationReason: text("host_verification_reason"), // Reason for rejection if applicable
  stripeCustomerId: varchar("stripe_customer_id"),
  squareCustomerId: varchar("square_customer_id"),
  language: varchar("language", { length: 5 }).default('en'), // en, es
  currency: varchar("currency", { length: 3 }).default('USD'),
  impersonatedBy: varchar("impersonated_by").references(() => users.id), // For admin impersonation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============================================================================
// PROPERTIES
// ============================================================================

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hostId: varchar("host_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  propertyType: varchar("property_type", { length: 50 }).notNull(), // house, apartment, villa, cabin, cottage
  category: varchar("category", { length: 50 }).notNull(), // beachfront, mountain, city, countryside, tropical
  location: text("location").notNull(),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  guests: integer("guests").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  beds: integer("beds").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  amenities: jsonb("amenities").default([]), // Array of amenity strings
  images: jsonb("images").default([]), // Array of image URLs
  videos: jsonb("videos").default([]), // Array of video URLs
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('USD'),
  cleaningFee: decimal("cleaning_fee", { precision: 10, scale: 2 }).default('0'),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).default('0'),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default('0.0625'), // 6.25%
  minNights: integer("min_nights").default(1),
  maxNights: integer("max_nights").default(30),
  weekendPriceMultiplier: decimal("weekend_price_multiplier", { precision: 3, scale: 2 }).default('1.0'), // 1.2 = 20% markup on weekends
  status: varchar("status", { length: 20 }).default('pending'), // pending, active, inactive
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

// Room types for properties (for properties with multiple room types)
export const roomTypes = pgTable("room_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  beds: integer("beds").notNull(),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRoomTypeSchema = createInsertSchema(roomTypes).omit({ id: true, createdAt: true });
export type InsertRoomType = z.infer<typeof insertRoomTypeSchema>;
export type RoomType = typeof roomTypes.$inferSelect;

// ============================================================================
// BOOKINGS
// ============================================================================

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id),
  guestId: varchar("guest_id").references(() => users.id), // Nullable for guest users (unauthenticated bookings)
  hostId: varchar("host_id").notNull().references(() => users.id),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  guests: integer("guests").notNull(),
  nights: integer("nights").notNull(),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  cleaningFee: decimal("cleaning_fee", { precision: 10, scale: 2 }).default('0'),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).default('0'),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull(), // Platform commission
  status: varchar("status", { length: 20 }).default('pending_approval'), // pending_approval, confirmed, cancelled, completed
  paymentStatus: varchar("payment_status", { length: 20 }).default('pending'), // pending, paid, refunded
  paymentMethod: varchar("payment_method", { length: 20 }).default('stripe'), // stripe, square
  paymentIntentId: varchar("payment_intent_id"),
  squarePaymentId: varchar("square_payment_id"),
  cancellationPolicy: text("cancellation_policy"),
  specialRequests: text("special_requests"),
  confirmedAt: timestamp("confirmed_at"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// ============================================================================
// PROPOSAL VERSIONING
// ============================================================================

export const proposalVersions = pgTable("proposal_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  versionNumber: integer("version_number").notNull(),
  title: text("title"),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  guests: integer("guests").notNull(),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  cleaningFee: decimal("cleaning_fee", { precision: 10, scale: 2 }).default('0'),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).default('0'),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default('draft'), // draft, proposed, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProposalVersionSchema = createInsertSchema(proposalVersions).omit({ id: true, createdAt: true });
export type InsertProposalVersion = z.infer<typeof insertProposalVersionSchema>;
export type ProposalVersion = typeof proposalVersions.$inferSelect;

// ============================================================================
// AVAILABILITY CALENDAR
// ============================================================================

export const availability = pgTable("availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  date: date("date").notNull(),
  isAvailable: boolean("is_available").default(true),
  price: decimal("price", { precision: 10, scale: 2 }), // Override price for this date (seasonal pricing)
  minNights: integer("min_nights"), // Override min nights for this date
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({ id: true, createdAt: true });
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof availability.$inferSelect;

// ============================================================================
// CHAT SYSTEM
// ============================================================================

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id),
  bookingId: varchar("booking_id").references(() => bookings.id),
  participant1Id: varchar("participant1_id").notNull().references(() => users.id),
  participant2Id: varchar("participant2_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  attachments: jsonb("attachments").default([]), // Array of {type: 'image'|'document', url: string, name: string}
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"), // Timestamp when message was read (for read receipts)
  editedAt: timestamp("edited_at"), // Timestamp when message was edited
  isDeleted: boolean("is_deleted").default(false), // Soft delete for message history
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // booking, message, payment, admin
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// ============================================================================
// CUSTOMIZATION SETTINGS
// ============================================================================

export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteName: text("site_name").default('StayFinder'),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: varchar("primary_color", { length: 7 }).default('#0066FF'),
  secondaryColor: varchar("secondary_color", { length: 7 }).default('#00D4FF'),
  heroImage: text("hero_image"),
  heroTitle: text("hero_title").default('Find your perfect vacation rental'),
  heroSubtitle: text("hero_subtitle").default('Discover unique places to stay around the world'),
  aboutText: text("about_text"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).default('0.15'), // 15%
  currency: varchar("currency", { length: 3 }).default('USD'),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default('0.0625'), // 6.25%
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;

// ============================================================================
// AUDIT LOG
// ============================================================================

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: varchar("entity_id"),
  changes: jsonb("changes"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ============================================================================
// MEDIA (Property Images/Videos)
// ============================================================================

export const media = pgTable("media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  type: varchar("type", { length: 20 }).notNull(), // 'image', 'video'
  url: text("url").notNull(),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type", { length: 50 }),
  order: integer("order").default(0), // For sorting media
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaSchema = createInsertSchema(media).omit({ id: true, createdAt: true });
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof media.$inferSelect;

// ============================================================================
// PAYMENTS & TRANSACTIONS
// ============================================================================

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  guestId: varchar("guest_id").notNull().references(() => users.id),
  hostId: varchar("host_id").notNull().references(() => users.id),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id").unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default('USD'),
  status: varchar("status", { length: 20 }).notNull(), // pending, processing, succeeded, failed, refunded
  paymentMethod: varchar("payment_method", { length: 50 }), // card, bank_transfer, etc.
  hostPayout: decimal("host_payout", { precision: 10, scale: 2 }), // Amount paid to host after commission
  commission: decimal("commission", { precision: 10, scale: 2 }), // Platform commission (deducted from total)
  tax: decimal("tax", { precision: 10, scale: 2 }), // Tax collected
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundReason: text("refund_reason"),
  errorMessage: text("error_message"), // If payment failed
  metadata: jsonb("metadata"), // Additional Stripe metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// ============================================================================
// REVIEWS & RATINGS
// ============================================================================

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  guestId: varchar("guest_id").notNull().references(() => users.id),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  rating: integer("rating").notNull(), // 1-5
  cleanliness: integer("cleanliness"), // 1-5
  communication: integer("communication"), // 1-5
  accuracy: integer("accuracy"), // 1-5
  location: integer("location"), // 1-5
  value: integer("value"), // 1-5
  title: text("title"),
  comment: text("comment"),
  isVerifiedBooking: boolean("is_verified_booking").default(true),
  helpful: integer("helpful").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// ============================================================================
// OAUTH PROFILES
// ============================================================================

export const oauthProfiles = pgTable("oauth_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar("provider", { length: 50 }).notNull(), // 'google', 'github', 'x', 'apple'
  providerUserId: varchar("provider_user_id").notNull(),
  providerEmail: varchar("provider_email"),
  displayName: varchar("display_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOAuthProfileSchema = createInsertSchema(oauthProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOAuthProfile = z.infer<typeof insertOAuthProfileSchema>;
export type OAuthProfile = typeof oauthProfiles.$inferSelect;

// ============================================================================
// ICAL CALENDAR SYNC
// ============================================================================

export const iCalCalendars = pgTable("ical_calendars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  iCalUrl: text("ical_url").notNull(),
  syncStatus: varchar("sync_status", { length: 20 }).default('pending'), // pending, synced, error
  lastSyncedAt: timestamp("last_synced_at"),
  syncError: text("sync_error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertICalCalendarSchema = createInsertSchema(iCalCalendars).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertICalCalendar = z.infer<typeof insertICalCalendarSchema>;
export type ICalCalendar = typeof iCalCalendars.$inferSelect;

// ============================================================================
// FAVORITES / SAVED PROPERTIES
// ============================================================================

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// ============================================================================
// ID VERIFICATION
// ============================================================================

export const idVerifications = pgTable("id_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  documentType: varchar("document_type", { length: 50 }).notNull(), // 'passport', 'drivers_license', 'id_card', 'cnic'
  documentUrl: text("document_url").notNull(),
  backDocumentUrl: text("back_document_url"), // For 2-sided documents like passports, driver's license
  selfieUrl: text("selfie_url"), // Selfie photo for liveness verification
  status: varchar("status", { length: 20 }).default('pending'), // pending, verified, rejected
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by").references(() => users.id), // Admin who verified
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIdVerificationSchema = createInsertSchema(idVerifications).omit({ id: true, verifiedAt: true, createdAt: true, updatedAt: true });
export type InsertIdVerification = z.infer<typeof insertIdVerificationSchema>;
export type IdVerification = typeof idVerifications.$inferSelect;

// ============================================================================
// USER PROFILE PREFERENCES
// ============================================================================

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  bio: text("bio"),
  phoneNumber: varchar("phone_number"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  preferences: jsonb("preferences").default({}), // { notifications, communication, etc }
  governmentId: varchar("government_id"), // Encrypted government ID
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, updatedAt: true });
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

// ============================================================================
// SEASONAL PRICING RULES
// ============================================================================

export const seasonalPricingRules = pgTable("seasonal_pricing_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(), // e.g., "Summer Peak", "Off Season"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  priceMultiplier: decimal("price_multiplier", { precision: 3, scale: 2 }).default("1.00"), // e.g., 1.5 = 50% increase
  minNights: integer("min_nights"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSeasonalPricingSchema = createInsertSchema(seasonalPricingRules).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSeasonalPricing = z.infer<typeof insertSeasonalPricingSchema>;
export type SeasonalPricing = typeof seasonalPricingRules.$inferSelect;

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

export const pushNotifications = pgTable("push_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  bookingId: varchar("booking_id").references(() => bookings.id, { onDelete: 'cascade' }),
  type: varchar("type", { length: 50 }).notNull(), // booking_confirmation, booking_inquiry, message, cancellation
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  phoneNumber: varchar("phone_number"), // For SMS notifications
  isSent: boolean("is_sent").default(false),
  sentAt: timestamp("sent_at"),
  sentVia: varchar("sent_via", { length: 20 }), // sms, email, push
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPushNotificationSchema = createInsertSchema(pushNotifications).omit({ id: true, createdAt: true });
export type InsertPushNotification = z.infer<typeof insertPushNotificationSchema>;
export type PushNotification = typeof pushNotifications.$inferSelect;

// ============================================================================
// CHAT FILE UPLOADS
// ============================================================================

export const chatFiles = pgTable("chat_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => messages.id, { onDelete: 'cascade' }),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type", { length: 20 }).notNull(), // image, pdf, document, video
  fileSizeBytes: integer("file_size_bytes"),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatFileSchema = createInsertSchema(chatFiles).omit({ id: true, createdAt: true });
export type InsertChatFile = z.infer<typeof insertChatFileSchema>;
export type ChatFile = typeof chatFiles.$inferSelect;

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  hostedProperties: many(properties, { relationName: 'host' }),
  bookings: many(bookings, { relationName: 'guest' }),
  hostBookings: many(bookings, { relationName: 'host' }),
  sentMessages: many(messages),
  notifications: many(notifications),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  host: one(users, {
    fields: [properties.hostId],
    references: [users.id],
    relationName: 'host',
  }),
  bookings: many(bookings),
  roomTypes: many(roomTypes),
  availability: many(availability),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  property: one(properties, {
    fields: [bookings.propertyId],
    references: [properties.id],
  }),
  guest: one(users, {
    fields: [bookings.guestId],
    references: [users.id],
    relationName: 'guest',
  }),
  host: one(users, {
    fields: [bookings.hostId],
    references: [users.id],
    relationName: 'host',
  }),
  conversations: many(conversations),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  property: one(properties, {
    fields: [conversations.propertyId],
    references: [properties.id],
  }),
  booking: one(bookings, {
    fields: [conversations.bookingId],
    references: [bookings.id],
  }),
  participant1: one(users, {
    fields: [conversations.participant1Id],
    references: [users.id],
  }),
  participant2: one(users, {
    fields: [conversations.participant2Id],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  property: one(properties, {
    fields: [reviews.propertyId],
    references: [properties.id],
  }),
  guest: one(users, {
    fields: [reviews.guestId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

export const oauthProfilesRelations = relations(oauthProfiles, ({ one }) => ({
  user: one(users, {
    fields: [oauthProfiles.userId],
    references: [users.id],
  }),
}));

export const iCalCalendarsRelations = relations(iCalCalendars, ({ one }) => ({
  property: one(properties, {
    fields: [iCalCalendars.propertyId],
    references: [properties.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [favorites.propertyId],
    references: [properties.id],
  }),
}));

export const idVerificationsRelations = relations(idVerifications, ({ one }) => ({
  user: one(users, {
    fields: [idVerifications.userId],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [idVerifications.verifiedBy],
    references: [users.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const seasonalPricingRelations = relations(seasonalPricingRules, ({ one }) => ({
  property: one(properties, {
    fields: [seasonalPricingRules.propertyId],
    references: [properties.id],
  }),
}));

export const pushNotificationRelations = relations(pushNotifications, ({ one }) => ({
  user: one(users, {
    fields: [pushNotifications.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [pushNotifications.bookingId],
    references: [bookings.id],
  }),
}));

export const chatFilesRelations = relations(chatFiles, ({ one }) => ({
  message: one(messages, {
    fields: [chatFiles.messageId],
    references: [messages.id],
  }),
  conversation: one(conversations, {
    fields: [chatFiles.conversationId],
    references: [conversations.id],
  }),
  uploader: one(users, {
    fields: [chatFiles.uploadedBy],
    references: [users.id],
  }),
}));
