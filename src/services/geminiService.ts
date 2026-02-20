export const getStrategicHint = async (
  imageBase64: string,
  validTargets: any[],
  dangerRow: number
) => {
  const controller = new AbortController();

  // Auto-timeout after 5 seconds
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch("/api/strategic-hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        imageBase64,
        validTargets,
        dangerRow
      })
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error("Server error");
    }

    return await res.json();
  } catch (err) {
    console.warn("AI Timeout or Error — fallback triggered.");
    return {
      hint: {
        message: "AI Timeout — Playing safe.",
        rationale: "Using fallback strategy."
      },
      debug: {
        latency: 0,
        promptContext: "",
        rawResponse: "",
        timestamp: new Date().toLocaleTimeString(),
        error: "Timeout"
      }
    };
  }
};
