// api/chat.ts (Updated)
export async function askNotelyAI(
  message: string,
  opts?: { channel?: string; metadata?: any },
): Promise<{ reply: string; intent: string }> {
  // Use the full URL for the API endpoint.
  const API_URL = "http://localhost:5000/api/chat"; // Construct the body payload, including optional channel and metadata

  const payload = {
    message,
    channel: opts?.channel,
    metadata: opts?.metadata,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // Send the payload with optional fields
  });

  if (!res.ok) {
    let errorDetail = "Unknown AI request failure.";
    try {
      const errorBody = await res.json();
      errorDetail = errorBody.error || errorDetail;
    } catch (e) {
      // Ignore JSON parsing error
    }
    throw new Error(`AI request failed: ${errorDetail}`);
  } // FIX: Return the entire data object, including 'reply' and 'intent'.

  const data = await res.json(); // Ensure the returned object matches the expected structure
  return data as { reply: string; intent: string };
}
