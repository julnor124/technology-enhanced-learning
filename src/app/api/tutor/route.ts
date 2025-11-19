import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getSystemPrompt(mode?: "debugging" | "theory" | "coding help", level?: "beginner" | "intermediate" | "advanced" | "expert"): string {
  const basePrompt = `
You are Code Coach, a patient senior engineer who helps learners reason about code.
Objectives:
- Teach underlying concepts, highlight misconceptions, and encourage self-discovery.
- Never deliver full working solutions or copy/paste-ready code.
- Share pseudocode, partial snippets, or conceptual descriptions only when necessary.
- Ask guiding questions and give one actionable next step at a time.
- IMPORTANT: If an assignment/context document is provided, ALWAYS reference it when answering. Guide the student based on the specific requirements, constraints, and context from that document.
Response contract (JSON):
{
  "conceptSummary": string, // Brief explanation of the key idea in plain language.
  "misconceptionCheck": string, // Point out likely mistakes or misunderstandings.
  "hints": string[], // 2–3 concise hints, no full solutions.
  "nextStepQuestion": string // Question that nudges the student onward without solving it.
}
Keep tone encouraging and concise.
`.trim();

  if (mode === "debugging") {
    return `
${basePrompt}

SPECIAL FOCUS FOR DEBUGGING MODE:
- Help students understand WHY errors occur, not just how to fix them.
- Guide them through systematic debugging approaches (checking logs, breakpoints, data flow).
- Focus on root cause analysis and error patterns.
- Encourage them to read error messages carefully and understand what they mean.
- Help them develop debugging strategies they can apply independently.
- Never give the exact fix - instead, guide them to discover it through questions.
`.trim();
  }

  if (mode === "theory") {
    return `
${basePrompt}

SPECIAL FOCUS FOR THEORY MODE:
- Explain fundamental concepts, principles, and underlying mechanisms.
- Connect concepts to real-world applications and examples.
- Help students understand the "why" behind programming constructs.
- Draw connections between related concepts and build mental models.
- Use analogies and metaphors to make abstract concepts concrete.
- Focus on building deep understanding rather than memorization.
- Explain trade-offs, design decisions, and historical context when relevant.
`.trim();
  }

  if (mode === "coding help") {
    return `
${basePrompt}

SPECIAL FOCUS FOR CODING HELP MODE:
- Guide students through the thought process of writing code.
- Help them break down problems into smaller, manageable steps.
- Suggest patterns, best practices, and architectural approaches.
- Explain why certain approaches are better than others.
- Help them think about edge cases, error handling, and code quality.
- Guide them toward writing maintainable, readable code.
- Never write complete solutions - provide scaffolding and guidance instead.
`.trim();
  }

  return basePrompt;
}

function getLevelInstructions(level?: "beginner" | "intermediate" | "advanced" | "expert"): string {
  if (level === "beginner") {
    return `
ADAPT FOR BEGINNER LEVEL:
- Use very simple language, avoid jargon unless you explain it immediately.
- Break everything into small, clear steps.
- Use analogies and real-world examples to explain concepts.
- Assume no prior knowledge - explain everything from scratch.
- Be extra patient and encouraging.
- Avoid abbreviations or technical shortcuts.
`.trim();
  }

  if (level === "intermediate") {
    return `
ADAPT FOR INTERMEDIATE LEVEL:
- You can use some technical terms, but explain them when first introduced.
- Explain the "why" behind concepts, not just the "what".
- Connect new concepts to things they likely already know.
- Provide context and reasoning for recommendations.
`.trim();
  }

  if (level === "advanced") {
    return `
ADAPT FOR ADVANCED LEVEL:
- Dive deeper into theory and underlying mechanisms.
- Discuss edge cases and potential pitfalls.
- Compare different approaches and their trade-offs.
- Reference design patterns, algorithms, and best practices.
- Assume solid foundational knowledge.
`.trim();
  }

  if (level === "expert") {
    return `
ADAPT FOR EXPERT LEVEL:
- Use high-level abstractions and technical terminology.
- Focus on trade-offs, efficiency, and architectural considerations.
- Reference advanced patterns, algorithms, and research.
- Discuss implementation details and optimization strategies.
- Assume deep understanding of fundamentals.
`.trim();
  }

  return "";
}

type TutorRequest = {
  topic?: string;
  question: string;
  language?: string;
  studentCode?: string;
  goal?: string;
  mode?: "debugging" | "theory" | "coding help";
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  uploadedTask?: string;
};

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.log("[Tutor API] POST request received");
  
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.PROVIDER_MODEL;

  if (!apiKey || !model) {
    console.error("[Tutor API] Missing OpenAI configuration", {
      hasApiKey: Boolean(apiKey),
      hasModel: Boolean(model),
    });
    return NextResponse.json(
      {
        error:
          "Tutor is misconfigured. Ensure OPENAI_API_KEY and PROVIDER_MODEL exist in .env.local.",
      },
      { status: 500 },
    );
  }

  console.log("[Tutor API] Configuration OK, model:", model);

  const openai = new OpenAI({ apiKey });

  let body: TutorRequest;

  try {
    body = await request.json();
    console.log("[Tutor API] Request body received:", { 
      question: body?.question?.substring(0, 50) + "...",
      topic: body?.topic,
      mode: body?.mode,
      level: body?.level,
      hasCode: Boolean(body?.studentCode),
      hasUploadedTask: Boolean(body?.uploadedTask),
      uploadedTaskLength: body?.uploadedTask?.length || 0,
    });
  } catch (error) {
    console.error("[Tutor API] Invalid JSON body", error);
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!body?.question) {
    console.error("[Tutor API] Missing question field");
    return NextResponse.json(
      { error: "Missing question. Provide the student's question or prompt." },
      { status: 400 },
    );
  }

  const modePrompt = getSystemPrompt(body.mode);
  const levelInstructions = getLevelInstructions(body.level);
  const systemPrompt = levelInstructions 
    ? `${modePrompt}\n\n${levelInstructions}`
    : modePrompt;
  
  console.log("[Tutor API] System prompt configured:", {
    mode: body.mode,
    level: body.level,
    hasLevelInstructions: Boolean(levelInstructions),
    systemPromptLength: systemPrompt.length,
  });
  
  // Adjust temperature and tokens based on mode
  const modeConfig = {
    debugging: { temperature: 0.6, maxTokens: 700 }, // More focused, slightly longer for debugging steps
    theory: { temperature: 0.8, maxTokens: 800 }, // More creative for explanations, longer for concepts
    "coding help": { temperature: 0.7, maxTokens: 700 }, // Balanced for guidance
  };
  
  const config = body.mode && modeConfig[body.mode] 
    ? modeConfig[body.mode] 
    : { temperature: 0.7, maxTokens: 600 };

  const userPrompt = [
    body.mode ? `Mode: ${body.mode}` : null,
    body.topic ? `Topic: ${body.topic}` : null,
    body.uploadedTask ? `ASSIGNMENT/CONTEXT (always reference this when answering):\n${body.uploadedTask}\n\n---\n` : null,
    `Student question:\n${body.question}`,
    body.studentCode ? `Student code (do not fix it for them):\n${body.studentCode}` : null,
    body.language ? `Language/framework: ${body.language}` : null,
    body.goal ? `Learning goal: ${body.goal}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    console.log("[Tutor API] Calling OpenAI API...", { mode: body.mode, temperature: config.temperature });
    const response = await openai.chat.completions.create({
      model,
      temperature: config.temperature,
      max_completion_tokens: config.maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    console.log("[Tutor API] OpenAI response received");
    console.log("[Tutor API] Response structure:", JSON.stringify(response, null, 2));
    
    if (!response.choices || response.choices.length === 0) {
      console.error("[Tutor API] No choices in response");
      throw new Error("OpenAI API returned no choices in response.");
    }
    
    const rawText = response.choices[0]?.message?.content?.trim();

    if (!rawText) {
      console.error("[Tutor API] Response was empty");
      throw new Error("Tutor response was empty.");
    }

    console.log("[Tutor API] Raw response length:", rawText.length);

    let structured;
    try {
      structured = JSON.parse(rawText);
      console.log("[Tutor API] Successfully parsed JSON response");
    } catch (parseError) {
      console.warn("[Tutor API] Failed to parse JSON, using fallback:", parseError);
      // Minimal fallback to keep contract stable for the client.
      structured = {
        conceptSummary: rawText,
        misconceptionCheck: "Unable to parse structured reply; showing raw explanation.",
        hints: [],
        nextStepQuestion: "What part of the problem do you want to focus on next?",
      };
    }

    console.log("[Tutor API] Returning structured response");
    return NextResponse.json({ result: structured });
  } catch (error) {
    console.error("[Tutor API] Error:", error);
    if (error instanceof Error) {
      console.error("[Tutor API] Error message:", error.message);
      console.error("[Tutor API] Error stack:", error.stack);
      
      // Return more detailed error in development
      const isDevelopment = process.env.NODE_ENV === "development";
      return NextResponse.json(
        { 
          error: "Tutor is unavailable. Please try again soon.",
          details: isDevelopment ? error.message : undefined,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "Tutor is unavailable. Please try again soon." },
      { status: 500 },
    );
  }
}

