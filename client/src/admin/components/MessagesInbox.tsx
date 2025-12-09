import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function MessagesInbox() {
  const [reply, setReply] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const { data = [], refetch } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => fetch("/admin/messages").then(res => res.json()),
  });

  const sendReply = async () => {
    await fetch("/admin/messages/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: selectedId, reply }),
    });

    setReply("");
    setSelectedId("");
    refetch();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">User Messages</h1>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">User</th>
            <th className="border p-2">Message</th>
            <th className="border p-2">Admin Reply</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((m) => (
            <tr key={m.id}>
              <td className="border p-2">{m.userId}</td>
              <td className="border p-2">{m.message}</td>
              <td className="border p-2">{m.adminReply || "—"}</td>
              <td className="border p-2">
                <Button
                  onClick={() => {
                    setSelectedId(m.id);
                  }}
                >
                  Reply
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedId && (
        <div className="mt-6 space-y-3">
          <textarea
            className="border p-3 w-full"
            placeholder="Write a reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />

          <Button onClick={sendReply}>Send Reply</Button>
        </div>
      )}
    </div>
  );
}
