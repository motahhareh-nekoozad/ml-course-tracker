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

  const accentColor =
    color === "yellow" ? "accent-yellow-500" : "accent-purple-500";

  // New: Map for hover classes (avoids purge issues)
  const getHoverClass = (color ,userId , currentUserId) => {
    if (color === "yellow") {
      return "hover:bg-yellow-300 dark:hover:bg-yellow-700"; // Full static classes for yellow
    } else if (color === "purple") {
      return "hover:bg-purple-300 dark:hover:bg-purple-900"; // For purple
    }
    return "hover:bg-gray-100 dark:hover:bg-gray-700"; // Default
  };  
  const getCursorPointer = (userId, currentUserId) => {
    return userId === currentUserId ? "cursor-pointer" : "cursor-default";
  };

  const cursorClass = getCursorPointer(userId, currentUserId);

  const hoverClass = getHoverClass(color || "purple"); // Use color prop for hover

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      className={`p-4 border rounded-lg mb-2 shadow ${bgColor} ${cursorClass} ${hoverClass}`}
    >
      <div onClick={handleChange} className="flex justify-between items-center">
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
