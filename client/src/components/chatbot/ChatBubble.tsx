import { Message } from "./useChatStore";
import { motion } from "framer-motion";

export default function ChatBubble({ msg }: { msg: Message }) {
  const isBot = msg.from === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-[80%] p-2 rounded-xl text-sm ${
        isBot ? "bg-gray-200 text-black" : "bg-blue-600 text-white ml-auto"
      }`}
    >
      {msg.text}
    </motion.div>
  );
}
