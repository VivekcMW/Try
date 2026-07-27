-- CreateEnum
CREATE TYPE "KycTier" AS ENUM ('bronze', 'silver', 'gold');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'warned', 'suspended', 'banned', 'deleted');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('resident', 'merchant', 'rwa_admin', 'guard', 'moderator', 'super_admin');

-- CreateEnum
CREATE TYPE "SocietyStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "KycDocType" AS ENUM ('rent_agreement', 'electricity_bill', 'society_noc', 'aadhaar', 'passport', 'voter_id');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('proof', 'vouch', 'aadhaar');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('update', 'safety', 'lost', 'event', 'poll', 'sell', 'rwa_notice', 'sos');

-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('tower', 'society', 'neighborhood');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('active', 'hidden', 'removed', 'deleted');

-- CreateEnum
CREATE TYPE "ReactionKind" AS ENUM ('like', 'love', 'thanks', 'support', 'concern');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('spam', 'harassment', 'misinformation', 'nudity', 'hate_speech', 'violence', 'child_safety', 'illegal_goods', 'impersonation', 'other');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('open', 'in_review', 'resolved', 'dismissed');

-- CreateEnum
CREATE TYPE "ReportRouting" AS ENUM ('rwa', 'lokul', 'both');

-- CreateEnum
CREATE TYPE "ReportPriority" AS ENUM ('critical', 'high', 'normal');

-- CreateEnum
CREATE TYPE "ModActionType" AS ENUM ('dismiss', 'warn', 'hide', 'remove', 'suspend_7d', 'suspend_30d', 'ban', 'reinstate');

-- CreateEnum
CREATE TYPE "StrikeWeight" AS ENUM ('full', 'half');

-- CreateEnum
CREATE TYPE "ClassifiedCondition" AS ENUM ('new_item', 'like_new', 'used', 'for_parts');

-- CreateEnum
CREATE TYPE "ClassifiedVisibility" AS ENUM ('tower', 'society', 'neighborhood');

-- CreateEnum
CREATE TYPE "ClassifiedStatus" AS ENUM ('active', 'reserved', 'sold', 'expired', 'removed');

-- CreateEnum
CREATE TYPE "MerchantStatus" AS ENUM ('pending_verification', 'active', 'suspended', 'rejected');

-- CreateEnum
CREATE TYPE "FeatureFlagScope" AS ENUM ('global', 'society', 'city', 'pincode', 'user');

-- CreateEnum
CREATE TYPE "BroadcastStatus" AS ENUM ('draft', 'sent', 'cancelled');

-- CreateEnum
CREATE TYPE "LocalityNewsCategory" AS ENUM ('civic', 'safety', 'weather', 'health', 'transport', 'local');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('cook', 'rider', 'coach', 'tutor', 'beautician', 'caretaker', 'handyman', 'reseller');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed');

-- CreateEnum
CREATE TYPE "CommunityType" AS ENUM ('interest', 'activity', 'parenting', 'cultural', 'buying', 'professional', 'cause', 'pets', 'business');

-- CreateEnum
CREATE TYPE "CommunityJoinPolicy" AS ENUM ('open', 'request', 'invite_only');

-- CreateEnum
CREATE TYPE "CommunityMemberRole" AS ENUM ('member', 'co_admin', 'admin');

-- CreateEnum
CREATE TYPE "CommunityMemberStatus" AS ENUM ('pending', 'active', 'banned');

-- CreateEnum
CREATE TYPE "ChatThreadType" AS ENUM ('dm', 'society_main', 'tower', 'topic', 'community');

-- CreateEnum
CREATE TYPE "CarpoolStatus" AS ENUM ('open', 'full', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "CarpoolJoinStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "GroupBuyStatus" AS ENUM ('open', 'locked', 'distributing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "GroupBuyCommitStatus" AS ENUM ('committed', 'withdrawn', 'paid', 'received', 'refunded');

-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('yes', 'maybe', 'no');

-- CreateEnum
CREATE TYPE "WalletTxType" AS ENUM ('topup', 'spend', 'earn', 'payout', 'refund', 'hold', 'release');

-- CreateEnum
CREATE TYPE "WalletTxStatus" AS ENUM ('pending', 'completed', 'failed', 'reversed');

-- CreateEnum
CREATE TYPE "SosIncidentStatus" AS ENUM ('open', 'ack', 'resolved');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- CreateEnum
CREATE TYPE "QuoteRequestStatus" AS ENUM ('open', 'quoted', 'accepted', 'declined');

-- CreateEnum
CREATE TYPE "RazorpayOrderStatus" AS ENUM ('created', 'paid', 'failed');

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "notify" BOOLEAN NOT NULL DEFAULT true,
    "invitedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "kycTier" "KycTier" NOT NULL DEFAULT 'bronze',
    "trustScore" INTEGER NOT NULL DEFAULT 0,
    "role" "UserRole" NOT NULL DEFAULT 'resident',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "suspendedUntil" TIMESTAMP(3),
    "strikeCount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "walletBalancePaise" INTEGER NOT NULL DEFAULT 0,
    "walletHeldPaise" INTEGER NOT NULL DEFAULT 0,
    "walletEarningsPaise" INTEGER NOT NULL DEFAULT 0,
    "privacySettings" JSONB,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocality" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT '',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLocality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserResidence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "towerId" TEXT,
    "flatNumber" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "verificationMethod" "VerificationMethod",
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserResidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "KycDocType" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vouch" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "voucheeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vouch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Society" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "pinCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT '',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "status" "SocietyStatus" NOT NULL DEFAULT 'pending',
    "rwaContactEmail" TEXT,
    "createdById" TEXT,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "postCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Society_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tower" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flatCountHint" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocietyAdmin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "SocietyAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "PostType" NOT NULL DEFAULT 'update',
    "body" TEXT NOT NULL,
    "visibility" "PostVisibility" NOT NULL DEFAULT 'society',
    "societyId" TEXT,
    "towerId" TEXT,
    "pinCode" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "pinnedUntil" TIMESTAMP(3),
    "commentsLocked" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'active',
    "reactionCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostMedia" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "durationMs" INTEGER,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PostMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTag" (
    "postId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "PostTag_pkey" PRIMARY KEY ("postId","tag")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "ReactionKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("postId","userId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "parentId" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classified" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL,
    "pricePaise" INTEGER NOT NULL DEFAULT 0,
    "condition" "ClassifiedCondition" NOT NULL DEFAULT 'used',
    "visibility" "ClassifiedVisibility" NOT NULL DEFAULT 'neighborhood',
    "pinCode" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "status" "ClassifiedStatus" NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "soldAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "saveCount" INTEGER NOT NULL DEFAULT 0,
    "chatCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classified_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassifiedPhoto" (
    "id" TEXT NOT NULL,
    "classifiedId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClassifiedPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "pinCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "status" "MerchantStatus" NOT NULL DEFAULT 'pending_verification',
    "subscriptionTier" TEXT NOT NULL DEFAULT 'free',
    "subscriptionEndsAt" TIMESTAMP(3),
    "isEndorsed" BOOLEAN NOT NULL DEFAULT false,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "ratingAvg" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetKind" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "freeText" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'open',
    "routedTo" "ReportRouting" NOT NULL DEFAULT 'lokul',
    "priority" "ReportPriority" NOT NULL DEFAULT 'normal',
    "societyScopeId" TEXT,
    "assignedToId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModAction" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetKind" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "action" "ModActionType" NOT NULL,
    "reasonCategory" TEXT NOT NULL,
    "internalNotes" TEXT,
    "reportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrikeRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weight" "StrikeWeight" NOT NULL,
    "relatedReportId" TEXT,
    "issuedById" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "StrikeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorKind" TEXT NOT NULL DEFAULT 'user',
    "action" TEXT NOT NULL,
    "targetKind" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "scope" "FeatureFlagScope" NOT NULL DEFAULT 'global',
    "scopeValue" TEXT,
    "description" TEXT,
    "setById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broadcast" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "targetScope" TEXT NOT NULL DEFAULT 'all',
    "sentById" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "BroadcastStatus" NOT NULL DEFAULT 'draft',
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteBatch" (
    "id" TEXT NOT NULL,
    "pinCode" TEXT,
    "city" TEXT,
    "totalCount" INTEGER NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openedCount" INTEGER NOT NULL DEFAULT 0,
    "registeredCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalityNews" (
    "id" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "category" "LocalityNewsCategory" NOT NULL DEFAULT 'local',
    "lang" TEXT NOT NULL DEFAULT 'en',
    "isAlert" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalityNews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceListing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "pricePaise" INTEGER NOT NULL DEFAULT 0,
    "priceUnit" TEXT NOT NULL DEFAULT 'session',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "radiusM" INTEGER NOT NULL DEFAULT 500,
    "pinCode" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "ratingAvg" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "listingId" TEXT,
    "serviceCategory" "ServiceCategory",
    "title" TEXT NOT NULL,
    "descriptionSnapshot" TEXT NOT NULL DEFAULT '',
    "pricePaise" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "addressNote" TEXT,
    "buyerNote" TEXT,
    "sellerNote" TEXT,
    "pinCode" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "rateeId" TEXT NOT NULL,
    "listingId" TEXT,
    "score" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "type" "CommunityType" NOT NULL DEFAULT 'interest',
    "joinPolicy" "CommunityJoinPolicy" NOT NULL DEFAULT 'open',
    "radiusM" INTEGER NOT NULL DEFAULT 500,
    "pinCode" TEXT NOT NULL,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMember" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CommunityMemberRole" NOT NULL DEFAULT 'member',
    "status" "CommunityMemberStatus" NOT NULL DEFAULT 'active',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatThread" (
    "id" TEXT NOT NULL,
    "type" "ChatThreadType" NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "societyId" TEXT,
    "towerId" TEXT,
    "communityId" TEXT,
    "createdById" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMembership" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "ChatMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'text',
    "mediaKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarpoolTrip" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "fromLabel" TEXT NOT NULL,
    "toLabel" TEXT NOT NULL,
    "fromLat" DOUBLE PRECISION,
    "fromLng" DOUBLE PRECISION,
    "toLat" DOUBLE PRECISION,
    "toLng" DOUBLE PRECISION,
    "departureAt" TIMESTAMP(3) NOT NULL,
    "seatsTotal" INTEGER NOT NULL,
    "seatsLeft" INTEGER NOT NULL,
    "pricePaise" INTEGER NOT NULL DEFAULT 0,
    "status" "CarpoolStatus" NOT NULL DEFAULT 'open',
    "pinCode" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarpoolTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarpoolJoin" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "seats" INTEGER NOT NULL DEFAULT 1,
    "status" "CarpoolJoinStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarpoolJoin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupBuy" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "pricePaise" INTEGER NOT NULL,
    "marketPricePaise" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    "minQty" INTEGER NOT NULL,
    "targetQty" INTEGER NOT NULL,
    "currentQty" INTEGER NOT NULL DEFAULT 0,
    "facilitatorFeePaise" INTEGER NOT NULL DEFAULT 0,
    "pinCode" TEXT NOT NULL,
    "imageUrl" TEXT,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "status" "GroupBuyStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupBuy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupBuyCommit" (
    "id" TEXT NOT NULL,
    "groupBuyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPaise" INTEGER NOT NULL,
    "status" "GroupBuyCommitStatus" NOT NULL DEFAULT 'committed',
    "paidAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupBuyCommit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "mediaKey" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'image',
    "caption" TEXT,
    "pinCode" TEXT NOT NULL,
    "societyId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryView" (
    "storyId" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryView_pkey" PRIMARY KEY ("storyId","viewerId")
);

-- CreateTable
CREATE TABLE "EventRsvp" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RsvpStatus" NOT NULL DEFAULT 'yes',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRsvp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralRecord" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT,
    "refereePhone" TEXT,
    "creditPaise" INTEGER NOT NULL DEFAULT 0,
    "creditedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferralRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "WalletTxType" NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" "WalletTxStatus" NOT NULL DEFAULT 'completed',
    "reference" TEXT,
    "party" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationConfig" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "webhookUrl" TEXT,
    "config" JSONB,
    "lastTestedAt" TIMESTAMP(3),
    "lastTestOk" BOOLEAN,
    "lastTestMsg" TEXT,
    "setById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SosIncident" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "body" TEXT NOT NULL,
    "status" "SosIncidentStatus" NOT NULL DEFAULT 'open',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstAlertAt" TIMESTAMP(3),
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "escalatedAt" TIMESTAMP(3),
    "notifiedUserIds" TEXT[],

    CONSTRAINT "SosIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SosResponder" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SosResponder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceSlot" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "booked" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "slotId" TEXT,
    "serviceLabel" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'pending',
    "notesForMerchant" TEXT,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "serviceDescription" TEXT NOT NULL,
    "budgetPaise" INTEGER,
    "status" "QuoteRequestStatus" NOT NULL DEFAULT 'open',
    "merchantReply" TEXT,
    "quotedPaise" INTEGER,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpVerification" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RazorpayOrder" (
    "id" TEXT NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "purpose" TEXT NOT NULL,
    "status" "RazorpayOrderStatus" NOT NULL DEFAULT 'created',
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RazorpayOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_email_key" ON "WaitlistEntry"("email");

-- CreateIndex
CREATE INDEX "WaitlistEntry_pincode_idx" ON "WaitlistEntry"("pincode");

-- CreateIndex
CREATE INDEX "WaitlistEntry_createdAt_idx" ON "WaitlistEntry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_kycTier_idx" ON "User"("kycTier");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "UserLocality_userId_idx" ON "UserLocality"("userId");

-- CreateIndex
CREATE INDEX "UserLocality_pinCode_idx" ON "UserLocality"("pinCode");

-- CreateIndex
CREATE INDEX "UserResidence_userId_idx" ON "UserResidence"("userId");

-- CreateIndex
CREATE INDEX "UserResidence_societyId_idx" ON "UserResidence"("societyId");

-- CreateIndex
CREATE INDEX "KycDocument_userId_idx" ON "KycDocument"("userId");

-- CreateIndex
CREATE INDEX "KycDocument_status_idx" ON "KycDocument"("status");

-- CreateIndex
CREATE INDEX "Vouch_voucheeId_idx" ON "Vouch"("voucheeId");

-- CreateIndex
CREATE UNIQUE INDEX "Vouch_voucherId_voucheeId_key" ON "Vouch"("voucherId", "voucheeId");

-- CreateIndex
CREATE INDEX "Society_pinCode_idx" ON "Society"("pinCode");

-- CreateIndex
CREATE INDEX "Society_city_idx" ON "Society"("city");

-- CreateIndex
CREATE INDEX "Society_status_idx" ON "Society"("status");

-- CreateIndex
CREATE INDEX "Society_createdAt_idx" ON "Society"("createdAt");

-- CreateIndex
CREATE INDEX "Tower_societyId_idx" ON "Tower"("societyId");

-- CreateIndex
CREATE INDEX "SocietyAdmin_societyId_idx" ON "SocietyAdmin"("societyId");

-- CreateIndex
CREATE UNIQUE INDEX "SocietyAdmin_userId_societyId_key" ON "SocietyAdmin"("userId", "societyId");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_societyId_idx" ON "Post"("societyId");

-- CreateIndex
CREATE INDEX "Post_pinCode_idx" ON "Post"("pinCode");

-- CreateIndex
CREATE INDEX "Post_type_idx" ON "Post"("type");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "PostMedia_postId_idx" ON "PostMedia"("postId");

-- CreateIndex
CREATE INDEX "PostTag_tag_idx" ON "PostTag"("tag");

-- CreateIndex
CREATE INDEX "Reaction_userId_idx" ON "Reaction"("userId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Classified_sellerId_idx" ON "Classified"("sellerId");

-- CreateIndex
CREATE INDEX "Classified_category_idx" ON "Classified"("category");

-- CreateIndex
CREATE INDEX "Classified_pinCode_idx" ON "Classified"("pinCode");

-- CreateIndex
CREATE INDEX "Classified_status_idx" ON "Classified"("status");

-- CreateIndex
CREATE INDEX "Classified_expiresAt_idx" ON "Classified"("expiresAt");

-- CreateIndex
CREATE INDEX "Classified_createdAt_idx" ON "Classified"("createdAt");

-- CreateIndex
CREATE INDEX "ClassifiedPhoto_classifiedId_idx" ON "ClassifiedPhoto"("classifiedId");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_ownerId_key" ON "Merchant"("ownerId");

-- CreateIndex
CREATE INDEX "Merchant_pinCode_idx" ON "Merchant"("pinCode");

-- CreateIndex
CREATE INDEX "Merchant_city_idx" ON "Merchant"("city");

-- CreateIndex
CREATE INDEX "Merchant_status_idx" ON "Merchant"("status");

-- CreateIndex
CREATE INDEX "Merchant_category_idx" ON "Merchant"("category");

-- CreateIndex
CREATE INDEX "Merchant_createdAt_idx" ON "Merchant"("createdAt");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_priority_idx" ON "Report"("priority");

-- CreateIndex
CREATE INDEX "Report_routedTo_idx" ON "Report"("routedTo");

-- CreateIndex
CREATE INDEX "Report_targetKind_targetId_idx" ON "Report"("targetKind", "targetId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_societyScopeId_idx" ON "Report"("societyScopeId");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "ModAction_actorId_idx" ON "ModAction"("actorId");

-- CreateIndex
CREATE INDEX "ModAction_targetKind_targetId_idx" ON "ModAction"("targetKind", "targetId");

-- CreateIndex
CREATE INDEX "ModAction_action_idx" ON "ModAction"("action");

-- CreateIndex
CREATE INDEX "ModAction_reportId_idx" ON "ModAction"("reportId");

-- CreateIndex
CREATE INDEX "ModAction_createdAt_idx" ON "ModAction"("createdAt");

-- CreateIndex
CREATE INDEX "StrikeRecord_userId_idx" ON "StrikeRecord"("userId");

-- CreateIndex
CREATE INDEX "StrikeRecord_expiresAt_idx" ON "StrikeRecord"("expiresAt");

-- CreateIndex
CREATE INDEX "StrikeRecord_issuedAt_idx" ON "StrikeRecord"("issuedAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_targetKind_targetId_idx" ON "AuditLog"("targetKind", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "FeatureFlag_key_idx" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "FeatureFlag_scope_idx" ON "FeatureFlag"("scope");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_scope_scopeValue_key" ON "FeatureFlag"("key", "scope", "scopeValue");

-- CreateIndex
CREATE INDEX "Broadcast_status_idx" ON "Broadcast"("status");

-- CreateIndex
CREATE INDEX "Broadcast_createdAt_idx" ON "Broadcast"("createdAt");

-- CreateIndex
CREATE INDEX "InviteBatch_pinCode_idx" ON "InviteBatch"("pinCode");

-- CreateIndex
CREATE INDEX "InviteBatch_city_idx" ON "InviteBatch"("city");

-- CreateIndex
CREATE INDEX "InviteBatch_sentAt_idx" ON "InviteBatch"("sentAt");

-- CreateIndex
CREATE INDEX "InviteBatch_createdAt_idx" ON "InviteBatch"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LocalityNews_sourceUrl_key" ON "LocalityNews"("sourceUrl");

-- CreateIndex
CREATE INDEX "LocalityNews_pinCode_expiresAt_idx" ON "LocalityNews"("pinCode", "expiresAt");

-- CreateIndex
CREATE INDEX "LocalityNews_city_expiresAt_idx" ON "LocalityNews"("city", "expiresAt");

-- CreateIndex
CREATE INDEX "LocalityNews_isAlert_idx" ON "LocalityNews"("isAlert");

-- CreateIndex
CREATE INDEX "LocalityNews_publishedAt_idx" ON "LocalityNews"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceListing_userId_key" ON "ServiceListing"("userId");

-- CreateIndex
CREATE INDEX "ServiceListing_userId_idx" ON "ServiceListing"("userId");

-- CreateIndex
CREATE INDEX "ServiceListing_category_idx" ON "ServiceListing"("category");

-- CreateIndex
CREATE INDEX "ServiceListing_pinCode_idx" ON "ServiceListing"("pinCode");

-- CreateIndex
CREATE INDEX "ServiceListing_isActive_idx" ON "ServiceListing"("isActive");

-- CreateIndex
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");

-- CreateIndex
CREATE INDEX "Order_sellerId_idx" ON "Order"("sellerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_scheduledAt_idx" ON "Order"("scheduledAt");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_orderId_key" ON "Rating"("orderId");

-- CreateIndex
CREATE INDEX "Rating_rateeId_idx" ON "Rating"("rateeId");

-- CreateIndex
CREATE INDEX "Rating_listingId_idx" ON "Rating"("listingId");

-- CreateIndex
CREATE INDEX "Rating_createdAt_idx" ON "Rating"("createdAt");

-- CreateIndex
CREATE INDEX "Community_pinCode_idx" ON "Community"("pinCode");

-- CreateIndex
CREATE INDEX "Community_type_idx" ON "Community"("type");

-- CreateIndex
CREATE INDEX "Community_createdAt_idx" ON "Community"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityMember_communityId_idx" ON "CommunityMember"("communityId");

-- CreateIndex
CREATE INDEX "CommunityMember_userId_idx" ON "CommunityMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMember_communityId_userId_key" ON "CommunityMember"("communityId", "userId");

-- CreateIndex
CREATE INDEX "ChatThread_societyId_idx" ON "ChatThread"("societyId");

-- CreateIndex
CREATE INDEX "ChatThread_communityId_idx" ON "ChatThread"("communityId");

-- CreateIndex
CREATE INDEX "ChatThread_lastMessageAt_idx" ON "ChatThread"("lastMessageAt");

-- CreateIndex
CREATE INDEX "ChatMembership_userId_idx" ON "ChatMembership"("userId");

-- CreateIndex
CREATE INDEX "ChatMembership_threadId_idx" ON "ChatMembership"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMembership_threadId_userId_key" ON "ChatMembership"("threadId", "userId");

-- CreateIndex
CREATE INDEX "ChatMessage_threadId_createdAt_idx" ON "ChatMessage"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- CreateIndex
CREATE INDEX "CarpoolTrip_driverId_idx" ON "CarpoolTrip"("driverId");

-- CreateIndex
CREATE INDEX "CarpoolTrip_pinCode_idx" ON "CarpoolTrip"("pinCode");

-- CreateIndex
CREATE INDEX "CarpoolTrip_departureAt_idx" ON "CarpoolTrip"("departureAt");

-- CreateIndex
CREATE INDEX "CarpoolTrip_status_idx" ON "CarpoolTrip"("status");

-- CreateIndex
CREATE INDEX "CarpoolJoin_tripId_idx" ON "CarpoolJoin"("tripId");

-- CreateIndex
CREATE INDEX "CarpoolJoin_passengerId_idx" ON "CarpoolJoin"("passengerId");

-- CreateIndex
CREATE UNIQUE INDEX "CarpoolJoin_tripId_passengerId_key" ON "CarpoolJoin"("tripId", "passengerId");

-- CreateIndex
CREATE INDEX "GroupBuy_pinCode_idx" ON "GroupBuy"("pinCode");

-- CreateIndex
CREATE INDEX "GroupBuy_status_idx" ON "GroupBuy"("status");

-- CreateIndex
CREATE INDEX "GroupBuy_closesAt_idx" ON "GroupBuy"("closesAt");

-- CreateIndex
CREATE INDEX "GroupBuy_organizerId_idx" ON "GroupBuy"("organizerId");

-- CreateIndex
CREATE INDEX "GroupBuyCommit_userId_idx" ON "GroupBuyCommit"("userId");

-- CreateIndex
CREATE INDEX "GroupBuyCommit_groupBuyId_idx" ON "GroupBuyCommit"("groupBuyId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupBuyCommit_groupBuyId_userId_key" ON "GroupBuyCommit"("groupBuyId", "userId");

-- CreateIndex
CREATE INDEX "Story_authorId_idx" ON "Story"("authorId");

-- CreateIndex
CREATE INDEX "Story_pinCode_expiresAt_idx" ON "Story"("pinCode", "expiresAt");

-- CreateIndex
CREATE INDEX "Story_societyId_idx" ON "Story"("societyId");

-- CreateIndex
CREATE INDEX "EventRsvp_postId_idx" ON "EventRsvp"("postId");

-- CreateIndex
CREATE INDEX "EventRsvp_userId_idx" ON "EventRsvp"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRsvp_postId_userId_key" ON "EventRsvp"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");

-- CreateIndex
CREATE INDEX "PushToken_userId_idx" ON "PushToken"("userId");

-- CreateIndex
CREATE INDEX "PushToken_isActive_idx" ON "PushToken"("isActive");

-- CreateIndex
CREATE INDEX "ReferralRecord_referrerId_idx" ON "ReferralRecord"("referrerId");

-- CreateIndex
CREATE INDEX "ReferralRecord_refereeId_idx" ON "ReferralRecord"("refereeId");

-- CreateIndex
CREATE INDEX "ReferralRecord_refereePhone_idx" ON "ReferralRecord"("refereePhone");

-- CreateIndex
CREATE INDEX "WalletEntry_userId_idx" ON "WalletEntry"("userId");

-- CreateIndex
CREATE INDEX "WalletEntry_userId_type_idx" ON "WalletEntry"("userId", "type");

-- CreateIndex
CREATE INDEX "WalletEntry_createdAt_idx" ON "WalletEntry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConfig_provider_key" ON "IntegrationConfig"("provider");

-- CreateIndex
CREATE INDEX "IntegrationConfig_enabled_idx" ON "IntegrationConfig"("enabled");

-- CreateIndex
CREATE INDEX "SosIncident_pinCode_status_idx" ON "SosIncident"("pinCode", "status");

-- CreateIndex
CREATE INDEX "SosIncident_authorId_idx" ON "SosIncident"("authorId");

-- CreateIndex
CREATE INDEX "SosIncident_createdAt_idx" ON "SosIncident"("createdAt");

-- CreateIndex
CREATE INDEX "SosIncident_escalationLevel_firstAlertAt_idx" ON "SosIncident"("escalationLevel", "firstAlertAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocation_userId_key" ON "UserLocation"("userId");

-- CreateIndex
CREATE INDEX "UserLocation_lat_lon_idx" ON "UserLocation"("lat", "lon");

-- CreateIndex
CREATE INDEX "SosResponder_incidentId_idx" ON "SosResponder"("incidentId");

-- CreateIndex
CREATE INDEX "SosResponder_userId_idx" ON "SosResponder"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SosResponder_incidentId_userId_key" ON "SosResponder"("incidentId", "userId");

-- CreateIndex
CREATE INDEX "ServiceSlot_merchantId_date_idx" ON "ServiceSlot"("merchantId", "date");

-- CreateIndex
CREATE INDEX "ServiceSlot_date_idx" ON "ServiceSlot"("date");

-- CreateIndex
CREATE INDEX "Appointment_userId_idx" ON "Appointment"("userId");

-- CreateIndex
CREATE INDEX "Appointment_merchantId_idx" ON "Appointment"("merchantId");

-- CreateIndex
CREATE INDEX "Appointment_scheduledAt_idx" ON "Appointment"("scheduledAt");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "QuoteRequest_userId_idx" ON "QuoteRequest"("userId");

-- CreateIndex
CREATE INDEX "QuoteRequest_merchantId_idx" ON "QuoteRequest"("merchantId");

-- CreateIndex
CREATE INDEX "QuoteRequest_status_idx" ON "QuoteRequest"("status");

-- CreateIndex
CREATE INDEX "QuoteRequest_createdAt_idx" ON "QuoteRequest"("createdAt");

-- CreateIndex
CREATE INDEX "OtpVerification_phone_idx" ON "OtpVerification"("phone");

-- CreateIndex
CREATE INDEX "OtpVerification_expiresAt_idx" ON "OtpVerification"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RazorpayOrder_razorpayOrderId_key" ON "RazorpayOrder"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "RazorpayOrder_userId_idx" ON "RazorpayOrder"("userId");

-- CreateIndex
CREATE INDEX "RazorpayOrder_razorpayOrderId_idx" ON "RazorpayOrder"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "RazorpayOrder_status_idx" ON "RazorpayOrder"("status");

-- AddForeignKey
ALTER TABLE "UserLocality" ADD CONSTRAINT "UserLocality_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResidence" ADD CONSTRAINT "UserResidence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResidence" ADD CONSTRAINT "UserResidence_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResidence" ADD CONSTRAINT "UserResidence_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "Tower"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vouch" ADD CONSTRAINT "Vouch_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vouch" ADD CONSTRAINT "Vouch_voucheeId_fkey" FOREIGN KEY ("voucheeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tower" ADD CONSTRAINT "Tower_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocietyAdmin" ADD CONSTRAINT "SocietyAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocietyAdmin" ADD CONSTRAINT "SocietyAdmin_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "Society"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostMedia" ADD CONSTRAINT "PostMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classified" ADD CONSTRAINT "Classified_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassifiedPhoto" ADD CONSTRAINT "ClassifiedPhoto_classifiedId_fkey" FOREIGN KEY ("classifiedId") REFERENCES "Classified"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModAction" ADD CONSTRAINT "ModAction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModAction" ADD CONSTRAINT "ModAction_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrikeRecord" ADD CONSTRAINT "StrikeRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceListing" ADD CONSTRAINT "ServiceListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ServiceListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_rateeId_fkey" FOREIGN KEY ("rateeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ServiceListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatThread" ADD CONSTRAINT "ChatThread_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMembership" ADD CONSTRAINT "ChatMembership_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMembership" ADD CONSTRAINT "ChatMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarpoolTrip" ADD CONSTRAINT "CarpoolTrip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarpoolJoin" ADD CONSTRAINT "CarpoolJoin_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "CarpoolTrip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarpoolJoin" ADD CONSTRAINT "CarpoolJoin_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupBuy" ADD CONSTRAINT "GroupBuy_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupBuyCommit" ADD CONSTRAINT "GroupBuyCommit_groupBuyId_fkey" FOREIGN KEY ("groupBuyId") REFERENCES "GroupBuy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupBuyCommit" ADD CONSTRAINT "GroupBuyCommit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryView" ADD CONSTRAINT "StoryView_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryView" ADD CONSTRAINT "StoryView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralRecord" ADD CONSTRAINT "ReferralRecord_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralRecord" ADD CONSTRAINT "ReferralRecord_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletEntry" ADD CONSTRAINT "WalletEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosIncident" ADD CONSTRAINT "SosIncident_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosResponder" ADD CONSTRAINT "SosResponder_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "SosIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SosResponder" ADD CONSTRAINT "SosResponder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceSlot" ADD CONSTRAINT "ServiceSlot_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ServiceSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RazorpayOrder" ADD CONSTRAINT "RazorpayOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
