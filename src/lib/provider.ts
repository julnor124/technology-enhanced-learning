function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }



export async function streamFromProvider(messages: Array<{ role: string; content: string }>): Promise<ReadableStream> {

  const useMock = process.env.NEXT_PUBLIC_PROVIDER === "mock" || !process.env.PROVIDER_API_KEY;



  if (useMock) {

    // Simple mock that streams a friendly echo

    const input = messages?.[messages.length - 1]?.content ?? "";

    const reply = `🤖 Mock reply for: \n\n"${input}"\n\nReplace lib/provider.ts with your real provider (OpenAI/Anthropic/Gemini/Ollama).`;



    return new ReadableStream({

      async start(controller) {

        for (const ch of reply) {

          controller.enqueue(new TextEncoder().encode(ch));

          await sleep(10 + Math.random() * 25);

        }

        controller.close();

      },

    });

  }



  // TODO: Replace with a real provider call, e.g. OpenAI/Anthropic/etc.

  // Example shape (pseudocode):

  // const res = await fetch("<PROVIDER_ENDPOINT>", {

  //   method: "POST",

  //   headers: { Authorization: `Bearer ${process.env.PROVIDER_API_KEY}`, "Content-Type": "application/json" },

  //   body: JSON.stringify({ model: process.env.PROVIDER_MODEL, messages, stream: true }),

  // });

  // if (!res.ok || !res.body) throw new Error("Provider error");

  // return res.body as ReadableStream;



  throw new Error("Provider not configured. Set NEXT_PUBLIC_PROVIDER=mock to use the mock stream.");

}

