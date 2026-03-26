import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db";

const ALL_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const ALL_DIFFICULTIES = ["seedling", "sapling", "tree", "mighty_oak"];

export async function GET() {
  try {
    const tablesValue = getSetting("maths_tables");
    const tables = tablesValue
      ? tablesValue.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n >= 1 && n <= 12)
      : ALL_TABLES;

    const diffsValue = getSetting("maths_difficulties");
    const difficulties = diffsValue
      ? diffsValue.split(",").map((s) => s.trim()).filter((s) => ALL_DIFFICULTIES.includes(s))
      : ALL_DIFFICULTIES;

    return NextResponse.json({
      tables: tables.length > 0 ? tables : ALL_TABLES,
      difficulties: difficulties.length > 0 ? difficulties : ALL_DIFFICULTIES,
    });
  } catch {
    return NextResponse.json({ tables: ALL_TABLES, difficulties: ALL_DIFFICULTIES });
  }
}
