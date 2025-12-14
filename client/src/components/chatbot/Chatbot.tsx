import ChatWindow from "./ChatWindow";
// Import the factory function instead of the uninitialized hook
import { createChatStore } from "./useChatStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react"; // Needed for store initialization/user fetching

// --- Mock function to simulate fetching the logged-in user's name ---
// In a real application, this would come from an Auth Context, Redux, etc.
const useLoggedInUserName = () => {
  // Replace this logic with your actual user fetching/context hook
  // We'll return a placeholder name for initialization.
  return "Notely User";
};
// --- End Mock ---

// 4. Initialize the store hook outside the component for persistence across renders.
// NOTE: This approach works only if the username is available statically or fetched
// outside the component's render loop. For simplicity, we initialize it here.
const userName = useLoggedInUserName();
const useChatStore = createChatStore(userName);

export default function Chatbot() {
  // 5. Destructure the properties from the initialized hook
  const { open, toggle } = useChatStore();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            className="mb-3"
          >
            {/* 6. Pass the initialized hook as the 'useStore' prop */}
            <ChatWindow useStore={useChatStore} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggle}
        className="bg-black text-white p-4 rounded-full shadow-xl"
        whileTap={{ scale: 0.9 }}
      >
        💬
      </motion.button>
    </div>
  );
}
