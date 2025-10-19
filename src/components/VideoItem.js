import React from "react";
import { motion } from "framer-motion";

function VideoItem({ video, userId, currentUserId, color, done, onToggle }) {
  const handleChange = () => {
    if (userId !== currentUserId) return;
    if (onToggle) onToggle();
  };

  const bgColor = done
    ? color === "yellow"
      ? "bg-yellow-400 dark:bg-yellow-600"
      : "bg-purple-400 dark:bg-purple-600"
    : "bg-white dark:bg-gray-800";

    const accentColor = color === "yellow" ? "accent-yellow-500" : "accent-purple-500";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      className={`p-4 border rounded-lg mb-2 shadow ${bgColor}`}
    >
      <div
        onClick={handleChange}
        className="flex justify-between items-center"
      >
        <div>
          <span className="font-bold text-lg">{video.title}</span>
          <p className="text-sm">{video.day}</p>
        </div>
        <input
          type="checkbox"
          checked={done}
          disabled={userId !== currentUserId}
          className="w-6 h-6 rounded-2xl"
          style={{ accentColor: done ? color : undefined }}
        />
      </div>
    </motion.div>
  );
}

export default VideoItem;
