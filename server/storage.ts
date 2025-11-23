import {
  users,
  properties,
  roomTypes,
  bookings,
  availability,
  conversations,
  messages,
  notifications,
  siteSettings,
  auditLogs,
  media,
  payments,
  proposalVersions,
  reviews,
  oauthProfiles,
  iCalCalendars,
  favorites,
  idVerifications,
  userProfiles,
  seasonalPricingRules,
  pushNotifications,
  chatFiles,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type RoomType,
  type InsertRoomType,
  type Booking,
  type InsertBooking,
  type Availability,
  type InsertAvailability,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Notification,
  type InsertNotification,
  type SiteSettings,
  type InsertSiteSettings,
  type AuditLog,
  type InsertAuditLog,
  type Media,
  type InsertMedia,
  type Payment,
  type InsertPayment,
  type ProposalVersion,
  type InsertProposalVersion,
  type Review,
  type InsertReview,
  type OAuthProfile,
  type InsertOAuthProfile,
  type ICalCalendar,
  type InsertICalCalendar,
  type Favorite,
  type InsertFavorite,
  type IdVerification,
  type InsertIdVerification,
  type UserProfile,
  type InsertUserProfile,
  type SeasonalPricing,
  type InsertSeasonalPricing,
  type PushNotification,
  type InsertPushNotification,
  type ChatFile,
  type InsertChatFile,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, sql, or, like, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;

  // Property operations
  createProperty(property: InsertProperty): Promise<Property>;
  getProperty(id: string): Promise<Property | undefined>;
  getProperties(filters?: PropertyFilters): Promise<Property[]>;
  getFeaturedProperties(limit?: number): Promise<Property[]>;
  updateProperty(id: string, data: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<void>;

  // Room type operations
  createRoomType(roomType: InsertRoomType): Promise<RoomType>;
  getRoomTypesForProperty(propertyId: string): Promise<RoomType[]>;

  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByGuest(guestId: string): Promise<Booking[]>;
  getBookingsByHost(hostId: string): Promise<Booking[]>;
  getBookingsByProperty(propertyId: string): Promise<Booking[]>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  updateBooking(id: string, data: Partial<InsertBooking>): Promise<Booking | undefined>;

  // Availability operations
  setAvailability(data: InsertAvailability): Promise<Availability>;
  getAvailabilityForProperty(propertyId: string, startDate: string, endDate: string): Promise<Availability[]>;
  checkAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<boolean>;

  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsForUser(userId: string): Promise<Conversation[]>;
  updateConversation(id: string, data: Partial<InsertConversation>): Promise<Conversation | undefined>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesForConversation(conversationId: string, limit?: number): Promise<Message[]>;
  markMessageAsRead(id: string): Promise<void>;

  // Proposal versioning operations
  createProposalVersion(proposal: InsertProposalVersion): Promise<ProposalVersion>;
  getProposalVersion(id: string): Promise<ProposalVersion | undefined>;
  getProposalVersionsForBooking(bookingId: string): Promise<ProposalVersion[]>;
  updateProposalVersionStatus(id: string, status: string): Promise<ProposalVersion | undefined>;
  deleteProposalVersion(id: string): Promise<void>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsForUser(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Site settings operations
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings>;

  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;

  // Media operations
  createMedia(mediaData: InsertMedia): Promise<Media>;
  getMediaForProperty(propertyId: string): Promise<Media[]>;
  deleteMedia(id: string): Promise<void>;

  // Payment operations
  createPayment(paymentData: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByBooking(bookingId: string): Promise<Payment[]>;
  updatePaymentStatus(id: string, status: string): Promise<Payment | undefined>;

  // Analytics operations
  getAdminStats(): Promise<AdminStats>;
  getHostStats(hostId: string): Promise<HostStats>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsForProperty(propertyId: string): Promise<Review[]>;
  getReviewsForHost(hostId: string): Promise<Review[]>;
  getPropertyAverageRating(propertyId: string): Promise<number>;

  // OAuth operations
  createOAuthProfile(profile: InsertOAuthProfile): Promise<OAuthProfile>;
  getOAuthProfile(userId: string, provider: string): Promise<OAuthProfile | undefined>;
  getOAuthProfileByProviderUserId(provider: string, providerUserId: string): Promise<OAuthProfile | undefined>;

  // iCal operations
  createICalCalendar(calendar: InsertICalCalendar): Promise<ICalCalendar>;
  getICalCalendarForProperty(propertyId: string): Promise<ICalCalendar | undefined>;
  updateICalSyncStatus(id: string, status: string, error?: string): Promise<ICalCalendar | undefined>;

  // User stats
  getUserStats(userId: string): Promise<any>;

  // Favorites operations
  addFavorite(userId: string, propertyId: string): Promise<Favorite>;
  removeFavorite(userId: string, propertyId: string): Promise<void>;
  getFavorites(userId: string): Promise<Property[]>;
  isFavorite(userId: string, propertyId: string): Promise<boolean>;

  // ID Verification operations
  createIdVerification(verification: InsertIdVerification): Promise<IdVerification>;
  getIdVerification(userId: string): Promise<IdVerification | undefined>;
  updateIdVerificationStatus(id: string, status: string, rejectionReason?: string): Promise<IdVerification | undefined>;
  getPendingVerifications(): Promise<IdVerification[]>;

  // User Profile operations
  createOrUpdateUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  getUserProfile(userId: string): Promise<UserProfile | undefined>;

  // Stay History
  getUserStays(userId: string): Promise<any[]>;

  // Seasonal Pricing
  createSeasonalPricing(pricing: InsertSeasonalPricing): Promise<SeasonalPricing>;
  getSeasonalPricingForProperty(propertyId: string): Promise<SeasonalPricing[]>;
  updateSeasonalPricing(id: string, pricing: Partial<InsertSeasonalPricing>): Promise<SeasonalPricing | undefined>;
  calculatePriceWithSeason(propertyId: string, pricePerNight: string, checkIn: string, checkOut: string): Promise<string>;

  // Push Notifications
  createPushNotification(notification: InsertPushNotification): Promise<PushNotification>;
  getPendingNotifications(userId: string): Promise<PushNotification[]>;
  markNotificationAsSent(id: string, sentVia: string): Promise<PushNotification | undefined>;
  sendAllPendingNotifications(): Promise<void>;

  // Chat Files
  uploadChatFile(file: InsertChatFile): Promise<ChatFile>;
  getChatFiles(conversationId: string): Promise<ChatFile[]>;
  deleteChatFile(id: string): Promise<void>;

  // Admin Impersonation
  impersonateUser(adminId: string, userId: string): Promise<User | undefined>;
  getImpersonationStatus(userId: string): Promise<any>;
}

export interface PropertyFilters {
  location?: string;
  category?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  hostId?: string;
  status?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalHosts: number;
  activeProperties: number;
  pendingProperties: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

export interface HostStats {
  totalProperties: number;
  activeProperties: number;
  upcomingBookings: number;
  monthlyEarnings: number;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(or(eq(users.id, id), eq(users.email, id)));
    return user as User | undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    const user = (Array.isArray(result) ? result[0] : result) as User;
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return (await db.select().from(users).where(eq(users.role, role))) as User[];
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user as User | undefined;
  }

  // Property operations
  async createProperty(propertyData: InsertProperty): Promise<Property> {
    const [property] = await db.insert(properties).values(propertyData).returning();
    return property;
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async getProperties(filters?: PropertyFilters): Promise<Property[]> {
    let query = db.select().from(properties);
    const conditions: any[] = [];

    if (filters?.location) {
      conditions.push(like(properties.location, `%${filters.location}%`));
    }
    if (filters?.category && filters.category !== 'all') {
      conditions.push(eq(properties.category, filters.category));
    }
    if (filters?.propertyType && filters.propertyType !== 'all') {
      conditions.push(eq(properties.propertyType, filters.propertyType));
    }
    if (filters?.minPrice) {
      conditions.push(gte(properties.pricePerNight, filters.minPrice.toString()));
    }
    if (filters?.maxPrice && filters.maxPrice !== 9999) {
      conditions.push(lte(properties.pricePerNight, filters.maxPrice.toString()));
    }
    if (filters?.guests) {
      conditions.push(gte(properties.guests, filters.guests));
    }
    if (filters?.hostId) {
      conditions.push(eq(properties.hostId, filters.hostId));
    }
    if (filters?.status) {
      conditions.push(eq(properties.status, filters.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(properties.createdAt));
  }

  async getFeaturedProperties(limit = 12): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(and(eq(properties.isActive, true), eq(properties.status, 'active')))
      .orderBy(desc(properties.createdAt))
      .limit(limit);
  }

  async updateProperty(id: string, data: Partial<InsertProperty>): Promise<Property | undefined> {
    const [property] = await db
      .update(properties)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return property;
  }

  async deleteProperty(id: string): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  // Room type operations
  async createRoomType(roomTypeData: InsertRoomType): Promise<RoomType> {
    const [roomType] = await db.insert(roomTypes).values(roomTypeData).returning();
    return roomType;
  }

  async getRoomTypesForProperty(propertyId: string): Promise<RoomType[]> {
    return await db.select().from(roomTypes).where(eq(roomTypes.propertyId, propertyId));
  }

  // Booking operations
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    return booking;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByGuest(guestId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.guestId, guestId))
      .orderBy(desc(bookings.checkIn));
  }

  async getBookingsByHost(hostId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.hostId, hostId))
      .orderBy(desc(bookings.checkIn));
  }

  async getBookingsByProperty(propertyId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.propertyId, propertyId))
      .orderBy(desc(bookings.checkIn));
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.status, status))
      .orderBy(desc(bookings.createdAt));
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    if (status === 'confirmed') {
      updates.confirmedAt = new Date();
    } else if (status === 'cancelled') {
      updates.cancelledAt = new Date();
    }

    const [booking] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async updateBooking(id: string, data: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Availability operations
  async setAvailability(data: InsertAvailability): Promise<Availability> {
    const [avail] = await db
      .insert(availability)
      .values(data)
      .onConflictDoUpdate({
        target: [availability.propertyId, availability.date],
        set: data,
      })
      .returning();
    return avail;
  }

  async getAvailabilityForProperty(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<Availability[]> {
    return await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.propertyId, propertyId),
          gte(availability.date, startDate),
          lte(availability.date, endDate)
        )
      );
  }

  async checkAvailability(propertyId: string, checkIn: string, checkOut: string): Promise<boolean> {
    // Check if there are any confirmed bookings that overlap with the requested dates
    // Only 'confirmed' bookings block availability, not 'pending' ones
    const overlappingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.propertyId, propertyId),
          eq(bookings.status, 'confirmed'),
          or(
            and(
              lte(bookings.checkIn, checkIn),
              gte(bookings.checkOut, checkIn)
            ),
            and(
              lte(bookings.checkIn, checkOut),
              gte(bookings.checkOut, checkOut)
            ),
            and(
              gte(bookings.checkIn, checkIn),
              lte(bookings.checkOut, checkOut)
            )
          )
        )
      );

    return overlappingBookings.length === 0;
  }

  // Conversation operations
  async createConversation(conversationData: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(conversationData).returning();
    return conversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationsForUser(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));
  }

  async updateConversation(
    id: string,
    data: Partial<InsertConversation>
  ): Promise<Conversation | undefined> {
    const [conversation] = await db
      .update(conversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return conversation;
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();

    // Update conversation last message time
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date(), updatedAt: new Date() })
      .where(eq(conversations.id, messageData.conversationId));

    return message;
  }

  async getMessagesForConversation(conversationId: string, limit = 100): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .limit(limit);
  }

  async markMessageAsRead(id: string): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getNotificationsForUser(userId: string, limit = 50): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    return settings;
  }

  async updateSiteSettings(settingsData: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    const existing = await this.getSiteSettings();

    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(siteSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(siteSettings).values(settingsData as InsertSiteSettings).returning();
      return created;
    }
  }

  // Audit log operations
  async createAuditLog(logData: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(logData).returning();
    return log;
  }

  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  // Analytics operations
  async getAdminStats(): Promise<AdminStats> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [hostCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(or(eq(users.role, 'host'), eq(users.role, 'admin')));
    const [activeProps] = await db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(eq(properties.status, 'active'));
    const [pendingProps] = await db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(eq(properties.status, 'pending'));
    const [bookingCount] = await db.select({ count: sql<number>`count(*)` }).from(bookings);
    const [pendingBookingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(eq(bookings.status, 'pending'));
    const [revenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${bookings.total} AS DECIMAL)), 0)` })
      .from(bookings)
      .where(eq(bookings.paymentStatus, 'paid'));

    return {
      totalUsers: Number(userCount.count) || 0,
      totalHosts: Number(hostCount.count) || 0,
      activeProperties: Number(activeProps.count) || 0,
      pendingProperties: Number(pendingProps.count) || 0,
      totalBookings: Number(bookingCount.count) || 0,
      pendingBookings: Number(pendingBookingCount.count) || 0,
      totalRevenue: Number(revenue.total) || 0,
    };
  }

  async getHostStats(hostId: string): Promise<HostStats> {
    const [propCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(eq(properties.hostId, hostId));
    const [activeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(and(eq(properties.hostId, hostId), eq(properties.status, 'active')));
    const [upcomingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.hostId, hostId),
          eq(bookings.status, 'confirmed'),
          gte(bookings.checkIn, new Date().toISOString().split('T')[0])
        )
      );

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthlyEarnings] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${bookings.total} AS DECIMAL)), 0)` })
      .from(bookings)
      .where(
        and(
          eq(bookings.hostId, hostId),
          eq(bookings.paymentStatus, 'paid'),
          gte(bookings.createdAt, firstDayOfMonth)
        )
      );

    return {
      totalProperties: Number(propCount.count) || 0,
      activeProperties: Number(activeCount.count) || 0,
      upcomingBookings: Number(upcomingCount.count) || 0,
      monthlyEarnings: Number(monthlyEarnings.total) || 0,
    };
  }

  // ============================================================================
  // MEDIA OPERATIONS
  // ============================================================================

  async createMedia(mediaData: InsertMedia): Promise<Media> {
    const [media_item] = await db.insert(media).values(mediaData).returning();
    return media_item;
  }

  async getMediaForProperty(propertyId: string): Promise<Media[]> {
    return await db.select().from(media).where(eq(media.propertyId, propertyId)).orderBy(asc(media.order));
  }

  async deleteMedia(id: string): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  // ============================================================================
  // PAYMENT OPERATIONS
  // ============================================================================

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment_record] = await db.insert(payments).values(paymentData).returning();
    return payment_record;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment_record] = await db.select().from(payments).where(eq(payments.id, id));
    return payment_record;
  }

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.bookingId, bookingId));
  }

  async updatePaymentStatus(id: string, status: string): Promise<Payment | undefined> {
    const [payment_record] = await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment_record;
  }

  async getPaymentsByStatus(status: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.status, status));
  }

  // ============================================================================
  // BOOKING CONFLICT RESOLUTION
  // ============================================================================

  async getConflictingBookings(propertyId: string, checkIn: string, checkOut: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.propertyId, propertyId),
          or(
            eq(bookings.status, 'confirmed'),
            eq(bookings.status, 'pending')
          ),
          or(
            // Booking overlaps: checkIn is before existing checkOut
            and(lte(bookings.checkOut, checkOut), gte(bookings.checkOut, checkIn)),
            // Booking overlaps: checkOut is after existing checkIn
            and(gte(bookings.checkIn, checkIn), lte(bookings.checkIn, checkOut)),
            // New booking encompasses entire existing booking
            and(lte(bookings.checkIn, checkIn), gte(bookings.checkOut, checkOut))
          )
        )
      );
  }

  // ============================================================================
  // PROPOSAL VERSIONING
  // ============================================================================

  async createProposalVersion(proposal: InsertProposalVersion): Promise<ProposalVersion> {
    const [created] = await db.insert(proposalVersions).values(proposal).returning();
    return created;
  }

  async getProposalVersion(id: string): Promise<ProposalVersion | undefined> {
    const [proposal] = await db.select().from(proposalVersions).where(eq(proposalVersions.id, id));
    return proposal;
  }

  async getProposalVersionsForBooking(bookingId: string): Promise<ProposalVersion[]> {
    return await db
      .select()
      .from(proposalVersions)
      .where(eq(proposalVersions.bookingId, bookingId))
      .orderBy(desc(proposalVersions.versionNumber));
  }

  async updateProposalVersionStatus(id: string, status: string): Promise<ProposalVersion | undefined> {
    const [updated] = await db
      .update(proposalVersions)
      .set({ status })
      .where(eq(proposalVersions.id, id))
      .returning();
    return updated;
  }

  async deleteProposalVersion(id: string): Promise<void> {
    await db.delete(proposalVersions).where(eq(proposalVersions.id, id));
  }

  // ============================================================================
  // REVIEWS & RATINGS
  // ============================================================================

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    return created;
  }

  async getReviewsForProperty(propertyId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.propertyId, propertyId));
  }

  async getReviewsForHost(hostId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .innerJoin(properties, eq(reviews.propertyId, properties.id))
      .where(eq(properties.hostId, hostId))
      .then((rows) => rows.map((r) => r.reviews));
  }

  async getPropertyAverageRating(propertyId: string): Promise<number> {
    const result = await db
      .select({ avg: sql`AVG(${reviews.rating})` })
      .from(reviews)
      .where(eq(reviews.propertyId, propertyId));
    return Number(result[0]?.avg) || 0;
  }

  // ============================================================================
  // OAUTH PROFILES
  // ============================================================================

  async createOAuthProfile(profile: InsertOAuthProfile): Promise<OAuthProfile> {
    const [created] = await db.insert(oauthProfiles).values(profile).returning();
    return created;
  }

  async getOAuthProfile(userId: string, provider: string): Promise<OAuthProfile | undefined> {
    const [profile] = await db
      .select()
      .from(oauthProfiles)
      .where(and(eq(oauthProfiles.userId, userId), eq(oauthProfiles.provider, provider)));
    return profile;
  }

  async getOAuthProfileByProviderUserId(provider: string, providerUserId: string): Promise<OAuthProfile | undefined> {
    const [profile] = await db
      .select()
      .from(oauthProfiles)
      .where(and(eq(oauthProfiles.provider, provider), eq(oauthProfiles.providerUserId, providerUserId)));
    return profile;
  }

  // ============================================================================
  // ICAL CALENDARS
  // ============================================================================

  async createICalCalendar(calendar: InsertICalCalendar): Promise<ICalCalendar> {
    const [created] = await db.insert(iCalCalendars).values(calendar).returning();
    return created;
  }

  async getICalCalendarForProperty(propertyId: string): Promise<ICalCalendar | undefined> {
    const [calendar] = await db.select().from(iCalCalendars).where(eq(iCalCalendars.propertyId, propertyId));
    return calendar;
  }

  async updateICalSyncStatus(id: string, status: string, error?: string): Promise<ICalCalendar | undefined> {
    const [updated] = await db
      .update(iCalCalendars)
      .set({
        syncStatus: status,
        lastSyncedAt: new Date(),
        syncError: error,
      })
      .where(eq(iCalCalendars.id, id))
      .returning();
    return updated;
  }

  // ============================================================================
  // FAVORITES
  // ============================================================================

  async addFavorite(userId: string, propertyId: string): Promise<Favorite> {
    const [created] = await db.insert(favorites).values({ userId, propertyId }).returning();
    return created;
  }

  async removeFavorite(userId: string, propertyId: string): Promise<void> {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)));
  }

  async getFavorites(userId: string): Promise<Property[]> {
    const fav = await db.select({ property: properties }).from(favorites)
      .innerJoin(properties, eq(favorites.propertyId, properties.id))
      .where(eq(favorites.userId, userId));
    return fav.map(f => f.property);
  }

  async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    const [fav] = await db.select().from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)));
    return !!fav;
  }

  // ============================================================================
  // ID VERIFICATION
  // ============================================================================

  async createIdVerification(verification: InsertIdVerification): Promise<IdVerification> {
    const [created] = await db.insert(idVerifications).values(verification).returning();
    return created;
  }

  async getIdVerification(userId: string): Promise<IdVerification | undefined> {
    const [verification] = await db.select().from(idVerifications).where(eq(idVerifications.userId, userId)).orderBy(desc(idVerifications.createdAt));
    return verification;
  }

  async updateIdVerificationStatus(id: string, status: string, rejectionReason?: string): Promise<IdVerification | undefined> {
    const [updated] = await db.update(idVerifications).set({
      status,
      rejectionReason,
      verifiedAt: status === 'verified' ? new Date() : undefined,
      updatedAt: new Date(),
    }).where(eq(idVerifications.id, id)).returning();
    return updated;
  }

  async getPendingVerifications(): Promise<IdVerification[]> {
    return await db.select().from(idVerifications).where(eq(idVerifications.status, 'pending'));
  }

  // ============================================================================
  // USER PROFILES & STATS
  // ============================================================================

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createOrUpdateUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const existing = await this.getUserProfile(profile.userId);
    if (existing) {
      const [updated] = await db.update(userProfiles).set(profile).where(eq(userProfiles.userId, profile.userId)).returning();
      return updated;
    }
    const [created] = await db.insert(userProfiles).values(profile).returning();
    return created;
  }

  async getUserStays(userId: string): Promise<any[]> {
    return await db.select({
      booking: bookings,
      property: properties,
    }).from(bookings)
      .leftJoin(properties, eq(bookings.propertyId, properties.id))
      .where(eq(bookings.guestId, userId))
      .orderBy(desc(bookings.checkIn));
  }

  async getUserStats(userId: string): Promise<any> {
    const userBookings = await db.select({ count: sql`count(*)` }).from(bookings).where(eq(bookings.guestId, userId));
    const totalSpent = await db.select({ sum: sql`sum(cast(${bookings.total} as float))` }).from(bookings).where(eq(bookings.guestId, userId));
    return {
      totalBookings: Number(userBookings[0]?.count || 0),
      totalSpent: Number(totalSpent[0]?.sum || 0),
      avgBookingValue: Number(totalSpent[0]?.sum || 0) / Math.max(Number(userBookings[0]?.count || 1), 1),
    };
  }

  // ============================================================================
  // SEASONAL PRICING
  // ============================================================================

  async createSeasonalPricing(pricing: InsertSeasonalPricing): Promise<SeasonalPricing> {
    const [created] = await db.insert(seasonalPricingRules).values(pricing).returning();
    return created;
  }

  async getSeasonalPricingForProperty(propertyId: string): Promise<SeasonalPricing[]> {
    return await db.select().from(seasonalPricingRules).where(and(eq(seasonalPricingRules.propertyId, propertyId), eq(seasonalPricingRules.isActive, true)));
  }

  async updateSeasonalPricing(id: string, pricing: Partial<InsertSeasonalPricing>): Promise<SeasonalPricing | undefined> {
    const [updated] = await db.update(seasonalPricingRules).set({ ...pricing, updatedAt: new Date() }).where(eq(seasonalPricingRules.id, id)).returning();
    return updated;
  }

  async calculatePriceWithSeason(propertyId: string, pricePerNight: string, checkIn: string, checkOut: string): Promise<string> {
    const rules = await this.getSeasonalPricingForProperty(propertyId);
    let multiplier = 1;
    const checkInDate = new Date(checkIn);
    for (const rule of rules) {
      const start = new Date(rule.startDate);
      const end = new Date(rule.endDate);
      if (checkInDate >= start && checkInDate <= end) {
        multiplier = Number(rule.priceMultiplier);
        break;
      }
    }
    return (Number(pricePerNight) * multiplier).toFixed(2);
  }

  // ============================================================================
  // PUSH NOTIFICATIONS
  // ============================================================================

  async createPushNotification(notification: InsertPushNotification): Promise<PushNotification> {
    const [created] = await db.insert(pushNotifications).values(notification).returning();
    return created;
  }

  async getPendingNotifications(userId: string): Promise<PushNotification[]> {
    return await db.select().from(pushNotifications).where(and(eq(pushNotifications.userId, userId), eq(pushNotifications.isSent, false)));
  }

  async markNotificationAsSent(id: string, sentVia: string): Promise<PushNotification | undefined> {
    const [updated] = await db.update(pushNotifications).set({ isSent: true, sentAt: new Date(), sentVia }).where(eq(pushNotifications.id, id)).returning();
    return updated;
  }

  async sendAllPendingNotifications(): Promise<void> {
    const pending = await db.select().from(pushNotifications).where(eq(pushNotifications.isSent, false));
    for (const notif of pending) {
      if (notif.phoneNumber && notif.type.includes('booking')) {
        console.log(`SMS to ${notif.phoneNumber}: ${notif.title}`);
        await this.markNotificationAsSent(notif.id, 'sms');
      }
    }
  }

  // ============================================================================
  // CHAT FILES
  // ============================================================================

  async uploadChatFile(file: InsertChatFile): Promise<ChatFile> {
    const [created] = await db.insert(chatFiles).values(file).returning();
    return created;
  }

  async getChatFiles(conversationId: string): Promise<ChatFile[]> {
    return await db.select().from(chatFiles).where(eq(chatFiles.conversationId, conversationId));
  }

  async deleteChatFile(id: string): Promise<void> {
    await db.delete(chatFiles).where(eq(chatFiles.id, id));
  }

  // ============================================================================
  // ADMIN IMPERSONATION
  // ============================================================================

  async impersonateUser(adminId: string, userId: string): Promise<User | undefined> {
    const admin = await this.getUser(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new Error('Only admins can impersonate users');
    }
    const [updated] = await db.update(users).set({ impersonatedBy: adminId }).where(eq(users.id, userId)).returning();
    return updated as User | undefined;
  }

  async getImpersonationStatus(userId: string): Promise<any> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return null;
    if (user.impersonatedBy) {
      const [admin] = await db.select().from(users).where(eq(users.id, user.impersonatedBy));
      return { userId, isImpersonated: true, impersonatedBy: admin?.email };
    }
    return { userId, isImpersonated: false };
  }
}

export const storage = new DatabaseStorage();
