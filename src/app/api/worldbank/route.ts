/**
 * /api/worldbank — World Bank API proxy route.
 *
 * Server-side proxy that hides the API details from the client bundle.
 * The World Bank API is free and open, no API key required.
 *
 * Usage:
 *   GET /api/worldbank?indicator=NY.GDP.MKTP.CD&country=US&date=2020:2024
 *
 * Query Parameters:
 *   indicator (required) — World Bank indicator ID, e.g. "NY.GDP.MKTP.CD"
 *   country   (optional) — ISO2 country code, e.g. "US", "JP", "CN" (default: "US")
 *   date      (optional) — Date range, format "start:end", default "2020:2024"
 *
 * Response:
 *   { indicator_id, observations: [{date, value}, ...] }
 *
 * @see https://api.worldbank.org/docs
 */

import { NextRequest, NextResponse } from "next/server";

const WORLD_BASE_URL = "https://api.worldbank.org/v2";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const indicatorId = searchParams.get("indicator");
  const countryCode = searchParams.get("country") || "US";
  const dateRange = searchParams.get("date") || "2020:2024";

  if (!indicatorId) {
    return NextResponse.json(
      { error: "indicator parameter is required" },
      { status: 400 }
    );
  }

  // Convert ISO date range (e.g. "2020-01-01:2024-01-01") to World Bank year format ("2020:2024")
  const [startYear, endYear] = dateRange.split(":").map((p) =>
    p.includes("-") ? p.split("-")[0] : p
  );
  const formattedDateRange = `${startYear}:${endYear}`;

  try {
    // World Bank API endpoint for a specific country's indicator data
    const url = `${WORLD_BASE_URL}/country/${countryCode}/indicator/${indicatorId}?date=${formattedDateRange}&format=json&per_page=500`;

    const response = await fetch(url, {
      headers: { "User-Agent": "Economix/1.0" },
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `World Bank API error: ${response.status}`, details: text },
        { status: response.status }
      );
    }

    const data = await response.json();

    // World Bank v2 API response structure:
    // [0] = metadata: { page, pages, total, per_page, ... }
    // [1] = dataArray: [{ indicator, country, date, value, ... }, ...]
    let observations: any[] = [];
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      observations = data[1];
    }

    // Transform to our standard format: [{date, value}]
    // World Bank dates are just years like "2024", convert to ISO date "2024-01-01"
    // to match FRED's date format (FRED uses YYYY-01-01 for annual/quarterly data)
    const formattedObservations = observations
      .filter(
        (obs: { value: string | number | null }) =>
          obs.value !== null && obs.value !== "" && obs.value !== undefined
      )
      .map((obs: { date: string; value: string | number }) => ({
        // Convert year "2024" to "2024-01-01" for consistency with FRED
        date: obs.date.length === 4 ? `${obs.date}-01-01` : obs.date,
        value: typeof obs.value === "string" ? parseFloat(obs.value) : obs.value,
      }))
      // Sort by date ascending
      .sort((a: { date: string }, b: { date: string }) =>
        a.date.localeCompare(b.date)
      );

    return NextResponse.json({
      indicator_id: indicatorId,
      observations: formattedObservations,
    });
  } catch (error) {
    console.error("World Bank API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from World Bank" },
      { status: 500 }
    );
  }
}