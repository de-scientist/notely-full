import { Message } from "./useChatStore";
import { motion } from "framer-motion";

export default function ChatBubble({ msg }: { msg: Message }) {
  const isBot = msg.from === "bot";

  return (
    // Outer div to control alignment (left for bot, right for user)
    <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        // Adjusted maximum width slightly for better flow
        className={`max-w-[75%] p-3 text-sm shadow-md transition-colors duration-200 ${
          isBot 
            ? "bg-gray-100 text-gray-800 rounded-tr-xl rounded-b-xl rounded-tl-sm" // Light background for bot, sharp corner top-left
            : "bg-indigo-600 text-white rounded-tl-xl rounded-b-xl rounded-tr-sm" // Primary color for user, sharp corner top-right
        }`}
      >
        {/* Use whitespace-pre-wrap to handle line breaks within the message text */}
        <p className="whitespace-pre-wrap">{msg.text}</p>
      </motion.div>
    </div>
  );
}