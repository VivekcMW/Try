/**
 * POST /api/merchant/catalog/import
 * Bulk-import catalog items from a CSV file.
 *
 * Expected CSV columns (first row = header, case-insensitive):
 *   name*, price*, unit, description, category, kind, stock, available, image_url, duration_mins
 *
 * Returns: { created, skipped, errors: [{ row, reason }] }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMerchant } from "@/lib/merchant-auth";
import { prisma } from "@/lib/prisma";

const VALID_KINDS = ["product", "menu_item", "service", "consultation", "class_batch"];
const MAX_ROWS = 500;

// ── Lightweight CSV parser ──────────────────────────────────────────────────
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return [];

  const headers = splitCsvRow(lines[0]).map((h) => h.toLowerCase().trim());

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCsvRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function splitCsvRow(line: string): string[] {
  const result: string[] = [];
  let inQuotes = false;
  let current = "";

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ── Column aliases ─────────────────────────────────────────────────────────
function get(row: Record<string, string>, ...aliases: string[]): string {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== "") return row[alias];
  }
  return "";
}

export async function POST(request: NextRequest) {
  try {
    const { merchantId } = await requireMerchant();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await (file as File).text();
    const rows = parseCsv(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV is empty or has no data rows" }, { status: 400 });
    }

    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `CSV too large — max ${MAX_ROWS} rows per import` },
        { status: 400 }
      );
    }

    let created = 0;
    let skipped = 0;
    const errors: Array<{ row: number; reason: string }> = [];

    type CreateInput = {
      merchantId: string; name: string; kind: string; pricePaise: number;
      unit: string | null; description: string | null; catalogCategory: string | null;
      stockCount: number | null; isAvailable: boolean; imageUrl: string | null;
      durationMins: number | null; sortOrder: number;
    };
    const itemsToCreate: CreateInput[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed, +1 for header

      const name = get(row, "name", "item name", "product name", "service name");
      const priceRaw = get(row, "price", "price (₹)", "price (rs)", "mrp", "rate");

      if (!name) {
        errors.push({ row: rowNum, reason: "Missing name" });
        skipped++;
        continue;
      }

      const pricePaise = Math.round(parseFloat(priceRaw) * 100);
      if (!priceRaw || isNaN(pricePaise) || pricePaise < 0) {
        errors.push({ row: rowNum, reason: `Invalid price: "${priceRaw}"` });
        skipped++;
        continue;
      }

      const kindRaw = get(row, "kind", "type", "item type").toLowerCase();
      const kind = VALID_KINDS.includes(kindRaw) ? kindRaw : "product";

      const stockRaw = get(row, "stock", "stock count", "qty", "quantity");
      const stockCount = stockRaw !== "" ? parseInt(stockRaw, 10) : null;
      if (stockRaw !== "" && (isNaN(stockCount!) || stockCount! < 0)) {
        errors.push({ row: rowNum, reason: `Invalid stock count: "${stockRaw}"` });
        skipped++;
        continue;
      }

      const availableRaw = get(row, "available", "is available", "availability");
      const isAvailable =
        availableRaw === "" || availableRaw === "1" || availableRaw.toLowerCase() === "true" || availableRaw.toLowerCase() === "yes";

      const durationRaw = get(row, "duration_mins", "duration", "prep time", "prep_time");
      const durationMins = durationRaw !== "" ? parseInt(durationRaw, 10) : null;

      itemsToCreate.push({
        merchantId,
        name: name.trim(),
        kind: kind as any,
        pricePaise,
        unit: get(row, "unit", "unit of measurement") || null,
        description: get(row, "description", "desc") || null,
        catalogCategory: get(row, "category", "menu category", "catalog category", "section") || null,
        stockCount: stockCount ?? null,
        isAvailable,
        imageUrl: get(row, "image_url", "image", "photo", "img") || null,
        durationMins: durationMins && !isNaN(durationMins) ? durationMins : null,
        sortOrder: 0,
      });
      created++;
    }

    if (itemsToCreate.length > 0) {
      await prisma.merchantCatalogItem.createMany({ data: itemsToCreate as any });
    }

    return NextResponse.json({ created, skipped, errors });
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("CSV import failed:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
