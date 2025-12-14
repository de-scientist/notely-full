export async function askNotelyAI(message: string) {
  // Use the full URL for the API endpoint.
  // Get the server URL from an environment variable or define it here.
  // Assuming the server runs on the port defined in index.ts (e.g., 5000).
  //const SERVER_URL = process.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Construct the full API URL
  const API_URL = "http://localhost:5000/api/chat";

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    // Read the error message from the server if available
    let errorDetail = "Unknown AI request failure.";
    try {
      const errorBody = await res.json();
      errorDetail = errorBody.error || errorDetail;
    } catch (e) {
      // Ignore JSON parsing error if the response wasn't JSON
    }
    throw new Error(`AI request failed: ${errorDetail}`);
  }

  // The server returns a JSON object like { reply: "..." }.
  const data = await res.json();

  // Return the specific 'reply' field from the server response
  return data.reply;
}
