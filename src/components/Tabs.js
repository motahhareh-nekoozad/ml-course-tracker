import React, { useState, useEffect } from "react";
import VideoItem from "./VideoItem";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { AnimatePresence } from "framer-motion";

function ProgressTabs({ videos, currentUserId, partnerId, users, userColors }) {
  const [videoStatuses, setVideoStatuses] = useState({}); // {title: true/false} for selected user
  const [activeTab, setActiveTab] = useState("notDone");
  const [percent, setPercent] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(currentUserId); // for Me/Partner selection

  // fetch status for selected user
  const fetchStatus = async (userIdToFetch) => {
    let statuses = {};
    for (let v of videos) {
      const docRef = doc(db, "progress", `${userIdToFetch}_${v.title}`);
      const docSnap = await getDoc(docRef);
      statuses[v.title] = docSnap.exists() ? docSnap.data().done : false;
    }
    setVideoStatuses(statuses);
    updatePercent(statuses);
  };

  const updatePercent = (statuses) => {
    const doneCount = Object.values(statuses).filter(Boolean).length;
    setPercent(Math.round((doneCount / videos.length) * 100));
  };

  // useEffect to fetch status when videos or selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      fetchStatus(selectedUserId);
    }
  }, [videos, selectedUserId]); // add dependencies

  //toggle done status
  const toggleDone = (title) => {
    if (selectedUserId !== currentUserId) return; // only allow if current user is selected

    const currentDone = videoStatuses[title] || false;
    const newStatuses = { ...videoStatuses, [title]: !currentDone };

    // 1️⃣ update local state immediately
    setVideoStatuses(newStatuses);
    updatePercent(newStatuses);

    // 2️⃣ update in Firestore
    const docRef = doc(db, "progress", `${selectedUserId}_${title}`); // selectedUserId == currentUserId
    setDoc(docRef, { done: !currentDone });
  };

  const doneVideos = videos.filter((v) => videoStatuses[v.title]);
  const notDoneVideos = videos.filter((v) => !videoStatuses[v.title]);

  // ui colors based on selected user
  const selectedColor = userColors[selectedUserId] || "purple";

  return (
    <div className="mt-6">
      {/*select User Tab(Me / Partner) */}
      <div className="flex space-x-2 mb-4 bg-gray-200 dark:bg-gray-700 p-2 rounded">
        <button
          className={`px-4 py-2 rounded ${
            selectedUserId === currentUserId
              ? `bg-${selectedColor}-500 text-white`
              : "bg-gray-300 dark:bg-gray-600"
          }`}
          onClick={() => setSelectedUserId(currentUserId)}
        >
          Me
        </button>
        <button
          className={`px-4 py-2 rounded ${
            selectedUserId === partnerId
              ? `bg-${userColors[partnerId]}-500 text-white`
              : "bg-gray-300 dark:bg-gray-600"
          }`}
          onClick={() => setSelectedUserId(partnerId)}
          disabled={!partnerId} // if no partner, disable button
        >
          Partner
        </button>
      </div>

      {/* inner selected With Colors */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "done"
              ? `bg-${selectedColor}-500 text-white`
              : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => setActiveTab("done")}
        >
          Completed
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "notDone"
              ? `bg-${selectedColor}-500 text-white`
              : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => setActiveTab("notDone")}
        >
          Not Completed
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "progress"
              ? `bg-${selectedColor}-500 text-white`
              : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => setActiveTab("progress")}
        >
          Progress
        </button>
      </div>

      <div className="border rounded p-4 bg-white dark:bg-gray-800 shadow">
        <AnimatePresence>
          {activeTab === "done" &&
            doneVideos.map((v) => (
              <VideoItem
                key={v.title}
                video={v}
                userId={selectedUserId} // 👈 fix: SelectedUser Id for handle Disabling
                currentUserId={currentUserId}
                color={userColors[selectedUserId]} // Selected User Color
                done={videoStatuses[v.title]}
                onToggle={() => toggleDone(v.title)}
              />
            ))}

          {activeTab === "notDone" &&
            notDoneVideos.map((v) => (
              <VideoItem
                key={v.title}
                video={v}
                userId={selectedUserId} // 👈 fix: selectedUserId
                currentUserId={currentUserId}
                color={userColors[selectedUserId]} // Color of selected user
                done={videoStatuses[v.title]}
                onToggle={() => toggleDone(v.title)}
              />
            ))}
        </AnimatePresence>

        {activeTab === "progress" && (
          <div>
            <div className="text-lg font-bold mb-2">
              {/* 👈 progress for Selected User */}
              Progress ({selectedUserId}): {percent}%
            </div>
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div
                className={`h-4 rounded-full`} // 👈 Dynamic Color
                style={{
                  width: `${percent}%`,
                  backgroundColor: userColors[selectedUserId], // Selected User Color
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressTabs;
