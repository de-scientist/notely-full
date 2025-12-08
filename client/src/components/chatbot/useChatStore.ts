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
 * Factory function to create the chat store. It allows the initial bot greeting
 * to be customized with the current logged-in user's name.
 * * @param userName The name of the currently logged-in user (e.g., from an authentication context).
 * @returns The Zustand store hook ready for use in components.
 * * NOTE: In your application, you must now call this function once when the user logs in
 * or when the user's name is available to create the actual useChatStore hook.
 */
export const createChatStore = (userName: string) => {
    // Dynamically generates the initial greeting message using the template literal.
    const BOT_GREETING = `Hello ${userName}! I’m Notely Assistant. What can I help you with?`;

    return create<ChatState>((set) => ({
      open: false,
      messages: [
        { from: "bot", text: BOT_GREETING }, // Initial message with dynamic user name
      ],
      input: "",

      // Toggles the chat window visibility
      toggle: () => set((s) => ({ open: !s.open })),
      
      // Sets the current input value
      setInput: (v) => set({ input: v }),
      
      // Adds a new message to the chat history
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      
      // Resets the chat state to its initial configuration
      reset: () =>
        set({
          messages: [
            { from: "bot", text: BOT_GREETING }, // Ensures reset also uses the dynamic greeting
          ],
          input: "",
        }),
    }));
};