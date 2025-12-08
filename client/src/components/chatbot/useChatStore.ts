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

export const useChatStore = create<ChatState>((set) => ({
  open: false,
  messages: [
    { from: "bot", text: "Hello! I’m Notely Assistant. What can I help you with?" },
  ],
  input: "",

  toggle: () => set((s) => ({ open: !s.open })),
  setInput: (v) => set({ input: v }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  reset: () =>
    set({
      messages: [
        { from: "bot", text: "Hello! I’m Notely Assistant. What can I help you with?" },
      ],
      input: "",
    }),
}));
