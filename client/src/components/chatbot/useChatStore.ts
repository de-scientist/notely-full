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

/**
 * Factory function to create the chat store. It accepts the userName of the
 * currently logged-in user to generate a dynamic initial greeting.
 * * NOTE: In your application, you must call this function once when the user's name
 * is available to create the actual useChatStore hook.
 * * Example Usage:
 * const useChatStore = createChatStore(currentUser.name);
 * * @param userName The name of the currently logged-in user.
 * @returns A custom Zustand store hook.
 */
export const createChatStore = (userName: string) => {
  // Dynamically generates the initial greeting message.
  const DYNAMIC_GREETING = `Hello ${userName}! I’m Notely Assistant. What can I help you with?`;

  return create<ChatState>((set) => ({
    open: false,
    messages: [
      { from: "bot", text: DYNAMIC_GREETING }, // Dynamic initial message
    ],
    input: "",

    // Preserved functionality: Toggles the chat window visibility
    toggle: () => set((s) => ({ open: !s.open })),

    // Preserved functionality: Sets the current input value
    setInput: (v) => set({ input: v }),

    // Preserved functionality: Adds a new message to the chat history
    addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

    // Preserved functionality: Resets the chat state to its initial configuration
    reset: () =>
      set({
        messages: [
          { from: "bot", text: DYNAMIC_GREETING }, // Dynamic greeting on reset
        ],
        input: "",
      }),
  }));
};
