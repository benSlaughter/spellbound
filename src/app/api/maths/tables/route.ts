import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db";

const ALL_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export async function GET() {
  try {
    const value = getSetting("maths_tables");
    if (!value) {
      return NextResponse.json({ tables: ALL_TABLES });
    }

    const tables = value
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 12);

    return NextResponse.json({ tables: tables.length > 0 ? tables : ALL_TABLES });
  } catch {
    return NextResponse.json({ tables: ALL_TABLES });
  }
}
