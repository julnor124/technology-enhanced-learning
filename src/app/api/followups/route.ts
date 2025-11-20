import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type FollowupRequest = {
  sessionId: string;
  mode: "debugging" | "theory" | "coding help" | null;
  uploadedTask?: string;
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.PROVIDER_MODEL;

  if (!apiKey || !model) {
    return NextResponse.json(
      { error: "Tutor is misconfigured. Ensure OPENAI_API_KEY and PROVIDER_MODEL exist in environment variables." },
      { status: 500 },
    );
  }

  let body: FollowupRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.sessionId || !body.mode) {
    return NextResponse.json({ error: "Missing sessionId or mode." }, { status: 400 });
  }

  let conversation: { role: string; content: string }[] = [];
  try {
    const record = await prisma.conversation.findUnique({
      where: { sessionId: body.sessionId },
    });
    if (record?.messages) {
      conversation = record.messages as { role: string; content: string }[];
    }
  } catch (error) {
    console.error("[Followups API] Failed to fetch conversation history:", error);
  }

  const conversationExcerpt = conversation
    .slice(-8)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n\n");

  const systemPrompt = `
You are a tutoring assistant that helps learners keep a productive conversation going.
Given the recent conversation, produce exactly 3 short follow-up prompts they could ask next.
Each prompt should:
- Be concise (max 18 words).
- Reference the previous discussion when useful.
- Encourage deeper thinking or action.
Return ONLY a JSON array of strings.
`.trim();

  const userPrompt = `
Mode: ${body.mode}
${body.uploadedTask ? `Assignment context:\n${body.uploadedTask}\n\n` : ""}
Recent conversation:
${conversationExcerpt || "No prior context."}

Generate 3 follow-up prompts the student can ask next.
`.trim();

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.9,
      max_completion_tokens: 200,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) {
      throw new Error("Follow-up response was empty.");
    }

    let tips: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        tips = parsed.filter((item) => typeof item === "string");
      }
    } catch {
      tips = raw
        .split("\n")
        .map((line) => line.replace(/^\d+[\).\s-]*/, "").trim())
        .filter(Boolean);
    }

    tips = tips.slice(0, 3);
    if (tips.length === 0) {
      tips = [
        "Ask the tutor to recap key insights from the previous answer.",
        "Request an example or analogy to deepen understanding.",
        "Ask what the next logical step would be for your project.",
      ];
    }

    return NextResponse.json({ tips });
  } catch (error) {
    console.error("[Followups API] Error:", error);
    return NextResponse.json({ error: "Unable to generate follow-up suggestions." }, { status: 500 });
  }
}


