#!/usr/bin/env node

/**
 * Create test merchant for merchant@test.com
 */

const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating test merchant...\n');

  // Find user by email (should exist from Supabase registration)
  let user = await prisma.user.findUnique({
    where: { email: 'merchant@test.com' },
  });

  if (!user) {
    console.error('❌ User merchant@test.com not found in database');
    console.log('\nPlease ensure:');
    console.log('1. User is created in Supabase (email: merchant@test.com)');
    console.log('2. User record exists in Prisma database');
    console.log('\nTry running: npx prisma db push');
    return;
  }

  console.log('✅ Found user:', user.id, '-', user.email);

  // Check if merchant exists
  let merchant = await prisma.merchant.findFirst({
    where: { ownerId: user.id },
  });

  if (!merchant) {
    // Create merchant
    merchant = await prisma.merchant.create({
      data: {
        ownerId: user.id,
        name: 'Test Merchant Shop',
        category: 'kirana',
        phone: '+919876543210',
        addressLine1: '123 Test Street',
        pincode: '560001',
        status: 'active',
        acceptingOrders: true,
        subscriptionTier: 'free',
        subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        ratingAvg: 4.5,
        ratingCount: 10,
        isBlacklisted: false,
      },
    });
    console.log('✅ Created merchant:', merchant.id);
  } else {
    // Update merchant to ensure it's active
    merchant = await prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        status: 'active',
        isBlacklisted: false,
      },
    });
    console.log('✅ Merchant exists and updated:', merchant.id);
  }

  console.log('\n🎉 Test merchant setup complete!');
  console.log('\nCredentials:');
  console.log('  Email: merchant@test.com');
  console.log('  Password: test123');
  console.log('  Merchant ID:', merchant.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
