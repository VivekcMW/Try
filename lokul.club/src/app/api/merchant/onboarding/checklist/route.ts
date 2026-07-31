import { NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { merchantId } = await requireMerchant();

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    select: {
      name: true,
      description: true,
      avatarUrl: true,
      addressLine1: true,
      businessHoursStart: true,
      businessHoursEnd: true,
      workflowProfile: true,
      gstNumber: true,
      fssaiNumber: true,
      _count: {
        select: {
          catalogItems: true,
          offers: true,
        },
      },
    },
  });

  if (!merchant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const addressLine1 = (merchant as any).addressLine1;
  const gstNumber = (merchant as any).gstNumber;
  const fssaiNumber = (merchant as any).fssaiNumber;

  const checks = [
    {
      id: "profile_photo",
      label: "Add a profile photo",
      description: "Merchants with photos get 3× more customer clicks",
      done: !!merchant.avatarUrl,
      href: "/merchant/settings",
      points: 15,
    },
    {
      id: "description",
      label: "Write a business description",
      description: "Tell customers what makes you special",
      done: !!merchant.description && merchant.description.length > 20,
      href: "/merchant/settings",
      points: 10,
    },
    {
      id: "address",
      label: "Add your shop address",
      description: "Help customers find you",
      done: !!addressLine1,
      href: "/merchant/settings#location",
      points: 20,
    },
    {
      id: "business_hours",
      label: "Set business hours",
      description: "Let customers know when you're open",
      done: !!merchant.businessHoursStart && !!merchant.businessHoursEnd,
      href: "/merchant/settings#hours",
      points: 10,
    },
    {
      id: "catalog",
      label: "Add at least 5 items to your catalog",
      description: "More items = more discovery",
      done: merchant._count.catalogItems >= 5,
      href: "/merchant/catalog",
      points: 25,
    },
    {
      id: "first_offer",
      label: "Create your first offer",
      description: "Businesses with offers get 3× more orders",
      done: merchant._count.offers > 0,
      href: "/merchant/offers",
      points: 20,
    },
  ];

  if (merchant.workflowProfile === "food") {
    checks.push({
      id: "fssai",
      label: "Add your FSSAI license number",
      description: "Required for food businesses. Builds customer trust.",
      done: !!fssaiNumber,
      href: "/merchant/settings#compliance",
      points: 15,
    });
  } else {
    checks.push({
      id: "gst",
      label: "Add your GST number",
      description: "Unlock GST invoicing for your customers",
      done: !!gstNumber,
      href: "/merchant/settings#compliance",
      points: 15,
    });
  }

  const totalPoints = checks.reduce((sum, c) => sum + c.points, 0);
  const earnedPoints = checks.filter((c) => c.done).reduce((sum, c) => sum + c.points, 0);
  const completionPct = Math.round((earnedPoints / totalPoints) * 100);

  return NextResponse.json({ checks, completionPct, totalPoints, earnedPoints });
}
