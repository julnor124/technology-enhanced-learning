export async function track(event: string, props: Record<string, unknown> = {}) {

  try {

    await fetch("/api/track", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ event, props, ts: Date.now() }),

      keepalive: true,

    });

  } catch (e) {

    // swallow

  }

}
