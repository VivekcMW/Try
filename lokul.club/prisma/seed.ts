/**
 * Seed script — populates lokul_club with a realistic, organic community dataset
 * spread across three localities. Feed content is written the way real neighbours
 * post (garage sales, lost pets, recommendations, complaints, event invites) —
 * not as formal RWA/committee notices.
 *
 * This script WIPES its own tables first (safe: this is local dev data, and
 * re-running the old seed.ts twice had already produced duplicate rows since
 * it used `.create()` instead of upserts for most content).
 *
 * Run: npx tsx prisma/seed.ts
 */
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DAY = 24 * 3600 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms);
const fromNow = (ms: number) => new Date(Date.now() + ms);

// ─────────────────────────────────────────────────────────────────────────────
// LOCALITIES
// ─────────────────────────────────────────────────────────────────────────────
const LOCALITIES = [
  { pinCode: '411028', city: 'Pune', region: 'Hadapsar', lat: 18.5074, lng: 73.9258 },
  { pinCode: '411045', city: 'Pune', region: 'Baner', lat: 18.5590, lng: 73.7868 },
  { pinCode: '560038', city: 'Bengaluru', region: 'Indiranagar', lat: 12.9716, lng: 77.6412 },
] as const;

// A stable, real-loading placeholder photo per index (picsum.photos serves a
// fixed image per seed number, so these don't change between runs).
const photo = (seed: number) => `https://picsum.photos/seed/lokul-${seed}/800/600`;

async function main() {
  console.log('🌱  Seeding lokul_club (fresh, non-RWA community dataset)…');

  // ── 0. Wipe previous seed-owned content ──────────────────────────────────
  // Order matters — children before parents. This is local dev data only.
  await prisma.$transaction([
    prisma.postTag.deleteMany(),
    prisma.postMedia.deleteMany(),
    prisma.reaction.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.eventRsvp.deleteMany(),
    prisma.post.deleteMany(),
    prisma.classifiedPhoto.deleteMany(),
    prisma.classified.deleteMany(),
    prisma.carpoolJoin.deleteMany(),
    prisma.carpoolTrip.deleteMany(),
    prisma.groupBuyCommit.deleteMany(),
    prisma.groupBuy.deleteMany(),
    prisma.communityMember.deleteMany(),
    prisma.community.deleteMany(),
    prisma.chatMessage.deleteMany(),
    prisma.chatMembership.deleteMany(),
    prisma.chatThread.deleteMany(),
    prisma.storyView.deleteMany(),
    prisma.story.deleteMany(),
    prisma.sosResponder.deleteMany(),
    prisma.sosIncident.deleteMany(),
    prisma.safetyContact.deleteMany(),
    prisma.medicalProfile.deleteMany(),
    prisma.volunteer.deleteMany(),
    prisma.localityNews.deleteMany(),
    prisma.broadcast.deleteMany(),
    prisma.featureFlag.deleteMany(),
    prisma.pushToken.deleteMany(),
    prisma.quoteRequest.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.serviceSlot.deleteMany(),
    prisma.rating.deleteMany(),
    prisma.order.deleteMany(),
    prisma.walletEntry.deleteMany(),
    prisma.referralRecord.deleteMany(),
    prisma.serviceListing.deleteMany(),
    prisma.merchant.deleteMany(),
    prisma.userLocality.deleteMany(),
  ]);
  console.log('  ✓  wiped previous seed data');

  // ── 1. Users ────────────────────────────────────────────────────────────
  // loc: 0=Hadapsar(Pune) 1=Baner(Pune) 2=Indiranagar(Bengaluru)
  const USER_DEFS = [
    // Hadapsar (locality 0)
    { name: 'Vivek Sharma',      phone: '+919876543210', kycTier: 'gold',   role: 'resident',  trustScore: 88, loc: 0 },
    { name: 'Priya Nair',        phone: '+919812345678', kycTier: 'silver', role: 'resident',  trustScore: 72, loc: 0 },
    { name: 'Ramesh Gupta',      phone: '+919900112233', kycTier: 'bronze', role: 'resident',  trustScore: 55, loc: 0 },
    { name: 'Sunita Mehta',      phone: '+919988776655', kycTier: 'silver', role: 'merchant',  trustScore: 80, loc: 0 },
    { name: 'Anil Patil',        phone: '+919876501234', kycTier: 'bronze', role: 'resident',  trustScore: 61, loc: 0 },
    { name: 'Deepa Krishnan',    phone: '+919654321098', kycTier: 'gold',   role: 'merchant',  trustScore: 95, loc: 0 },
    { name: 'Rohit Deshmukh',    phone: '+919000000101', kycTier: 'silver', role: 'resident',  trustScore: 68, loc: 0 },
    { name: 'Neha Kulkarni',     phone: '+919000000102', kycTier: 'bronze', role: 'resident',  trustScore: 40, loc: 0 },
    { name: 'Suresh Nair',       phone: '+919000000103', kycTier: 'silver', role: 'resident',  trustScore: 74, loc: 0 },
    { name: 'Tanya Bose',        phone: '+919000000104', kycTier: 'gold',   role: 'resident',  trustScore: 91, loc: 0 },
    { name: 'Amit Joshi',        phone: '+919000000105', kycTier: 'bronze', role: 'resident',  trustScore: 52, loc: 0 },
    { name: 'Kavita Rao',        phone: '+919000000106', kycTier: 'silver', role: 'merchant',  trustScore: 77, loc: 0 },
    { name: 'Vikram Singh',      phone: '+919000000107', kycTier: 'bronze', role: 'resident',  trustScore: 45, loc: 0 },
    { name: 'Meera Iyer',        phone: '+919000000108', kycTier: 'gold',   role: 'moderator', trustScore: 94, loc: 0 },
    { name: 'Sanjay Verma',      phone: '+919000000109', kycTier: 'bronze', role: 'resident',  trustScore: 22, loc: 0 }, // low trust — realism
    { name: 'Pooja Agarwal',     phone: '+919000000110', kycTier: 'silver', role: 'resident',  trustScore: 65, loc: 0 },
    { name: 'Arjun Menon',       phone: '+919000000111', kycTier: 'bronze', role: 'resident',  trustScore: 58, loc: 0 },

    // Baner (locality 1)
    { name: 'Kunal Chatterjee',  phone: '+919000000201', kycTier: 'gold',   role: 'resident',  trustScore: 85, loc: 1 },
    { name: 'Ishita Bhatt',      phone: '+919000000202', kycTier: 'silver', role: 'resident',  trustScore: 70, loc: 1 },
    { name: 'Rahul Kadam',       phone: '+919000000203', kycTier: 'bronze', role: 'resident',  trustScore: 48, loc: 1 },
    { name: 'Swati Pawar',       phone: '+919000000204', kycTier: 'silver', role: 'merchant',  trustScore: 79, loc: 1 },
    { name: 'Nikhil Oak',        phone: '+919000000205', kycTier: 'bronze', role: 'resident',  trustScore: 51, loc: 1 },
    { name: 'Ananya Shah',       phone: '+919000000206', kycTier: 'gold',   role: 'merchant',  trustScore: 92, loc: 1 },
    { name: 'Devendra Thakur',   phone: '+919000000207', kycTier: 'silver', role: 'resident',  trustScore: 66, loc: 1 },
    { name: 'Radhika Pillai',    phone: '+919000000208', kycTier: 'bronze', role: 'resident',  trustScore: 37, loc: 1 },
    { name: 'Harshad Bhosale',   phone: '+919000000209', kycTier: 'silver', role: 'resident',  trustScore: 73, loc: 1 },
    { name: 'Simran Kaur',       phone: '+919000000210', kycTier: 'gold',   role: 'resident',  trustScore: 89, loc: 1 },
    { name: 'Yash Trivedi',      phone: '+919000000211', kycTier: 'bronze', role: 'resident',  trustScore: 44, loc: 1 },
    { name: 'Farha Sheikh',      phone: '+919000000212', kycTier: 'silver', role: 'merchant',  trustScore: 81, loc: 1 },
    { name: 'Omkar Bhide',       phone: '+919000000213', kycTier: 'bronze', role: 'resident',  trustScore: 33, loc: 1 },
    { name: 'Leela Ramesh',      phone: '+919000000214', kycTier: 'gold',   role: 'moderator', trustScore: 96, loc: 1 },
    { name: 'Girish Kamble',     phone: '+919000000215', kycTier: 'bronze', role: 'resident',  trustScore: 27, loc: 1 },
    { name: 'Zoya Khan',         phone: '+919000000216', kycTier: 'silver', role: 'resident',  trustScore: 62, loc: 1 },
    { name: 'Prasad Naik',       phone: '+919000000217', kycTier: 'bronze', role: 'resident',  trustScore: 56, loc: 1 },

    // Indiranagar, Bengaluru (locality 2)
    { name: 'Sharath Kumar',     phone: '+919000000301', kycTier: 'gold',   role: 'resident',  trustScore: 87, loc: 2 },
    { name: 'Divya Prasad',      phone: '+919000000302', kycTier: 'silver', role: 'resident',  trustScore: 71, loc: 2 },
    { name: 'Manoj Reddy',       phone: '+919000000303', kycTier: 'bronze', role: 'resident',  trustScore: 49, loc: 2 },
    { name: 'Lakshmi Venkat',    phone: '+919000000304', kycTier: 'silver', role: 'merchant',  trustScore: 78, loc: 2 },
    { name: 'Arvind Rao',        phone: '+919000000305', kycTier: 'bronze', role: 'resident',  trustScore: 53, loc: 2 },
    { name: 'Chaitra Gowda',     phone: '+919000000306', kycTier: 'gold',   role: 'merchant',  trustScore: 93, loc: 2 },
    { name: 'Vignesh Iyer',      phone: '+919000000307', kycTier: 'silver', role: 'resident',  trustScore: 67, loc: 2 },
    { name: 'Ashwini Hegde',     phone: '+919000000308', kycTier: 'bronze', role: 'resident',  trustScore: 41, loc: 2 },
    { name: 'Deepak Shetty',     phone: '+919000000309', kycTier: 'silver', role: 'resident',  trustScore: 75, loc: 2 },
    { name: 'Sowmya Bhat',       phone: '+919000000310', kycTier: 'gold',   role: 'resident',  trustScore: 90, loc: 2 },
    { name: 'Naveen Kumar',      phone: '+919000000311', kycTier: 'bronze', role: 'resident',  trustScore: 46, loc: 2 },
    { name: 'Preethi Achar',     phone: '+919000000312', kycTier: 'silver', role: 'merchant',  trustScore: 82, loc: 2 },
    { name: 'Ravi Shankar',      phone: '+919000000313', kycTier: 'bronze', role: 'resident',  trustScore: 30, loc: 2 },
    { name: 'Anitha Suresh',     phone: '+919000000314', kycTier: 'gold',   role: 'moderator', trustScore: 95, loc: 2 },
    { name: 'Girish Pai',        phone: '+919000000315', kycTier: 'bronze', role: 'resident',  trustScore: 25, loc: 2 },
    { name: 'Meghana Rao',       phone: '+919000000316', kycTier: 'silver', role: 'resident',  trustScore: 64, loc: 2 },
  ] as const;

  const users = await Promise.all(
    USER_DEFS.map((u) =>
      prisma.user.upsert({
        where: { phone: u.phone },
        update: { name: u.name, kycTier: u.kycTier, role: u.role, trustScore: u.trustScore, status: 'active' },
        create: { phone: u.phone, name: u.name, kycTier: u.kycTier, role: u.role, status: 'active', trustScore: u.trustScore },
      }),
    ),
  );
  const byName = (n: string) => users[USER_DEFS.findIndex((u) => u.name === n)];
  const locUsers = (locIdx: number) => users.filter((_, i) => USER_DEFS[i].loc === locIdx);
  console.log(`  ✓  ${users.length} users across ${LOCALITIES.length} localities`);

  // ── 2. User Localities ──────────────────────────────────────────────────
  await Promise.all(
    users.map((u, i) => {
      const l = LOCALITIES[USER_DEFS[i].loc];
      return prisma.userLocality.create({
        data: { userId: u.id, pinCode: l.pinCode, city: l.city, region: l.region, isPrimary: true },
      });
    }),
  );
  console.log('  ✓  user localities');

  // ── 3. Merchants ─────────────────────────────────────────────────────────
  const MERCHANT_DEFS = [
    { owner: 'Sunita Mehta',     name: 'Sunita Home Maid Services',       category: 'maid',        desc: 'Professional maid services for apartments. 5+ years experience. Part-time and full-time available. Starting ₹2,500/month.', rating: 4.6, count: 34, loc: 0 },
    { owner: 'Deepa Krishnan',   name: 'Deepa Tiffin Services',           category: 'tiffin',      desc: 'Home-cooked South Indian & North Indian tiffin. Fresh, hygienic, delivered daily. ₹3,000/month.', rating: 4.8, count: 67, loc: 0 },
    { owner: 'Anil Patil',       name: 'Anil AC & Electrical Works',      category: 'electrician', desc: 'AC servicing, installation, electrical repairs. Quick service, genuine parts. ₹350 per visit.', rating: 4.1, count: 18, loc: 0 },
    { owner: 'Kavita Rao',       name: 'Kavita\'s Beauty Studio',          category: 'salon',       desc: 'Facials, waxing, threading, bridal packages. Home visits available on weekends.', rating: 4.7, count: 41, loc: 0 },
    { owner: 'Swati Pawar',      name: 'Pawar Plumbing & Sanitation',     category: 'plumber',     desc: '24/7 emergency plumbing. Leak fixing, bathroom fittings, water tank cleaning.', rating: 4.3, count: 29, loc: 1 },
    { owner: 'Ananya Shah',      name: 'Shah Interiors & Carpentry',      category: 'carpenter',   desc: 'Custom furniture, modular kitchens, wardrobe fitting. Free site visit.', rating: 4.9, count: 52, loc: 1 },
    { owner: 'Farha Sheikh',     name: 'Farha\'s Daily Tiffin',            category: 'tiffin',      desc: 'Home-style Mughlai and North Indian meals. Diet-friendly options available.', rating: 4.5, count: 38, loc: 1 },
    { owner: 'Leela Ramesh',     name: 'Leela Fitness Studio',            category: 'gym',         desc: 'Small-group personal training, yoga, and Zumba. First class free.', rating: 4.8, count: 63, loc: 1 },
    { owner: 'Lakshmi Venkat',   name: 'Venkat Grocery & Kirana',         category: 'kirana',      desc: 'Daily essentials, fresh vegetables, home delivery within 2km.', rating: 4.4, count: 71, loc: 2 },
    { owner: 'Chaitra Gowda',    name: 'Gowda Pest Control Services',     category: 'pest_control',desc: 'Cockroach, termite and mosquito control. Eco-friendly chemicals, 6-month warranty.', rating: 4.2, count: 24, loc: 2 },
    { owner: 'Preethi Achar',    name: 'Achar\'s Laundry & Dry Clean',     category: 'laundry',     desc: 'Pickup and delivery laundry service. Same-day dry cleaning available.', rating: 4.6, count: 45, loc: 2 },
    { owner: 'Ravi Shankar',     name: 'Shankar Photography',             category: 'photographer',desc: 'Birthdays, pujas, small events. Candid + traditional styles. Packages from ₹5,000.', rating: 4.0, count: 12, loc: 2 },
  ] as const;

  const merchants = await Promise.all(
    MERCHANT_DEFS.map((m) => {
      const owner = byName(m.owner);
      const l = LOCALITIES[m.loc];
      return prisma.merchant.upsert({
        where: { ownerId: owner.id },
        update: {},
        create: {
          ownerId: owner.id, name: m.name, category: m.category, description: m.desc,
          pinCode: l.pinCode, city: l.city, ratingAvg: m.rating, ratingCount: m.count,
          status: 'active', isEndorsed: m.rating >= 4.5, isBlacklisted: false,
        },
      });
    }),
  );
  console.log(`  ✓  ${merchants.length} merchants`);

  // ── 4. Service Listings (ServiceCategory enum: cook|rider|coach|tutor|beautician|caretaker|handyman|reseller) ──
  const SERVICE_LISTING_DEFS = [
    { user: 'Sunita Mehta',  category: 'caretaker', title: 'Part-time Maid Service',        desc: 'Daily 2-hour cleaning, utensil washing, mopping. Available Mon–Sat 7am–10am.', price: 250000, loc: 0 },
    { user: 'Deepa Krishnan',category: 'cook',       title: 'Home-cooked Tiffin – Veg & Non-veg', desc: 'Fresh lunch & dinner tiffin. South Indian Mon/Wed/Fri, North Indian Tue/Thu/Sat.', price: 300000, loc: 0 },
    { user: 'Kavita Rao',    category: 'beautician', title: 'At-Home Beauty Services',        desc: 'Facial, waxing, mehendi at your doorstep.', price: 80000, loc: 0 },
    { user: 'Rohit Deshmukh',category: 'coach',      title: 'Badminton Coaching – Beginners',  desc: 'Weekend badminton coaching for kids and adults at the community court.', price: 150000, loc: 0 },
    { user: 'Swati Pawar',   category: 'handyman',   title: 'Plumbing & Fitting Services',     desc: 'Bathroom fittings, leak repair, tank cleaning.', price: 50000, loc: 1 },
    { user: 'Ananya Shah',   category: 'reseller',   title: 'Custom Furniture Orders',         desc: 'Book a slot for a free carpentry site visit.', price: 0, loc: 1 },
    { user: 'Ishita Bhatt',  category: 'tutor',       title: 'Maths & Science Tuition – 6th to 10th', desc: 'CBSE/ICSE. Small batches, evening slots.', price: 200000, loc: 1 },
    { user: 'Leela Ramesh',  category: 'coach',       title: 'Personal Training & Yoga',        desc: 'Weight loss, flexibility, and strength programs.', price: 350000, loc: 1 },
    { user: 'Lakshmi Venkat',category: 'reseller',    title: 'Daily Grocery Subscription',       desc: 'Weekly vegetable box + daily essentials.', price: 120000, loc: 2 },
    { user: 'Preethi Achar', category: 'handyman',    title: 'Laundry Pickup & Delivery',         desc: 'Twice-weekly pickup, 24hr turnaround.', price: 90000, loc: 2 },
    { user: 'Divya Prasad',  category: 'tutor',       title: 'Spoken English & Communication',    desc: 'For adults and working professionals. Weekend batches.', price: 180000, loc: 2 },
    { user: 'Ravi Shankar',  category: 'reseller',    title: 'Event Photography Bookings',        desc: 'Birthdays, pujas, small functions.', price: 500000, loc: 2 },
  ] as const;

  await Promise.all(
    SERVICE_LISTING_DEFS.map((s) => {
      const user = byName(s.user);
      const l = LOCALITIES[s.loc];
      return prisma.serviceListing.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id, category: s.category, title: s.title, description: s.desc,
          pricePaise: s.price, priceUnit: 'month', radiusM: 4000, pinCode: l.pinCode,
          ratingAvg: 4.2 + Math.random() * 0.7, ratingCount: 5 + Math.floor(Math.random() * 60), isActive: true,
        },
      });
    }),
  );
  console.log(`  ✓  ${SERVICE_LISTING_DEFS.length} service listings`);

  // ── 5. Feed Posts — organic, individual voices. NOT committee notices. ──
  // type ∈ update|safety|lost|event|poll|sell|rwa_notice|sos
  type PostDef = { author: string; type: 'update' | 'safety' | 'lost' | 'event' | 'poll' | 'sell' | 'rwa_notice' | 'sos'; body: string; daysAgo: number; visibility?: 'tower' | 'society' | 'neighborhood'; hasPhoto?: boolean };

  const HADAPSAR_POSTS: PostDef[] = [
    { author: 'Vivek Sharma', type: 'update', body: 'Water supply will be interrupted tomorrow 10am–2pm for pipeline maintenance. Please store water in advance. 🚰', daysAgo: 0.2 },
    { author: 'Priya Nair', type: 'safety', body: 'Alert: unknown person was seen trying car door handles in B-wing parking at 11 PM last night. Please ensure your vehicles are locked. Reported to security.', daysAgo: 0.5 },
    { author: 'Sunita Mehta', type: 'sell', body: 'Selling my Sony 43" Smart TV (2022 model). Excellent condition, moving to a smaller city. ₹18,000 negotiable. DM for details.', daysAgo: 1, hasPhoto: true },
    { author: 'Ramesh Gupta', type: 'event', body: 'Throwing a small Diwali get-together at the clubhouse lawn this Saturday evening — food stalls, games for the kids, some music. All welcome, bring a dish if you can! 🪔', daysAgo: 2 },
    { author: 'Anil Patil', type: 'lost', body: 'Lost: Golden Retriever puppy "Bruno" (3 months, male, yellow collar) near A-wing gate. Last seen around 6 PM today. Please contact if found. 🐕', daysAgo: 0.3, hasPhoto: true },
    { author: 'Anil Patil', type: 'update', body: 'UPDATE: Bruno is home!! A security guard near the Amanora gate had him. Thank you to everyone who shared and kept an eye out, means a lot 🙏', daysAgo: 0.1 },
    { author: 'Tanya Bose', type: 'event', body: 'Weekend Garage Sale — Saturday 9am to 1pm at the Tower A lobby! Declutter and find bargains. Books, clothes, toys, kitchenware and more. Everything under ₹500. All welcome!', daysAgo: 3, hasPhoto: true },
    { author: 'Neha Kulkarni', type: 'update', body: 'Anyone else\'s Wi-Fi been terrible this week? ACT keeps dropping every evening around 8. Thinking of switching, any recommendations for a reliable provider in Hadapsar?', daysAgo: 1.5 },
    { author: 'Suresh Nair', type: 'sell', body: 'Moving out sale — dining table (6 seater, glass top) ₹6,000, bookshelf ₹1,500, microwave ₹2,000. All in great shape. Pickup only.', daysAgo: 4 },
    { author: 'Rohit Deshmukh', type: 'event', body: 'Starting a casual badminton group at the community court, Sunday mornings 7-8:30am. Beginners very welcome, we have a couple of spare rackets. Comment if interested!', daysAgo: 5 },
    { author: 'Kavita Rao', type: 'update', body: 'The stray dogs near the D-wing garbage area have had puppies. They\'re sweet but the mother\'s protective — please don\'t let kids get too close. Feeding them separately so they don\'t block the walkway.', daysAgo: 6 },
    { author: 'Vikram Singh', type: 'safety', body: 'Two-wheelers zipping through the internal road near the kids\' play area again this evening, quite fast. Can we get a speed bump or at least a sign put up? Almost had an accident.', daysAgo: 2.5 },
    { author: 'Amit Joshi', type: 'poll', body: 'Which weekend would work better for a building cricket match — this Saturday or next? Trying to get enough people for two full teams.', daysAgo: 7 },
    { author: 'Meera Iyer', type: 'update', body: 'PSA: the vegetable vendor who used to come Tuesday/Friday evenings has shifted his timing to mornings 8-9am. Caught me off guard today!', daysAgo: 1 },
    { author: 'Pooja Agarwal', type: 'lost', body: 'Found a bunch of keys (looks like a scooter key + 2 house keys) near the jogging track this morning. DM me with a description to claim.', daysAgo: 0.8 },
    { author: 'Priya Nair', type: 'update', body: 'The new bakery that opened near the Hadapsar gaon signal has really good khari biscuits and a decent cold coffee. Worth checking out if you haven\'t already.', daysAgo: 8 },
    { author: 'Deepa Krishnan', type: 'sell', body: 'Barely used baby stroller (Chicco brand) — my daughter has outgrown it. ₹3,500. Also have a baby bathtub and some 0-1yr clothes, taking free if you need them.', daysAgo: 9, hasPhoto: true },
    { author: 'Arjun Menon', type: 'safety', body: 'Got a call claiming to be from "bank customer care" asking to verify my UPI PIN over the phone. Obviously didn\'t share anything, but wanted to warn others — sounded very convincing.', daysAgo: 3 },
    { author: 'Sanjay Verma', type: 'update', body: 'Does anyone have a spare parking spot they don\'t use? Happy to pay monthly, my building allotment got messed up.', daysAgo: 10 },
    { author: 'Vivek Sharma', type: 'event', body: 'Hosting a small potluck this Sunday evening on the terrace, 7pm onwards. Bring a dish and yourself, kids welcome. Should be a nice way to actually meet the new families that moved in.', daysAgo: 11 },
    { author: 'Ramesh Gupta', type: 'sell', body: 'Selling a barely-used treadmill, folds up nicely. ₹9,000. Also an exercise cycle for ₹2,500. Reason for selling — gym membership finally stuck this time!', daysAgo: 12 },
    { author: 'Tanya Bose', type: 'update', body: 'Just wanted to say the new security guard on the night shift (the one who checks IDs properly) is doing a great job. Small thing but noticed the difference this week.', daysAgo: 13 },
    { author: 'Suresh Nair', type: 'poll', body: 'For those of us ordering the same milk brand — would switching to the subscription box (delivered every 2 days, slightly cheaper) be worth it? Trying to gauge interest before I commit.', daysAgo: 14 },
    { author: 'Anil Patil', type: 'safety', body: 'Streetlight near the B-wing back gate has been out for almost a week now. Gets pretty dark by 7:30pm, a bit unsafe for anyone walking back from the bus stop.', daysAgo: 4.5 },
    { author: 'Neha Kulkarni', type: 'event', body: 'Anyone up for a weekend trek to Sinhagad this Saturday? Planning to leave by 5:30am to beat the crowd. 4 spots left in the car.', daysAgo: 15 },
    { author: 'Kavita Rao', type: 'sell', body: 'Selling my sewing machine (Usha, barely 2 years old) — ₹4,000. Comes with extra bobbins and a cover.', daysAgo: 16 },
    { author: 'Meera Iyer', type: 'update', body: 'Reminder that the community library exchange shelf near the clubhouse is still going — drop a book, take a book. Restocked it with some thrillers this week.', daysAgo: 17 },
    { author: 'Vikram Singh', type: 'lost', body: 'My son lost his school water bottle (blue, Spiderman design) somewhere between the playground and A-wing. If anyone\'s spotted it, would mean a lot to him 😅', daysAgo: 6.5 },
    { author: 'Amit Joshi', type: 'sell', body: 'Two study chairs, ergonomic, barely used — WFH setup that never got used. ₹1,800 each or ₹3,000 for both.', daysAgo: 18, hasPhoto: true },
    { author: 'Pooja Agarwal', type: 'update', body: 'Heads up, there\'s a fair bit of construction dust from the new building coming up nearby. Might want to keep windows shut on windy days for a while.', daysAgo: 19 },
    { author: 'Arjun Menon', type: 'event', body: 'Organising a small talent evening for the kids — singing, dance, whatever they\'d like to perform. Looking for a date that works for most, thinking a Saturday in a couple weeks.', daysAgo: 20 },
    { author: 'Sanjay Verma', type: 'sell', body: 'iPhone 12, 128GB, minor scratch on the back, battery health 84%. ₹22,000 firm. Box and charger included.', daysAgo: 21 },
    { author: 'Deepa Krishnan', type: 'update', body: 'The tiffin delivery guys mentioned the main road near the flyover is dug up for cable work — expect delays if you\'re driving that route in the evenings this week.', daysAgo: 22 },
    { author: 'Rohit Deshmukh', type: 'safety', body: 'Small kitchen fire in one of the C-wing flats yesterday (cooking oil, no injuries thankfully). Just a reminder to keep a fire blanket or extinguisher handy if you can.', daysAgo: 23 },
    { author: 'Priya Nair', type: 'poll', body: 'If a few of us chip in for a better quality water purifier service (AMC) instead of everyone doing individual repairs, would you be interested? Trying to see if it\'s worth organising.', daysAgo: 24 },
    { author: 'Vivek Sharma', type: 'update', body: 'Finally fixed the wobbly gate at the kids\' play area myself over the weekend — was getting genuinely dangerous. Let me know if you spot anything else that needs a quick fix.', daysAgo: 25 },
    { author: 'Suresh Nair', type: 'sell', body: 'Kids\' cycle (age 5-8), pretty good condition. ₹1,200. Also a badminton set, almost new, ₹500.', daysAgo: 26 },
    { author: 'Tanya Bose', type: 'lost', body: 'My cat Whiskey (grey, white paws, very friendly, will probably approach you) got out around noon. If you see her near the parking or garden, please just call out "Whiskey" — she comes running for food.', daysAgo: 7.2, hasPhoto: true },
    { author: 'Tanya Bose', type: 'update', body: 'She\'s back!! Found hiding under a car two buildings over, hungry and a bit dusty but fine. Thank you all for the messages ❤️', daysAgo: 7.0 },
    { author: 'Anil Patil', type: 'rwa_notice', body: 'Water tanker will supply extra water to A & B wing this Thursday 6-9am due to the ongoing pipeline work — please keep your sump tank accessible.', daysAgo: 27 },
    { author: 'Kavita Rao', type: 'event', body: 'A few of us are doing a small Ganpati visarjan procession from the society to the lake this year, keeping it simple and eco-friendly (clay idol). Join if you\'d like.', daysAgo: 28 },
    { author: 'Vikram Singh', type: 'update', body: 'Any recommendations for a good orthopaedic doctor nearby? My knee\'s been acting up and I\'d rather go on a recommendation than just Google.', daysAgo: 29 },
    { author: 'Meera Iyer', type: 'safety', body: 'For anyone doing online shopping — got a very realistic-looking fake delivery SMS with a payment link today. The courier company never asks for payment via SMS link, please double check before clicking anything.', daysAgo: 30 },
  ];

  const BANER_POSTS: PostDef[] = [
    { author: 'Kunal Chatterjee', type: 'update', body: 'The new flyover ramp near Baner Road finally opened — cuts my commute by a good 15 minutes. Small win but I\'ll take it.', daysAgo: 0.3 },
    { author: 'Ishita Bhatt', type: 'safety', body: 'Bike theft attempt caught on a neighbour\'s doorbell cam near the main gate last night, around 1am. Two people on a scooter, didn\'t manage to get it open but worth being extra careful with your locks.', daysAgo: 0.6 },
    { author: 'Rahul Kadam', type: 'sell', body: 'PS5 with 2 controllers and 3 games, barely used (kid lost interest fast 😅). ₹32,000 for everything.', daysAgo: 1, hasPhoto: true },
    { author: 'Swati Pawar', type: 'event', body: 'A bunch of us are doing a Sunday morning cycling group, meeting at the Baner-Pashan link road junction, 6:30am. All levels welcome, we go at a relaxed pace.', daysAgo: 2 },
    { author: 'Nikhil Oak', type: 'lost', body: 'Lost my wallet somewhere between the gym and the parking lot, has my Aadhaar and a couple of cards. If found please just message me, no questions asked, I\'ll come collect it.', daysAgo: 0.4 },
    { author: 'Ananya Shah', type: 'sell', body: 'Selling a barely-used sofa set (3+1+1, grey fabric) — moving to a smaller apartment. ₹15,000 for the set, pickup this weekend preferred.', daysAgo: 3, hasPhoto: true },
    { author: 'Devendra Thakur', type: 'update', body: 'Heads up — the society next to ours is doing some digging for a new water line, expect some noise between 9-5 for the next week or so.', daysAgo: 1.5 },
    { author: 'Radhika Pillai', type: 'event', body: 'Hosting a small Holi celebration on the terrace this year — colors, some snacks, water balloons for the kids. Bring your own colors if you have a preference, otherwise we\'ll have extras.', daysAgo: 4 },
    { author: 'Harshad Bhosale', type: 'safety', body: 'Please double check your car windows are up — someone reported a smashed window and a bag stolen from a parked car two streets over. Not our building specifically but close enough to be careful.', daysAgo: 2.2 },
    { author: 'Simran Kaur', type: 'update', body: 'Does anyone know a reliable AC repair person? Mine\'s been making a rattling noise for a week and I\'d rather not deal with a random Google search person again.', daysAgo: 5 },
    { author: 'Yash Trivedi', type: 'sell', body: 'Gaming chair, hardly used, ₹4,500. Also selling a 27" monitor, 144hz, ₹9,000. Both in mint condition.', daysAgo: 6 },
    { author: 'Farha Sheikh', type: 'event', body: 'Small iftar gathering this Friday evening at my place, 7:30pm — neighbours of all backgrounds welcome, would love the company. Just let me know numbers so I cook enough!', daysAgo: 7 },
    { author: 'Omkar Bhide', type: 'poll', body: 'Trying to gauge interest — would people want a shared subscription for one of those meal-kit delivery services? Splitting the delivery fee could make it worth it.', daysAgo: 8 },
    { author: 'Leela Ramesh', type: 'update', body: 'Reminder that my Sunday morning yoga sessions in the garden are open to anyone, free, just bring a mat. 7am, rain or shine (well, not rain).', daysAgo: 9 },
    { author: 'Girish Kamble', type: 'lost', body: 'My dog Tommy (brown indie, no collar right now since it broke) slipped out of the gate this evening. Very friendly, responds to his name, please call if spotted.', daysAgo: 0.7, hasPhoto: true },
    { author: 'Girish Kamble', type: 'update', body: 'Tommy\'s back home safe, someone from the next building recognised him from the post and brought him over. Genuinely so grateful, this app actually works 🙏', daysAgo: 0.5 },
    { author: 'Zoya Khan', type: 'safety', body: 'The elevator in Wing C has been making a concerning grinding noise for two days — reported it, but wanted to flag here too in case people want to avoid it till it\'s checked.', daysAgo: 3.5 },
    { author: 'Prasad Naik', type: 'sell', body: 'Selling an almost-new pressure washer, used it exactly twice. ₹3,000. Great for cleaning the balcony/car.', daysAgo: 10 },
    { author: 'Ishita Bhatt', type: 'event', body: 'Book club meetup this month is at my place, we\'re discussing "The Midnight Library" — new members always welcome even if you haven\'t finished the book!', daysAgo: 11 },
    { author: 'Kunal Chatterjee', type: 'update', body: 'The new cafe that opened near the main junction has really solid filter coffee and reasonably fast wifi if anyone\'s looking for a change of scenery to work from.', daysAgo: 12 },
    { author: 'Rahul Kadam', type: 'sell', body: 'Kids\' study table + chair combo, good condition, ₹2,000. Pickup only, ground floor so no elevator hassle.', daysAgo: 13 },
    { author: 'Swati Pawar', type: 'safety', body: 'A tree branch came down near the parking area after last night\'s wind — cleared it myself but wanted to flag in case there are more weak branches around after the rain.', daysAgo: 4.8 },
    { author: 'Nikhil Oak', type: 'poll', body: 'Would it be worth pooling together for a decent quality water purifier AMC instead of each of us calling separately when something breaks?', daysAgo: 14 },
    { author: 'Radhika Pillai', type: 'update', body: 'PSA for parents: the new pediatric clinic near the flyover has weekend slots, much easier than the usual weekday scramble.', daysAgo: 15 },
    { author: 'Devendra Thakur', type: 'sell', body: 'Selling a set of 4 dining chairs (wooden, no table), good condition. ₹2,500 for all four.', daysAgo: 16 },
    { author: 'Simran Kaur', type: 'event', body: 'Planning a small farmers-market style Sunday stall exchange — bring homemade pickles, baked goods, plants, whatever you make, and swap or sell. Anyone interested in joining?', daysAgo: 17 },
    { author: 'Harshad Bhosale', type: 'update', body: 'The internal road resurfacing finally happened, no more dodging potholes on the way to the gate. Small things.', daysAgo: 18 },
    { author: 'Yash Trivedi', type: 'lost', body: 'Left my earphones (white, in a black case) on the bench near the garden yesterday evening. Long shot but if anyone\'s seen them...', daysAgo: 19 },
    { author: 'Farha Sheikh', type: 'sell', body: 'Selling a barely-used stand mixer (KitchenAid style), used it for exactly one baking phase that didn\'t last 😄. ₹6,500.', daysAgo: 20, hasPhoto: true },
    { author: 'Ananya Shah', type: 'safety', body: 'Got a suspicious call pretending to be from the electricity board threatening to cut power if I didn\'t pay "pending dues" immediately over a QR code. It\'s a known scam going around, please don\'t scan anything.', daysAgo: 5.5 },
    { author: 'Omkar Bhide', type: 'poll', body: 'Would people be up for a monthly potluck, rotating between homes/the terrace? Trying to actually get to know more neighbours beyond a nod in the elevator.', daysAgo: 21 },
    { author: 'Leela Ramesh', type: 'update', body: 'Started a small "plants for beginners" swap — if you\'ve got cuttings or saplings to spare, or want to start, drop by the garden this Sunday after yoga.', daysAgo: 22 },
    { author: 'Zoya Khan', type: 'sell', body: 'Selling my old scooter (Activa, 2019, 22k km) — upgraded to an EV. ₹38,000, all papers clear, will help with RC transfer.', daysAgo: 23 },
    { author: 'Prasad Naik', type: 'rwa_notice', body: 'Visitor parking near Gate 2 will be closed for resurfacing this weekend — please use Gate 1 visitor parking instead.', daysAgo: 24 },
    { author: 'Simran Kaur', type: 'update', body: 'That new bakery\'s croissants are genuinely excellent, in case anyone was on the fence. Sadly also excellent for my waistline.', daysAgo: 25 },
    { author: 'Devendra Thakur', type: 'event', body: 'A few of us are watching the match this weekend at the clubhouse if there\'s a projector available — anyone know who to ask for that?', daysAgo: 26 },
    { author: 'Rahul Kadam', type: 'safety', body: 'Noticed the fire extinguisher near the lift lobby is past its inspection date sticker — might be worth someone following up with the facility team.', daysAgo: 27 },
  ];

  const INDIRANAGAR_POSTS: PostDef[] = [
    { author: 'Sharath Kumar', type: 'update', body: 'The metro extension work near 100 Feet Road is finally wrapping up — should make the morning commute a lot less painful soon.', daysAgo: 0.3 },
    { author: 'Divya Prasad', type: 'safety', body: 'Chain snatching reported near the CMH Road signal yesterday evening around 8pm — please be a bit more alert with bags/jewellery on that stretch after dark.', daysAgo: 0.5 },
    { author: 'Manoj Reddy', type: 'sell', body: 'Selling my acoustic guitar (Yamaha F310), barely played, comes with a bag and a capo. ₹5,500.', daysAgo: 1, hasPhoto: true },
    { author: 'Lakshmi Venkat', type: 'event', body: 'Organising a small Ugadi get-together at the apartment garden this weekend, potluck style — bring a dish from your region if you\'d like, all welcome regardless of background.', daysAgo: 2 },
    { author: 'Arvind Rao', type: 'lost', body: 'Lost my office ID badge and a set of keys somewhere between the metro station and 12th Main. If found, please DM — the badge is useless to anyone else but I need it for tomorrow!', daysAgo: 0.4 },
    { author: 'Chaitra Gowda', type: 'sell', body: 'Moving sale — dining set (4 seater), TV unit, and a bookshelf. Good condition, reasonable prices, message for the full list and photos.', daysAgo: 3, hasPhoto: true },
    { author: 'Vignesh Iyer', type: 'update', body: 'The new metro station has genuinely made getting to work so much easier. Also parking near the station fills up fast if anyone\'s planning to park and ride.', daysAgo: 1.2 },
    { author: 'Ashwini Hegde', type: 'event', body: 'Hosting a small book swap + coffee morning this Saturday at the community hall. Bring 2-3 books you\'re done with, take home the same number. Coffee\'s on me.', daysAgo: 4 },
    { author: 'Deepak Shetty', type: 'safety', body: 'A stray electrical wire has been hanging low near the transformer by the park entrance for two days now — flagged to BESCOM but wanted to warn people to stay clear till it\'s fixed.', daysAgo: 2.4 },
    { author: 'Sowmya Bhat', type: 'update', body: 'Does anyone have a good recommendation for a physiotherapist nearby? Been dealing with a nagging shoulder issue and want someone good rather than the nearest option.', daysAgo: 5 },
    { author: 'Naveen Kumar', type: 'sell', body: 'Selling a barely used air fryer (Philips, 4.1L), got a bigger one as a gift. ₹4,000.', daysAgo: 6 },
    { author: 'Preethi Achar', type: 'event', body: 'Weekend badminton group meets at the apartment court, Saturday and Sunday 7-9am. All skill levels, we rotate partners so it stays fun.', daysAgo: 7 },
    { author: 'Ravi Shankar', type: 'poll', body: 'Would people be interested in a shared photography walk one weekend — around the lake or Cubbon Park? Been meaning to get more people into it, even phone cameras welcome.', daysAgo: 8 },
    { author: 'Anitha Suresh', type: 'update', body: 'PSA: the vegetable cart guy who comes around 6pm has started accepting UPI, no more scrambling for change every evening!', daysAgo: 9 },
    { author: 'Girish Pai', type: 'lost', body: 'My cat Simba (orange tabby, quite chunky, answers to food more than his name) got out through a gap in the balcony grill. If you spot him around the building, please let me know.', daysAgo: 0.9, hasPhoto: true },
    { author: 'Girish Pai', type: 'update', body: 'Simba found — he was one floor down, apparently made himself comfortable in someone else\'s balcony for a nap. Thanks to whoever spotted him and messaged!', daysAgo: 0.7 },
    { author: 'Meghana Rao', type: 'safety', body: 'Got a fake "your parcel is stuck at customs, pay a fee to release it" SMS with a payment link today. Definitely a scam, deleting and warning others.', daysAgo: 3.2 },
    { author: 'Sharath Kumar', type: 'sell', body: 'Selling a road bike (Btwin, size M), good condition, recently serviced. ₹8,000.', daysAgo: 10, hasPhoto: true },
    { author: 'Divya Prasad', type: 'event', body: 'A few of us are doing a Sunday morning run along the lake, 6:15am start, easy pace, all welcome. Great way to actually see the neighbourhood wake up.', daysAgo: 11 },
    { author: 'Manoj Reddy', type: 'update', body: 'The new craft beer place on 12th Main has a decent happy hour if anyone\'s looking for somewhere new after work.', daysAgo: 12 },
    { author: 'Arvind Rao', type: 'poll', body: 'Trying to decide between two internet providers — anyone had good/bad experiences with ACT vs Airtel Fiber in this area recently? Speeds and reliability matter more than price for me.', daysAgo: 13 },
    { author: 'Chaitra Gowda', type: 'safety', body: 'Noticed the pedestrian signal near the main junction has been stuck on red-for-cars-always for two days, causing some near misses with people crossing. Reported it, sharing here too.', daysAgo: 5.6 },
    { author: 'Vignesh Iyer', type: 'sell', body: 'Selling an office chair (Green Soul, ergonomic), used for about a year, still very comfortable. ₹5,000.', daysAgo: 14 },
    { author: 'Ashwini Hegde', type: 'update', body: 'The community hall booking process finally moved online, much easier than the old paper register system for anyone planning an event.', daysAgo: 15 },
    { author: 'Deepak Shetty', type: 'event', body: 'Small carrom + board games evening this Friday at my place, 7pm. Snacks provided, just bring yourself and maybe a game if you have a favourite.', daysAgo: 16 },
    { author: 'Sowmya Bhat', type: 'sell', body: 'Selling a barely used yoga mat + block set, and a couple of resistance bands. ₹1,000 for everything.', daysAgo: 17 },
    { author: 'Naveen Kumar', type: 'lost', body: 'Lost my sunglasses (Ray-Ban, tortoiseshell frame) somewhere around the park bench area yesterday. Not expecting much luck but worth a shot!', daysAgo: 18 },
    { author: 'Preethi Achar', type: 'poll', body: 'Would a shared laundry pickup slot (twice a week, split the delivery charge) be useful for people in this block? Trying to see if there\'s enough interest to organise it properly.', daysAgo: 19 },
    { author: 'Ravi Shankar', type: 'update', body: 'Managed to get some nice shots of the sunset from the terrace yesterday — small joys of this building actually facing the right way for once.', daysAgo: 20, hasPhoto: true },
    { author: 'Anitha Suresh', type: 'safety', body: 'Someone reported their two-wheeler mirror was broken overnight in the open parking — might be worth checking your vehicle if you park there too.', daysAgo: 6.3 },
    { author: 'Girish Pai', type: 'sell', body: 'Selling a barely used blender/mixer grinder, upgraded to a bigger one. ₹1,800.', daysAgo: 21 },
    { author: 'Meghana Rao', type: 'event', body: 'Planning a small terrace movie night this weekend, projector arranged, just need people to vote on the movie and bring a snack to share.', daysAgo: 22 },
    { author: 'Lakshmi Venkat', type: 'rwa_notice', body: 'Water tanker supply scheduled for Thursday 7-10am due to BWSSB maintenance in the area — please plan accordingly.', daysAgo: 23 },
    { author: 'Deepak Shetty', type: 'update', body: 'The new pothole on the internal road near the gate has been there for two weeks now, definitely getting worse after the rain. Flagged with BBMP but no updates yet.', daysAgo: 24 },
    { author: 'Sharath Kumar', type: 'sos', body: 'Need someone with a car urgently — my neighbour slipped on the stairs and can\'t put weight on her ankle, trying to get her to the hospital fast. Anyone nearby available right now?', daysAgo: 8.5 },
    { author: 'Divya Prasad', type: 'update', body: 'Following up on the earlier post — she\'s fine, just a bad sprain, X-ray was clear. Thank you to the two people who showed up within minutes, this community is something else.', daysAgo: 8.4 },
  ];

  const ALL_POST_DEFS: { def: PostDef; loc: number }[] = [
    ...HADAPSAR_POSTS.map((def) => ({ def, loc: 0 })),
    ...BANER_POSTS.map((def) => ({ def, loc: 1 })),
    ...INDIRANAGAR_POSTS.map((def) => ({ def, loc: 2 })),
  ];

  const posts = await Promise.all(
    ALL_POST_DEFS.map(({ def, loc }) => {
      const l = LOCALITIES[loc];
      return prisma.post.create({
        data: {
          authorId: byName(def.author).id,
          type: def.type,
          pinCode: l.pinCode,
          body: def.body,
          visibility: def.visibility ?? 'neighborhood',
          status: 'active',
          createdAt: ago(def.daysAgo * DAY),
          viewCount: 5 + Math.floor(Math.random() * 220),
        },
      });
    }),
  );
  console.log(`  ✓  ${posts.length} feed posts (non-RWA, organic content)`);

  // ── 6. Post Media (for posts flagged hasPhoto) ───────────────────────────
  let photoSeed = 100;
  await Promise.all(
    ALL_POST_DEFS.flatMap(({ def }, i) =>
      def.hasPhoto
        ? [
            prisma.postMedia.create({
              data: { postId: posts[i].id, kind: 'image', storageKey: photo(photoSeed++), orderIndex: 0 },
            }),
          ]
        : [],
    ),
  );
  console.log('  ✓  post media (photos)');

  // ── 7. Post Tags ──────────────────────────────────────────────────────────
  await Promise.all(
    posts.map((p, i) => {
      const def = ALL_POST_DEFS[i].def;
      const tags = def.type === 'event' ? ['community', 'event']
                 : def.type === 'lost'  ? ['lost', 'pet']
                 : def.type === 'sell'  ? ['classifieds']
                 : def.type === 'safety' ? ['safety', 'alert']
                 : def.type === 'poll'  ? ['poll']
                 : def.type === 'sos'   ? ['urgent']
                 : ['update'];
      return prisma.postTag.createMany({ data: tags.map((t) => ({ postId: p.id, tag: t })), skipDuplicates: true });
    }),
  );
  console.log('  ✓  post tags');

  // ── 8. Comments (spread across many posts, natural replies) ─────────────
  const commentOn = (postIdx: number, author: string, body: string, hoursAgo = 1) =>
    prisma.comment.create({ data: { postId: posts[postIdx].id, authorId: byName(author).id, body, createdAt: ago(hoursAgo * 3600 * 1000) } });

  await Promise.all([
    commentOn(0, 'Priya Nair', 'Thanks for the heads up! Will store water tonight.', 20),
    commentOn(0, 'Ramesh Gupta', 'Is this for all towers or just A & B wing?', 19),
    commentOn(1, 'Vivek Sharma', 'Have reported this to the security office, they\'re increasing patrol rounds tonight.', 11),
    commentOn(3, 'Priya Nair', 'We\'ll bring a big pot of biryani!', 40),
    commentOn(4, 'Meera Iyer', 'Oh no, will keep an eye out on my evening walk', 6),
    commentOn(6, 'Suresh Nair', 'Nice, I have some old books I can bring too', 60),
    commentOn(9, 'Vikram Singh', 'Count me in, been meaning to start playing again', 100),
    commentOn(11, 'Amit Joshi', 'Happened to me too near the same spot, glad someone\'s raising it', 50),
    commentOn(14, 'Anil Patil', 'Left a note at the gate too just in case', 15),
    commentOn(19, 'Tanya Bose', 'This sounds lovely, we\'ll join!', 250),
    commentOn(30, 'Suresh Nair', 'That\'s scary, thanks for the warning', 700),
    commentOn(37, 'Vivek Sharma', 'So happy to see this update, was worried all day', 168),
    // Baner
    commentOn(38 + 2, 'Nikhil Oak', 'Wow that\'s a steal for a PS5 setup', 22),
    commentOn(38 + 4, 'Ananya Shah', 'Hope you find it, that\'s so stressful', 8),
    commentOn(38 + 7, 'Harshad Bhosale', 'Count me in for Holi!', 90),
    commentOn(38 + 14, 'Zoya Khan', 'So relieved for you, Tommy\'s a sweetheart', 12),
    commentOn(38 + 18, 'Kunal Chatterjee', 'Been meaning to check this cafe out, thanks!', 260),
    // Indiranagar
    commentOn(75 + 4, 'Vignesh Iyer', 'That\'s a great deal for the dining set', 68),
    commentOn(75 + 14, 'Anitha Suresh', 'Glad Simba\'s safe! Balconies are dangerous for cats here', 20),
    commentOn(75 + 33, 'Meghana Rao', 'On my way now, is she at the base of the stairs?', 204),
    commentOn(75 + 34, 'Naveen Kumar', 'Amazing news, glad it wasn\'t worse', 202),
  ]);
  console.log('  ✓  comments (varied, natural)');

  // ── 9. Reactions (spread across many posts) ──────────────────────────────
  const REACTION_KINDS = ['like', 'love', 'thanks', 'support', 'concern'] as const;
  const reactionJobs: Promise<unknown>[] = [];
  for (let i = 0; i < posts.length; i++) {
    const reactCount = Math.floor(Math.random() * 6); // 0-5 reactions per post
    const localityUsers = locUsers(ALL_POST_DEFS[i].loc);
    const reactors = [...localityUsers].sort(() => Math.random() - 0.5).slice(0, reactCount);
    for (const u of reactors) {
      const kind = REACTION_KINDS[Math.floor(Math.random() * REACTION_KINDS.length)];
      reactionJobs.push(
        prisma.reaction.upsert({
          where: { postId_userId: { postId: posts[i].id, userId: u.id } },
          update: {},
          create: { postId: posts[i].id, userId: u.id, kind },
        }),
      );
    }
  }
  await Promise.all(reactionJobs);
  console.log(`  ✓  reactions (${reactionJobs.length})`);

  // ── 10. reactionCount / commentCount denormalisation ─────────────────────
  for (const p of posts) {
    const [reactionCount, commentCount] = await Promise.all([
      prisma.reaction.count({ where: { postId: p.id } }),
      prisma.comment.count({ where: { postId: p.id } }),
    ]);
    await prisma.post.update({ where: { id: p.id }, data: { reactionCount, commentCount } });
  }
  console.log('  ✓  denormalised counts');

  // ── 11. Classifieds ───────────────────────────────────────────────────────
  const CLASSIFIED_DEFS = [
    { seller: 'Sunita Mehta', title: 'LG Washing Machine 6.5kg – Fully Automatic', desc: 'Used for 3 years, perfect working condition. Selling due to upgrade. Includes original warranty card.', price: 1200000, cond: 'used', cat: 'electronics', loc: 0 },
    { seller: 'Vivek Sharma', title: 'Wooden Study Table – 4ft', desc: 'Good quality teak wood study table with a drawer. Minor scratches but sturdy. Size: 4x2 ft.', price: 350000, cond: 'used', cat: 'furniture', loc: 0 },
    { seller: 'Priya Nair', title: 'Kids Bicycle – Age 6-9', desc: 'Hero Disney Princess bicycle, used for 1 year. Good condition, comes with training wheels.', price: 180000, cond: 'like_new', cat: 'sports', loc: 0 },
    { seller: 'Ramesh Gupta', title: 'Treadmill – Foldable', desc: 'Barely used, folds up nicely for storage. Max speed 12km/h.', price: 900000, cond: 'used', cat: 'sports', loc: 0 },
    { seller: 'Tanya Bose', title: 'Baby Stroller – Chicco', desc: 'Daughter has outgrown it. Smooth wheels, one-hand fold.', price: 350000, cond: 'used', cat: 'kids', loc: 0 },
    { seller: 'Amit Joshi', title: 'Study Chair (Ergonomic) x2', desc: 'WFH setup that never got used. Excellent lumbar support.', price: 180000, cond: 'like_new', cat: 'furniture', loc: 0 },
    { seller: 'Sanjay Verma', title: 'iPhone 12, 128GB', desc: 'Minor scratch on back, battery health 84%. Box + charger included.', price: 2200000, cond: 'used', cat: 'electronics', loc: 0 },
    { seller: 'Kavita Rao', title: 'Sewing Machine – Usha', desc: 'Barely 2 years old, extra bobbins and cover included.', price: 400000, cond: 'used', cat: 'other', loc: 0 },
    { seller: 'Rahul Kadam', title: 'PS5 + 2 Controllers + 3 Games', desc: 'Barely used. Kid lost interest fast.', price: 3200000, cond: 'like_new', cat: 'electronics', loc: 1 },
    { seller: 'Ananya Shah', title: 'Sofa Set (3+1+1) – Grey Fabric', desc: 'Moving to a smaller apartment. Very comfortable, no stains or tears.', price: 1500000, cond: 'used', cat: 'furniture', loc: 1 },
    { seller: 'Yash Trivedi', title: 'Gaming Chair', desc: 'Hardly used, adjustable armrests and recline.', price: 450000, cond: 'like_new', cat: 'furniture', loc: 1 },
    { seller: 'Yash Trivedi', title: '27" Monitor 144hz', desc: 'Mint condition, great for gaming or work.', price: 900000, cond: 'like_new', cat: 'electronics', loc: 1 },
    { seller: 'Devendra Thakur', title: 'Dining Chairs x4 (Wooden)', desc: 'No table, chairs only. Solid wood, good condition.', price: 250000, cond: 'used', cat: 'furniture', loc: 1 },
    { seller: 'Zoya Khan', title: 'Activa Scooter 2019', desc: '22k km, all papers clear, upgraded to EV. Will help with RC transfer.', price: 3800000, cond: 'used', cat: 'vehicles', loc: 1 },
    { seller: 'Prasad Naik', title: 'Pressure Washer', desc: 'Used exactly twice. Great for balcony/car cleaning.', price: 300000, cond: 'like_new', cat: 'other', loc: 1 },
    { seller: 'Farha Sheikh', title: 'Stand Mixer (KitchenAid style)', desc: 'One baking phase that didn\'t last. Barely used.', price: 650000, cond: 'like_new', cat: 'other', loc: 1 },
    { seller: 'Manoj Reddy', title: 'Acoustic Guitar – Yamaha F310', desc: 'Barely played, comes with a bag and a capo.', price: 550000, cond: 'like_new', cat: 'other', loc: 2 },
    { seller: 'Chaitra Gowda', title: 'Dining Set (4 seater) + TV Unit', desc: 'Moving sale, good condition, reasonable price for both.', price: 800000, cond: 'used', cat: 'furniture', loc: 2 },
    { seller: 'Naveen Kumar', title: 'Air Fryer – Philips 4.1L', desc: 'Got a bigger one as a gift, this one barely used.', price: 400000, cond: 'like_new', cat: 'electronics', loc: 2 },
    { seller: 'Sharath Kumar', title: 'Road Bike – Btwin (Size M)', desc: 'Recently serviced, good condition, ready to ride.', price: 800000, cond: 'used', cat: 'sports', loc: 2 },
    { seller: 'Vignesh Iyer', title: 'Office Chair – Green Soul', desc: 'Ergonomic, used about a year, still very comfortable.', price: 500000, cond: 'used', cat: 'furniture', loc: 2 },
    { seller: 'Sowmya Bhat', title: 'Yoga Mat + Block Set + Bands', desc: 'Barely used bundle, great starter kit.', price: 100000, cond: 'like_new', cat: 'sports', loc: 2 },
    { seller: 'Girish Pai', title: 'Mixer Grinder', desc: 'Upgraded to a bigger one, this works perfectly.', price: 180000, cond: 'used', cat: 'electronics', loc: 2 },
    { seller: 'Preethi Achar', title: 'Bookshelf – 5 tier', desc: 'Solid wood, moving out sale.', price: 220000, cond: 'used', cat: 'furniture', loc: 2 },
  ] as const;

  const classifieds = await Promise.all(
    CLASSIFIED_DEFS.map((c) => {
      const l = LOCALITIES[c.loc];
      return prisma.classified.create({
        data: {
          sellerId: byName(c.seller).id, title: c.title, description: c.desc, pricePaise: c.price,
          condition: c.cond, category: c.cat, pinCode: l.pinCode,
          visibility: Math.random() > 0.5 ? 'neighborhood' : 'society', status: 'active',
          expiresAt: fromNow(30 * DAY),
        },
      });
    }),
  );
  console.log(`  ✓  ${classifieds.length} classifieds`);

  // ── 12. Classified Photos ─────────────────────────────────────────────────
  await Promise.all(
    classifieds.map((c) =>
      prisma.classifiedPhoto.createMany({
        data: [
          { classifiedId: c.id, storageKey: photo(photoSeed++), orderIndex: 0 },
          { classifiedId: c.id, storageKey: photo(photoSeed++), orderIndex: 1 },
        ],
      }),
    ),
  );
  console.log('  ✓  classified photos');

  // ── 13. Carpool Trips ──────────────────────────────────────────────────────
  const CARPOOL_DEFS = [
    { driver: 'Vivek Sharma', from: 'Kumar Sienna, Hadapsar', to: 'Magarpatta Cybercity', seats: 3, left: 2, price: 3000, loc: 0 },
    { driver: 'Anil Patil', from: 'Nyati Unitree, Undri', to: 'Hinjewadi IT Park Phase 1', seats: 4, left: 3, price: 8000, loc: 0 },
    { driver: 'Ramesh Gupta', from: 'Amanora Park, Hadapsar', to: 'Koregaon Park', seats: 3, left: 1, price: 4500, loc: 0 },
    { driver: 'Kunal Chatterjee', from: 'Baner Road', to: 'Hinjewadi Phase 2', seats: 4, left: 2, price: 6000, loc: 1 },
    { driver: 'Rahul Kadam', from: 'Balewadi High Street', to: 'Pune Airport', seats: 3, left: 3, price: 5000, loc: 1 },
    { driver: 'Devendra Thakur', from: 'Baner', to: 'Deccan Gymkhana', seats: 4, left: 1, price: 3500, loc: 1 },
    { driver: 'Sharath Kumar', from: 'Indiranagar 100ft Road', to: 'Electronic City', seats: 4, left: 2, price: 9000, loc: 2 },
    { driver: 'Manoj Reddy', from: 'Indiranagar', to: 'Whitefield', seats: 3, left: 2, price: 8500, loc: 2 },
    { driver: 'Deepak Shetty', from: 'CMH Road', to: 'Kempegowda Airport', seats: 4, left: 3, price: 12000, loc: 2 },
  ] as const;

  const carpoolTrips = await Promise.all(
    CARPOOL_DEFS.map((c, i) => {
      const l = LOCALITIES[c.loc];
      return prisma.carpoolTrip.create({
        data: {
          driverId: byName(c.driver).id, fromLabel: c.from, toLabel: c.to,
          fromLat: l.lat, fromLng: l.lng, toLat: l.lat + 0.03, toLng: l.lng + 0.03,
          departureAt: fromNow((2 + i * 3) * 3600 * 1000), seatsTotal: c.seats, seatsLeft: c.left,
          pricePaise: c.price, pinCode: l.pinCode, status: 'open',
        },
      });
    }),
  );
  console.log(`  ✓  ${carpoolTrips.length} carpool trips`);

  // ── 14. Group Buys ─────────────────────────────────────────────────────────
  const GROUPBUY_DEFS = [
    { organizer: 'Priya Nair', title: 'Organic Vegetables Box – Weekly', desc: 'Fresh organic vegetables sourced directly from farmers. Box includes 5kg assorted seasonal veggies.', price: 49900, market: 65000, unit: 'box', target: 20, current: 12, min: 15, loc: 0 },
    { organizer: 'Vivek Sharma', title: 'Water Purifier – Aquaguard Enova RO', desc: 'Group purchase of Aquaguard Enova RO+UV+UF. Retail ₹18,499 — Group price ₹14,999. Delivery + installation included.', price: 1499900, market: 1849900, unit: 'unit', target: 10, current: 7, min: 8, loc: 0 },
    { organizer: 'Sunita Mehta', title: 'Premium Cashews 1kg – Dry Fruits Wholesale', desc: 'W320 grade premium cashews sourced directly from Goa. Bulk buy of min 15 units.', price: 85000, market: 110000, unit: 'kg', target: 30, current: 24, min: 15, loc: 0 },
    { organizer: 'Ananya Shah', title: 'Modular Kitchen Hardware – Bulk Discount', desc: 'Soft-close hinges + channels, sourced directly from the manufacturer. Min 10 sets.', price: 250000, market: 340000, unit: 'set', target: 15, current: 6, min: 10, loc: 1 },
    { organizer: 'Swati Pawar', title: 'Filtered Drinking Water Cans – Monthly', desc: '20L cans, RO+UV filtered, delivered weekly. Group rate for 15+ subscribers.', price: 15000, market: 22000, unit: 'month', target: 25, current: 18, min: 15, loc: 1 },
    { organizer: 'Leela Ramesh', title: 'Yoga Mats – Bulk Order', desc: 'Premium 6mm mats, group rate for the building fitness group.', price: 60000, market: 90000, unit: 'unit', target: 20, current: 9, min: 10, loc: 1 },
    { organizer: 'Lakshmi Venkat', title: 'Rice & Pulses Combo – Wholesale', desc: 'Sona masoori rice 10kg + toor dal 2kg + moong dal 2kg. Sourced direct from FPO.', price: 180000, market: 230000, unit: 'combo', target: 25, current: 14, min: 12, loc: 2 },
    { organizer: 'Chaitra Gowda', title: 'Pest Control – Building-wide Discount', desc: 'Group booking rate for whole-building pest treatment, valid this month only.', price: 120000, market: 180000, unit: 'flat', target: 15, current: 8, min: 8, loc: 2 },
    { organizer: 'Preethi Achar', title: 'Laundry Detergent – Bulk 5kg Packs', desc: 'Eco-friendly detergent, bulk rate for 5kg packs.', price: 60000, market: 85000, unit: 'pack', target: 20, current: 11, min: 10, loc: 2 },
  ] as const;

  const groupBuys = await Promise.all(
    GROUPBUY_DEFS.map((g) => {
      const l = LOCALITIES[g.loc];
      return prisma.groupBuy.create({
        data: {
          organizerId: byName(g.organizer).id, title: g.title, description: g.desc, pricePaise: g.price,
          marketPricePaise: g.market, unit: g.unit, targetQty: g.target, currentQty: g.current, minQty: g.min,
          pinCode: l.pinCode, closesAt: fromNow((3 + Math.random() * 10) * DAY), status: 'open',
        },
      });
    }),
  );
  console.log(`  ✓  ${groupBuys.length} group buys`);

  // ── 15. Group Buy Commits ────────────────────────────────────────────────
  for (const gb of groupBuys) {
    const loc = GROUPBUY_DEFS.find((g) => g.title === gb.title)!.loc;
    const participants = locUsers(loc).filter((u) => u.id !== gb.organizerId).sort(() => Math.random() - 0.5).slice(0, 4);
    let cumQty = 0;
    for (const u of participants) {
      const qty = Math.max(1, Math.floor(gb.minQty / 3));
      cumQty += qty;
      await prisma.groupBuyCommit.upsert({
        where: { groupBuyId_userId: { groupBuyId: gb.id, userId: u.id } },
        update: {},
        create: { groupBuyId: gb.id, userId: u.id, quantity: qty, totalPaise: qty * gb.pricePaise, status: 'committed' },
      });
    }
  }
  console.log('  ✓  group buy commits');

  // ── 16. Carpool Joins ─────────────────────────────────────────────────────
  for (let i = 0; i < carpoolTrips.length; i++) {
    const loc = CARPOOL_DEFS[i].loc;
    const passenger = locUsers(loc).find((u) => u.id !== carpoolTrips[i].driverId);
    if (passenger) {
      await prisma.carpoolJoin.upsert({
        where: { tripId_passengerId: { tripId: carpoolTrips[i].id, passengerId: passenger.id } },
        update: {},
        create: { tripId: carpoolTrips[i].id, passengerId: passenger.id, seats: 1, status: 'confirmed', message: 'Will be at the gate 5 mins early' },
      });
    }
  }
  console.log('  ✓  carpool joins');

  // ── 17. Communities ────────────────────────────────────────────────────────
  const COMMUNITY_DEFS = [
    { name: 'Kumar Sienna Residents', desc: 'Community for residents of Kumar Sienna, Hadapsar — announcements, events, everyday chatter.', type: 'interest', creator: 'Vivek Sharma', members: 145, policy: 'invite_only', loc: 0 },
    { name: 'Hadapsar Pet Lovers', desc: 'For all pet owners in Hadapsar. Share tips, find vets, arrange playdates!', type: 'pets', creator: 'Priya Nair', members: 38, policy: 'open', loc: 0 },
    { name: 'Hadapsar Parents Network', desc: 'Connect with other parents in the neighbourhood for school tips, carpools, playdates & more.', type: 'parenting', creator: 'Sunita Mehta', members: 67, policy: 'open', loc: 0 },
    { name: 'Baner Runners & Cyclists', desc: 'Weekend running and cycling groups, all paces welcome.', type: 'activity', creator: 'Swati Pawar', members: 54, policy: 'open', loc: 1 },
    { name: 'Baner Book Club', desc: 'Monthly book discussions, rotating houses. New members always welcome.', type: 'interest', creator: 'Ishita Bhatt', members: 22, policy: 'request', loc: 1 },
    { name: 'Baner Home Chefs & Bakers', desc: 'Share recipes, sell homemade food, swap kitchen tips.', type: 'interest', creator: 'Farha Sheikh', members: 46, policy: 'open', loc: 1 },
    { name: 'Indiranagar Foodies', desc: 'Best new restaurants, hidden gems, and honest reviews from actual residents.', type: 'interest', creator: 'Manoj Reddy', members: 88, policy: 'open', loc: 2 },
    { name: 'Indiranagar Pet Parents', desc: 'For cat and dog owners in the area — vet recos, playdates, lost & found.', type: 'pets', creator: 'Girish Pai', members: 41, policy: 'open', loc: 2 },
    { name: 'Indiranagar Working Professionals', desc: 'Networking, carpooling to tech parks, and general professional chatter.', type: 'professional', creator: 'Sharath Kumar', members: 63, policy: 'request', loc: 2 },
  ] as const;

  const communities = await Promise.all(
    COMMUNITY_DEFS.map((c) => {
      const l = LOCALITIES[c.loc];
      return prisma.community.create({
        data: {
          name: c.name, description: c.desc, type: c.type, pinCode: l.pinCode,
          creatorId: byName(c.creator).id, memberCount: c.members, joinPolicy: c.policy,
        },
      });
    }),
  );
  console.log(`  ✓  ${communities.length} communities`);

  // ── 18. Community Members ────────────────────────────────────────────────
  const memberJobs: Promise<unknown>[] = [];
  communities.forEach((community, i) => {
    const loc = COMMUNITY_DEFS[i].loc;
    const creator = byName(COMMUNITY_DEFS[i].creator);
    memberJobs.push(
      prisma.communityMember.upsert({
        where: { communityId_userId: { communityId: community.id, userId: creator.id } },
        update: {}, create: { communityId: community.id, userId: creator.id, role: 'admin' },
      }),
    );
    const members = locUsers(loc).filter((u) => u.id !== creator.id).sort(() => Math.random() - 0.5).slice(0, 4);
    for (const m of members) {
      memberJobs.push(
        prisma.communityMember.upsert({
          where: { communityId_userId: { communityId: community.id, userId: m.id } },
          update: {}, create: { communityId: community.id, userId: m.id, role: 'member' },
        }),
      );
    }
  });
  await Promise.all(memberJobs);
  console.log('  ✓  community members');

  // ── 19. Wallet Entries ────────────────────────────────────────────────────
  const walletJobs: Promise<unknown>[] = [];
  for (const u of users) {
    const n = Math.floor(Math.random() * 3); // 0-2 entries per user
    for (let k = 0; k < n; k++) {
      const kinds: { type: 'earn' | 'spend' | 'topup' | 'payout' | 'refund' | 'hold' | 'release'; amt: number; desc: string }[] = [
        { type: 'earn', amt: 30000 + Math.floor(Math.random() * 200000), desc: 'Order payout' },
        { type: 'spend', amt: 5000 + Math.floor(Math.random() * 50000), desc: 'Service booking' },
        { type: 'topup', amt: 50000, desc: 'Wallet top-up' },
        { type: 'earn', amt: 5000, desc: 'Referral bonus' },
      ];
      const pick = kinds[Math.floor(Math.random() * kinds.length)];
      walletJobs.push(prisma.walletEntry.create({ data: { userId: u.id, type: pick.type, amountPaise: pick.amt, description: pick.desc } }));
    }
  }
  await Promise.all(walletJobs);
  console.log(`  ✓  ${walletJobs.length} wallet entries`);

  // ── 20. Referral Records ──────────────────────────────────────────────────
  const referralJobs: Promise<unknown>[] = [];
  for (let loc = 0; loc < LOCALITIES.length; loc++) {
    const pool = locUsers(loc);
    for (let i = 0; i < 5 && i + 1 < pool.length; i++) {
      referralJobs.push(
        prisma.referralRecord.create({
          data: { referrerId: pool[i].id, refereeId: pool[i + 1].id, creditPaise: 5000, creditedAt: ago(Math.random() * 20 * DAY) },
        }),
      );
    }
  }
  await Promise.all(referralJobs);
  console.log(`  ✓  ${referralJobs.length} referral records`);

  // ── 21. Orders + Ratings ──────────────────────────────────────────────────
  const ORDER_DEFS = [
    { buyer: 'Vivek Sharma', seller: 'Sunita Mehta', title: 'Part-time Maid Service – 1 month', price: 250000 },
    { buyer: 'Priya Nair', seller: 'Deepa Krishnan', title: 'Tiffin Subscription – 1 month', price: 300000 },
    { buyer: 'Ramesh Gupta', seller: 'Anil Patil', title: 'AC Servicing – 2 units', price: 70000 },
    { buyer: 'Neha Kulkarni', seller: 'Kavita Rao', title: 'Bridal Facial + Makeup Trial', price: 300000 },
    { buyer: 'Kunal Chatterjee', seller: 'Swati Pawar', title: 'Bathroom Leak Repair', price: 50000 },
    { buyer: 'Ishita Bhatt', seller: 'Ananya Shah', title: 'Wardrobe Fitting', price: 1800000 },
    { buyer: 'Rahul Kadam', seller: 'Farha Sheikh', title: 'Tiffin Subscription – 2 weeks', price: 150000 },
    { buyer: 'Nikhil Oak', seller: 'Leela Ramesh', title: 'Personal Training – 10 sessions', price: 500000 },
    { buyer: 'Sharath Kumar', seller: 'Lakshmi Venkat', title: 'Weekly Grocery Box', price: 120000 },
    { buyer: 'Divya Prasad', seller: 'Chaitra Gowda', title: 'Pest Control – Full Flat', price: 180000 },
    { buyer: 'Manoj Reddy', seller: 'Preethi Achar', title: 'Laundry Service – 1 month', price: 90000 },
    { buyer: 'Arvind Rao', seller: 'Ravi Shankar', title: 'Birthday Photoshoot', price: 500000 },
  ] as const;
  const RATING_REVIEWS = [
    'Excellent service! Very punctual and thorough.',
    'Good work overall, would book again.',
    'Really happy with the quality, highly recommend.',
    'Professional and courteous, fair pricing.',
    'Did the job well, slightly delayed but worth the wait.',
    'Above expectations, will definitely reuse this service.',
  ];
  for (const o of ORDER_DEFS) {
    const buyer = byName(o.buyer);
    const buyerLoc = LOCALITIES[USER_DEFS[users.indexOf(buyer)].loc];
    const order = await prisma.order.create({
      data: {
        buyerId: buyer.id, sellerId: byName(o.seller).id, title: o.title, pricePaise: o.price,
        quantity: 1, status: 'completed', pinCode: buyerLoc.pinCode,
        completedAt: ago(Math.random() * 15 * DAY),
      },
    });
    await prisma.rating.create({
      data: {
        orderId: order.id, raterId: buyer.id, rateeId: byName(o.seller).id,
        score: 4 + Math.round(Math.random()), review: RATING_REVIEWS[Math.floor(Math.random() * RATING_REVIEWS.length)],
      },
    });
  }
  console.log(`  ✓  ${ORDER_DEFS.length} orders + ratings`);

  // ── 22. Push Token (test account) ─────────────────────────────────────────
  await prisma.pushToken.upsert({
    where: { token: 'ExponentPushToken[demo-dev-token]' },
    update: {}, create: { userId: byName('Vivek Sharma').id, token: 'ExponentPushToken[demo-dev-token]', platform: 'ios' },
  });
  console.log('  ✓  push token');

  // ── 23. Event RSVPs (for every event-type post) ──────────────────────────
  const rsvpJobs: Promise<unknown>[] = [];
  posts.forEach((p, i) => {
    if (ALL_POST_DEFS[i].def.type !== 'event') return;
    const loc = ALL_POST_DEFS[i].loc;
    const attendees = locUsers(loc).sort(() => Math.random() - 0.5).slice(0, 5);
    attendees.forEach((u) => {
      const status = Math.random() > 0.75 ? 'maybe' : Math.random() > 0.1 ? 'yes' : 'no';
      rsvpJobs.push(
        prisma.eventRsvp.upsert({
          where: { postId_userId: { postId: p.id, userId: u.id } }, update: {},
          create: { postId: p.id, userId: u.id, status },
        }),
      );
    });
  });
  await Promise.all(rsvpJobs);
  console.log(`  ✓  ${rsvpJobs.length} event RSVPs`);

  // ── 24. Service Slots (next 7 days × 4 slots per merchant) ────────────────
  const slotsData: { merchantId: string; date: string; startTime: string; endTime: string; capacity: number; booked: number }[] = [];
  const today = new Date();
  for (const m of merchants) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + dayOffset);
      const dateStr = d.toISOString().slice(0, 10);
      ['09:00', '11:00', '14:00', '16:00'].forEach((startTime) => {
        const [h, mm] = startTime.split(':').map(Number);
        const endTime = `${String(h + 1).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        slotsData.push({ merchantId: m.id, date: dateStr, startTime, endTime, capacity: 2, booked: 0 });
      });
    }
  }
  await prisma.serviceSlot.createMany({ data: slotsData, skipDuplicates: true });
  console.log(`  ✓  ${slotsData.length} service slots`);

  // ── 25. Appointments ───────────────────────────────────────────────────────
  const apptMerchant = merchants[0];
  const apptSlot = await prisma.serviceSlot.findFirst({ where: { merchantId: apptMerchant.id, date: today.toISOString().slice(0, 10) } });
  if (apptSlot) {
    await prisma.appointment.create({
      data: {
        userId: byName('Vivek Sharma').id, merchantId: apptMerchant.id, slotId: apptSlot.id,
        serviceLabel: 'Deep cleaning – 2BHK', scheduledAt: new Date(`${apptSlot.date}T${apptSlot.startTime}:00`),
        status: 'confirmed', notesForMerchant: 'Please bring eco-friendly cleaning supplies',
      },
    });
  }
  await prisma.appointment.create({
    data: {
      userId: byName('Priya Nair').id, merchantId: merchants[2].id, serviceLabel: 'Kitchen sink leak fix',
      scheduledAt: ago(2 * DAY), status: 'completed', notesForMerchant: 'Leak under the main basin tap',
    },
  });
  console.log('  ✓  appointments');

  // ── 26. Quote Requests ─────────────────────────────────────────────────────
  await prisma.quoteRequest.create({
    data: {
      userId: byName('Vivek Sharma').id, merchantId: merchants[2].id,
      serviceDescription: 'Need AC servicing for two 1.5T split units. When can you visit and what would it cost?',
      budgetPaise: 200000, status: 'quoted',
      merchantReply: 'I can visit this Saturday morning. ₹1,500 total for both units including gas top-up if needed.',
      quotedPaise: 150000, repliedAt: ago(3 * 3600 * 1000),
    },
  });
  console.log('  ✓  quote request');

  // ── 27. Chat Threads + Memberships + Messages ────────────────────────────
  async function createDm(a: string, b: string, messages: { from: string; body: string; hoursAgo: number }[]) {
    const userA = byName(a), userB = byName(b);
    const thread = await prisma.chatThread.create({
      data: {
        type: 'dm', createdById: userA.id, lastMessageAt: new Date(),
        memberships: { create: [{ userId: userA.id, lastReadAt: new Date() }, { userId: userB.id, lastReadAt: ago(3600 * 1000) }] },
      },
    });
    await prisma.chatMessage.createMany({
      data: messages.map((m) => ({ threadId: thread.id, senderId: byName(m.from).id, body: m.body, kind: 'text', createdAt: ago(m.hoursAgo * 3600 * 1000) })),
    });
    return thread;
  }

  async function createCommunityThread(communityIdx: number, name: string, creator: string, members: string[], messages: { from: string; body: string; hoursAgo: number }[]) {
    const community = communities[communityIdx];
    const thread = await prisma.chatThread.create({
      data: {
        type: 'community', name, communityId: community.id, createdById: byName(creator).id, lastMessageAt: new Date(),
        memberships: { create: members.map((m) => ({ userId: byName(m).id, lastReadAt: ago(Math.random() * 6 * 3600 * 1000) })) },
      },
    });
    await prisma.chatMessage.createMany({
      data: messages.map((m) => ({ threadId: thread.id, senderId: byName(m.from).id, body: m.body, kind: 'text', createdAt: ago(m.hoursAgo * 3600 * 1000) })),
    });
    return thread;
  }

  await createDm('Vivek Sharma', 'Priya Nair', [
    { from: 'Priya Nair', body: 'Hey! Are you coming to the potluck on Sunday?', hoursAgo: 2 },
    { from: 'Vivek Sharma', body: 'Yes definitely! Need any help with setup?', hoursAgo: 1.5 },
    { from: 'Priya Nair', body: 'That would be amazing, can you come by 4pm?', hoursAgo: 1 },
    { from: 'Vivek Sharma', body: 'Done, see you then!', hoursAgo: 0.5 },
  ]);
  await createDm('Anil Patil', 'Deepa Krishnan', [
    { from: 'Anil Patil', body: 'Is the tiffin service still taking new subscriptions this month?', hoursAgo: 5 },
    { from: 'Deepa Krishnan', body: 'Yes! One spot left for the north Indian batch actually.', hoursAgo: 4 },
    { from: 'Anil Patil', body: 'Perfect, sign me up please', hoursAgo: 3 },
  ]);
  await createDm('Ishita Bhatt', 'Ananya Shah', [
    { from: 'Ishita Bhatt', body: 'Loved the wardrobe work, sending a couple more friends your way', hoursAgo: 30 },
    { from: 'Ananya Shah', body: 'Thank you so much, means a lot!', hoursAgo: 28 },
  ]);
  await createDm('Divya Prasad', 'Chaitra Gowda', [
    { from: 'Divya Prasad', body: 'The pest control team was great, very thorough', hoursAgo: 50 },
    { from: 'Chaitra Gowda', body: 'So glad to hear it! Let me know if anything comes back up within warranty', hoursAgo: 48 },
  ]);

  await createCommunityThread(1, 'Hadapsar Pet Lovers', 'Priya Nair', ['Priya Nair', 'Anil Patil', 'Vivek Sharma'], [
    { from: 'Anil Patil', body: 'Anyone know a good vet near Hadapsar gaon? My lab needs vaccinations.', hoursAgo: 5 },
    { from: 'Priya Nair', body: 'Dr Patwardhan on Magarpatta road is excellent, open till 9pm.', hoursAgo: 4 },
    { from: 'Vivek Sharma', body: 'Also playdate at the central park this Sunday 5pm — anyone bringing dogs?', hoursAgo: 1 },
  ]);
  await createCommunityThread(3, 'Baner Runners & Cyclists', 'Swati Pawar', ['Swati Pawar', 'Nikhil Oak', 'Kunal Chatterjee'], [
    { from: 'Swati Pawar', body: 'Meeting point tomorrow is the usual junction, 6:30am sharp', hoursAgo: 10 },
    { from: 'Nikhil Oak', body: 'I\'ll be 5 mins late, save me a spot at the back 😅', hoursAgo: 9 },
    { from: 'Kunal Chatterjee', body: 'No worries, we\'ll wait at the first stop', hoursAgo: 8 },
  ]);
  await createCommunityThread(7, 'Indiranagar Pet Parents', 'Girish Pai', ['Girish Pai', 'Meghana Rao', 'Anitha Suresh'], [
    { from: 'Girish Pai', body: 'Simba\'s doing much better after the vet visit, thanks for the recommendation', hoursAgo: 15 },
    { from: 'Meghana Rao', body: 'So glad! Balconies are risky for cats around here, we added extra mesh after a scare too', hoursAgo: 14 },
    { from: 'Anitha Suresh', body: 'Good idea, will do the same this weekend', hoursAgo: 13 },
  ]);
  console.log('  ✓  chat threads + messages (4 DMs, 3 community)');

  // ── 28. Stories (5 per locality, expiring in 24h) ────────────────────────
  const STORY_DEFS = [
    { author: 'Priya Nair', caption: 'Rangoli prep for the weekend! 🪔', loc: 0 },
    { author: 'Deepa Krishnan', caption: 'Today\'s special — pongal & gunpowder chutney', loc: 0 },
    { author: 'Sunita Mehta', caption: 'Team morning huddle 💪', loc: 0 },
    { author: 'Kavita Rao', caption: 'New nail art designs in stock!', loc: 0 },
    { author: 'Rohit Deshmukh', caption: 'Sunday badminton crew 🏸', loc: 0 },
    { author: 'Swati Pawar', caption: 'Fixed a tricky leak today, satisfying work', loc: 1 },
    { author: 'Ananya Shah', caption: 'Fresh teak delivery for this week\'s orders', loc: 1 },
    { author: 'Leela Ramesh', caption: 'Sunrise yoga session 🧘', loc: 1 },
    { author: 'Farha Sheikh', caption: 'Weekend biryani prep', loc: 1 },
    { author: 'Ishita Bhatt', caption: 'This month\'s book club pick 📚', loc: 1 },
    { author: 'Lakshmi Venkat', caption: 'Fresh veggies just arrived!', loc: 2 },
    { author: 'Chaitra Gowda', caption: 'Eco-friendly pest control in action', loc: 2 },
    { author: 'Ravi Shankar', caption: 'Golden hour shoot from yesterday 📸', loc: 2 },
    { author: 'Preethi Achar', caption: 'Fresh laundry, ready for delivery', loc: 2 },
    { author: 'Divya Prasad', caption: 'Lake view on today\'s run 🏞️', loc: 2 },
  ] as const;
  const stories = await Promise.all(
    STORY_DEFS.map((s) => {
      const l = LOCALITIES[s.loc];
      return prisma.story.create({
        data: { authorId: byName(s.author).id, mediaKey: photo(photoSeed++), kind: 'image', caption: s.caption, pinCode: l.pinCode, viewCount: 3 + Math.floor(Math.random() * 40), expiresAt: fromNow(24 * 3600 * 1000) },
      });
    }),
  );
  await Promise.all(
    stories.flatMap((s, i) => {
      const loc = STORY_DEFS[i].loc;
      const viewers = locUsers(loc).sort(() => Math.random() - 0.5).slice(0, 3);
      return viewers.map((v) => prisma.storyView.create({ data: { storyId: s.id, viewerId: v.id } }).catch(() => null));
    }),
  );
  console.log(`  ✓  ${stories.length} stories`);

  // ── 29. SOS Incidents + Responders ────────────────────────────────────────
  const SOS_DEFS = [
    { author: 'Anil Patil', category: 'medical', severity: 'high', body: 'My father (78) has chest pain — need someone with a car ASAP to reach Ruby Hall', loc: 0 },
    { author: 'Meera Iyer', category: 'fire', severity: 'medium', body: 'Small electrical short in the meter room, sparks visible — building electrician on the way but flagging in case', loc: 0 },
    { author: 'Zoya Khan', category: 'security', severity: 'medium', body: 'Two unfamiliar men loitering near the children\'s play area for the last 20 minutes, seems off', loc: 1 },
    { author: 'Devendra Thakur', category: 'medical', severity: 'high', body: 'Elderly neighbour has fallen and can\'t get up, conscious but in pain — need help getting her to a hospital', loc: 1 },
    { author: 'Sharath Kumar', category: 'medical', severity: 'high', body: 'Neighbour slipped on the stairs, can\'t put weight on her ankle — need a car urgently', loc: 2 },
    { author: 'Ashwini Hegde', category: 'security', severity: 'low', body: 'Suspicious parked van outside the gate for over an hour, no one\'s come to check on it', loc: 2 },
  ] as const;
  const sosIncidents = await Promise.all(
    SOS_DEFS.map((s) => {
      const l = LOCALITIES[s.loc];
      const notifyPool = locUsers(s.loc).filter((u) => u.id !== byName(s.author).id).slice(0, 4).map((u) => u.id);
      return prisma.sosIncident.create({
        data: {
          authorId: byName(s.author).id, pinCode: l.pinCode, category: s.category, severity: s.severity,
          body: s.body, status: 'ack', lat: l.lat, lng: l.lng, escalationLevel: 1, notifiedUserIds: notifyPool,
        },
      });
    }),
  );
  await Promise.all(
    sosIncidents.map((s, i) => {
      const responder = locUsers(SOS_DEFS[i].loc).find((u) => u.id !== s.authorId);
      return responder ? prisma.sosResponder.create({ data: { incidentId: s.id, userId: responder.id, respondedAt: ago(5 * 60 * 1000) } }) : Promise.resolve();
    }),
  );
  console.log(`  ✓  ${sosIncidents.length} SOS incidents + responders`);

  // ── 30. Safety: Contacts, Medical Profiles, Volunteers ───────────────────
  const contactJobs: Promise<unknown>[] = [];
  for (const loc of [0, 1, 2]) {
    const pool = locUsers(loc).slice(0, 6);
    pool.forEach((u, i) => {
      contactJobs.push(prisma.safetyContact.create({ data: { userId: u.id, name: i % 2 === 0 ? 'Mom' : 'Spouse', phone: `+9198765${String(10000 + loc * 100 + i).slice(-5)}`, relation: i % 2 === 0 ? 'mother' : 'spouse' } }));
    });
  }
  await Promise.all(contactJobs);

  const medicalPool = [byName('Vivek Sharma'), byName('Priya Nair'), byName('Kunal Chatterjee'), byName('Ishita Bhatt'), byName('Sharath Kumar'), byName('Divya Prasad')];
  await Promise.all(
    medicalPool.map((u) =>
      prisma.medicalProfile.upsert({
        where: { userId: u.id }, update: {},
        create: { userId: u.id, bloodGroup: 'O+', allergies: ['penicillin'], conditions: [], medications: [], emergencyNote: 'No major conditions on file.', doctorPhone: '+912012345678' },
      }),
    ),
  );

  const volunteerPool = [byName('Ramesh Gupta'), byName('Vivek Sharma'), byName('Devendra Thakur'), byName('Leela Ramesh'), byName('Deepak Shetty'), byName('Anitha Suresh')];
  await Promise.all(
    volunteerPool.map((u, i) => {
      const loc = USER_DEFS[users.indexOf(u)].loc;
      return prisma.volunteer.upsert({
        where: { userId: u.id }, update: {},
        create: { userId: u.id, skills: i % 2 === 0 ? ['driving', 'first_aid'] : ['tech_help', 'driving'], pinCode: LOCALITIES[loc].pinCode, active: true },
      });
    }),
  );
  console.log('  ✓  safety contacts, medical profiles, volunteers');

  // ── 31. Locality News ──────────────────────────────────────────────────────
  const NEWS_DEFS = [
    { loc: 0, headline: 'Water supply disruption in Hadapsar tomorrow 9am–2pm', summary: 'PMC has announced scheduled maintenance affecting parts of Hadapsar and Magarpatta.', source: 'PMC Notice', category: 'civic', alert: true },
    { loc: 0, headline: 'New metro station opening at Hadapsar by December', summary: 'Pune Metro Line 1 extension is on track for a December opening.', source: 'Pune Mirror', category: 'transport', alert: false },
    { loc: 0, headline: 'Diwali fireworks safety advisory', summary: 'Police request residents avoid bursting crackers after 10pm.', source: 'Hadapsar Police', category: 'safety', alert: false },
    { loc: 1, headline: 'Baner-Pashan link road resurfacing this week', summary: 'PMC to resurface the stretch, expect diversions during work hours.', source: 'PMC Notice', category: 'civic', alert: true },
    { loc: 1, headline: 'New IT park approved near Baner', summary: 'Local authorities cleared a new commercial development, expected to add traffic in 2 years.', source: 'Pune Times', category: 'civic', alert: false },
    { loc: 1, headline: 'Heavy rain alert for Pune this weekend', summary: 'IMD forecasts heavy rainfall, residents advised to avoid low-lying areas.', source: 'IMD', category: 'weather', alert: true },
    { loc: 2, headline: 'Metro Purple Line extension nears completion near Indiranagar', summary: 'BMRCL says testing is underway, operational in coming months.', source: 'Deccan Herald', category: 'transport', alert: false },
    { loc: 2, headline: 'BWSSB water tanker schedule for this week', summary: 'Scheduled tanker supply due to ongoing pipeline work in the ward.', source: 'BWSSB', category: 'civic', alert: true },
    { loc: 2, headline: 'Traffic diversion near 100 Feet Road this weekend', summary: 'Police have announced a diversion for a marathon event Sunday morning.', source: 'Bangalore Traffic Police', category: 'transport', alert: false },
  ] as const;
  await prisma.localityNews.createMany({
    data: NEWS_DEFS.map((n, i) => {
      const l = LOCALITIES[n.loc];
      return {
        pinCode: l.pinCode, city: l.city, headline: n.headline, summary: n.summary, sourceName: n.source,
        sourceUrl: `https://example.com/news-${i}`, category: n.category, lang: 'en', isAlert: n.alert,
        publishedAt: ago(Math.random() * 24 * 3600 * 1000), expiresAt: fromNow((n.alert ? 2 : 7) * DAY),
      };
    }),
    skipDuplicates: true,
  });
  console.log(`  ✓  ${NEWS_DEFS.length} locality news items`);

  // ── 32. Feature Flags ──────────────────────────────────────────────────────
  await prisma.featureFlag.createMany({
    data: [
      // Core features (enabled by default for Phase 1 launch)
      { key: 'feed', enabled: true, scope: 'global', scopeValue: null, description: 'Home feed with neighborhood posts' },
      { key: 'services', enabled: true, scope: 'global', scopeValue: null, description: 'Peer services marketplace (Cook/Handyman/Tutor)' },
      { key: 'wallet', enabled: true, scope: 'global', scopeValue: null, description: 'Wallet and payments via Razorpay' },
      { key: 'classifieds', enabled: true, scope: 'global', scopeValue: null, description: 'Buy/Sell/Rent listings' },
      { key: 'events', enabled: true, scope: 'global', scopeValue: null, description: 'Community events and RSVP' },
      { key: 'lost_found', enabled: true, scope: 'global', scopeValue: null, description: 'Lost & Found items/pets' },
      { key: 'safety_contacts', enabled: true, scope: 'global', scopeValue: null, description: 'Add safety contacts (limited SOS)' },
      { key: 'shop_directory', enabled: true, scope: 'global', scopeValue: null, description: 'Local shops directory (call to order)' },
      
      // Phase 2+ features (disabled by default - hide until validated)
      { key: 'telemedicine', enabled: false, scope: 'global', scopeValue: null, description: 'Doctor consultations (needs verification, legal compliance)' },
      { key: 'insurance', enabled: false, scope: 'global', scopeValue: null, description: 'Insurance marketplace (needs IRDAI license)' },
      { key: 'carpool', enabled: false, scope: 'global', scopeValue: null, description: 'Ride sharing (needs 50+ active users)' },
      { key: 'group_buying', enabled: false, scope: 'global', scopeValue: null, description: 'Group bulk purchases (needs 20+ per deal)' },
      { key: 'sports_groups', enabled: false, scope: 'global', scopeValue: null, description: 'Sports and fitness groups' },
      { key: 'pet_care', enabled: false, scope: 'global', scopeValue: null, description: 'Pet care services (separate from general services)' },
      { key: 'bill_splitting', enabled: false, scope: 'global', scopeValue: null, description: 'Split bills with neighbors' },
      { key: 'item_borrowing', enabled: false, scope: 'global', scopeValue: null, description: 'Borrow items from neighbors' },
      { key: 'rwa_management', enabled: false, scope: 'global', scopeValue: null, description: 'RWA admin dashboard (B2B feature)' },
      
      // Advanced features (phase 3+)
      { key: 'sos_alerts', enabled: false, scope: 'global', scopeValue: null, description: 'Full SOS emergency broadcast (launch Week 3-4)' },
      { key: 'stories', enabled: false, scope: 'global', scopeValue: null, description: 'Instagram-style stories' },
      { key: 'video_calls', enabled: false, scope: 'global', scopeValue: null, description: 'Video calls with providers' },
      { key: 'header_ads', enabled: true, scope: 'global', scopeValue: null, description: 'Promotional ads in feed' },
      { key: 'parking_sharing', enabled: false, scope: 'global', scopeValue: null, description: 'Share/rent parking spaces' },
      { key: 'kids_education', enabled: false, scope: 'global', scopeValue: null, description: 'Playschools, daycares (separate from tutor)' },
      { key: 'jobs_board', enabled: false, scope: 'global', scopeValue: null, description: 'Local job postings' },
      { key: 'realestate', enabled: false, scope: 'global', scopeValue: null, description: 'Property listings (needs RERA compliance)' },
      { key: 'amenity_booking', enabled: false, scope: 'global', scopeValue: null, description: 'Book society amenities (clubhouse, pool)' },
      { key: 'domestic_help', enabled: false, scope: 'global', scopeValue: null, description: 'Maid/cook/driver directory (can be part of Services)' },
      { key: 'sos_broadcast', enabled: false, scope: 'global', scopeValue: null, description: 'Emergency "sos" post type in the feed' },
      { key: 'kyc_gold_tier', enabled: true, scope: 'global', scopeValue: null, description: 'Aadhaar liveness/face-match gold KYC tier flow' },

      // Merchant back-office (admin off-switch for abuse/spam review)
      { key: 'merchant_broadcasts', enabled: true, scope: 'global', scopeValue: null, description: 'Merchants push messages to their past customers' },
      { key: 'merchant_coupons', enabled: true, scope: 'global', scopeValue: null, description: 'Merchants create their own discount codes' },
      { key: 'merchant_subscriptions', enabled: true, scope: 'global', scopeValue: null, description: 'Merchants sell recurring subscription plans' },
      { key: 'merchant_branches', enabled: true, scope: 'global', scopeValue: null, description: 'Merchants add multiple business locations' },
      { key: 'merchant_pages', enabled: true, scope: 'global', scopeValue: null, description: 'Public merchant directory/storefront listings' },
    ],
    skipDuplicates: true,
  });
  console.log('  ✓  feature flags');

  // ── 33. Broadcasts ─────────────────────────────────────────────────────────
  await prisma.broadcast.createMany({
    data: LOCALITIES.map((l) => ({
      title: 'Welcome to Lokul!',
      body: 'Stay connected with your neighbours, find trusted services, and join community events.',
      targetScope: `pincode:${l.pinCode}`, sentById: byName('Vivek Sharma').id, status: 'sent', sentAt: new Date(),
    })),
  });
  console.log('  ✓  broadcasts');

  console.log('\n✅  Seed complete!');
  console.log(`   ${users.length} users · ${posts.length} posts · ${merchants.length} merchants · ${classifieds.length} classifieds`);
  console.log(`   ${communities.length} communities · ${carpoolTrips.length} carpool trips · ${groupBuys.length} group buys · ${stories.length} stories`);
  console.log('   Log in as Vivek Sharma with phone +919876543210, OTP code 1123 (dev fixed code).');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
