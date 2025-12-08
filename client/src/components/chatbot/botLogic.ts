export const botResponses: Record<string, string> = {
  create: "To create a note, click the 'New Note' button at the top.",
  edit: "Open any note, then tap the 'Edit' button to modify it.",
  delete: "Open the note, then click the trash icon to delete it.",
  bookmark:
    "To bookmark a note, click the star icon on the top right corner of its card.",
  search: "Use the search bar at the top to quickly find your notes.",
  list: "All your notes appear on the homepage. Tap any to open.",
  welcome: "Welcome back! What do you want to do today?",
};

export function getBotReply(input: string): string {
  const msg = input.toLowerCase();

  const key = Object.keys(botResponses).find((k) => msg.includes(k));

  return (
    botResponses[key ?? ""] ||
    "I'm not sure I understand. Try asking about creating, editing, deleting, bookmarks, or navigation."
  );
}
