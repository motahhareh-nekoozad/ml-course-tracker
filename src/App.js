import React, { useState, useEffect } from "react";
import CalendarView from "./components/CalendarView";
import ProgressTabs from "./components/Tabs";
import { courseData } from "./data/courseData";
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
function App() {
  const [userId, setUserId] = useState("");
  const [tempName, setTempName] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const users = ["mahan", "jojo"];
  const userColors = { mahan: "yellow", jojo: "purple" };

  const partnerId = users.find((u) => u !== userId);

  useEffect(() => {
    const savedUser = localStorage.getItem("ml_user");
    if (savedUser) setUserId(savedUser);
  }, []);

const handleLogin = () => {
    const trimmedName = tempName.trim();
    if (!trimmedName) return alert("Please enter your name");
    
    // Added: Check if the name is one of the allowed users
    if (!users.includes(trimmedName.toLowerCase())) {  // toLowerCase for case-insensitive matching
      return alert("Only users 'mahan' or 'jojo' are allowed to log in. Please enter your valid name my little girl :)❤️");
    }
    
    localStorage.setItem("ml_user", trimmedName.toLowerCase());  // Store in lowercase for consistency
    setUserId(trimmedName.toLowerCase());
  };
  const handleLogout = () => {
    localStorage.removeItem("ml_user");
    setUserId("");
  };

  // fix: userColor based on userId
  const userColor = userColors[userId] || "purple";

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to ML Course Tracker
        </h1>
        <input
          type="text"
          placeholder="Enter your nickname"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          className="border rounded px-4 py-2 mb-4 text-black"
        />
        <button
          onClick={handleLogin}
          className="px-6 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">ML Course Tracker</h1>
          <div className="flex items-center gap-3">
            <span className="font-semibold">
              Hello, <span className="text-purple-500">{userId}</span>
            </span>
            <button
              className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
            {/* Updated: Attractive dark mode button with better moon icon */}
            <button
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white rounded-lg shadow-md transition-all duration-200 flex items-center justify-center"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <SunIcon size={20} className="h-5 w-5 text-white" />
              ) : (
                <MoonIcon size={20} className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>

        <CalendarView
          events={courseData}
          users={users}
          userColors={userColors}
          darkMode={darkMode}
        />

        {/* Progress Tabs */}
        <ProgressTabs
          videos={courseData}
          currentUserId={userId}
          partnerId={partnerId}
          users={users}
          userColors={userColors}
        />
      </div>
    </div>
  );
}

export default App;
