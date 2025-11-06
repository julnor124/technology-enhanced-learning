import { NextRequest } from "next/server";

import { streamFromProvider } from "@/lib/provider";



export const runtime = "edge"; // fast streaming



export async function POST(req: NextRequest) {

  const { messages } = await req.json();

  const stream = await streamFromProvider(messages);

  return new Response(stream, {

    headers: {

      "Content-Type": "text/plain; charset=utf-8",

      "Cache-Control": "no-cache",

    },

  });

}
