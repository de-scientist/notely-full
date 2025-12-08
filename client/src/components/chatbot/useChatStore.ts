import { create } from "zustand";

export interface Message {
  from: "bot" | "user";
  text: string;
}

interface ChatState {
  open: boolean;
  messages: Message[];
  input: string;

  toggle: () => void;
  setInput: (v: string) => void;
  addMessage: (msg: Message) => void;
  reset: () => void;
}

// NOTE: In a real application, the USER_NAME placeholder would be replaced 
// by an actual variable holding the current user's name/handle.
const BOT_GREETING_TEMPLATE = (user: string) => 
  `Hello ${user}! I’m Notely Assistant. What can I help you with?`;

export const useChatStore = create<ChatState>((set) => ({
  open: false,
  messages: [
    { from: "bot", text: BOT_GREETING_TEMPLATE("USER_NAME") }, // Updated initial message
  ],
  input: "",

  toggle: () => set((s) => ({ open: !s.open })),
  setInput: (v) => set({ input: v }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  reset: () =>
    set({
      messages: [
        { from: "bot", text: BOT_GREETING_TEMPLATE("USER_NAME") }, // Updated reset message
      ],
      input: "",
    }),
}));