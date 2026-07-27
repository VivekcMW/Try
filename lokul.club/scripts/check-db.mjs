import { PrismaClient } from './src/generated/prisma/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });
try {
  const all = await p.merchant.findMany({ select: { name: true, category: true, pinCode: true, status: true } });
  console.log('Total merchants:', all.length);
  console.log(JSON.stringify(all, null, 2));
} catch (e) { console.error('ERROR:', e.message); }
await p.$disconnect();
