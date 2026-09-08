/**
 * /api/fred — FRED API proxy route.
 *
 * Server-side proxy that hides the API key from the client bundle.
 * Reads FRED_API_KEY from environment variables.
 *
 * Usage:
 *   GET /api/fred?series_id=GDP&start_date=2020-01-01&end_date=2024-01-01
 *
 * Query Parameters:
 *   series_id  (required) — FRED series ID, e.g. "GDP", "UNRATE"
 *   start_date (optional) — ISO date, default "2000-01-01"
 *   end_date   (optional) — ISO date, default today
 *   limit      (optional) — Max observations, default 9999
 *
 * Response:
 *   { series_id: string, observations: [{ date, value }] }
 *
 * @see https://fred.stlouisfed.org/docs/api/api.html
 */

import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage, type Locale } from "@/lib/api-errors";

const FRED_API_KEY = process.env.FRED_API_KEY || "";
const FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const seriesId = searchParams.get("series_id");
  const startDate = searchParams.get("start_date") || "2000-01-01";
  const endDate = searchParams.get("end_date") || new Date().toISOString().split("T")[0];
  const limit = searchParams.get("limit") || "9999";
  const locale = (searchParams.get("locale") || "en") as Locale;

  if (!seriesId) {
    return NextResponse.json({ error: getErrorMessage("series_id is required", locale) }, { status: 400 });
  }

  if (!FRED_API_KEY) {
    return NextResponse.json(
      { error: getErrorMessage("FRED API key not configured", locale) },
      { status: 500 }
    );
  }

  try {
    const url = new URL(FRED_BASE_URL);
    url.searchParams.set("series_id", seriesId);
    url.searchParams.set("api_key", FRED_API_KEY);
    url.searchParams.set("file_type", "json");
    url.searchParams.set("observation_start", startDate);
    url.searchParams.set("observation_end", endDate);
    url.searchParams.set("limit", limit);
    url.searchParams.set("sort_order", "asc");

    const response = await fetch(url.toString(), {
      headers: { "User-Agent": "Economix/1.0" },
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `FRED API error: ${response.status}`, details: text },
        { status: response.status }
      );
    }

    const data = await response.json();

    const observations = (data.observations || [])
      .filter((obs: { value: string }) => obs.value !== ".")
      .map((obs: { date: string; value: string }) => ({
        date: obs.date,
        value: parseFloat(obs.value),
      }));

    return NextResponse.json({
      series_id: seriesId,
      observations,
    });
  } catch (error) {
    console.error("FRED API error:", error);
    return NextResponse.json(
      { error: getErrorMessage("Failed to fetch data from FRED", locale) },
      { status: 500 }
    );
  }
}
