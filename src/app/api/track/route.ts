import { NextRequest } from "next/server";



export const runtime = "edge";



export async function POST(req: NextRequest) {

  const body = await req.json();

  // In production: forward to PostHog/Mixpanel/BigQuery. Here we just log.

  console.log("track", body);

  return new Response("ok");

}

