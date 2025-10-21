import React, { useState, useEffect, useMemo, useRef } from "react";
import VideoItem from "./VideoItem";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline"; // Beautiful chevron icon

function ProgressTabs({ videos, currentUserId, partnerId, users, userColors }) {
  const [videoStatuses, setVideoStatuses] = useState({});
  const [activeTab, setActiveTab] = useState("notDone");
  const [percent, setPercent] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(currentUserId);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false); // Loading for filter changes

  // Filter state for tags
  const [selectedTag, setSelectedTag] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // For custom dropdown

  // Pagination states
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Accumulated displayed videos for done/notDone
  const [displayedDone, setDisplayedDone] = useState([]);
  const [displayedNotDone, setDisplayedNotDone] = useState([]);

  const dropdownRef = useRef(null); // For closing dropdown on outside click

  const tags = [
    "Supervised Machine Learning",
    "Advanced Algorithms",
    "Unsupervised Machine Learning",
  ];

  const initializeStatuses = useMemo(() => {
    const init = {};
    videos.forEach((v) => (init[v.title] = false));
    return init;
  }, [videos]);

  const fetchStatus = async (userIdToFetch) => {
    setIsLoading(true);
    let statuses = initializeStatuses;

    try {
      const batchSize = 15;
      for (let i = 0; i < videos.length; i += batchSize) {
        const batch = videos.slice(i, i + batchSize);
        const promises = batch.map((v) =>
          getDoc(doc(db, "progress", `${userIdToFetch}_${v.title}`))
            .then((docSnap) => (docSnap.exists() ? docSnap.data().done : false))
            .catch(() => false)
        );
        const results = await Promise.all(promises);
        batch.forEach((v, idx) => {
          statuses[v.title] = results[idx];
        });
        if (i + batchSize < videos.length) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
    } catch (error) {
      console.warn("Firestore fetch failed, using local fallback:", error);
      const cached = localStorage.getItem(`progress_${userIdToFetch}`);
      if (cached) {
        const cachedStatuses = JSON.parse(cached);
        Object.keys(cachedStatuses).forEach((title) => {
          if (statuses[title] !== undefined)
            statuses[title] = cachedStatuses[title];
        });
      }
    } finally {
      setIsLoading(false);
    }

    setVideoStatuses(statuses);
    updatePercent(statuses);
  };

  const updatePercent = (statuses) => {
    const doneCount = Object.values(statuses).filter(Boolean).length;
    setPercent(Math.round((doneCount / videos.length) * 100));
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchStatus(selectedUserId);
      setPage(1);
      setDisplayedDone([]);
      setDisplayedNotDone([]);
    }
  }, [videos, selectedUserId]);

  const toggleDone = async (title) => {
    if (selectedUserId !== currentUserId) return;

    const currentDone = videoStatuses[title] || false;
    const newStatuses = { ...videoStatuses, [title]: !currentDone };

    setVideoStatuses(newStatuses);
    updatePercent(newStatuses);

    localStorage.setItem(
      `progress_${selectedUserId}`,
      JSON.stringify(newStatuses)
    );

    const docRef = doc(db, "progress", `${selectedUserId}_${title}`);
    setDoc(docRef, { done: !currentDone }).catch((error) => {
      console.warn("Firestore toggle failed:", error);
    });
  };

  // Memoized done/notDone videos with tag filter
  const filteredDoneVideos = useMemo(() => {
    let filtered = videos.filter((v) => videoStatuses[v.title]);
    if (selectedTag !== "All") {
      filtered = filtered.filter((v) => v.tag === selectedTag);
    }
    return filtered;
  }, [videos, videoStatuses, selectedTag]);

  const filteredNotDoneVideos = useMemo(() => {
    let filtered = videos.filter((v) => !videoStatuses[v.title]);
    if (selectedTag !== "All") {
      filtered = filtered.filter((v) => v.tag === selectedTag);
    }
    return filtered;
  }, [videos, videoStatuses, selectedTag]);

  // Load initial batch or more
  const loadBatch = (allVideos, setDisplayed, isInitial = false) => {
    const startIndex = isInitial
      ? 0
      : displayedDone.length || displayedNotDone.length; // Use current length for append
    const endIndex = startIndex + itemsPerPage;
    const nextBatch = allVideos.slice(startIndex, endIndex);
    setDisplayed((prev) => [...prev, ...nextBatch]);
    if (!isInitial) {
      setPage(page + 1);
    }
  };

  // Has more check
  const hasMore = useMemo(() => {
    const currentVideos =
      activeTab === "done" ? filteredDoneVideos : filteredNotDoneVideos;
    const currentDisplayed =
      activeTab === "done" ? displayedDone : displayedNotDone;
    return currentDisplayed.length < currentVideos.length;
  }, [
    activeTab,
    filteredDoneVideos,
    filteredNotDoneVideos,
    displayedDone,
    displayedNotDone,
  ]);

  const selectedColor = userColors[selectedUserId] || "purple";

  // Dynamic loading color based on selected user color
  const getLoadingColorSpinner = (color) => {
    switch (color) {
      case "yellow":
        return "border-yellow-200 border-t-yellow-500 dark:border-yellow-800 dark:border-t-yellow-400";
      case "purple":
        return "border-purple-200 border-t-purple-500 dark:border-purple-800 dark:border-t-purple-400";
      default:
        return "border-purple-200 border-t-purple-500 dark:border-purple-800 dark:border-t-purple-400";
    }
  };

  const spinnerColorClass = getLoadingColorSpinner(selectedColor);

  const getActiveClass = (color) => {
    switch (color) {
      case "yellow":
        return "bg-yellow-500";
      case "purple":
        return "bg-purple-500";
      default:
        return "bg-purple-500";
    }
  };

  const partnerActiveClass = getActiveClass(userColors[partnerId] || "purple");

  const getTagProgress = (tag) => {
    const videosForTag = videos.filter((v) => v.tag === tag);
    if (videosForTag.length === 0) return 0;
    const doneForTag = videosForTag.filter(
      (v) => videoStatuses[v.title]
    ).length;
    return Math.round((doneForTag / videosForTag.length) * 100);
  };

  const getProgressBarColor = (userColor, tag) => {
    if (userColor === "yellow") {
      switch (tag) {
        case "Supervised Machine Learning":
          return "#fef3c7";
        case "Advanced Algorithms":
          return "#fde68a";
        case "Unsupervised Machine Learning":
          return "#f59e0b";
        default:
          return "#fde68a";
      }
    } else if (userColor === "purple") {
      switch (tag) {
        case "Supervised Machine Learning":
          return "#a78bfa";
        case "Advanced Algorithms":
          return "#c084fc";
        case "Unsupervised Machine Learning":
          return "#a855f7";
        default:
          return "#c084fc";
      }
    }
    return "#6b7280";
  };

  const handleLoadMore = () => {
    if (activeTab === "done") {
      loadBatch(filteredDoneVideos, setDisplayedDone, false);
    } else if (activeTab === "notDone") {
      loadBatch(filteredNotDoneVideos, setDisplayedNotDone, false);
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setPage(1);
    // Reset displayed for new tab
    if (newTab === "done") {
      setDisplayedNotDone([]);
    } else if (newTab === "notDone") {
      setDisplayedDone([]);
    }
  };

  // Reset displayed and set loading when tag changes
  useEffect(() => {
    if (activeTab !== "progress") {
      setIsFiltering(true);
      setPage(1);
      if (activeTab === "done") {
        setDisplayedDone([]);
      } else if (activeTab === "notDone") {
        setDisplayedNotDone([]);
      }
    }
  }, [selectedTag, activeTab]);

  // Initial load for current tab when statuses change or tag/tab changes
  useEffect(() => {
    if (
      Object.keys(videoStatuses).length > 0 &&
      activeTab !== "progress" &&
      isFiltering // 👈 Simplified: trigger only on isFiltering (not on displayed.length)
    ) {
      // After statuses loaded and not loading
      if (activeTab === "done" && displayedDone.length === 0) {
        // 👈 Keep this for safety
        loadBatch(filteredDoneVideos, setDisplayedDone, true);
      } else if (activeTab === "notDone" && displayedNotDone.length === 0) {
        loadBatch(filteredNotDoneVideos, setDisplayedNotDone, true);
      }
      setIsFiltering(false); // Reset loading after load
    }
  }, [
    activeTab,
    videoStatuses,
    filteredDoneVideos,
    filteredNotDoneVideos,
    isFiltering, // 👈 This triggers the load on filter change
  ]);
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Beautiful Loading Spinner Component - Dynamic color based on user
  const LoadingSpinner = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center p-8"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`w-8 h-8 border-4 rounded-full ${spinnerColorClass} mb-4`}
      />
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Loading your progress...
      </p>
    </motion.div>
  );

  // Dynamic dropdown classes based on user color
  const getDropdownClasses = (color) => {
    const bg =
      color === "yellow"
        ? "bg-yellow-50 dark:bg-yellow-500"
        : "bg-purple-50 dark:bg-purple-500";
    const border =
      color === "yellow"
        ? "border-yellow-300 dark:border-yellow-700"
        : "border-purple-300 dark:border-purple-700";
    const ring =
      color === "yellow" ? "focus:ring-yellow-500" : "focus:ring-purple-500";
    const text =
      color === "yellow"
        ? "text-yellow-900 dark:text-yellow-100"
        : "text-purple-900 dark:text-purple-100";
    return `${bg} ${border} ${ring} ${text}`;
  };

  const dropdownClasses = getDropdownClasses(selectedColor);

  //  Dynamic hover/selected classes for options based on user color
  const getOptionClasses = (color) => {
    const hoverBg =
      color === "yellow"
        ? "hover:bg-yellow-100 dark:hover:bg-yellow-800"
        : "hover:bg-purple-100 dark:hover:bg-purple-800";
    const selectedBg =
      color === "yellow"
        ? "bg-yellow-100 dark:bg-yellow-800"
        : "bg-purple-100 dark:bg-purple-800";
    return { hoverBg, selectedBg };
  };

  const optionClasses = getOptionClasses(selectedColor);

  //  Custom Dropdown Component - Fixed selected color for yellow user and prettier icon
  const CustomDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`w-full min-w-[200px] px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${dropdownClasses} flex justify-between items-center`}
      >
        <span>{selectedTag}</span>
        <ChevronDownIcon className="w-4 h-4" /> {/*  Prettier chevron icon */}
      </button>
      {isDropdownOpen && (
        <motion.ul
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`absolute z-10 w-full min-w-[200px] mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-60 overflow-auto ${getDropdownClasses(
            selectedColor
          )}`}
        >
          <li
            key="All"
            className={`px-4 py-2 cursor-pointer rounded ${
              optionClasses.hoverBg
            } ${selectedTag === "All" ? optionClasses.selectedBg : ""}`}
            onClick={() => {
              setSelectedTag("All");
              setIsDropdownOpen(false);
            }}
          >
            All Tags
          </li>
          {tags.map((tag) => (
            <li
              key={tag}
              className={`px-4 py-2 cursor-pointer rounded ${
                optionClasses.hoverBg
              } ${selectedTag === tag ? optionClasses.selectedBg : ""}`}
              onClick={() => {
                setSelectedTag(tag);
                setIsDropdownOpen(false);
              }}
            >
              {tag}
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );

  return (
    <div className="mt-6">
      {/* User Tab */}
      <div className="flex space-x-2 mb-4 bg-gray-200 dark:bg-gray-700 p-2 rounded">
        <button
          className={`px-4 py-2 rounded ${
            selectedUserId === currentUserId
              ? `${getActiveClass(selectedColor)} text-white`
              : "bg-gray-300 dark:bg-gray-600"
          }`}
          onClick={() => setSelectedUserId(currentUserId)}
        >
          Me
        </button>
        <button
          className={`px-4 py-2 rounded ${
            selectedUserId === partnerId
              ? `${partnerActiveClass} text-white`
              : "bg-gray-300 dark:bg-gray-600"
          }`}
          onClick={() => setSelectedUserId(partnerId)}
          disabled={!partnerId}
        >
          Partner
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "done"
              ? `${getActiveClass(selectedColor)} text-white`
              : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => handleTabChange("done")}
        >
          Completed
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "notDone"
              ? `${getActiveClass(selectedColor)} text-white`
              : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => handleTabChange("notDone")}
        >
          Not Completed
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "progress"
              ? `${getActiveClass(selectedColor)} text-white`
              : "bg-gray-200 dark:bg-gray-700"
          }`}
          onClick={() => handleTabChange("progress")}
        >
          Progress
        </button>
      </div>

      <div className="border rounded p-4 bg-white dark:bg-gray-800 shadow">
        {/* Tag Filter Dropdown - Only for done/notDone tabs - Custom UI */}
        {/* Tag Filter Dropdown - Inline without gap */}
        {(activeTab === "done" || activeTab === "notDone") && (
          <div className="mb-4 flex items-center gap-1">
            {" "}
            {/* 👈 gap-1 for minimal space */}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Filter by Tag:
            </label>
            <CustomDropdown />
          </div>
        )}

        <AnimatePresence>
          {activeTab === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading || isFiltering ? (
                <LoadingSpinner />
              ) : displayedDone.length === 0 && !hasMore ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No completed videos{" "}
                  {selectedTag !== "All" ? `for "${selectedTag}"` : ""}.
                </p>
              ) : (
                <div>
                  {displayedDone.map((v) => (
                    <VideoItem
                      key={v.title}
                      video={v}
                      userId={selectedUserId}
                      currentUserId={currentUserId}
                      color={userColors[selectedUserId]}
                      done={videoStatuses[v.title] ?? false}
                      onToggle={() => toggleDone(v.title)}
                    />
                  ))}
                  {hasMore && (
                    <button
                      onClick={handleLoadMore}
                      className="w-full py-2 bg-gray-200 dark:bg-gray-700 rounded mt-2 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Load More (
                      {filteredDoneVideos.length - displayedDone.length}{" "}
                      remaining)
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "notDone" && (
            <motion.div
              key="notDone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading || isFiltering ? (
                <LoadingSpinner />
              ) : displayedNotDone.length === 0 && !hasMore ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No incomplete videos{" "}
                  {selectedTag !== "All" ? `for "${selectedTag}"` : ""}.
                </p>
              ) : (
                <div>
                  {displayedNotDone.map((v) => (
                    <VideoItem
                      key={v.title}
                      video={v}
                      userId={selectedUserId}
                      currentUserId={currentUserId}
                      color={userColors[selectedUserId]}
                      done={videoStatuses[v.title] ?? false}
                      onToggle={() => toggleDone(v.title)}
                    />
                  ))}
                  {hasMore && (
                    <button
                      onClick={handleLoadMore}
                      className="w-full py-2 bg-gray-200 dark:bg-gray-700 rounded mt-2 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Load More (
                      {filteredNotDoneVideos.length - displayedNotDone.length}{" "}
                      remaining)
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === "progress" && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                tags.map((tag) => {
                  const tagPercent = getTagProgress(tag);
                  const barColor = getProgressBarColor(selectedColor, tag);
                  return (
                    <div key={tag} className="text-lg font-bold mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span>{tag}</span>
                        <span>{tagPercent}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                          className="h-4 rounded-full transition-all duration-300"
                          style={{
                            width: `${tagPercent}%`,
                            backgroundColor: barColor,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">Overall Progress</span>
                  <span>{percent}%</span>
                </div>
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div
                    className="h-4 rounded-full transition-all duration-300"
                    style={{
                      width: `${percent}%`,
                      backgroundColor:
                        selectedColor === "yellow" ? "#eab308" : "#a855f7",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ProgressTabs;
