import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

const STUB = {
  id: "demo-merchant-001",
  name: "Ramesh Kirana & General Stores",
  category: "grocery",
  description: "Your neighborhood kirana since 1998. Fresh produce, daily essentials, home delivery within 500m. WhatsApp orders welcome.",
  avatarUrl: null,
  phone: "+919845001234",
  pinCode: "560038",
  city: "Bengaluru",
  address: "12, 4th Cross, Jayanagar 3rd Block, Bengaluru, Karnataka 560038",
  lat: 12.9302,
  lng: 77.5834,
  isEndorsed: true,
  ratingAvg: 4.7,
  ratingCount: 213,
  createdAt: new Date("2024-03-01").toISOString(),
  owner: { id: "u1", name: "Ramesh Patel", avatarUrl: null, kycTier: "gold" },
  serviceSlots: [
    { id: "s1", dayOfWeek: 1, startTime: "08:00", endTime: "21:00", capacity: 10, bookedCount: 3 },
    { id: "s2", dayOfWeek: 2, startTime: "08:00", endTime: "21:00", capacity: 10, bookedCount: 5 },
    { id: "s3", dayOfWeek: 3, startTime: "08:00", endTime: "21:00", capacity: 10, bookedCount: 2 },
    { id: "s4", dayOfWeek: 4, startTime: "08:00", endTime: "21:00", capacity: 10, bookedCount: 4 },
    { id: "s5", dayOfWeek: 5, startTime: "08:00", endTime: "21:00", capacity: 10, bookedCount: 6 },
    { id: "s6", dayOfWeek: 6, startTime: "09:00", endTime: "18:00", capacity: 10, bookedCount: 1 },
  ],
  recentRatings: [
    { id: "r1", score: 5, review: "Best kirana in the area! Always fresh stock.", raterName: "Priya S." },
    { id: "r2", score: 5, review: "Super quick delivery. Highly recommended.", raterName: "Arun M." },
    { id: "r3", score: 4, review: "Good selection, reasonable prices.", raterName: "Neha K." },
  ],
  photos: [
    { id: "ph1", url: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=480&fit=crop&q=80&auto=format", caption: "Store front",           addedBy: "owner",    byName: "Ramesh Patel" },
    { id: "ph2", url: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800&h=480&fit=crop&q=80&auto=format", caption: "Inside — shelves",     addedBy: "owner",    byName: "Ramesh Patel" },
    { id: "ph3", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=480&fit=crop&q=80&auto=format", caption: "Fresh vegetables",      addedBy: "neighbor", byName: "Priya S." },
    { id: "ph4", url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=480&fit=crop&q=80&auto=format", caption: "Spice aisle",           addedBy: "neighbor", byName: "Arun M." },
    { id: "ph5", url: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&h=480&fit=crop&q=80&auto=format", caption: "Dairy corner",          addedBy: "neighbor", byName: "Neha K." },
  ],
  catalog: [
    { id: "c1",  name: "Aashirvaad Atta",            category: "grains",    unit: "5 kg",    pricePaise: 22000, inStock: true  },
    { id: "c2",  name: "India Gate Basmati Rice",     category: "grains",    unit: "5 kg",    pricePaise: 37000, inStock: true  },
    { id: "c3",  name: "Toor Dal",                    category: "grains",    unit: "1 kg",    pricePaise: 14500, inStock: true  },
    { id: "c4",  name: "Chana Dal",                   category: "grains",    unit: "1 kg",    pricePaise: 10800, inStock: true  },
    { id: "c5",  name: "Moong Dal",                   category: "grains",    unit: "500 g",   pricePaise:  7200, inStock: false },
    { id: "c6",  name: "Fortune Sunflower Oil",       category: "oils",      unit: "1 L",     pricePaise: 16000, inStock: true  },
    { id: "c7",  name: "Patanjali Pure Ghee",         category: "oils",      unit: "500 ml",  pricePaise: 31000, inStock: true  },
    { id: "c8",  name: "Groundnut Oil",               category: "oils",      unit: "1 L",     pricePaise: 18500, inStock: true  },
    { id: "c9",  name: "Everest Red Chilli Powder",   category: "spices",    unit: "200 g",   pricePaise:  6500, inStock: true  },
    { id: "c10", name: "Turmeric Powder",             category: "spices",    unit: "100 g",   pricePaise:  4200, inStock: true  },
    { id: "c11", name: "MDH Garam Masala",            category: "spices",    unit: "100 g",   pricePaise:  7800, inStock: true  },
    { id: "c12", name: "Coriander Powder",            category: "spices",    unit: "200 g",   pricePaise:  5500, inStock: false },
    { id: "c13", name: "Nandini Full Cream Milk",     category: "dairy",     unit: "1 L",     pricePaise:  6800, inStock: true  },
    { id: "c14", name: "Fresh Paneer",                category: "dairy",     unit: "200 g",   pricePaise:  9500, inStock: true  },
    { id: "c15", name: "Amul Butter",                 category: "dairy",     unit: "100 g",   pricePaise:  6200, inStock: true  },
    { id: "c16", name: "Amul Curd",                   category: "dairy",     unit: "400 g",   pricePaise:  5500, inStock: true  },
    { id: "c17", name: "Haldiram Mixture",            category: "snacks",    unit: "400 g",   pricePaise: 12000, inStock: true  },
    { id: "c18", name: "Parle-G Biscuits",            category: "snacks",    unit: "800 g",   pricePaise:  6500, inStock: true  },
    { id: "c19", name: "Poha",                        category: "snacks",    unit: "500 g",   pricePaise:  4500, inStock: true  },
    { id: "c20", name: "Brooke Bond Red Label Tea",   category: "beverages", unit: "250 g",   pricePaise: 12500, inStock: true  },
    { id: "c21", name: "Bournvita",                   category: "beverages", unit: "500 g",   pricePaise: 23000, inStock: true  },
    { id: "c22", name: "Nescafe Classic Coffee",      category: "beverages", unit: "100 g",   pricePaise:  9800, inStock: false },
    { id: "c23", name: "Surf Excel Washing Powder",   category: "household", unit: "1 kg",    pricePaise: 13000, inStock: true  },
    { id: "c24", name: "Vim Dish Soap",               category: "household", unit: "750 ml",  pricePaise:  8800, inStock: true  },
    { id: "c25", name: "Detergent Bar",               category: "household", unit: "150 g",   pricePaise:  2400, inStock: true  },
  ],
  nearbyStores: [
    { id: "nb1", name: "Suresh General Store",    category: "grocery",  ratingAvg: 4.3, ratingCount: 87,  distanceM: 60,  city: "Bengaluru", pinCode: "560038", isEndorsed: false },
    { id: "nb2", name: "Sri Venkatesh Kirana",    category: "grocery",  ratingAvg: 4.5, ratingCount: 141, distanceM: 85,  city: "Bengaluru", pinCode: "560038", isEndorsed: true  },
    { id: "nb3", name: "Meenakshi Provision Store",category: "grocery",  ratingAvg: 4.1, ratingCount: 53,  distanceM: 95,  city: "Bengaluru", pinCode: "560038", isEndorsed: false },
    { id: "nb4", name: "Raj Supermarket",         category: "grocery",  ratingAvg: 4.6, ratingCount: 210, distanceM: 110, city: "Bengaluru", pinCode: "560038", isEndorsed: true  },
  ],
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (E2E) {
    return NextResponse.json({ business: { ...STUB, id } });
  }

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true, kycTier: true, phone: true } },
        serviceSlots: { take: 10, orderBy: [{ date: "asc" }, { startTime: "asc" }] },
      },
    });

    if (!merchant || merchant.status !== "active" || merchant.isBlacklisted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fetch top 3 ratings via ratings on orders for this merchant's owner
    const ratings = await prisma.rating.findMany({
      where: { rateeId: merchant.ownerId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { rater: { select: { name: true } } },
    });

    const { owner, ...merchantFields } = merchant;
    const { phone, ...ownerFields } = owner;

    return NextResponse.json({
      business: {
        ...merchantFields,
        owner: ownerFields,
        phone,
        createdAt: merchant.createdAt.toISOString(),
        // No merchant catalog/product model exists yet — honestly empty rather
        // than fabricated, unlike the E2E STUB above which is fixture data only.
        catalog: [],
        recentRatings: ratings.map((r) => ({
          id: r.id,
          score: r.score,
          review: r.review,
          raterName: r.rater.name.split(" ")[0] + " " + (r.rater.name.split(" ")[1]?.[0] ?? "") + ".",
        })),
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
