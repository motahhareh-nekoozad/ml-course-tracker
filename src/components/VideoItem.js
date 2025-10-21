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
  const getHoverClass = (color, userId, currentUserId) => {
    // Check if this is for the current user; if not, disable hover
    if (userId !== currentUserId) {
      return ""; // No hover effect for partner's items
    }

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

  // Updated: Tag colors with more contrast - Wider shade range for better distinction
  // Text colors optimized for readability
  const getTagColorClass = (userColor, tag) => {
    if (userColor === "yellow") {
      switch (tag) {
        case "Supervised Machine Learning": // Very light yellow for basics
          return "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-50";
        case "Advanced Algorithms": // Medium yellow for advanced
          return "bg-yellow-300 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100";
        case "Unsupervised Machine Learning": // Bold yellow for projects
          return "bg-yellow-500 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-50";
        default:
          return "bg-yellow-300 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100"; // Fallback
      }
    } else if (userColor === "purple") {
      switch (tag) {
        case "Supervised Machine Learning": // Very light purple for basics
          return "bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-50";
        case "Advanced Algorithms": // Medium purple for advanced
          return "bg-purple-300 dark:bg-purple-700 text-purple-900 dark:text-purple-100";
        case "Unsupervised Machine Learning": // Bold purple for projects
          return "bg-purple-500 dark:bg-purple-500 text-purple-900 dark:text-purple-50";
        default:
          return "bg-purple-300 dark:bg-purple-700 text-purple-900 dark:text-purple-100"; // Fallback
      }
    }
    // Default if no color
    return "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100";
  };

  const cursorClass = getCursorPointer(userId, currentUserId);

  const hoverClass = getHoverClass(color, userId, currentUserId); // Pass userId and currentUserId for conditional hover

  const tagColorClass = getTagColorClass(color, video.tag); // Now based on user color and tag

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
        <div className="flex flex-col justify-center gap-2">
          <div className="flex justify-between items-center gap-8">
            <span className="font-bold text-lg">{video.title}</span>
            <div
              className={`${tagColorClass} border rounded-md px-2 py-1 inline-block`}
            >
              <span className="font-semibold text-md">{video.tag}</span>
            </div>
          </div>
          <p className="text-sm">{video.day}</p>
        </div>
        <input
          type="checkbox"
          checked={done}
          disabled={userId !== currentUserId}
          readOnly={true} // 👈 اضافه کن
          className="w-6 h-6 rounded-2xl"
          style={{ accentColor: done ? color : undefined }}
        />
      </div>
    </motion.div>
  );
}

export default VideoItem;
