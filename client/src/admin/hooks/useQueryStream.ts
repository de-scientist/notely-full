import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Define the type for the data structure coming from the SSE endpoint
type StreamMessage = {
  userId: string;
  question: string;
  createdAt: string;
  // Assuming the server also sends a unique ID if logged to the database
  id: string;
};

// Define the type for the existing cached data (the array of queries)
type QueryCache = StreamMessage[];

export function useQueryStream() {
  const qc = useQueryClient();

  useEffect(() => {
    // 1. Establish the Server-Sent Events (SSE) connection
    const ev = new EventSource("/admin/queries/stream");

    ev.onmessage = (e) => {
      try {
        // FIX 2: Use the 'msg' data instead of ignoring it
        const msg: StreamMessage = JSON.parse(e.data);

        // 2. Use setQueryData to directly update the cache.
        // This instantly adds the new query to the list without waiting for a full fetch,
        // improving UX/perceived latency.
        qc.setQueryData<QueryCache>(["admin-queries"], (oldData) => {
          // If oldData is undefined (first run), just return the new message as an array.
          if (!oldData) return [msg];

          // Otherwise, prepend the new message to the existing list.
          return [msg, ...oldData];
        });

        // 3. Invalidate other queries if necessary (e.g., top-queries)
        // FIX 1: The invalidateQueries signature must use an object { queryKey: [...] }
        qc.invalidateQueries({ queryKey: ["admin-queries"] });
      } catch (error) {
        console.error("Error processing SSE message:", error);
      }
    };

    // Cleanup function: Close the EventSource when the component unmounts
    return () => ev.close();
  }, [qc]); // Dependency array includes qc (query client), required by the linter
}
