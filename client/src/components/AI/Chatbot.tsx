import ChatWindow from "../voiceAI/ChatWindow";
import { useChatStore } from "./useChatStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot() {
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
            <ChatWindow />
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
