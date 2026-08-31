/**
 * /api/dbnomics — DBnomics API proxy route.
 *
 * Server-side proxy for the DBnomics economic data aggregator.
 * No API key required — the service is free and open.
 *
 * Usage:
 *   GET /api/dbnomics?dataset_code=WFIVERDB-5&provider_code=FRED
 *
 * Query Parameters:
 *   dataset_code (required) — DBnomics dataset code
 *   provider_code (required) — Data provider (e.g., "FRED", "IMF")
 *   start_date   (optional) — ISO date filter
 *   end_date     (optional) — ISO date filter
 *
 * Response:
 *   { dataset_code: string, provider_code: string, observations: [{ date, value }] }
 *
 * @see https://db.nomics.world/
 */

import { NextRequest, NextResponse } from "next/server";

const DBNOMICS_BASE_URL = "https://api.db.nomics.world/v22";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const datasetCode = searchParams.get("dataset_code");
  const providerCode = searchParams.get("provider_code");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  if (!datasetCode || !providerCode) {
    return NextResponse.json(
      { error: "dataset_code and provider_code are required" },
      { status: 400 }
    );
  }

  try {
    let url = `${DBNOMICS_BASE_URL}/series/${providerCode}/${datasetCode}`;
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    params.set("limit", "10000");
    params.set("offset", "0");

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await fetch(url, {
      headers: { "User-Agent": "Economix/1.0" },
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `DBnomics API error: ${response.status}`, details: text },
        { status: response.status }
      );
    }

    const result = await response.json();

    const series = result.data?.series || result.series || result;
    const values = series?.values || series?.data || [];

    const observations = values.map(
      (item: { period: string; value: string | number }) => ({
        date: item.period,
        value: typeof item.value === "string" ? parseFloat(item.value) : item.value,
      })
    );

    return NextResponse.json({
      dataset_code: datasetCode,
      provider_code: providerCode,
      observations,
    });
  } catch (error) {
    console.error("DBnomics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from DBnomics" },
      { status: 500 }
    );
  }
}
