/**
 * Seed booking merchants + staff matching the mobile app's Discover catalog
 * (fixed ids '1'–'20' from catalog.tsx, providers p51… from bookingStore.ts)
 * plus venue slots for the next 7 days.
 *
 * Usage (from repo root, DATABASE_URL in env):
 *   node scripts/seed-bookings.mjs
 *
 * Idempotent: fixed ids, ON CONFLICT DO UPDATE.
 */
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const MERCHANTS = [
  ["1",  "Amul Parlour",                     "grocery"],
  ["2",  "Fresh Veggies Store",              "grocery"],
  ["3",  "MedPlus Pharmacy",                 "pharmacy"],
  ["4",  "Sharma Bakery",                    "bakery"],
  ["5",  "Glamour Touch Salon",              "salon"],
  ["6",  "Style Studio Unisex Salon",        "salon"],
  ["7",  "Sunrise Family Clinic",            "clinic"],
  ["8",  "Smile Care Dental Clinic",         "clinic"],
  ["9",  "LifeCare Multispeciality Hospital","clinic"],
  ["10", "QuickFix AC & Appliance Repair",   "repair"],
  ["11", "Sharma Plumbing & Electrical",     "repair"],
  ["12", "SafeNest Packers & Movers",        "movers"],
  ["13", "Happy Paws Grooming & Vet",        "pet_care"],
  ["14", "HealthFirst Diagnostics @Home",    "lab_test"],
  ["15", "ShieldPro Pest Control",           "pest_control"],
  ["16", "Moments Photography & Events",     "event"],
  ["17", "Ghar Ka Khana Tiffin",             "tiffin"],
  ["18", "LegalEase CA & Advocates",         "consult"],
  ["20", "Sparkle Wash Laundry",             "laundry"],
];

const STAFF = [
  // Glamour Touch Salon
  ["p51",  "5",  "Rakesh",           "Senior Stylist",                 4.8, 9],
  ["p52",  "5",  "Imran",            "Hair & Beard Expert",            4.6, 6],
  ["p53",  "5",  "Sunita",           "Skin & Facial Specialist",       4.7, 7],
  // Style Studio Unisex Salon
  ["p61",  "6",  "Neha",             "Senior Hair Artist",             4.5, 8],
  ["p62",  "6",  "Priya",            "Nail & Spa Expert",              4.3, 4],
  ["p63",  "6",  "Farhan",           "Color Specialist",               4.4, 5],
  // Sunrise Family Clinic
  ["p71",  "7",  "Dr. Meera Nair",   "General Physician · MBBS, MD",   4.9, 14],
  ["p72",  "7",  "Dr. Arjun Rao",    "Family Medicine · MBBS",         4.7, 8],
  // Smile Care Dental Clinic
  ["p81",  "8",  "Dr. Kavita Shah",  "Dentist · BDS, MDS",             4.8, 12],
  ["p82",  "8",  "Dr. Rohit Verma",  "Orthodontist · MDS",             4.6, 9],
  // LifeCare Multispeciality Hospital
  ["p91",  "9",  "Dr. S. Krishnan",  "Internal Medicine · MD",         4.7, 18],
  ["p92",  "9",  "Dr. Anita Desai",  "Cardiologist · DM",              4.8, 15],
  ["p93",  "9",  "Dr. Vikram Singh", "Orthopaedics · MS",              4.5, 11],
  // Happy Paws — groomers & vet
  ["p131", "13", "Dr. Tanya Kapoor", "Veterinarian · BVSc",            4.8, 10],
  ["p132", "13", "Suresh",           "Senior Pet Groomer",             4.6, 6],
];

// Venue slot times for slot-kind merchants (salon/clinic/pet/consult)
const SLOT_MERCHANTS = ["5", "6", "7", "8", "9", "13", "18"];
const SLOT_TIMES = [
  ["10:00", "10:30"], ["10:30", "11:00"], ["11:00", "11:30"], ["11:30", "12:00"],
  ["16:00", "16:30"], ["16:30", "17:00"], ["17:00", "17:30"], ["17:30", "18:00"],
  ["18:00", "18:30"], ["18:30", "19:00"],
];

try {
  // Owner users (Merchant.ownerId is unique + required)
  for (const [id, name] of MERCHANTS) {
    await client.query(
      `INSERT INTO "User" (id, name, phone, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, now(), now())
       ON CONFLICT (id) DO UPDATE SET name = $2, "updatedAt" = now()`,
      [`owner_seed_${id}`, `${name} Owner`, `+9198100010${id.padStart(2, "0")}`],
    );
  }
  console.log(`  ✓ ${MERCHANTS.length} owner users`);

  for (const [id, name, category] of MERCHANTS) {
    await client.query(
      `INSERT INTO "Merchant" (id, "ownerId", name, category, "pinCode", city, status, "ratingCount", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, '560001', 'Bengaluru', 'active'::"MerchantStatus", 0, now(), now())
       ON CONFLICT (id) DO UPDATE SET name = $3, category = $4, status = 'active'::"MerchantStatus", "updatedAt" = now()`,
      [id, `owner_seed_${id}`, name, category],
    );
  }
  console.log(`  ✓ ${MERCHANTS.length} merchants`);

  for (const [id, merchantId, name, role, rating, years] of STAFF) {
    await client.query(
      `INSERT INTO "MerchantStaff" (id, "merchantId", name, role, rating, years, "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, true, now(), now())
       ON CONFLICT (id) DO UPDATE SET name = $3, role = $4, rating = $5, years = $6, "updatedAt" = now()`,
      [id, merchantId, name, role, rating, years],
    );
  }
  console.log(`  ✓ ${STAFF.length} staff members`);

  // Slots: next 7 days, per merchant, capacity 2 (skip existing via unique-ish fixed ids)
  let slotCount = 0;
  for (let d = 0; d < 7; d++) {
    const date = new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
    for (const merchantId of SLOT_MERCHANTS) {
      for (const [startTime, endTime] of SLOT_TIMES) {
        const slotId = `slot_seed_${merchantId}_${date}_${startTime.replace(":", "")}`;
        await client.query(
          `INSERT INTO "ServiceSlot" (id, "merchantId", date, "startTime", "endTime", capacity, booked, "createdAt")
           VALUES ($1, $2, $3, $4, $5, 2, 0, now())
           ON CONFLICT (id) DO NOTHING`,
          [slotId, merchantId, date, startTime, endTime],
        );
        slotCount++;
      }
    }
  }
  console.log(`  ✓ ${slotCount} service slots (7 days)`);

  console.log("Done.");
} finally {
  await client.end();
}
