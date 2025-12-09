// api/chat.ts
export async function askNotelyAI(message: string, opts?: { channel?: string; metadata?: any }) {
  
  // Use the full URL for the API endpoint. 
  // For production, this should ideally come from an environment variable.
  const API_URL = "http://localhost:5000/api/chat";

  // Construct the body payload, including optional channel and metadata
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
    // Read the error message from the server if available (Enhanced error handling)
    let errorDetail = "Unknown AI request failure.";
    try {
        const errorBody = await res.json();
        errorDetail = errorBody.error || errorDetail;
    } catch (e) {
        // Ignore JSON parsing error if the response wasn't JSON
    }
    throw new Error(`AI request failed: ${errorDetail}`);
  }

  // The server returns a JSON object like { reply: "...", intent: "..." }.
  const data = await res.json();
  
  // Return the specific 'reply' field from the server response
  return data.reply;
}