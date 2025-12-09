import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useQueryStream() {
  const qc = useQueryClient();

  useEffect(() => {
    const ev = new EventSource("/admin/queries/stream");

    ev.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      qc.invalidateQueries(["admin-queries"]);
    };

    return () => ev.close();
  }, []);
}
