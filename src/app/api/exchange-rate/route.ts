/**
 * /api/exchange-rate — Exchange rate proxy route.
 *
 * Fetches exchange rates from FRED for USD conversion.
 * Returns the most recent rate for each requested currency pair.
 *
 * Usage:
 *   GET /api/exchange-rate?series_ids=DEXUSEU,DEXJPUS,DEXUSUK
 *
 * Query Parameters:
 *   series_ids (required) — Comma-separated FRED series IDs
 *
 * Response:
 *   { rates: { "DEXUSEU": 1.08, "DEXJPUS": 149.5, ... } }
 *
 * @see https://fred.stlouisfed.org/docs/api/api.html
 */

import { NextRequest, NextResponse } from "next/server";

const FRED_API_KEY = process.env.FRED_API_KEY || "";
const FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations";

// Simple in-memory cache (resets on server restart)
const rateCache = new Map<string, { value: number; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const seriesIds = searchParams.get("series_ids");

  if (!seriesIds) {
    return NextResponse.json(
      { error: "series_ids is required (comma-separated)" },
      { status: 400 }
    );
  }

  if (!FRED_API_KEY) {
    return NextResponse.json(
      { error: "FRED API key not configured" },
      { status: 500 }
    );
  }

  const ids = seriesIds
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const now = Date.now();
  const rates: Record<string, number> = {};

  // Check cache first
  const idsToFetch = ids.filter((id) => {
    const cached = rateCache.get(id);
    if (cached && now - cached.timestamp < CACHE_TTL) {
      rates[id] = cached.value;
      return false;
    }
    return true;
  });

  // Fetch missing rates in parallel
  if (idsToFetch.length > 0) {
    const results = await Promise.allSettled(
      idsToFetch.map(async (seriesId) => {
        const url = new URL(FRED_BASE_URL);
        url.searchParams.set("series_id", seriesId);
        url.searchParams.set("api_key", FRED_API_KEY);
        url.searchParams.set("file_type", "json");
        url.searchParams.set("sort_order", "desc");
        url.searchParams.set("limit", "1");

        const response = await fetch(url.toString(), {
          headers: { "User-Agent": "Economix/1.0" },
        });

        if (!response.ok) {
          throw new Error(`FRED API error: ${response.status}`);
        }

        const data = await response.json();
        const observations = data.observations || [];
        const latest = observations.find(
          (obs: { value: string }) => obs.value !== "."
        );

        if (!latest) {
          throw new Error(`No valid data for ${seriesId}`);
        }

        return { seriesId, value: parseFloat(latest.value) };
      })
    );

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const { seriesId, value } = result.value;
        rates[seriesId] = value;
        rateCache.set(seriesId, { value, timestamp: now });
      } else {
        console.warn(
          `Failed to fetch exchange rate for ${idsToFetch[index]}:`,
          result.reason
        );
      }
    });
  }

  return NextResponse.json({ rates });
}
