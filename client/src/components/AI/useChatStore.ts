import { create } from "zustand";

export interface Message {
  from: "bot" | "user";
  text: string;
}

interface ChatState {
  open: boolean;
  messages: Message[];
  input: string;
  loading: boolean;

  toggle: () => void;
  setInput: (v: string) => void;
  addMessage: (msg: Message) => void;
  setLoading: (v: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  open: false,
  messages: [
    { from: "bot", text: "Hello! I'm Notely AI. How can I help you today?" },
  ],
  input: "",
  loading: false,

  toggle: () => set((s) => ({ open: !s.open })),
  setInput: (v) => set({ input: v }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setLoading: (v) => set({ loading: v }),
  reset: () =>
    set({
      messages: [
        {
          from: "bot",
          text: "Hello! I'm Notely AI. How can I help you today?",
        },
      ],
      input: "",
      loading: false,
    }),
}));
