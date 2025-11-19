import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type SuggestionsRequest = {
  mode?: "debugging" | "theory" | "coding help";
  uploadedTask?: string;
};

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.log("[Suggestions API] POST request received");

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.PROVIDER_MODEL;

  if (!apiKey || !model) {
    console.error("[Suggestions API] Missing OpenAI configuration");
    return NextResponse.json(
      {
        error: "Suggestions service is misconfigured. Ensure OPENAI_API_KEY and PROVIDER_MODEL exist in .env.local.",
      },
      { status: 500 },
    );
  }

  const openai = new OpenAI({ apiKey });

  let body: SuggestionsRequest;

  try {
    body = await request.json();
    console.log("[Suggestions API] Request body received:", {
      mode: body?.mode,
      hasUploadedTask: Boolean(body?.uploadedTask),
      uploadedTaskLength: body?.uploadedTask?.length || 0,
    });
  } catch (error) {
    console.error("[Suggestions API] Invalid JSON body", error);
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body?.mode) {
    return NextResponse.json({ error: "Missing mode. Provide a mode (debugging, theory, or coding help)." }, { status: 400 });
  }

  // Build context-aware prompt for suggestions
  const contextPrompt = body.uploadedTask
    ? `The student has uploaded a task/assignment with the following content:\n\n${body.uploadedTask.substring(0, 500)}${body.uploadedTask.length > 500 ? "..." : ""}\n\n`
    : "";

  const systemPrompt = `You are a helpful assistant that generates simple, basic prompt suggestions for students learning to code.
Generate exactly 3 short, simple prompt suggestions for ${body.mode} mode.
${contextPrompt 
    ? "The suggestions should relate to the uploaded task, but keep them simple and general enough to be useful." 
    : "Keep suggestions general and basic - they should help students learn concepts without requiring a specific assignment."}
Each suggestion should be:
- Very simple and short (5-15 words maximum)
- Basic and straightforward
- Appropriate for ${body.mode} mode
- Written as a simple question the student might ask
- Not detailed or complex
${contextPrompt ? "" : "- General enough to apply to various learning scenarios"}

Return ONLY a JSON array of exactly 3 strings, no other text. Example format:
["Simple question 1", "Simple question 2", "Simple question 3"]`;

  const userPrompt = `Generate 3 prompt suggestions for ${body.mode} mode${body.uploadedTask ? " based on the uploaded task" : ""}.`;

  try {
    console.log("[Suggestions API] Calling OpenAI API...");
    const response = await openai.chat.completions.create({
      model,
      temperature: 0.9, // Higher temperature for more varied suggestions
      max_completion_tokens: 100, // Reduced since suggestions should be shorter
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    console.log("[Suggestions API] OpenAI response received");

    if (!response.choices || response.choices.length === 0) {
      throw new Error("OpenAI API returned no choices in response.");
    }

    const rawText = response.choices[0]?.message?.content?.trim();

    if (!rawText) {
      throw new Error("Suggestions response was empty.");
    }

    // Try to parse as JSON array
    let suggestions: string[];
    try {
      // Remove any markdown code blocks if present
      const cleanedText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      suggestions = JSON.parse(cleanedText);

      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        throw new Error("Invalid suggestions format");
      }

      // Ensure we have exactly 3 suggestions
      suggestions = suggestions.slice(0, 3);
    } catch (parseError) {
      console.warn("[Suggestions API] Failed to parse JSON, using fallback:", parseError);
      // Fallback: split by newlines or use the raw text
      suggestions = rawText
        .split("\n")
        .map((line) => line.trim().replace(/^[-*•]\s*/, "").replace(/^"\s*|\s*"$/g, ""))
        .filter((line) => line.length > 0)
        .slice(0, 3);

      if (suggestions.length === 0) {
        suggestions = [rawText.substring(0, 100)];
      }
    }

    console.log("[Suggestions API] Returning suggestions:", suggestions.length);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[Suggestions API] Error:", error);
    if (error instanceof Error) {
      console.error("[Suggestions API] Error message:", error.message);
      return NextResponse.json(
        {
          error: "Failed to generate suggestions. Please try again.",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Failed to generate suggestions. Please try again." }, { status: 500 });
  }
}

